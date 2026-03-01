"""Intelligencre Studio CLI - Databricks API from the terminal."""

import json
import os
import sys
import time

import click
import httpx
from rich.console import Console
from rich.json import JSON as RichJSON
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress
from dotenv import load_dotenv

load_dotenv()

console = Console()

PRESETS = {
    "list-clusters": ("GET", "/api/2.0/clusters/list"),
    "list-jobs": ("GET", "/api/2.1/jobs/list"),
    "list-warehouses": ("GET", "/api/2.0/sql/warehouses"),
    "list-catalogs": ("GET", "/api/2.1/unity-catalog/catalogs"),
    "list-schemas": ("GET", "/api/2.1/unity-catalog/schemas"),
    "list-tables": ("GET", "/api/2.1/unity-catalog/tables"),
    "list-users": ("GET", "/api/2.0/preview/scim/v2/Users"),
    "list-groups": ("GET", "/api/2.0/preview/scim/v2/Groups"),
    "get-user": ("GET", "/api/2.0/preview/scim/v2/Users/me"),
    "workspace-list": ("GET", "/api/2.0/workspace/list"),
}


def get_credentials():
    host = os.environ.get("DATABRICKS_HOST", "")
    token = os.environ.get("DATABRICKS_TOKEN", "")
    if not host or not token:
        console.print("[red]Error:[/red] Set DATABRICKS_HOST and DATABRICKS_TOKEN environment variables")
        sys.exit(1)
    return host.rstrip("/"), token


@click.group(invoke_without_command=True)
@click.argument("method", required=False)
@click.argument("path", required=False)
@click.option("--body", "-d", help="JSON request body")
@click.option("--body-file", "-f", help="Path to JSON body file")
@click.option("--preset", "-p", help="Use a preset endpoint")
@click.option("--timeout", "-t", default=30, help="Request timeout in seconds")
@click.option("--retries", "-r", default=3, help="Number of retries")
@click.option("--show-headers", "-H", is_flag=True, help="Show response headers")
@click.option("--curl", is_flag=True, help="Output as cURL command")
@click.option("--raw", is_flag=True, help="Output raw JSON")
@click.pass_context
def cli(ctx, method, path, body, body_file, preset, timeout, retries, show_headers, curl, raw):
    """Intelligencre Studio CLI - Databricks API from the terminal.

    Examples:
        dbx-cli GET /api/2.0/clusters/list
        dbx-cli --preset list-clusters
        dbx-cli POST /api/2.0/clusters/create -d '{"cluster_name": "test"}'
    """
    if ctx.invoked_subcommand:
        return

    # Handle preset
    if preset:
        if preset not in PRESETS:
            console.print(f"[red]Unknown preset:[/red] {preset}")
            console.print(f"Available: {', '.join(PRESETS.keys())}")
            return
        method, path = PRESETS[preset]

    if not method or not path:
        console.print(Panel(
            "[bold]Intelligencre Studio CLI[/bold]\n\n"
            "Usage: dbx-cli [METHOD] [PATH] [OPTIONS]\n"
            "       dbx-cli --preset [NAME]\n\n"
            f"Presets: {', '.join(PRESETS.keys())}",
            title="Help",
            border_style="blue",
        ))
        return

    host, token = get_credentials()

    # Parse body
    request_body = None
    if body:
        request_body = json.loads(body)
    elif body_file:
        with open(body_file) as f:
            request_body = json.load(f)

    # Show cURL
    if curl:
        cmd = f"curl -X {method.upper()} '{host}{path}'"
        cmd += f" \\\n  -H 'Authorization: Bearer $DATABRICKS_TOKEN'"
        cmd += f" \\\n  -H 'Content-Type: application/json'"
        if request_body:
            cmd += f" \\\n  -d '{json.dumps(request_body)}'"
        console.print(cmd)
        return

    # Execute request
    with Progress(transient=True) as progress:
        progress.add_task(f"[cyan]{method.upper()} {path}...", total=None)

        start = time.time()
        last_error = None

        for attempt in range(retries):
            try:
                with httpx.Client(timeout=timeout) as client:
                    resp = client.request(
                        method=method.upper(),
                        url=f"{host}{path}",
                        headers={
                            "Authorization": f"Bearer {token}",
                            "Content-Type": "application/json",
                        },
                        json=request_body,
                    )

                    duration = round((time.time() - start) * 1000)

                    if resp.status_code == 429:
                        retry_after = float(resp.headers.get("Retry-After", "1"))
                        console.print(f"[yellow]Rate limited, waiting {retry_after}s...[/yellow]")
                        time.sleep(retry_after)
                        continue

                    # Success or non-retryable error
                    break

            except httpx.TimeoutException:
                last_error = "Request timed out"
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                console.print(f"[red]Error:[/red] {last_error}")
                return
            except Exception as e:
                last_error = str(e)
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                console.print(f"[red]Error:[/red] {last_error}")
                return

    # Display results
    status_color = "green" if resp.status_code < 300 else "yellow" if resp.status_code < 400 else "red"
    console.print(f"\n[{status_color}]Status: {resp.status_code}[/{status_color}]  [dim]({duration}ms)[/dim]")

    if show_headers:
        header_table = Table(title="Response Headers", show_lines=True)
        header_table.add_column("Header", style="cyan")
        header_table.add_column("Value", style="white")
        for key, value in resp.headers.items():
            header_table.add_row(key, value)
        console.print(header_table)

    try:
        data = resp.json()
        if raw:
            click.echo(json.dumps(data, indent=2))
        else:
            console.print(RichJSON(json.dumps(data, indent=2)))
    except Exception:
        console.print(resp.text)


@cli.command()
def presets():
    """List all available presets."""
    table = Table(title="Available Presets", show_lines=True)
    table.add_column("Name", style="cyan")
    table.add_column("Method", style="green")
    table.add_column("Path", style="white")

    for name, (method, path) in PRESETS.items():
        table.add_row(name, method, path)

    console.print(table)


@cli.command()
def status():
    """Check Databricks connection status."""
    host, token = get_credentials()
    console.print(f"Host: [cyan]{host}[/cyan]")

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                f"{host}/api/2.0/clusters/list",
                headers={"Authorization": f"Bearer {token}"},
                params={"max_results": 1},
            )
            if resp.status_code == 200:
                console.print("[green]Connected successfully[/green]")
            else:
                console.print(f"[red]Connection failed: HTTP {resp.status_code}[/red]")
    except Exception as e:
        console.print(f"[red]Connection failed: {e}[/red]")


if __name__ == "__main__":
    cli()
