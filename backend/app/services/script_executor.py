import asyncio
import time
import re

BLOCKED_PATTERNS = [
    r"os\.system\s*\(",
    r"os\.popen\s*\(",
    r"subprocess\.",
    r"\bexec\s*\(",
    r"\beval\s*\(",
    r"\bcompile\s*\(",
    r"open\s*\(",
    r"socket\.",
    r"urllib\.",
    r"\bpty\.",
    r"os\.fork\s*\(",
]


def validate_script_safety(script: str) -> tuple[bool, str]:
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, script):
            return False, f"Blocked pattern detected: {pattern}"
    return True, "Script passed safety validation"


async def execute_python_script(
    script: str,
    dry_run: bool = False,
    timeout: int = 300,
    host: str | None = None,
    token: str | None = None,
) -> dict:
    # Safety check
    is_safe, message = validate_script_safety(script)
    if not is_safe:
        return {"success": False, "logs": [message], "output": "", "error": message, "durationMs": 0}

    if dry_run:
        return {
            "success": True,
            "logs": ["[DRY RUN] Script validated successfully", f"[DRY RUN] Script length: {len(script)} chars"],
            "output": "[DRY RUN] No execution performed",
            "durationMs": 0,
        }

    start = time.time()
    logs = []

    # Wrap script with safety and error handling
    wrapped_script = f"""
import sys
import json

# Inject Databricks credentials
import os
os.environ['DATABRICKS_HOST'] = {repr(host or '')}
os.environ['DATABRICKS_TOKEN'] = {repr(token or '')}

try:
{_indent_script(script)}
except Exception as e:
    print(f"ERROR: {{type(e).__name__}}: {{e}}", file=sys.stderr)
    sys.exit(1)
"""

    try:
        process = await asyncio.create_subprocess_exec(
            "python3", "-c", wrapped_script,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env={"PYTHONUNBUFFERED": "1"},
        )

        try:
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            process.kill()
            duration_ms = round((time.time() - start) * 1000)
            return {
                "success": False,
                "logs": [f"Script timed out after {timeout} seconds"],
                "output": "",
                "error": "Execution timed out",
                "durationMs": duration_ms,
            }

        duration_ms = round((time.time() - start) * 1000)
        output = stdout.decode() if stdout else ""
        errors = stderr.decode() if stderr else ""

        if errors:
            logs.append(errors)

        # Try to parse structured output
        data = None
        if output:
            try:
                data = _parse_json_output(output)
            except Exception:
                pass

        return {
            "success": process.returncode == 0,
            "logs": logs,
            "output": output,
            "data": data,
            "error": errors if process.returncode != 0 else None,
            "durationMs": duration_ms,
        }

    except Exception as e:
        duration_ms = round((time.time() - start) * 1000)
        return {
            "success": False,
            "logs": [str(e)],
            "output": "",
            "error": str(e),
            "durationMs": duration_ms,
        }


def _indent_script(script: str) -> str:
    return "\n".join(f"    {line}" for line in script.split("\n"))


def _parse_json_output(output: str) -> dict | list | None:
    # Look for JSON between markers
    import json
    for line in output.strip().split("\n"):
        line = line.strip()
        if line.startswith("{") or line.startswith("["):
            try:
                return json.loads(line)
            except json.JSONDecodeError:
                continue
    return None
