import type { EndingRule, NarrativeExhibitDef, TriggerRule } from "./narrative-types";
import type { ExhibitId, NpcId } from "./types";

type ExhibitOverride = Pick<
  NarrativeExhibitDef,
  "name" | "scanClueName" | "highlightKeyword" | "fuzzyKeywords" | "scanKeywords" | "observation"
>;

type TriggerOverride = Pick<TriggerRule, "rewardClueName" | "prompt" | "response" | "keywords">;

type EndingOverride = Pick<EndingRule, "title" | "description" | "feedback">;

export const ENGLISH_EXHIBIT_OVERRIDES: Record<ExhibitId, ExhibitOverride> = {
  E1: {
    name: "Peking University School of Pharmacy Commemorative Plate",
    scanClueName: "A complete keepsake of exchange",
    highlightKeyword: "Exchange",
    fuzzyKeywords: ["Commemoration", "Friendship"],
    scanKeywords: ["Exchange", "Commemoration", "Friendship"],
    observation: "This commemorative plate makes the history of exchange feel complete, formal, and lasting.",
  },
  E2: {
    name: "CUHK-Shenzhen Commemorative Coin",
    scanClueName: "A small coin carrying friendship",
    highlightKeyword: "Coin",
    fuzzyKeywords: ["Bond", "Witness"],
    scanKeywords: ["Coin", "Bond", "Witness"],
    observation: "A small commemorative coin carries a friendship that stretches across time between two universities.",
  },
  E3: {
    name: "Silk Textile",
    scanClueName: "Threads tracing the roots of computing",
    highlightKeyword: "Loom",
    fuzzyKeywords: ["Computing", "Origins"],
    scanKeywords: ["Loom", "Computing", "Origins"],
    observation: "This silk textile links modern computing back to the binary logic of punched cards and the Jacquard loom.",
  },
  E4: {
    name: "Mingzhou Yue Kiln Celadon Elephant",
    scanClueName: "The elephant and the blessing behind it",
    highlightKeyword: "Celadon",
    fuzzyKeywords: ["Good Fortune", "Warmth"],
    scanKeywords: ["Celadon", "Good Fortune", "Warmth"],
    observation: "The celadon elephant quietly carries the cultural echo between the character for elephant and the idea of good fortune.",
  },
  E5: {
    name: "Chess Set",
    scanClueName: "Different forms under shared rules",
    highlightKeyword: "Rules",
    fuzzyKeywords: ["Shared Ground", "Variety"],
    scanKeywords: ["Rules", "Shared Ground", "Variety"],
    observation: "The same rules take on completely different forms in different cultures.",
  },
  E6: {
    name: "Qin Dynasty Chariot from Xi'an Jiaotong University",
    scanClueName: "A chariot shaped by teamwork and drive",
    highlightKeyword: "Chariot",
    fuzzyKeywords: ["Heritage", "Collaboration"],
    scanKeywords: ["Chariot", "Heritage", "Collaboration"],
    observation: "The ancient chariot feels both like a feat of collaboration and a symbol of order set in motion.",
  },
  E7: {
    name: "Handwritten Celebration Calligraphy",
    scanClueName: "Emotion carried through ink",
    highlightKeyword: "Calligraphy",
    fuzzyKeywords: ["Brushwork", "Emotion"],
    scanKeywords: ["Calligraphy", "Brushwork", "Emotion"],
    observation: "Even when the words are not fully legible, the weight and rhythm of the ink already speak for themselves.",
  },
  E8: {
    name: "Canal Boat Model and Ceremonial Key",
    scanClueName: "A key pointing toward departure",
    highlightKeyword: "Key",
    fuzzyKeywords: ["Departure", "Connection"],
    scanKeywords: ["Key", "Departure", "Connection"],
    observation: "This key opens nothing, yet it feels like a reminder that a journey has already begun.",
  },
};

