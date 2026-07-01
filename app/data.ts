// Content for "The Ryan Chronicles" — a postcard through twenty years.
// Copy is intentionally Dutch, matching the design handoff.

export type Milestone = {
  age: string;
  title: string;
  text: string;
  /** Ages 0, 2, 5, 8, 10, 13, 15, 18, 19, 20 show a photo placeholder. */
  photo?: boolean;
  /** Ages 16-20 show a "klik mij niet" peeker that unlocks the secret page. */
  peek?: boolean;
  /** Which side the peeker pokes out from. */
  peekSide?: "left" | "right";
  /** Flavour flags carried through from the design (not rendered directly). */
  trip?: boolean;
  big?: boolean;
};

export const milestones: Milestone[] = [
  { age: "0", title: "Het begin", text: "Ryan komt ter wereld — klein, luid, en meteen het middelpunt van alles.", photo: true },
  { age: "1", title: "Eerste stapjes", text: "Wankelend door de kamer, en nu al onderweg." },
  { age: "2", title: "Kleine ontdekker", text: "Elke kast, elke la — niets was veilig.", photo: true },
  { age: "3", title: "Eigen wijsje", text: "De vragen begonnen en stopten eigenlijk nooit meer." },
  { age: "4", title: "Beste vriendjes", text: "Vond zijn mensen op de speelplaats." },
  { age: "5", title: "Schooltijd", text: "Eerste schooldag, rugzak groter dan hijzelf.", photo: true },
  { age: "6", title: "Op wielen", text: "Leerde fietsen — en wilde niet meer afremmen." },
  { age: "7", title: "De verzamelaar", text: "Een fase voor alles. Meestal allemaal tegelijk." },
  { age: "8", title: "Teamspeler", text: "Sport, geschaafde knieën en een echte winnaarsmentaliteit.", photo: true },
  { age: "9", title: "Logeerseizoen", text: "Eindeloze avonden met snacks en nul uur slaap." },
  { age: "10", title: "Dubbele cijfers", text: "Tien jaar en heel erg trots.", photo: true },
  { age: "11", title: "Nieuwe hobby’s", text: "Pakte dingen snel op, liet er ook een paar vallen." },
  { age: "12", title: "Groeien maar", text: "Elke week langer, elke dag grappiger." },
  { age: "13", title: "Tiener", text: "Officieel tiener. Het ogenrollen begon.", photo: true },
  { age: "14", title: "Zijn ding vinden", text: "Begon te ontdekken waar hij écht van hield." },
  { age: "15", title: "De crew", text: "Vriendschappen die er nu nog steeds zijn.", photo: true },
  { age: "16", title: "Onafhankelijk", text: "Eerste baantje, eerste echte vrijheid.", peek: true, peekSide: "right" },
  { age: "17", title: "Grote dromen", text: "Plannen groter dan de muren van zijn kamer.", peek: true, peekSide: "left" },
  { age: "18", title: "Volwassen", text: "Achttien — en klaar voor de wereld.", photo: true, peek: true, peekSide: "right" },
  { age: "19", title: "Griekenland roept", text: "Op naar Corfu voor een stage bij Ikos Dassia. Het avontuur van het jaar.", photo: true, trip: true, peek: true, peekSide: "left" },
  { age: "20", title: "Twintig", text: "En hier zijn we. Gefeliciteerd Ryan — deze is voor jou.", photo: true, big: true, peek: true, peekSide: "right" },
];

export type GalleryItem = {
  /** Short caption shown under the polaroid. */
  label: string;
  /** Fuller caption shown in the lightbox. */
  caption: string;
};

export const galleryItems: GalleryItem[] = [
  { label: "oude stad", caption: "Corfu · oude stad" },
  { label: "zonsondergang", caption: "Ikos Dassia · zonsondergang" },
  { label: "strand", caption: "Stranddag" },
  { label: "onderweg", caption: "Onderweg" },
];

export type Message = { name: string; text: string };

// Placeholder messages — replace name/text with real ones from friends & family.
export const messages: Message[] = [
  { name: "Voeg een naam toe", text: "Jouw verjaardagswens komt hier — schrijf iets waar Ryan over tien jaar nog om moet lachen." },
  { name: "Voeg een naam toe", text: "Een favoriete herinnering, een inside joke, of gewoon een dikke gefeliciteerd." },
  { name: "Voeg een naam toe", text: "Laat een wens achter voor het jaar dat komt. Hij leest ze allemaal." },
];
