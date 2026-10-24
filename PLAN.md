# Spider Sommen – plan

Rekenapp voor een kind van 5, met een spinnenheld in Spider-Man-stijl. Alleen voor thuisgebruik.

## Uitgangspunten
- **Apparaat:** iPad, bediend met tikken. Grote knoppen.
- **Vorm:** web-app (PWA) met Vite + TypeScript. Op de iPad: Safari → Deel → "Zet op beginscherm". Werkt offline.
- **Online zetten:** GitHub Pages (openbare repository). Er staan geen persoonlijke gegevens in de code.
- **Kosten:** geen.

## Thema en uiterlijk
- Een spinnenheld die dicht bij Spider-Man ligt: rood-blauw pak, webpatroon, masker met grote witte ogen en een spin op de borst. Vrolijke cartoonstijl.
- Geen officiële naam of logo.
- De held wordt vernoemd naar de zoon ("Spider-[naam]"). De naam wordt ingevuld op het ouderscherm en alleen op de iPad bewaard.
- Alle plaatjes zijn in code getekend (SVG). Verbeteren gaat door het aan Claude te vragen.

## Rekenen
- Vier niveaus: tellen (hoeveel spinnetjes?), cijfers herkennen, plus tot 10, min tot 10.
- **Het niveau groeit mee:** na 5 keer goed op rij gaat hij een niveau omhoog, bij veel fouten een stapje terug.
- **Antwoorden:** hij kiest uit 3 grote cijferknoppen.
- **Bij een fout antwoord:** een vriendelijke hint ("Bijna! Tel maar mee"), de spinnetjes lichten één voor één op en de foute knop verdwijnt.
- **Rondes van 10 sommen**, met aan het eind een feestje ("Missie klaar!").

## Geluid
- De Nederlandse stem van de iPad leest alle opdrachten voor (Web Speech API).
- Versie 2: eigen opnames van leuke zinnetjes ("Super gedaan!"). Die neem je op in de app en ze worden alleen op de iPad bewaard.

## Beloning
- Elke goede som levert een ster op. Met sterren speel je nieuwe pakken of kleuren voor de held vrij.

## Ouderscherm
- Verborgen: vinger 3 seconden op het logo houden.
- Je ziet wat hij goed kan en waar hij moeite mee heeft, je past het niveau aan en je vult de naam in.

## Versie 1 (eerst bouwen)
- Held (SVG), 4 somsoorten, 3 antwoordknoppen, voorlezen, hulp bij fouten, rondes van 10, sterren tellen, meegroeiend niveau, PWA (offline, beginscherm).

## Versie 2 (klaar)
- **Pakken:** 7 pakken (Klassiek, Nacht, Jungle, Goud, IJs, Galaxy, Vuur), vrij bij 0, 10, 25, 40, 60, 80 en 100 sterren in totaal. Sterren worden niet uitgegeven. Kledingkast via "👕 Pakken"; na een ronde volgt een feestje met een knop "Aantrekken!".
- **Ouderscherm:** slotje rechtsonder 2,5 seconde vasthouden. Naam, niveau, voortgang per somsoort (oranje = nog moeite), stemopnames en voortgang wissen.
- **Eigen stem:** 5 zinnetjes (welkom, 3 complimenten, missie klaar), max. 5 seconden, bewaard in IndexedDB op de iPad. Complimenten wisselen af met de iPad-stem.

## Nog open
- GitHub-account: regelen pas bij het online zetten.
