# Lokaler Vorschau-Server fuer die Zappelige-Zebras-Website.
# Nutzt nur Bordmittel von Windows (keine Installation noetig).
# Aufruf: Doppelklick auf start.bat  oder  powershell -File tools\server.ps1 [-Port 8080] [-NoBrowser]
# Fuer die Vorschau im WLAN: tools\server.py (in VS Code: "Website-Vorschau im WLAN").

param(
  [int]$Port = 8080,
  [switch]$NoBrowser
)

# Diese Pfade werden nie ausgeliefert (Originalfotos mit Namen, Einstellungen, Werkzeuge)
$Blocked = @("img/img_new", "tools", "CLAUDE.md")

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$MimeTypes = @{
  ".html"  = "text/html; charset=utf-8"
  ".css"   = "text/css; charset=utf-8"
  ".js"    = "text/javascript; charset=utf-8"
  ".json"  = "application/json; charset=utf-8"
  ".svg"   = "image/svg+xml"
  ".png"   = "image/png"
  ".jpg"   = "image/jpeg"
  ".jpeg"  = "image/jpeg"
  ".gif"   = "image/gif"
  ".webp"  = "image/webp"
  ".ico"   = "image/x-icon"
  ".woff2" = "font/woff2"
  ".woff"  = "font/woff"
  ".pdf"   = "application/pdf"
  ".txt"   = "text/plain; charset=utf-8"
}

# Freien Port suchen, falls der gewuenschte belegt ist
$listener = $null
for ($p = $Port; $p -lt $Port + 20; $p++) {
  $candidate = New-Object System.Net.HttpListener
  $candidate.Prefixes.Add("http://localhost:$p/")
  try { $candidate.Start(); $listener = $candidate; $Port = $p; break }
  catch { $candidate.Close() }
}
if (-not $listener) { Write-Host "Kein freier Port zwischen $Port und $($Port + 19) gefunden." -ForegroundColor Red; exit 1 }

$url = "http://localhost:$Port/"
Write-Host ""
Write-Host "  Zappelige Zebras - lokale Vorschau" -ForegroundColor Green
Write-Host "  $url"
Write-Host "  Ordner: $Root"
Write-Host "  Beenden mit Strg+C oder Fenster schliessen."
Write-Host ""

if (-not $NoBrowser) { Start-Process $url }

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $status = 200
    try {
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart("/")
      if ($rel -eq "" -or $rel.EndsWith("/")) { $rel += "index.html" }
      $path = [IO.Path]::GetFullPath((Join-Path $Root $rel))

      $relNorm = $rel.Replace("\", "/")
      $isBlocked = ($relNorm -split "/" | Where-Object { $_.StartsWith(".") }) -or
        ($Blocked | Where-Object { $relNorm -eq $_ -or $relNorm.StartsWith("$_/", [StringComparison]::OrdinalIgnoreCase) })

      # Nur Dateien innerhalb des Projektordners ausliefern, gesperrte Pfade nie
      if ($isBlocked -or -not $path.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
        $status = 403
      } elseif (Test-Path $path -PathType Container) {
        $path = Join-Path $path "index.html"
      }

      if ($status -eq 200 -and (Test-Path $path -PathType Leaf)) {
        $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
        $type = $MimeTypes[$ext]
        if (-not $type) { $type = "application/octet-stream" }
        $bytes = [IO.File]::ReadAllBytes($path)
        $res.StatusCode = 200
        $res.ContentType = $type
        $res.Headers.Add("Cache-Control", "no-store")
        $res.ContentLength64 = $bytes.Length
        if ($req.HttpMethod -ne "HEAD") { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
      } else {
        if ($status -eq 200) { $status = 404 }
        $msg = [Text.Encoding]::UTF8.GetBytes("$status - nicht gefunden: /$rel")
        $res.StatusCode = $status
        $res.ContentType = "text/plain; charset=utf-8"
        $res.OutputStream.Write($msg, 0, $msg.Length)
      }
    } catch {
      $status = 500
      try { $res.StatusCode = 500 } catch {}
    } finally {
      $color = if ($status -eq 200) { "Gray" } else { "Yellow" }
      Write-Host ("  {0} {1} {2}" -f $status, $req.HttpMethod, $req.Url.AbsolutePath) -ForegroundColor $color
      try { $res.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
