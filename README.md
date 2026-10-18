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

**Symbol oben in der Leiste:** Das Plugin hat ein eigenes Symbol (blauer Stern) in Seanimes Plugin-Leiste. Dort siehst du, ob du bei AniList angemeldet bist, welche Kategorien eingerichtet sind, und kannst fehlende Kategorien direkt einrichten.

**Custom Lists:** Häkchen setzen, in welchen Custom Lists der Titel steht, ihn optional aus den Status-Listen ausblenden und neue Custom Lists anlegen.

Ist der Titel noch nicht auf deiner Liste, wird er beim Speichern als „Planning“ hinzugefügt.

**AniList-Limit:** AniList erlaubt nur eine begrenzte Zahl an Anfragen pro Minute, die sich das Plugin mit Seanime teilt. Das Plugin merkt sich deshalb deine Kontoeinstellungen (30 Minuten) und deine Einträge (10 Minuten) und fragt AniList nicht bei jedem Öffnen neu. Wenn du nur den Score änderst, schickt es keine zusätzliche Anfrage.

## Einstellungen

In Seanime unter **Extensions → AniList Custom Ratings → Preferences**:

- **Language:** Sprache des Plugins (Standard: English)
- **Default arrow key step:** Schrittweite, mit der das Fenster startet

## Voraussetzungen auf AniList

Du musst Advanced Scoring nicht selbst einrichten. Hast du noch keine Bewertungskategorien, zeigt das Plugin beim ersten Öffnen ein Feld, in das du deine Kategorien mit Komma getrennt einträgst (Vorschlag: Story, Charaktere, Animation, Musik, Spaß). Mit „Kategorien einrichten“ legt das Plugin sie auf deinem AniList-Konto an und schaltet Advanced Scoring ein (für Anime und Manga getrennt). Ändern kannst du sie später auf anilist.co unter Settings → Lists.

Für Schritte von 0,5 und 0,1 brauchst du auf anilist.co (Settings → Lists) das Scoring System **10 Point Decimal**.

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

Zeigt Seanime „extension ID is already in use“, liegt das Plugin doppelt im Ordner `%APPDATA%\Seanime\extensions` (zum Beispiel als `anilist-custom-lists (1).json` nach einem zweiten Download). Lösche alle Kopien bis auf `anilist-custom-lists.json` und starte Seanime neu.

## Dateien

- `anilist-custom-lists.json`: das installierbare Plugin (Manifest mit eingebettetem Code)
- `src/plugin.js`: derselbe Code lesbar, falls du etwas anpassen willst

Nach einer Änderung an `src/plugin.js` muss der Code auch ins Feld `payload` der JSON-Datei übernommen und `version` erhöht werden.
