"""Minimal client for the live Blender MCP addon socket (blender-mcp, 127.0.0.1:9876).

Run with external Python:
    python scripts/blender_socket.py exec -f path/to/code.py
    python scripts/blender_socket.py exec -c "import bpy; print(bpy.data.filepath)"
    python scripts/blender_socket.py ping

The addon executes code on Blender's main thread, so long calls can time out
from the client side while Blender continues. Keep each call small.
"""
import argparse
import json
import socket
import sys

HOST = "127.0.0.1"
PORT = 9876


def send(payload: dict, timeout: float = 120.0) -> dict:
    with socket.create_connection((HOST, PORT), timeout=timeout) as sock:
        sock.settimeout(timeout)
        sock.sendall(json.dumps(payload).encode("utf-8"))
        chunks = []
        while True:
            chunk = sock.recv(65536)
            if not chunk:
                break
            chunks.append(chunk)
            # Addon sends one JSON document per request; stop when it parses.
            try:
                return json.loads(b"".join(chunks).decode("utf-8"))
            except json.JSONDecodeError:
                continue
        return json.loads(b"".join(chunks).decode("utf-8"))


def execute(code: str, timeout: float = 120.0) -> dict:
    return send({"type": "execute_code", "params": {"code": code}}, timeout=timeout)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["exec", "ping"])
    group = parser.add_mutually_exclusive_group()
    group.add_argument("-f", "--file")
    group.add_argument("-c", "--code")
    parser.add_argument("--timeout", type=float, default=120.0)
    args = parser.parse_args()

    if args.command == "ping":
        result = send({"type": "get_scene_info", "params": {}}, timeout=15)
    else:
        if args.file:
            with open(args.file, "r", encoding="utf-8") as handle:
                code = handle.read()
        else:
            code = args.code or ""
        result = execute(code, timeout=args.timeout)

    print(json.dumps(result, indent=2)[:20000])
    return 0 if result.get("status") == "success" else 1


if __name__ == "__main__":
    sys.exit(main())
