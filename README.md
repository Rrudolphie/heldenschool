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

## Icoontjes opnieuw maken

```bash
npm run icons
```
