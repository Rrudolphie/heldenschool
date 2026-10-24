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

---

# Versie 3: Heldenschool

De app wordt breder: rekenen én letters, voor groep 2 en 3. Nieuwe naam: **Heldenschool**.

## Opbouw
- **Startscherm = keuzescherm** met drie grote knoppen:
  - **Rekenen** met de spinnenheld (alles van versie 1 en 2)
  - **Letters** met de ijzerheld (nieuw)
  - **Mix-missie**: sommen en letteropdrachten wisselen elkaar af, en de held die erbij hoort verschijnt
- Kledingkast, ouderscherm en offline werken blijven zoals ze zijn.

## Twee helden
- **Spinnenheld** (lijkt op Spider-Man) bij rekenen.
- **Ijzerheld** (lijkt op Iron Man) bij letters: rood-goud harnas, gloeiende lamp op de borst en een gezichtsmasker met lichtgevende ogen. Geen officiële naam of logo.
- Naam op het ouderscherm: "Spider-[naam]" en "Iron-[naam]". De naam blijft alleen op de iPad en komt niet in de openbare code.

## Sterren en pakken
- **Elke held heeft eigen sterren:** rekenen levert sterren op voor de spinnenheld, letters voor de ijzerheld. Bij de Mix-missie gaat elke ster naar de held van die opdracht.
- **Elke held heeft eigen pakken.** Voor de ijzerheld komen er nieuwe, bijvoorbeeld Zilver, Stealth, Ruimte en Goud.
- De sterren die hij nu al heeft, horen bij de spinnenheld. De ijzerheld begint bij 0.

## Letters
- **Kleine letters**, in een schoolachtig lettertype (een 'a' zonder krul). Hoofdletters kunnen later met één schakelaar in het ouderscherm.
- **De ouder kiest de letters:** in het ouderscherm vink je aan welke letters hij al kent, en alleen die worden geoefend. Later kan er een keuze voor een leesmethode van school bij (bijv. Veilig Leren Lezen); daar houd ik de opzet geschikt voor.
- Versie 3 bevat alleen het alfabet. Klanken als aa, oe en ui komen later, eventueel samen met de methode.
- **Plaatjes:** emoji van de iPad (🐟 vis, 🌙 maan, 🌳 boom). Per letter minstens 3 woorden.
- **Oefeningen (niveaus), van makkelijk naar moeilijk:**
  1. **Beginklank:** plaatje en voorgelezen woord ("Waarmee begint 🐟 vis?"). Hij kiest uit 3 letters.
  2. **Letter herkennen:** hij ziet een grote letter en kiest het plaatje dat met die letter begint (3 plaatjes).
  3. **Hakken en plakken:** hij hoort "m – aa – n" en kiest het juiste plaatje. *Staat standaard uit.*
  4. **Woordje lezen:** hij ziet een kort woord en kiest het juiste plaatje. *Staat standaard uit.*
- Niveau 1 en 2 groeien vanzelf mee, net als bij rekenen. **Niveau 3 en 4 zet de ouder aan in het ouderscherm** zodra hij eraan toe is; pas daarna kan hij er vanzelf naartoe groeien.
- **Klanken:** de oefeningen gebruiken zoveel mogelijk hele woorden, want die spreekt de iPad-stem goed uit. Voor hakken en plakken kun je de klanken zelf opnemen in het ouderscherm; zolang die er niet zijn, doet de iPad-stem zijn best.
- Hulp bij een fout antwoord, rondes van 10 en voorlezen werken net als bij rekenen. Bij een fout antwoord zegt de ijzerheld bijvoorbeeld het woord nog een keer langzaam ("vvvis").

## Ouderscherm (uitbreiding)
- Per wereld een niveau en de voortgang.
- Letterraster om letters aan te vinken.
- Schakelaars voor hakken en plakken en voor woordjes lezen (later ook voor hoofdletters).
- Opnames van klanken (voor hakken en plakken).

## Hernoemen
- De GitHub-repository wordt `heldenschool`. Het nieuwe adres wordt **https://rrudolphie.github.io/heldenschool/**. Het icoontje zet je één keer opnieuw op het beginscherm.
- Sterren, pakken en opnames blijven bewaard, omdat ze bij `rrudolphie.github.io` horen.
- De projectmap op de pc mag blijven heten zoals hij heet, of wordt hernoemd naar `Heldenschool`.

## Bouwvolgorde
1. Keuzescherm met werelden, sterren per held en het hernoemen naar Heldenschool.
2. Ijzerheld tekenen, plus de pakken.
3. Letters: beginklank en letter herkennen, met letterraster in het ouderscherm.
4. Mix-missie.
5. Woordjes lezen en hakken en plakken (met klankopnames), achter de schakelaar.
