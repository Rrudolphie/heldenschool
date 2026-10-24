// De avonturen: elke missie heeft een ondeugende (niet enge) schurk en een probleem
// dat de held stap voor stap oplost. Plaatjes staan in public/beeld/ (gemaakt met
// scripts/maak-beeld.py); de zinnen worden vooraf ingesproken (zie zinnen.ts).
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
    schurkPortret: 'portrait of a clumsy cute little robot villain with blinking lights and a mischievous grin',
    held: 'spin',
    schurk: 'Robot Bolt',
    ding: 'stoplichten',
    intro: 'Oh nee! Robot Bolt heeft alle stoplichten in de stad door elkaar gezet. Help jij mij ze te repareren?',
    halverwege: 'Goed bezig! De auto’s rijden al een beetje beter. Nog even volhouden!',
    slot: 'Gelukt! Alle stoplichten werken weer. Robot Bolt gaat voortaan netjes wachten op groen!',
    beeldBegin: 'a clumsy cute little robot fiddling with traffic lights at a busy city crossing, cars honking, cartoon chaos',
    beeldEind: 'a happy city crossing with working traffic lights, a little robot waiting politely at the curb, sunny day',
  },
  {
    id: 'kladder',
    reacties: ['Kat Kladder blaast van schrik! Ga zo door!', 'Kat Kladder rent over het dak. We hebben hem bijna!'],
    icoon: '🎈',
    icoonKapot: '🎈',
    schurkPortret: 'portrait of a mischievous cartoon cat villain with a sly grin holding a balloon string',
    held: 'spin',
    schurk: 'Kat Kladder',
    ding: 'ballonnen',
    intro: 'Kijk daar! Kat Kladder heeft alle ballonnen van het kinderfeest gepikt. Zullen we ze terughalen?',
    halverwege: 'Super! De helft van de ballonnen is al terug. Ga zo door!',
    slot: 'Hoera! Alle ballonnen zijn terug en het feest kan beginnen. Kat Kladder mag ook een ballon!',
    beeldBegin: 'a mischievous cartoon cat running across rooftops holding a big bunch of colorful party balloons',
    beeldEind: 'a cheerful kids birthday party in a garden full of colorful balloons, a cat smiling with one balloon',
  },
  {
    id: 'mopperwolk',
    reacties: ['De Mopperwolk moppert: brrr, wat een zon!', 'De Mopperwolk wordt steeds kleiner!'],
    icoon: '☀️',
    icoonKapot: '🌧️',
    schurkPortret: 'portrait of a grumpy dark cartoon rain cloud villain with an angry face and little lightning bolts',
    held: 'spin',
    schurk: 'de Mopperwolk',
    ding: 'zonnestralen',
    intro: 'Brrr! De Mopperwolk laat het regenen op de kermis. Met elke goede som sturen we een zonnestraal!',
    halverwege: 'Kijk, de zon komt al tevoorschijn! Nog een paar zonnestralen!',
    slot: 'De zon schijnt weer! De Mopperwolk moet lachen en de kermis gaat weer open!',
    beeldBegin: 'a grumpy dark cartoon cloud with an angry face raining over an empty colorful funfair with a ferris wheel',
    beeldEind: 'a sunny funfair with a ferris wheel and happy people, a small fluffy white cloud smiling in the blue sky',
  },
  {
    id: 'wiebel',
    reacties: ['Professor Wiebel krabt op zijn hoofd. Hij snapt er niks van!', 'Professor Wiebel laat zijn sleutel vallen!'],
    icoon: '🔩',
    icoonKapot: '🔩',
    schurkPortret: 'portrait of a goofy cartoon mad scientist villain with wild white hair, goggles and a giant wrench',
    held: 'spin',
    schurk: 'Professor Wiebel',
    ding: 'bouten',
    intro: 'Help! Professor Wiebel heeft de bouten uit de grote brug gehaald. Hij wiebelt helemaal! Zullen we ze vastdraaien?',
    halverwege: 'Mooi zo! De brug wiebelt al veel minder. Nog een paar bouten!',
    slot: 'Klaar! De brug staat weer stevig. Professor Wiebel belooft dat hij voortaan alleen nog pudding laat wiebelen!',
    beeldBegin: 'a goofy cartoon scientist with wild hair and a giant wrench removing bolts from a big wobbly suspension bridge',
    beeldEind: 'a strong steady suspension bridge over a river at sunset with cars driving safely across',
  },
  {
    id: 'snoepslurper',
    reacties: ['De Snoepslurper krijgt de hik! Hik!', 'De Snoepslurper zijn slurf raakt in de knoop!'],
    icoon: '🍬',
    icoonKapot: '🍬',
    schurkPortret: 'portrait of a funny cartoon creature villain with a long vacuum-cleaner trunk nose and candy stuck on it',
    held: 'spin',
    schurk: 'de Snoepslurper',
    ding: 'snoepjes',
    intro: 'O jee! De Snoepslurper heeft de hele snoepwinkel leeggezogen. Zullen we het snoep terughalen?',
    halverwege: 'Lekker bezig! De potten raken alweer vol. Nog even!',
    slot: 'Gelukt! De snoepwinkel is weer vol. En de Snoepslurper? Die krijgt één snoepje, maar alleen als hij het eerlijk vraagt!',
    beeldBegin: 'a funny cartoon creature with a long vacuum-cleaner nose sucking up candy from jars in a colorful candy shop',
    beeldEind: 'a colorful candy shop with full candy jars, a funny creature politely holding one lollipop',
  },
  {
    id: 'lodewijk',
    reacties: ['Letterdief Lodewijk laat letters vallen uit zijn zak!', 'Letterdief Lodewijk struikelt over een a!'],
    icoon: '🔤',
    icoonKapot: '🔤',
    schurkPortret: 'portrait of a sneaky cartoon thief villain in a striped shirt and eye mask carrying a sack of letters',
    held: 'ijzer',
    schurk: 'Letterdief Lodewijk',
    ding: 'letters',
    intro: 'Wat is dit? Letterdief Lodewijk heeft alle letters van het schoolbord gestolen! Help jij mij ze terug te zetten?',
    halverwege: 'Knap! De helft van de letters staat alweer op het bord. Nog even!',
    slot: 'Alle letters zijn terug! Letterdief Lodewijk gaat nu zelf leren lezen in de klas!',
    beeldBegin: 'a sneaky cartoon thief in a striped shirt and mask running out of a classroom with a sack full of colorful alphabet letters',
    beeldEind: 'a bright classroom with a chalkboard full of colorful letters, a reformed thief sitting at a desk reading a book',
  },
  {
    id: 'robotkrab',
    reacties: ['De Robotkrab klappert boos met zijn scharen!', 'De Robotkrab loopt zijwaarts weg!'],
    icoon: '💡',
    icoonKapot: '💡',
    schurkPortret: 'portrait of a cute mechanical robot crab villain with big snipping claws and glowing eyes',
    held: 'ijzer',
    schurk: 'de Robotkrab',
    ding: 'lampjes',
    intro: 'Het is donker in de haven! De Robotkrab heeft alle lampjes doorgeknipt. Zullen we ze weer laten branden?',
    halverwege: 'Het wordt al lichter in de haven! Nog een paar lampjes!',
    slot: 'Alle lampjes branden weer! De Robotkrab knipt voortaan alleen nog papier!',
    beeldBegin: 'a cute mechanical robot crab snipping cables with its claws in a dark harbor at night with boats',
    beeldEind: 'a cozy harbor at night glowing with string lights and lanterns, boats, a robot crab cutting paper shapes',
  },
  {
    id: 'mist',
    reacties: ['Mevrouw Mist zucht: oeh, wat een wind!', 'Mevrouw Mist wordt steeds doorzichtiger!'],
    icoon: '✨',
    icoonKapot: '🌫️',
    schurkPortret: 'portrait of a whimsical cartoon lady villain made of swirling gray fog with a misty dress',
    held: 'ijzer',
    schurk: 'Mevrouw Mist',
    ding: 'wolkjes mist',
    intro: 'Ik zie bijna niks! Mevrouw Mist heeft de hele stad in dikke mist gehuld. Met elk goed antwoord blazen we mist weg!',
    halverwege: 'Ik zie de huizen alweer! Nog een beetje mist!',
    slot: 'Alle mist is weg! De stad is weer helder, en Mevrouw Mist gaat lekker zweven boven de zee!',
    beeldBegin: 'a whimsical cartoon lady made of fog with a misty dress blowing thick gray fog over a small city',
    beeldEind: 'a clear sunny small city with colorful houses, a friendly misty lady floating far away over the sea',
  },
  {
    id: 'magneetmuis',
    reacties: ['De Magneetmuis piept: hé, mijn fietsen!', 'De Magneetmuis haar magneet begint te wiebelen!'],
    icoon: '🚲',
    icoonKapot: '🚲',
    schurkPortret: 'portrait of a tiny cartoon mouse villain holding a giant red horseshoe magnet with a cheeky grin',
    held: 'ijzer',
    schurk: 'de Magneetmuis',
    ding: 'fietsen en auto’s',
    intro: 'Wat gebeurt er? De Magneetmuis trekt alle fietsen en auto’s naar zich toe! Help jij mij ze los te halen?',
    halverwege: 'Goed zo! Al veel fietsen zijn los. Nog even!',
    slot: 'Alles is los! De Magneetmuis gebruikt haar magneet nu alleen nog om haar kaas op te ruimen!',
    beeldBegin: 'a tiny cartoon mouse holding a giant horseshoe magnet pulling bicycles and toy cars into a big pile on a street',
    beeldEind: 'a tidy street with bicycles parked neatly and cars, a tiny mouse using a small magnet to stack cheese',
  },
  {
    id: 'kriebel',
    reacties: ['Kapitein Kriebel krijst: mijn goud, mijn goud!', 'Kapitein Kriebel verliest zijn piratenhoed!'],
    icoon: '🪙',
    icoonKapot: '🪙',
    schurkPortret: 'portrait of a funny cartoon pirate parrot villain with an eyepatch and a big pirate hat',
    held: 'ijzer',
    schurk: 'Kapitein Kriebel',
    ding: 'gouden muntjes',
    intro: 'Ahoi! Kapitein Kriebel, de piratenpapegaai, heeft de schatkist verstopt. Met elk goed antwoord vinden we een gouden muntje!',
    halverwege: 'Kijk eens hoeveel goud! We zijn al halverwege!',
    slot: 'De schatkist is gevonden! Kapitein Kriebel krijgt een cracker en deelt de schat met iedereen!',
    beeldBegin: 'a funny cartoon pirate parrot with an eyepatch and pirate hat hiding a treasure chest on a tropical beach',
    beeldEind: 'an open treasure chest full of gold coins on a sunny tropical beach, a happy pirate parrot eating a cracker',
  },
]

export const verhalenVan = (held: HeldId) => VERHALEN.filter((v) => v.held === held)

export const mixIntro = (v: Verhaal) =>
  `${v.schurk.replace(/^de /, 'De ')} is weer bezig! De spinnenheld en de ijzerheld gaan samen op missie!`