export const ENGLISH_TRIGGER_OVERRIDES: Record<string, TriggerOverride> = {
  "P1-E1-N1-F10": {
    rewardClueName: "The most winding donation",
    prompt: "Which donation had the longest detour?",
    response: "That commemorative plate sat in storage for a full year before anyone realized it carried the earliest spirit of exchange.",
    keywords: ["Donation", "Origins"],
  },
  "P1-E7-N1-F11": {
    rewardClueName: "Two objects, one shared line",
    prompt: "Are there two objects connected to the same exchange story?",
    response: "The calligraphy and the boat model were not gifts from the same moment, but they flow into the same long timeline of campus development.",
    keywords: ["Two Objects", "Timeline"],
  },
  "P1-E2-N2-F12": {
    rewardClueName: "A coin like a rite of passage",
    prompt: "As an exchange student, which object speaks to you most?",
    response: "She chose the coin and said it felt like a rite of passage shared between two universities, marking growth on both sides.",
    keywords: ["Rite of Passage", "Coin"],
  },
  "P1-E8-N3-F13": {
    rewardClueName: "The boat model and homesickness",
    prompt: "How does this exhibit make you feel after seeing it every day?",
    response: "The boat model always brings him back to the waterways of home, as if longing and distance have folded into the same route.",
    keywords: ["Homesickness", "Waterway"],
  },
  "P2-E4-N1-F14": {
    rewardClueName: "Explaining the elephant/blessing pun",
    prompt: "How would you explain the sound link between 'elephant' and 'blessing' to a non-Chinese audience?",
    response: "A pun is like a hidden seam in language. The Chinese sense of good fortune can sometimes find a parallel in English wordplay, but never in a one-to-one way.",
    keywords: ["Homophone", "Wordplay"],
  },
  "P2-E7-N1-F16": {
    rewardClueName: "Celebration calligraphy as blessing",
    prompt: "How would you talk about this celebratory calligraphy to someone overseas?",
    response: "The hardest part is not the literal meaning. It is the way the writing turns blessing into tone, and that tone often disappears in direct translation.",
    keywords: ["Blessing", "Brushwork"],
  },
  "P2-E7-N2-F15": {
    rewardClueName: "Ink that feels like speech",
    prompt: "What did you feel the first time you saw this piece?",
    response: "She said she could not read the characters, but the ink felt like tone of voice and the blank space felt like silence.",
    keywords: ["Ink", "Negative Space"],
  },
  "P2-E7-N3-F17": {
    rewardClueName: "Warmth in handwriting",
    prompt: "Can you read the characters in this calligraphy?",
    response: "He recognizes some of them, but what stays with him more is the force of the hand itself. Printed words never carry the same warmth.",
    keywords: ["Warmth", "Handwriting"],
  },
  "P3-E3-N1-F18": {
    rewardClueName: "A textile linking looms to computers",
    prompt: "Which exhibit is your personal favorite?",
    response: "This textile is the most brilliant one. It reminds us that even the newest invention still grows out of very old wisdom.",
    keywords: ["Origins", "Loom"],
  },
  "P3-E8-N3-F21": {
    rewardClueName: "A boat model carrying longing",
    prompt: "If you had to name just one exhibit that moved you most, which would it be?",
    response: "Still the boat model, because it feels closest to the private version of home someone carries while living far away.",
    keywords: ["Homesickness", "Boat Model"],
  },
  "P3-E7-N2-F19": {
    rewardClueName: "Calligraphy beyond translation",
    prompt: "If you could take one exhibit back to the UK, which would it be?",
    response: "She would take the calligraphy. Some things do not need translation. The lines and the breath inside them already speak.",
    keywords: ["Translation", "Aesthetics"],
  },
  "P3-E5-N2-F20": {
    rewardClueName: "Chess as internationalisation",
    prompt: "Which exhibit feels the most international to you?",
    response: "She says the chess set, because the rules stay the same while still leaving room for each culture to keep its own shape.",
    keywords: ["Internationalisation", "Rules"],
  },
  "P3-E6-N1-F22": {
    rewardClueName: "A chariot through two lenses",
    prompt: "What does the same chariot mean from two different cultural viewpoints?",
    response: "One person sees collaboration and craftsmanship. Another sees war and conquest. The same artifact throws two very different histories into view.",
    keywords: ["Two Perspectives", "Chariot"],
  },
  "P4-E7-N1-F23": {
    rewardClueName: "A suggestion to add a message wall",
    prompt: "If you were redesigning the exhibition, what would you add?",
    response: "He would add a message wall so visitors could write their own gifts and journeys into the exhibition itself.",
    keywords: ["Message Wall", "Participation"],
  },
  "P4-E4-N2-F24": {
    rewardClueName: "Quiet resonance in celadon",
    prompt: "Have you seen similar celadon pieces in your own country?",
    response: "She has seen Chinese ceramics before, but rarely an elephant this quiet, one that makes people from different cultures pause together.",
    keywords: ["Resonance", "Celadon"],
  },
  "P4-E5-N3-F25": {
    rewardClueName: "When touch becomes dialogue",
    prompt: "Which exhibit gets nudged out of place most often?",
    response: "The chess pieces get moved a little, but he thinks being moved is exactly how they join the conversation.",
    keywords: ["Dialogue", "Touch"],
  },
};

