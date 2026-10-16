# AniList Custom Ratings – Plugin für Seanime

Gebaut für Seanime Denshi 3.10.4 (deine Version).

## Was es macht

Auf jeder Anime- und Manga-Seite und im Rechtsklick-Menü der Karten gibt es zwei neue Buttons:

**Bewerten:** Öffnet ein Fenster mit deinen AniList-Bewertungskategorien (Advanced Scoring, z. B. Story, Characters, Visuals, Audio, Enjoyment). Du gibst pro Kategorie eine Zahl ein. Die Gesamtnote ist der Durchschnitt aller bewerteten Kategorien (leere oder 0 zählen nicht mit), genau wie auf AniList. „Speichern“ schickt die Einzelwerte und die Gesamtnote an AniList.

**Custom Lists:** Häkchen setzen, in welchen Custom Lists der Titel steht, ihn optional aus den Status-Listen ausblenden und neue Custom Lists anlegen.

Ist der Titel noch nicht auf deiner Liste, wird er beim Speichern als „Planning“ hinzugefügt.

## Voraussetzungen auf AniList

Unter anilist.co → Settings → Lists:

- Scoring System auf **100 Point** oder **10 Point Decimal** (nur damit erlaubt AniList Kategorien)
- **Advanced Scoring** aktivieren und deine Kategorien anlegen (für Anime und Manga getrennt)

Wenn etwas davon fehlt, sagt dir das Plugin im Fenster, was zu tun ist.

## Installation

**Per Link (empfohlen):** In Seanime unter **Extensions** auf „Add extension“ klicken und diesen Link einfügen:

```
https://raw.githubusercontent.com/vikTempest/custom-ratings-.5-options/main/anilist-custom-lists.json
```

Danach das Plugin aktivieren und die Berechtigungen bestätigen (AniList-Zugriff und AniList-Token, damit es in deinem Namen speichern kann). Neue Versionen aus diesem Repo kann Seanime dann selbst aktualisieren.

**Per Datei:**

1. Seanime schließen.
2. `anilist-custom-lists.json` in den Ordner `%APPDATA%\Seanime\extensions` kopieren (eine ältere Version mit demselben Namen einfach ersetzen).
3. Seanime starten, unter **Extensions** das Plugin aktivieren und die Berechtigungen bestätigen (AniList-Zugriff und AniList-Token, damit es in deinem Namen speichern kann).

## Dateien

- `anilist-custom-lists.json`: das installierbare Plugin (Manifest mit eingebettetem Code)
- `src/plugin.js`: derselbe Code lesbar, falls du etwas anpassen willst

Nach einer Änderung an `src/plugin.js` muss der Code auch ins Feld `payload` der JSON-Datei übernommen und `version` erhöht werden.
