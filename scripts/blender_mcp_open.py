"""Send one execute request to the running Blender MCP bridge and print the reply.

Protocol (verified against Blender Lab's MCP add-on 1.0.3): a JSON object with
`type` = "execute", a `code` string and a boolean `strict_json`, encoded UTF-8 and
terminated with a single NUL byte. The reply is JSON, also NUL terminated.

Usage:
    python scripts/blender_mcp_open.py <file.py>
    python scripts/blender_mcp_open.py --code "import bpy; print(len(bpy.data.objects))"
"""
from __future__ import annotations

import json
import socket
import sys
from pathlib import Path

HOST, PORT = "127.0.0.1", 9876


def send(code: str, timeout: float = 60.0, host: str = HOST, port: int = PORT) -> dict | str:
    request = {"type": "execute", "code": code, "strict_json": False}
    payload = (json.dumps(request) + "\0").encode("utf-8")
    with socket.create_connection((host, port), timeout=timeout) as sock:
        sock.sendall(payload)
        buffer = b""
        while b"\0" not in buffer:
            chunk = sock.recv(65536)
            if not chunk:
                break
            buffer += chunk
    text = buffer.split(b"\0")[0].decode("utf-8", "replace")
    if not text:
        return "no reply (a file load resets the execution context; verify separately)"
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def main() -> int:
    args = sys.argv[1:]
    timeout = 60.0
    if "--timeout" in args:
        i = args.index("--timeout")
        timeout = float(args[i + 1])
        del args[i:i + 2]
    if not args:
        print(__doc__)
        return 2
    if args[0] == "--code":
        code = args[1]
    else:
        code = Path(args[0]).read_text(encoding="utf-8")
    reply = send(code, timeout=timeout)
    print(reply if isinstance(reply, str) else json.dumps(reply, indent=2)[:4000])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