export const ENGLISH_ENDING_OVERRIDES: Record<string, EndingOverride> = {
  "p1-forgotten-and-missed": {
    title: "Forgotten Gifts, Lingering Longing",
    description: "Pair a delayed donation with quiet longing to reveal a warmer line in campus history.",
    feedback: "You placed the waiting of an object beside the longing of a person. The result feels quiet and moving.",
  },
  "p1-gift-timeline": {
    title: "Timeline of Gifts",
    description: "Turn gifts from different moments into one clear timeline of exchange.",
    feedback: "You mapped the order of those gifts clearly. A bit more human emotion would make the line even stronger.",
  },
  "p1-stories-behind-donations": {
    title: "Stories Behind the Donations",
    description: "Rebuild the path of exchange through gifts, timelines, and commemorative meaning.",
    feedback: "You connected donation details, gift timelines, and commemorative meaning with the clarity of a true archivist.",
  },
  "p1-key-and-boat": {
    title: "Key and Boat: Imagining the Way Home",
    description: "Let the key, boat, and idea of return form one gentle story of departure.",
    feedback: "You turned the key and the boat into a single story about departure and return. The tone feels beautifully consistent.",
  },
  "p2-homophones-and-coins": {
    title: "Homophones and Blessings",
    description: "Show how cross-cultural meaning must carry both literal sense and blessing.",
    feedback: "You brought together the wit of homophones and the tone of celebratory writing. This feels like real cultural explanation, not just literal translation.",
  },
  "p2-warmth-of-handwriting": {
    title: "The Warmth of Handwriting",
    description: "Use two different reactions to reveal the human warmth inside calligraphy.",
    feedback: "You let the same calligraphy carry different warmth for two people. The line is delicate, and it feels true.",
  },
  "p2-depth-of-translation": {
    title: "The Depth of Translation",
    description: "Place homophones beside ink and turn them into a story about understanding.",
    feedback: "You showed the full arc from misunderstanding to discovery to understanding. That is translation at its best.",
  },
  "p3-homesickness-and-aesthetics": {
    title: "Homesickness and Aesthetics",
    description: "Frame homesickness and cross-cultural aesthetics within one interview lens.",
    feedback: "You let longing and aesthetics sit side by side. It feels like a very reporter-like kind of double observation.",
  },
  "p3-rules-and-change": {
    title: "Rules and Change",
    description: "Use chess and the chariot to show how cultures reshape shared rules.",
    feedback: "You caught the tension between shared rules and different interpretations. That is a solid editorial instinct.",
  },
  "p3-silent-support-and-genuine-longing": {
    title: "Origins and Longing",
    description: "Place the roots of technology beside homesickness, and show how people look back while moving on.",
    feedback: "You placed returning to origins beside homesickness abroad. The line is quiet, but it carries real emotional weight.",
  },
  "p3-human-voices": {
    title: "Human Voices",
    description: "Let many voices share one page until they become a real oral history.",
    feedback: "What you gathered is no longer just evidence. It is a full oral history made of human voices.",
  },
  "p4-intern-complete-record": {
    title: "A Complete Volunteer Record",
    description: "Capture all three suggestions and turn them into notes that can guide the exhibition.",
    feedback: "You recorded all three voices. These volunteer notes are already strong enough to support a new educational display.",
  },
  "p4-message-wall-and-chess": {
    title: "Message Wall and Chess",
    description: "See how visitor notes and shifting chess pieces bring an exhibition to life.",
    feedback: "You captured the moment where visitors begin to participate. The exhibition shifts from being viewed to being answered.",
  },
  "p4-quietness-and-touch": {
    title: "Quietness and Touch",
    description: "Let the stillness of celadon and the touch of chess form a quieter volunteer story.",
    feedback: "You paired stillness and touch with precision. The exhibition now feels like something completed together by people and objects.",
  },
};

export const ENGLISH_FALLBACK_DIALOGUE: Record<NpcId, string> = {
  N1: "I do not have any extra context to add about this object right now.",
  N2: "Nothing new comes to mind about this object just yet.",
  N3: "I see it every day, but I do not have a new story to add this time.",
};
