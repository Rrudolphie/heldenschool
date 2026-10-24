# Spider Sommen

Rekenapp voor de iPad met een spinnenheld. Zie [PLAN.md](PLAN.md) voor alle keuzes.

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

De klare app staat dan in de map `dist`. Die zetten we straks op GitHub Pages.

## Icoontjes opnieuw maken

```bash
npm run icons
```
