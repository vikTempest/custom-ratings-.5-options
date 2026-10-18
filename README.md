# AniList Custom Ratings – Plugin für Seanime

Gebaut für Seanime Denshi 3.10.4.

Sprachen: Deutsch, English, Español, Português, 日本語

## Was es macht

**Im Seanime-Bearbeiten-Fenster:** Wenn du bei einem Eintrag auf den Bearbeiten-Button klickst, erscheint unter den normalen Feldern ein Bereich **„Custom Rating“** mit deinen AniList-Bewertungskategorien (Advanced Scoring, z. B. Story, Characters, Visuals).

- Deine bisherigen Kategorie-Bewertungen werden von AniList geladen und sind schon eingetragen.
- Die Felder sind Zahlenfelder. Mit den Pfeiltasten springst du in der eingestellten Schrittweite: 1, 0,5 oder 0,1 (bei „100 Point“: 1, 5 oder 10).
- Der Durchschnitt aller bewerteten Kategorien (leere oder 0 zählen nicht mit) wird oben ins Score-Feld eingetragen.
- Das Score-Feld oben springt mit den Pfeiltasten ebenfalls in deiner Schrittweite (1, 0,5 oder 0,1). Seanimes eigenes Score-Feld kann nur ganze Schritte, deshalb ersetzt das Plugin es im Fenster durch ein eigenes Feld an derselben Stelle.
- Klickst du auf Seanimes „Save“, wird der Durchschnitt als Score gespeichert und die Kategorie-Werte landen ebenfalls auf AniList.
- Änderst du keine Kategorie, bleibt der Score so, wie du ihn eingegeben hast.

**Bewerten / Rate:** Der Button auf Anime- und Manga-Seiten (und im Rechtsklick-Menü der Karten) öffnet dieselbe Bewertung in einem eigenen Fenster, mit zusätzlichen −/+ Buttons.

**Custom Lists:** Häkchen setzen, in welchen Custom Lists der Titel steht, ihn optional aus den Status-Listen ausblenden und neue Custom Lists anlegen.

Ist der Titel noch nicht auf deiner Liste, wird er beim Speichern als „Planning“ hinzugefügt.

**AniList-Limit:** AniList erlaubt nur eine begrenzte Zahl an Anfragen pro Minute, die sich das Plugin mit Seanime teilt. Das Plugin merkt sich deshalb deine Kontoeinstellungen (30 Minuten) und deine Einträge (10 Minuten) und fragt AniList nicht bei jedem Öffnen neu. Wenn du nur den Score änderst, schickt es keine zusätzliche Anfrage.

## Einstellungen

In Seanime unter **Extensions → AniList Custom Ratings → Preferences**:

- **Language:** Sprache des Plugins (Standard: English)
- **Default arrow key step:** Schrittweite, mit der das Fenster startet

## Voraussetzungen auf AniList

Unter anilist.co → Settings → Lists:

- **Advanced Scoring** aktivieren und deine Kategorien anlegen (für Anime und Manga getrennt)
- Für Schritte von 0,5 und 0,1 brauchst du das Scoring System **10 Point Decimal**

## Installation

**Per Link (empfohlen):** In Seanime unter **Extensions** auf „Add extensions“ klicken und unter „Install from URL“ diesen Link einfügen:

```
https://raw.githubusercontent.com/vikTempest/custom-ratings-.5-options/main/anilist-custom-lists.json
```

Danach das Plugin aktivieren und die Berechtigungen bestätigen (AniList-Zugriff und AniList-Token, damit es in deinem Namen speichern kann). Neue Versionen aus diesem Repo kann Seanime dann selbst aktualisieren.

**Per Datei:**

1. Seanime schließen.
2. `anilist-custom-lists.json` in den Ordner `%APPDATA%\Seanime\extensions` kopieren (eine ältere Version mit demselben Namen einfach ersetzen).
3. Seanime starten, unter **Extensions** das Plugin aktivieren und die Berechtigungen bestätigen.

## Dateien

- `anilist-custom-lists.json`: das installierbare Plugin (Manifest mit eingebettetem Code)
- `src/plugin.js`: derselbe Code lesbar, falls du etwas anpassen willst

Nach einer Änderung an `src/plugin.js` muss der Code auch ins Feld `payload` der JSON-Datei übernommen und `version` erhöht werden.
