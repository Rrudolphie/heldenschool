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

---

# Versie 4: natuurlijke stem en strak ontwerp

## Stem
- **Vooraf gemaakte, natuurlijke stem** in plaats van de robotstem van de iPad. Alle vaste zinnen (ongeveer 500) worden één keer op de pc gemaakt en als geluidjes in de app gezet. Dat werkt offline, kost niets en is samen ongeveer 5 tot 8 MB.
- **Eerst een stemproef:** proefzinnen met de Microsoft-stemmen (via een Node-hulpprogramma, eenmalig via internet) en met Piper (helemaal lokaal, los programma met Nederlandse stem). De ouder luistert en kiest.
- **Elke held een eigen stem:** bijvoorbeeld vrolijk voor de spinnenheld en stoer voor de ijzerheld.
- **Naam van het kind:** de ouder neemt de naam één keer op in het ouderscherm. De helden plakken die achter hun zinnen. De naam staat niet in de openbare app.
- **Eén spreker met wachtrij:** al het geluid gaat erdoorheen, dus vooraf gemaakte zinnen, eigen opnames, klanken en geluidseffecten. Er klinkt nooit meer iets door elkaar heen; een tik op een antwoord breekt het huidige geluid netjes af.
- **Eigen opnames** (welkom, complimenten, klanken) blijven werken en gaan voor op de vooraf gemaakte stem.
- **Zinnen met getallen** (bijv. "3 plus 4") worden als hele zin gemaakt. Voor tot 10 zijn dat er ongeveer 100.

## Ontwerp
- **Stijl A, rustig modern** (voorlopig; B en C kunnen nog): lichte achtergrond, witte kaarten, kleur alleen waar het telt, geen dikke zwarte randen en geen Comic Sans.
- **Lettertype Nunito** voor titels en knoppen; de oefenletters blijven in Andika.
- **Helden opnieuw getekend:** heldhaftige verhoudingen (breed, gespierd, kleiner hoofd), met schaduw en glans, in een stoere houding (handen in de zij). Blij: vuist omhoog. Denken: hand aan de kin.
- **Strakke eigen icoontjes** in plaats van de emoji-knoppen (huisje, luidspreker, slot, terug).
- **Achtergrond per held:** rekenen een rode sfeer met subtiele spinnenwebben, letters een gouden sfeer.
- **Vloeiende overgangen** tussen schermen en opdrachten.
- **Geluidseffecten:** "pling" bij goed, een zacht "boing" bij fout, "tadaa" bij missie klaar.

## Bouwvolgorde
1. Stemproef maken en de ouder laten kiezen (per held).
2. Alle zinnen maken, plus de spreker met wachtrij; de robotstem verdwijnt.
3. Nieuw ontwerp: kleuren, lettertype, icoontjes, achtergronden en overgangen.
4. Helden opnieuw tekenen (beide helden en alle pakken).
5. Geluidseffecten en het opnemen van de naam in het ouderscherm.
6. Testen en online zetten.

## Stemkeuze (stemproef afgerond)
- De Microsoft-dienst weigerde de verbinding; Piper klonk niet natuurlijk genoeg.
- Gekozen: het **AI-stemmodel Chatterbox (meertalig)**, lokaal op de videokaart van de pc (RTX 5060). Het staat in `C:\Users\robbi\Tools\ai-stem` (Python-omgeving `venv`, modelbestanden in `model`).
- **Spinnenheld:** de standaardstem van Chatterbox. **IJzerheld:** Chatterbox met de klankkleur van de Piper-stem Alex (`stemproef/piper-alex-spin.wav` als voorbeeld).
- Het script voor de proef staat in `scripts/ai-stemproef.py`.

## Bijsturing versie 4 (na feedback)
- **Helden:** de in code getekende helden zijn afgekeurd. Nieuwe aanpak: **realistische AI-plaatjes**, gemaakt met een lokaal beeldmodel (Stable Diffusion XL op de videokaart, `C:\Users\robbi\Tools\ai-beeld`). Ze zijn stoer en echt, duidelijk herkenbaar als spinnenheld en ijzerheld, maar geen exacte kopie en zonder officiële logo's, omdat de site openbaar is. Per held: 3 houdingen (stoer, juichen, denken) en de pakken.
- **Stemmen:** de eerste stemkeuze blijft (spin: standaard, ijzer: Alex), opnieuw ingesproken in een rustiger tempo en gecontroleerd door de spraakherkenner Whisper. Is een poging niet goed, dan volgt een nieuwe; de beste wordt bewaard.

