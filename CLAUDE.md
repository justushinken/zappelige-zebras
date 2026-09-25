# Zappelige Zebras e.V. – Website

Neue Website der Elterninitiative „Zappelige Zebras e.V.“: eine kleine Krippe (9 Kinder, 1–3 Jahre) in der Lenaustr. 7, 30169 Hannover. Sie ersetzt die alte IONOS-Baukasten-Seite https://www.zappelige-zebras.de/, aus der alle Inhalte, Fotos und PDFs stammen.

Sprache der Website und der Kommunikation: **Deutsch**. Anrede auf der Website: „Sie“.

## Aufbau

Rein statische Seite ohne Build-Schritt und ohne Abhängigkeiten. Testweise läuft sie über **GitHub Pages** (Repository `justushinken/zappelige-zebras`, Branch `main`, Ordner `/`). Pages veröffentlicht das ganze Repository so, wie es ist. `.nojekyll` schaltet die Jekyll-Verarbeitung von GitHub ab. Pages unterscheidet Groß- und Kleinschreibung in Dateinamen, Windows nicht: Verweise müssen exakt passen.

- `index.html` – One-Pager mit Abschnitten per Anker: `#kita`, `#konzept`, `#tagesablauf`, `#team`, `#eltern`, `#galerie`, `#anmeldung`, `#kontakt`
- `impressum.html`, `datenschutz.html` – Rechtstexte (eigener, vereinfachter Header/Footer)
- `css/style.css` – das einzige Stylesheet; Farben und Maße als CSS-Variablen in `:root`
- `js/main.js` – Vanilla-JS: mobiles Menü, Einblend-Animation (`.reveal`), Galerie-Lightbox (`<dialog>`), Anmeldeformular
- `img/` – Fotos (`eindruck-77` … `eindruck-86`), `favicon.svg` (Bildmarke im Header) und `logo-zebra.png` (das alte Zebra-Logo, als Aufkleber im Hero). `logo-zebra.png` ist aus `emotionheader.jpg` (Kopfbild der alten Seite) freigestellt; die türkise Fläche ist entfernt, weil Türkis nicht zur Palette gehört.
- `docs/` – PDFs: pädagogisches Konzept und Kinderschutzkonzept
- `fonts/` – selbst gehostete Schriften Fraunces (Überschriften) und Nunito (Text)

Icons sind SVG-`<symbol>`s oben in `index.html` und werden mit `<use href="#i-…">` eingebunden.

## Wichtige Regeln

- **Keine externen Ressourcen einbinden**: kein Google Fonts, keine CDNs, kein Google Maps, kein Tracking, keine Cookies. Das hat Datenschutzgründe (DSGVO), und `datenschutz.html` sagt das ausdrücklich zu. Wer etwas Externes einbaut, muss auch die Datenschutzerklärung anpassen.
- Kein Framework und kein Build-Tool einführen. Die Seite soll auch von Eltern ohne Programmierkenntnisse gepflegt werden können.
- Farben aus der Palette nehmen (`--ink`, `--paper`, `--lime`, `--berry`, `--sun`, `--sky` plus `-soft`/`-deep`-Varianten) und keine neuen Hex-Werte verstreuen. Die Farben sind aus den Kita-Fotos abgeleitet.
- Das Zebra-Streifen-Motiv (`repeating-linear-gradient`) ist das wiederkehrende Gestaltungselement.
- Jedes neue Bild braucht einen deutschen `alt`-Text. Fotos mit erkennbaren Kindern nur mit Einwilligung der Eltern verwenden.
- **Neue Fotos vor dem Einbau prüfen**: Kindernamen (Ordner, Fächer, Leisten), Kinderfotos und Geburtsdaten an Wänden verpixeln. Außerdem EXIF-/GPS-Daten entfernen und auf 1600 px Breite verkleinern (JPEG-Qualität ca. 82). Die Web-Versionen liegen mit sprechenden Namen in `img/` (`spielhaus.jpg`, `gruppenraum.jpg`, `spielecke.jpg`, `kueche.jpg`). Die unbearbeiteten Originale gehören nicht auf den Webspace und nicht ins Repository (`img/img_new/` steht in `.gitignore`, weil das Repository öffentlich ist).
- Mobil muss alles bei 390 px Breite funktionieren, ohne horizontales Scrollen.

## Anmeldeformular

