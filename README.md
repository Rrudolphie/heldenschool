# Heldenschool

Leerapp voor de iPad (groep 2 en 3): rekenen met de spinnenheld, letters met de ijzerheld. Zie [PLAN.md](PLAN.md) voor alle keuzes.

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

Ontbreekt een zin toch, dan zegt de iPad-stem hem als reserve.

## Plaatjes (helden en avonturen)

De helden (stripstijl, 7 pakken × 3 houdingen per held) en de begin- en eindplaatjes van de avonturen staan in `public/beeld/`. Ze zijn gemaakt met het lokale AI-beeldmodel Stable Diffusion XL (`C:\Users\robbi\Tools\ai-beeld`). Nieuwe of verwijderde plaatjes maak je zo opnieuw (bestaande worden overgeslagen):

```bash
C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-beeld.py
```

De avonturen zelf staan in `src/verhalen.ts`.

## Icoontjes opnieuw maken

```bash
npm run icons
```