## Verhalen: elke missie een kort avontuur
- Elke missie heeft een **ondeugende (niet enge) schurk**.
- **Begin:** een plaatje en een korte inleiding door de held.
- **Onderweg:** een pad met 10 stappen naar de schurk toe, met een aanmoediging halverwege.
- **Eind:** een feestplaatje en een slotzin.
- **Spinnenheld (rekenen):**
  1. Robot Bolt (stoplichten door elkaar)
  2. Kat Kladder (ballonnen van het kinderfeest gepikt)
  3. De Mopperwolk (regen op de kermis)
  4. Professor Wiebel (bouten uit de brug)
  5. De Snoepslurper (snoepwinkel leeggezogen)
- **IJzerheld (letters):**
  1. Letterdief Lodewijk (letters van het schoolbord)
  2. De Robotkrab (lichtjes van de haven)
  3. Mevrouw Mist (mist over de stad)
  4. De Magneetmuis (trekt fietsen en auto's naar zich toe)
  5. Kapitein Kriebel (piratenpapegaai met de verstopte schatkist)
- **Mix-missie:** beide helden samen tegen een van de schurken.

---

# Versie 5: levendiger en slimmer

## Eerst repareren
- **Rare geluiden voor en na de stem:** bij elke opname zoekt Whisper het eerste en laatste woord op, en alles daarbuiten (ademhaling, gemompel, naklank) wordt weggeknipt. Dit geldt voor alle bestaande opnames.

## Stemmen uitbreiden
- **Openingsscherm "Tik om te beginnen":** na de tik begroeten beide helden hem om de beurt. Spinnenheld: "Hoi (naam)! Zullen we samen een spelletje doen?" IJzerheld: "Kies maar: rekenen, letters of samen op missie!"
- **Troost bij een fout:** "Geeft niks, probeer het nog eens!", met per held een paar varianten.
- **Eigen complimenten per held:** bijvoorbeeld "Webtastisch!" en "Turbo goed!".
- **Afscheid bij stoppen:** "Tot de volgende keer, held!"
- **Kledingkast:** de helden zeggen iets over hun pak.
- **Tikken op de held:** grappige zinnen, zoals "Hihi, dat kietelt!".
- **De schurk reageert tijdens de missie:** 2 tot 3 zinnen per verhaal.

## Het hele scherm is het verhaal
- **Achtergrond:** het verhaalplaatje vult het scherm en schuift bij elke goede beurt van chaos naar opgelost.
- **De te redden dingen staan in beeld:** bijvoorbeeld 10 stoplichten of ballonnen. Bij elk goed antwoord wordt er één gered, met animatie en geluid, en een teller: "3 van de 10 stoplichten gerepareerd!".
- **De schurk als eigen stripkaart:** 10 extra AI-plaatjes. Hij staat tegenover de held, schudt bij elke redding en vlucht aan het eind.

## Interactieve held
- **Beweging:** de held ademt en zweeft, springt bij goed en schudt bij fout. Hij wisselt van houding.
- **Tekstwolkje:** wat de held zegt, verschijnt in een tekstwolkje, zoals in een strip.
- **Tikken op de held:** hij zegt iets grappigs en springt.
- **Superkracht na 3 keer goed op rij:** een webschot of laserstraal naar de schurk, met een effect over het scherm.

## Adaptief: moeilijker als het makkelijk gaat
- **Slimmer meegroeien binnen een niveau:** eerst tot 5, dan tot 10, en foute antwoorden die dichter bij het goede liggen. Snel en goed antwoorden betekent sneller omhoog.
- **Nieuwe rekenniveaus:** plus en min tot 20, met ongeveer 400 nieuwe ingesproken zinnen. Spinnetjes in rijtjes van 10.
- **Letters moeilijker:** meer letters tegelijk en op een hoger niveau 4 keuzes in plaats van 3.

## Bouwvolgorde
1. Geluiden voor en na de stem wegknippen (alle opnames).
2. Nieuwe zinnen schrijven en inspreken: begroeting, troost, complimenten, afscheid, kast, tikken en schurkreacties.
3. Schurkplaatjes maken (10 stuks).
4. Nieuw spelscherm: verhaal als achtergrond, te redden dingen, schurk, tekstwolk, bewegende held, superkracht en openingsscherm.
5. Adaptief meegroeien, sommen tot 20 (plus inspreken) en moeilijkere letters.
6. Testen en online zetten.

## Bijsturing versie 5: plaatjes komen tot leven
- "Interactief" betekent: de plaatjes moeten echt bewegen. Daarom maakt het AI-videomodel **Stable Video Diffusion** (lokaal, ca. 4 GB, `C:\Users\robbi\Tools\ai-beeld\svd`) korte bewegende versies, als geanimeerde WebP die heen en terug loopt (ca. 3 seconden).
- Wat beweegt: de helden in hun stoere houding (alle 14 pakken), de 10 schurken en de 10 beginplaatjes van de avonturen. De app gebruikt de bewegende versie automatisch zodra die bestaat (`*.anim.webp`).
- Script: `scripts/maak-film.py`.
