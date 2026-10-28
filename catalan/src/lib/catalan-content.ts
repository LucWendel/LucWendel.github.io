import eixample from "@/assets/eixample.jpg";
import calcots from "@/assets/calcots.jpg";
import castells from "@/assets/castells.jpg";
import sagrada from "@/assets/sagrada.jpg";
import sardana from "@/assets/sardana.jpg";

export type NodeKind = "lesson" | "culture" | "review";

export type PathNode = {
  id: string;
  kind: NodeKind;
  title: string;
  subtitle?: string;
  status: "completed" | "current" | "locked";
  duration?: string;
};

export type Unit = {
  id: string;
  index: string;
  title: string;
  motto?: string;
  subtitle: string;
  progress: number;
  accent: "heritage" | "med" | "gold";
  nodes: PathNode[];
};

export const UNITS: Unit[] = [
  {
    id: "unit-1",
    index: "Unitat 01",
    title: "Bon dia",
    motto: "Força, equilibri, valor i seny.",
    subtitle: "Greetings, introductions and the rhythm of a Catalan morning.",
    progress: 100,
    accent: "gold",
    nodes: [
      { id: "n1", kind: "lesson", title: "Basic greetings", status: "completed" },
      { id: "n2", kind: "culture", title: "Why Catalans say 'Bon dia'", duration: "4 min", status: "completed" },
      { id: "n3", kind: "lesson", title: "Numbers 1–10", status: "completed" },
    ],
  },
  {
    id: "unit-2",
    index: "Unitat 02",
    title: "The Spirit of the Ramblas",
    subtitle: "Order at the Mercat, greet the florists, find your way to the sea.",
    progress: 45,
    accent: "heritage",
    nodes: [
      { id: "n4", kind: "lesson", title: "At the market", status: "completed" },
      { id: "n5", kind: "culture", title: "The Castells tradition", duration: "8 min", status: "current" },
      { id: "n6", kind: "lesson", title: "Ordering at a bar", status: "locked" },
      { id: "n7", kind: "review", title: "Review: phrases", status: "locked" },
    ],
  },
  {
    id: "unit-3",
    index: "Unitat 03",
    title: "Festa Major",
    subtitle: "Sardanes, correfocs and the language of celebration.",
    progress: 0,
    accent: "med",
    nodes: [
      { id: "n8", kind: "lesson", title: "Days & months", status: "locked" },
      { id: "n9", kind: "culture", title: "Correfoc nights", duration: "6 min", status: "locked" },
      { id: "n10", kind: "lesson", title: "Inviting a friend", status: "locked" },
    ],
  },
];

export type CultureCard = {
  slug: string;
  title: string;
  catalanTitle: string;
  excerpt: string;
  image: string;
  tag: "Architecture" | "Tradition" | "Cuisine" | "Dance";
  readMinutes: number;
};

export const CULTURE: CultureCard[] = [
  {
    slug: "castells",
    title: "Castells: Human Towers",
    catalanTitle: "Els Castellers",
    excerpt:
      "Born in 18th-century Valls, the castell is a living metaphor for Catalan community — força, equilibri, valor i seny.",
    image: castells,
    tag: "Tradition",
    readMinutes: 6,
  },
  {
    slug: "sagrada-familia",
    title: "Gaudí's Stone Forest",
    catalanTitle: "La Sagrada Família",
    excerpt:
      "How Antoni Gaudí turned columns into trees, and a basilica into the most ambitious unfinished work in Europe.",
    image: sagrada,
    tag: "Architecture",
    readMinutes: 8,
  },
  {
    slug: "sardana",
    title: "The Sardana Circle",
    catalanTitle: "La Sardana",
    excerpt:
      "A dance held hand-in-hand, where strangers join the ring outside cathedrals on Sunday evenings.",
    image: sardana,
    tag: "Dance",
    readMinutes: 5,
  },
  {
    slug: "eixample",
    title: "The Eixample Grid",
    catalanTitle: "L'Eixample",
    excerpt:
      "Ildefons Cerdà's chamfered octagonal blocks were a 19th-century utopia for light, air and movement.",
    image: eixample,
    tag: "Architecture",
    readMinutes: 7,
  },
];

export type Dish = {
  name: string;
  catalan: string;
  description: string;
  image: string;
  region: string;
};

export const DISHES: Dish[] = [
  {
    name: "Calçots & Romesco",
    catalan: "La Calçotada",
    description:
      "Charred spring onions dipped in a smoky almond-and-pepper sauce. A messy winter feast eaten with a bib.",
    image: calcots,
    region: "Valls, Tarragona",
  },
  {
    name: "Pa amb tomàquet",
    catalan: "Pa amb tomàquet",
    description:
      "Country bread rubbed with ripe tomato, garlic and olive oil. The most Catalan thing on any table.",
    image: eixample,
    region: "All of Catalonia",
  },
  {
    name: "Crema Catalana",
    catalan: "Crema Catalana",
    description:
      "A custard kissed with lemon and cinnamon, finished with a torched caramel crust on Sant Josep.",
    image: sagrada,
    region: "Barcelona",
  },
];

export type Exercise = {
  prompt: string;
  catalan: string;
  options: { id: string; en: string; correct: boolean }[];
};

export const SAMPLE_EXERCISES: Record<string, Exercise[]> = {
  "n5": [
    {
      prompt: "Translate this phrase",
      catalan: "Bon dia, com va tot?",
      options: [
        { id: "a", en: "Good morning, how is everything?", correct: true },
        { id: "b", en: "Good night, where are you?", correct: false },
        { id: "c", en: "Hello, what is your name?", correct: false },
      ],
    },
    {
      prompt: "Select the Catalan word for 'thank you'",
      catalan: "—",
      options: [
        { id: "a", en: "Si us plau", correct: false },
        { id: "b", en: "Gràcies", correct: true },
        { id: "c", en: "Adéu", correct: false },
      ],
    },
    {
      prompt: "Translate this phrase",
      catalan: "M'agrada el pa amb tomàquet.",
      options: [
        { id: "a", en: "I'd like a coffee, please.", correct: false },
        { id: "b", en: "Where is the market?", correct: false },
        { id: "c", en: "I love bread with tomato.", correct: true },
      ],
    },
  ],
};

export const WORD_OF_DAY = {
  word: "Llibertat",
  ipa: "/ʎi.βəɾˈtat/",
  meaning: "Freedom",
  note: "A word painted on balconies across Catalonia.",
};
