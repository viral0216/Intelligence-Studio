"""
PyInstaller entry point — compiles to a standalone backend-server binary.
No Python installation required on the end user's machine.
"""
import multiprocessing
import os
import sys


def main():
    import uvicorn
    from app.main import create_app

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(create_app(), host="127.0.0.1", port=port, log_level="info")


if __name__ == "__main__":
    # Required by PyInstaller for multiprocessing support on Windows/macOS
    multiprocessing.freeze_support()
    main()