Es gibt keinen Server-Code. Das Formular in `#anmeldung` baut beim Absenden eine `mailto:`-Nachricht an info@zappelige-zebras.de (siehe `js/main.js`). Soll es direkt versenden, geht das auf GitHub Pages nicht (nur statische Dateien); bei IONOS wäre ein PHP-Skript der naheliegende Weg, dann muss auch `datenschutz.html` (Abschnitt 5) angepasst werden.

## Inhalte, die sich regelmäßig ändern

- **Freier Platz**: steht zweimal in `index.html`, im Hero (`.notice`) und in der Anmeldung (`.open-spot`). Beide Stellen gemeinsam ändern oder entfernen.
- **Team** (`#team`) und **Vorstand** (`impressum.html`) wechseln jährlich.
- **Vereinsämter und Elterndienste** (`#eltern`).

## Vorschau und Prüfung

Lokaler Server: Doppelklick auf `start.bat` startet `tools/server.ps1` (reines PowerShell, keine Installation nötig) unter http://localhost:8080/ und öffnet den Browser. Ist der Port belegt, nimmt der Server den nächsten freien. Optionen: `-Port 9000`, `-NoBrowser`. Kein Caching, Änderungen sind also nach dem Neuladen sofort sichtbar.

In VS Code: **F5** („Website-Vorschau (Edge)“ oder „(Chrome)“ in `.vscode/launch.json`). Das startet den Server als Hintergrund-Task auf Port 8080 (`.vscode/tasks.json`), öffnet den Browser und beendet den Server beim Stoppen wieder.

Im WLAN (z. B. zum Testen auf dem Handy): In VS Code „Website-Vorschau im WLAN (Edge/Chrome)“ mit F5 starten. Das nutzt `tools/server.py` (Python 3, nur Standardbibliothek) auf `0.0.0.0:8080`, ohne Administratorrechte. Die WLAN-Adresse steht im Terminal-Panel des Tasks. Beim ersten Start fragt die Windows-Firewall, ob Python Verbindungen annehmen darf. Ist das WLAN als „Öffentlich“ eingestuft, muss dort auch „Öffentliche Netzwerke“ erlaubt werden, oder das WLAN wird auf „Privat“ gestellt.

Beide Server liefern nie Pfade mit führendem Punkt (`.claude/`, `.vscode/`) sowie `img/img_new/`, `tools/` und `CLAUDE.md` aus (`$Blocked` in `server.ps1`, `BLOCKED` in `server.py`, beide gemeinsam pflegen).

`start.bat`, `tools/` und `.vscode/` sind nur für die lokale Vorschau da und würden bei IONOS **nicht** hochgeladen. Auf GitHub Pages sind sie mit öffentlich, weil sie im Repository liegen. Das ist unkritisch, solange dort nichts Vertrauliches steht.

Screenshots für die Prüfung gehen mit Edge im Headless-Modus, per `file:///` oder gegen den laufenden Server:

```
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=1400,9000 --virtual-time-budget=4000 --screenshot=<scratchpad>/shot.png "file:///D:/01_Software/zappelige-zebras/index.html"
```

Headless Edge rendert nicht schmaler als ca. 500 px. Für die Handy-Ansicht deshalb die Seite in einer Hilfs-HTML-Datei in ein `<iframe style="width:390px">` laden und davon den Screenshot machen. Elemente mit `.reveal` können im Screenshot leer erscheinen, wenn sie außerhalb des Fensters liegen. Das ist ein Artefakt des Screenshots, kein Layoutfehler.

## Offene Punkte

- **Testphase auf GitHub Pages**: `index.html` hat `<meta name="robots" content="noindex">`, damit die Testseite nicht in Suchmaschinen landet. Zum Livegang entfernen. Bleibt die Seite bei GitHub Pages, kommen eine Datei `CNAME` (`www.zappelige-zebras.de`) und DNS-Einträge bei IONOS dazu. Geht sie zu IONOS, muss Abschnitt 3 in `datenschutz.html` wieder auf IONOS umgestellt werden.
- `datenschutz.html` ist ein **Entwurf** (gelber Hinweis oben). Abschnitt 3 beschreibt derzeit GitHub Pages als Hoster. Vor dem Livegang vom Vorstand prüfen lassen und den Hinweis entfernen.
- Laut alter Team-Seite hat das Team „aktuell 6 Mitarbeiter“, aufgezählt sind aber 7 Personen. Die Zahl ist deshalb nicht genannt.
