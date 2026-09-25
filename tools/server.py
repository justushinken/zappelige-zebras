"""Vorschau-Server für die Zappelige-Zebras-Website, im WLAN erreichbar.

Braucht nur Python 3 (keine Pakete) und keine Administratorrechte.
Aufruf: in VS Code "Website-Vorschau im WLAN" (F5)  oder  python tools/server.py [--port 8080] [--no-browser]

Beim ersten Start fragt die Windows-Firewall, ob Python Verbindungen annehmen darf.
"""

import argparse
import functools
import http.server
import os
import socket
import sys
import urllib.parse
import webbrowser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Diese Pfade werden nie ausgeliefert (Originalfotos mit Namen, Einstellungen, Werkzeuge).
# Zusätzlich gesperrt: alles, dessen Pfad einen Teil mit führendem Punkt hat (.claude, .vscode).
BLOCKED = ("img/img_new", "tools", "claude.md")


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
    }

    def _blocked(self):
        rel = self.path.split("?", 1)[0].split("#", 1)[0]
        rel = urllib.parse.unquote(rel).replace("\\", "/").strip("/").lower()
        if any(part.startswith(".") for part in rel.split("/") if part):
            return True
        return any(rel == b or rel.startswith(b + "/") for b in BLOCKED)

    def send_head(self):
        if self._blocked():
            self.send_error(403, "Nicht freigegeben")
            return None
        return super().send_head()

    def list_directory(self, path):
        # Keine Verzeichnislisten anzeigen
        self.send_error(404, "Nicht gefunden")
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write("  %s  %s\n" % (self.address_string(), fmt % args))


def lan_ips():
    ips = set()
    try:
        # Ermittelt die Adresse, über die der Rechner ins Netz geht (es wird nichts gesendet)
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("192.0.2.1", 80))
            ips.add(s.getsockname()[0])
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info[4][0])
    except OSError:
        pass
    return sorted(ip for ip in ips if not ip.startswith(("127.", "169.254.")))


def main():
    parser = argparse.ArgumentParser(description="Vorschau-Server (WLAN)")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--bind", default="0.0.0.0", help="0.0.0.0 = im WLAN erreichbar")
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    handler = functools.partial(Handler, directory=ROOT)
    server = None
    for port in range(args.port, args.port + 20):
        try:
            server = http.server.ThreadingHTTPServer((args.bind, port), handler)
            break
        except OSError:
            continue
    if server is None:
        print("Kein freier Port gefunden.")
        sys.exit(1)

    url = "http://localhost:%d/" % port
    print()
    print("  Zappelige Zebras - Vorschau (WLAN)")
    print("  " + url)
    if args.bind == "0.0.0.0":
        for ip in lan_ips():
            print("  http://%s:%d/   (im WLAN, z. B. vom Handy)" % (ip, port))
    print("  Ordner: " + ROOT)
    print("  Beenden mit Strg+C oder Fenster schliessen.")
    print()

    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
