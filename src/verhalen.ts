// De avonturen: elke missie heeft een stoere maar niet enge schurk en een probleem
// dat de held stap voor stap oplost. Plaatjes staan in public/beeld/ (gemaakt met
// scripts/maak-flux.py); de zinnen worden vooraf ingesproken (zie zinnen.ts).
import type { HeldId } from './opslag'

export type Verhaal = {
  id: string
  held: HeldId
  schurk: string
  /** wat er bij elke goede beurt hersteld wordt (meervoud, voor "nog 5 ... te gaan") */
  ding: string
  intro: string
  halverwege: string
  slot: string
  /** wat de schurk roept tijdens de missie (na stap 3 en stap 7) */
  reacties: string[]
  /** icoontje van een gered ding, en van een nog niet gered ding (wordt grijs getoond) */
  icoon: string
  icoonKapot: string
  /** beschrijving van het schurkplaatje voor het AI-beeldmodel */
  schurkPortret: string
  /** beschrijving voor het AI-beeldmodel (Engels werkt het best) */
  beeldBegin: string
  beeldEind: string
}

export const VERHALEN: Verhaal[] = [
  {
    id: 'bolt',
    reacties: ['Kijk, Robot Bolt wordt boos! Zijn lampjes knipperen!', 'Robot Bolt probeert weg te rollen. Snel, nog een paar!'],
    icoon: '🚦',
    icoonKapot: '🚦',
    schurkPortret: 'Robot Bolt: a big boxy traffic robot with a square head and one large round glowing red camera eye, yellow and black hazard stripes on dark grey armor, traffic light parts on its shoulders, smug pose',
    held: 'spin',
    schurk: 'Robot Bolt',
    ding: 'stoplichten',
    intro: 'Oh nee! Robot Bolt heeft alle stoplichten in de stad door elkaar gezet. Help jij mij ze te repareren?',
    halverwege: 'Goed bezig! De auto’s rijden al een beetje beter. Nog even volhouden!',
    slot: 'Gelukt! Alle stoplichten werken weer. Robot Bolt gaat voortaan netjes wachten op groen!',
    beeldBegin: 'a big boxy dark grey robot with one red camera eye and hazard stripes messing up the traffic lights at a busy city crossing at dusk, cars honking, chaos',
    beeldEind: 'a calm city crossing with working traffic lights at sunset, cars driving neatly, a big boxy robot waiting politely at the curb',
  },
  {
    id: 'kladder',
    reacties: ['Kat Kladder blaast van schrik! Ga zo door!', 'Kat Kladder rent over het dak. We hebben hem bijna!'],
    icoon: '🎈',
    icoonKapot: '🎈',
    schurkPortret: 'Kat Kladder: a sly upright cat burglar with sleek black and orange fur, a dark hoodie and fingerless gloves, holding a big bunch of colorful balloons, smirking',
    held: 'spin',
    schurk: 'Kat Kladder',
    ding: 'ballonnen',
    intro: 'Kijk daar! Kat Kladder heeft alle ballonnen van het kinderfeest gepikt. Zullen we ze terughalen?',
    halverwege: 'Super! De helft van de ballonnen is al terug. Ga zo door!',
    slot: 'Hoera! Alle ballonnen zijn terug en het feest kan beginnen. Kat Kladder mag ook een ballon!',
    beeldBegin: 'a sly upright black and orange cat burglar in a dark hoodie running across city rooftops at dusk holding a huge bunch of colorful party balloons',
    beeldEind: 'a cheerful kids birthday party in a sunny garden full of colorful balloons, an upright cat in a dark hoodie holding one balloon and smiling',
  },
  {
    id: 'mopperwolk',
    reacties: ['De Mopperwolk moppert: brrr, wat een zon!', 'De Mopperwolk wordt steeds kleiner!'],
    icoon: '☀️',
    icoonKapot: '🌧️',
    schurkPortret: 'de Mopperwolk: a big floating dark grey storm cloud character with a grumpy cartoon face and glowing eyes, small lightning bolts and rain below it, only a cloud, no body, no arms, no legs',
    held: 'spin',
    schurk: 'de Mopperwolk',
    ding: 'zonnestralen',
    intro: 'Brrr! De Mopperwolk laat het regenen op de kermis. Met elke goede som sturen we een zonnestraal!',
    halverwege: 'Kijk, de zon komt al tevoorschijn! Nog een paar zonnestralen!',
    slot: 'De zon schijnt weer! De Mopperwolk moet lachen en de kermis gaat weer open!',
    beeldBegin: 'a huge dark grey storm cloud with two small horns and a grumpy face pouring rain and lightning over an empty funfair with a ferris wheel at dusk',
    beeldEind: 'a sunny funfair with a ferris wheel and happy people, a small white cloud smiling in the bright blue sky',
  },
  {
    id: 'wiebel',
    reacties: ['Professor Wiebel krabt op zijn hoofd. Hij snapt er niks van!', 'Professor Wiebel laat zijn sleutel vallen!'],
    icoon: '🔩',
    icoonKapot: '🔩',
    schurkPortret: 'Professor Wiebel: a tall lanky mad inventor with wild white hair, big brass goggles, a long dark leather coat and a giant wrench, smug grin',
    held: 'spin',
    schurk: 'Professor Wiebel',
    ding: 'bouten',
    intro: 'Help! Professor Wiebel heeft de bouten uit de grote brug gehaald. Hij wiebelt helemaal! Zullen we ze vastdraaien?',
    halverwege: 'Mooi zo! De brug wiebelt al veel minder. Nog een paar bouten!',
    slot: 'Klaar! De brug staat weer stevig. Professor Wiebel belooft dat hij voortaan alleen nog pudding laat wiebelen!',
    beeldBegin: 'a lanky mad inventor in a long dark coat and goggles with a giant wrench removing huge bolts from a big wobbling suspension bridge, dramatic sky',
    beeldEind: 'a strong steady suspension bridge over a river at sunset with cars driving safely across',
  },
  {
    id: 'snoepslurper',
    reacties: ['De Snoepslurper krijgt de hik! Hik!', 'De Snoepslurper zijn slurf raakt in de knoop!'],
    icoon: '🍬',
    icoonKapot: '🍬',
    schurkPortret: 'de Snoepslurper: a chubby purple creature with a long vacuum-hose trunk for a nose with candy stuck to it, big sly eyes and a greedy closed-mouth grin, no teeth',
    held: 'spin',
    schurk: 'de Snoepslurper',
    ding: 'snoepjes',
    intro: 'O jee! De Snoepslurper heeft de hele snoepwinkel leeggezogen. Zullen we het snoep terughalen?',
    halverwege: 'Lekker bezig! De potten raken alweer vol. Nog even!',
    slot: 'Gelukt! De snoepwinkel is weer vol. En de Snoepslurper? Die krijgt één snoepje, maar alleen als hij het eerlijk vraagt!',
    beeldBegin: 'a chubby purple horned creature with a long vacuum-hose trunk nose sucking candy out of jars in a colorful candy shop, candy flying through the air',
    beeldEind: 'a colorful candy shop with full candy jars, a chubby purple horned creature with a trunk nose politely holding one lollipop',
  },
  {
    id: 'lodewijk',
    reacties: ['Letterdief Lodewijk laat letters vallen uit zijn zak!', 'Letterdief Lodewijk struikelt over een a!'],
    icoon: '🔤',
    icoonKapot: '🔤',
    schurkPortret: 'Letterdief Lodewijk: a lean master thief in a black and grey striped shirt, black domino eye mask, black flat cap and gloves, carrying a sack with colorful alphabet letters spilling out, tiptoe pose, sneaky grin',
    held: 'ijzer',
    schurk: 'Letterdief Lodewijk',
    ding: 'letters',
    intro: 'Wat is dit? Letterdief Lodewijk heeft alle letters van het schoolbord gestolen! Help jij mij ze terug te zetten?',
    halverwege: 'Knap! De helft van de letters staat alweer op het bord. Nog even!',
    slot: 'Alle letters zijn terug! Letterdief Lodewijk gaat nu zelf leren lezen in de klas!',
    beeldBegin: 'a lean masked thief in a black and grey striped shirt sneaking out of a classroom at night with a sack full of colorful alphabet letters',
    beeldEind: 'a bright classroom with a chalkboard full of colorful letters, a thief in a striped shirt without his mask sitting at a desk reading a book',
  },
  {
    id: 'robotkrab',
    reacties: ['De Robotkrab klappert boos met zijn scharen!', 'De Robotkrab loopt zijwaarts weg!'],
    icoon: '💡',
    icoonKapot: '💡',
    schurkPortret: 'de Robotkrab: a big chunky mechanical crab with a shiny orange and gunmetal shell, two huge snipping claws raised, two round glowing eyes on short stalks, six short legs',
    held: 'ijzer',
    schurk: 'de Robotkrab',
    ding: 'lampjes',
    intro: 'Het is donker in de haven! De Robotkrab heeft alle lampjes doorgeknipt. Zullen we ze weer laten branden?',
    halverwege: 'Het wordt al lichter in de haven! Nog een paar lampjes!',
    slot: 'Alle lampjes branden weer! De Robotkrab knipt voortaan alleen nog papier!',
    beeldBegin: 'a big chunky mechanical crab with a shiny orange and gunmetal shell and two huge claws snipping power cables in a dark harbor at night, boats, sparks',
    beeldEind: 'a cozy harbor at night glowing with string lights and lanterns, boats, a chunky orange mechanical crab cutting paper shapes',
  },
  {
    id: 'mist',
    reacties: ['Mevrouw Mist zucht: oeh, wat een wind!', 'Mevrouw Mist wordt steeds doorzichtiger!'],
    icoon: '✨',
    icoonKapot: '🌫️',
    schurkPortret: 'Mevrouw Mist: a mysterious elegant lady with long silver hair in a flowing grey cloak that dissolves into swirling fog, sly smile',
    held: 'ijzer',
    schurk: 'Mevrouw Mist',
    ding: 'wolkjes mist',
    intro: 'Ik zie bijna niks! Mevrouw Mist heeft de hele stad in dikke mist gehuld. Met elk goed antwoord blazen we mist weg!',
    halverwege: 'Ik zie de huizen alweer! Nog een beetje mist!',
    slot: 'Alle mist is weg! De stad is weer helder, en Mevrouw Mist gaat lekker zweven boven de zee!',
    beeldBegin: 'a mysterious lady in a flowing grey cloak of fog blowing thick grey mist over a small city at dusk',
    beeldEind: 'a clear sunny small city with colorful houses, a lady in a grey cloak floating far away over the sea',
  },
  {
    id: 'magneetmuis',
    reacties: ['De Magneetmuis piept: hé, mijn fietsen!', 'De Magneetmuis haar magneet begint te wiebelen!'],
    icoon: '🚲',
    icoonKapot: '🚲',
    schurkPortret: 'de Magneetmuis: a cheeky mouse villain standing upright in a dark tech suit with goggles, holding a giant glowing red horseshoe magnet, mischievous grin',
    held: 'ijzer',
    schurk: 'de Magneetmuis',
    ding: 'fietsen en auto’s',
    intro: 'Wat gebeurt er? De Magneetmuis trekt alle fietsen en auto’s naar zich toe! Help jij mij ze los te halen?',
    halverwege: 'Goed zo! Al veel fietsen zijn los. Nog even!',
    slot: 'Alles is los! De Magneetmuis gebruikt haar magneet nu alleen nog om haar kaas op te ruimen!',
    beeldBegin: 'a cheeky upright mouse in a dark tech suit holding a giant glowing horseshoe magnet pulling bicycles and cars into a big pile on a city street',
    beeldEind: 'a tidy street with bicycles parked neatly and cars, a small upright mouse using a tiny magnet to stack cheese',
  },
  {
    id: 'kriebel',
    reacties: ['Kapitein Kriebel krijst: mijn goud, mijn goud!', 'Kapitein Kriebel verliest zijn piratenhoed!'],
    icoon: '🪙',
    icoonKapot: '🪙',
    schurkPortret: 'Kapitein Kriebel: a big pirate parrot captain with bright red and blue feathers, an eyepatch, a long dark captain coat and a big pirate hat, sly grin',
    held: 'ijzer',
    schurk: 'Kapitein Kriebel',
    ding: 'gouden muntjes',
    intro: 'Ahoi! Kapitein Kriebel, de piratenpapegaai, heeft de schatkist verstopt. Met elk goed antwoord vinden we een gouden muntje!',
    halverwege: 'Kijk eens hoeveel goud! We zijn al halverwege!',
    slot: 'De schatkist is gevonden! Kapitein Kriebel krijgt een cracker en deelt de schat met iedereen!',
    beeldBegin: 'a big pirate parrot captain in a dark coat and pirate hat hiding a treasure chest on a tropical beach at sunset, ship in the bay',
    beeldEind: 'an open treasure chest full of gold coins on a sunny tropical beach, a pirate parrot captain happily eating a cracker',
  },
]

export const verhalenVan = (held: HeldId) => VERHALEN.filter((v) => v.held === held)

export const mixIntro = (v: Verhaal) =>
  `${v.schurk.replace(/^de /, 'De ')} is weer bezig! Super-Kick en Agent Vroem gaan samen op missie!`
