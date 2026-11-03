# Heldenschool

Leerapp voor de iPad (groep 2 en 3): rekenen met Super-Kick, letters met Agent Vroem. Zie [PLAN.md](PLAN.md) voor alle keuzes.

## Online en offline

De app staat op **https://rrudolphie.github.io/heldenschool/**.

Op de iPad: open dit adres in Safari, tik op Deel → "Zet op beginscherm". Na het eerste openen werkt de app ook zonder internet.

Een nieuwe versie online zetten: commit en `git push`. GitHub bouwt de app dan vanzelf (zie het tabblad Actions). De iPad haalt de nieuwe versie op de eerstvolgende keer dat hij de app met internet opent.

## Testen op de pc

```bash
npm run dev
```

Open daarna http://localhost:5174 in de browser.

## Testen op de iPad (thuisnetwerk)

`npm run dev` laat ook een "Network"-adres zien, zoals `http://192.168.1.20:5174`. Open dat adres in Safari op de iPad. De pc moet dan wel aanstaan. Offline werken en "Zet op beginscherm" werken pas goed als de app op GitHub Pages staat.

## Bouwen

```bash
npm run build
```

De klare app staat dan in de map `dist`. Met `npm run preview` kun je die versie (met offline werken) op de pc testen.

## Stemmen (vooraf ingesproken)

Alle zinnen van de helden staan als mp3 in `public/stem/`. Ze zijn gemaakt met het AI-stemmodel Chatterbox, dat lokaal op de videokaart draait (`C:\Users\robbi\Tools\ai-stem`). Komen er zinnen bij of veranderen er zinnen in `src/zinnen.ts`, maak ze dan zo opnieuw (alleen nieuwe zinnen worden ingesproken):

```bash
npx tsx scripts/zinnen-lijst.ts
```

```bash
C:\Users\robbi\Tools\ai-stem\venv\Scripts\python.exe scripts\maak-stem.py
```

Handige opties van `maak-stem.py` (achter het commando zetten):
- `--zwak`: zinnen waarvan Whisper de opname niet goed verstond (score onder 0,8) opnieuw maken.
- `--knip`: stilte, ademhaling en naklank voor en na de zin wegknippen.
- `--verdacht`: twijfelwoorden opnieuw proberen met andere draagzinnen; de nieuwe versie telt alleen als hij beter klinkt. De oude gaat in `stemproef/stem-oud`.
- `--opnieuw`: alles opnieuw.

Ontbreekt een zin toch, dan zegt de iPad-stem hem als reserve. Het klankvoorbeeld van Agent Vroem (`scripts/stemvoorbeeld-vroem.wav`) komt uit een rechtenvrij LibriVox-luisterboek (zie `scripts/voorbeeld-proef.py`).

## Plaatjes (helden, schurken en avonturen)

Alle plaatjes staan in `public/beeld/`. Ze zijn gemaakt met het lokale AI-beeldmodel FLUX.1-schnell (`C:\Users\robbi\Tools\ai-beeld`) en losgeknipt met BiRefNet. Hoe de plaatjes zijn gemaakt, eerlijk op een rij:
- Super-Kick, houding "normaal", de schurken, de verhaalplaatjes, de superbal, het vangnet en de politieauto: lokaal met FLUX.1-schnell en losgeknipt met BiRefNet.
- Agent Vroem (nieuw ontwerp) en de houdingen "blij" en "nadenken": door de eigenaar zelf gemaakt met ChatGPT, daarna bewerkt met eigen scripts (losknippen, omkleuren per pak met `herkleur.py`, schoenlogo met `schoenlogo.py`).
- De overige pakken zijn omgekleurde versies van het basisplaatje.
- Gebruik je de app ooit commercieel, controleer dan zelf de actuele voorwaarden van de gebruikte diensten (zie ook de licenties van FLUX.1-schnell, BiRefNet, Chatterbox en Whisper).

Nieuwe of verwijderde plaatjes maak je zo opnieuw (bestaande worden overgeslagen):

```bash
C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-flux.py
```

Met `--kandidaten` maakt het script eerst twee versies per held en schurk om uit te kiezen. De avonturen zelf staan in `src/verhalen.ts`.

### Houdingen, schoenlogo en omkleuren

Alle drie draaien met dezelfde Python als `maak-flux.py`.

```bash
C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\houding.py
```

`houding.py` maakt blij en nadenken uit één basisplaatje per pak: alleen de armen worden opnieuw getekend, de rest blijft gelijk. De kandidaten komen in `stemproef/beeld/kandidaten` om te keuren (het script is nog in ontwikkeling).

```bash
C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\schoenlogo.py
```

`schoenlogo.py` zet het eigen K-logo op de schoenen van Super-Kick (zonder namen: alle plaatjes die nog geen logo hebben).

```bash
C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\herkleur.py stealth blij
```

`herkleur.py <pak> <houding>` maakt een pak van Agent Vroem door het klassieke plaatje om te kleuren.

## Icoontjes opnieuw maken

```bash
C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-icoon.py
```
