import {
  getExhibitIdForClue,
  getRoleStories,
  getTriggerByRewardClue,
} from "./narrative-rules";
import type { AppLanguage } from "./i18n";
import type { ClueId, DialogueClueId, EndingRule } from "./narrative-types";
import type { ExhibitId, NpcId, RoleId } from "./types";

export interface RoleBriefing {
  title: string;
  keywords: [string, string];
  intro: string;
  whyHere: string;
  mission: string;
  nextStep: string;
}

export interface HomeProgressState {
  activeStory: EndingRule | null;
  currentTierStories: HomeTierStoryChip[];
  matchedClueIds: ClueId[];
  totalClueIds: ClueId[];
  completedCount: number;
  totalCount: number;
  isAllComplete: boolean;
}

export interface HomeTierStoryChip {
  storyId: string;
  label: string;
  isComplete: boolean;
}

type HomeHintAction =
  | { type: "done" }
  | { type: "fallback" }
  | { type: "scan"; exhibitId: ExhibitId; needsRescan: boolean; npcId?: NpcId }
  | { type: "talk"; exhibitId: ExhibitId; npcId: NpcId };

const EXHIBIT_HINTS: Record<ExhibitId, string> = {
  E1: "先看旧礼物",
  E2: "也许有见证",
  E3: "去找源头线",
  E4: "留意温润处",
  E5: "规则里有别",
  E6: "看看谁驱动",
  E7: "字里有情绪",
  E8: "远行由此起",
};

const EXHIBIT_HINTS_EN: Record<ExhibitId, string> = {
  E1: "Check the earliest gift",
  E2: "Look for a witness",
  E3: "Trace it back",
  E4: "Watch for quiet meaning",
  E5: "There is more in the rules",
  E6: "See what drives it",
  E7: "The emotion is in the ink",
  E8: "Every journey starts here",
};

const NPC_HINTS: Record<NpcId, string> = {
  N1: "也许她懂典故",
  N2: "也许他有共鸣",
  N3: "也许他见得多",
};

const NPC_HINTS_EN: Record<NpcId, string> = {
  N1: "She may know the backstory",
  N2: "He may relate to it",
  N3: "He has seen a lot",
};

const STORY_CHIP_LABELS: Record<string, string> = {
  "p1-forgotten-and-missed": "旧物回声",
  "p1-gift-timeline": "礼物来路",
  "p1-stories-behind-donations": "捐赠脉络",
  "p1-key-and-boat": "远行想象",
  "p2-homophones-and-coins": "寓意传达",
  "p2-warmth-of-handwriting": "字间温度",
  "p2-depth-of-translation": "文化转译",
  "p3-homesickness-and-aesthetics": "异乡情绪",
  "p3-rules-and-change": "规则变奏",
  "p3-silent-support-and-genuine-longing": "源头回望",
  "p3-human-voices": "人物回声",
  "p4-intern-complete-record": "完整记录",
  "p4-message-wall-and-chess": "参与反馈",
  "p4-quietness-and-touch": "共鸣体验",
};

const STORY_CHIP_LABELS_EN: Record<string, string> = {
  "p1-forgotten-and-missed": "Forgotten Echoes",
  "p1-gift-timeline": "Gift Timeline",
  "p1-stories-behind-donations": "Donation Trail",
  "p1-key-and-boat": "Homeward Journey",
  "p2-homophones-and-coins": "Meaning in Words",
  "p2-warmth-of-handwriting": "Warm Handwriting",
  "p2-depth-of-translation": "Translation Depth",
  "p3-homesickness-and-aesthetics": "Longing Abroad",
  "p3-rules-and-change": "Rules Reframed",
  "p3-silent-support-and-genuine-longing": "Looking Back",
  "p3-human-voices": "Human Voices",
  "p4-intern-complete-record": "Complete Notes",
  "p4-message-wall-and-chess": "Participation & Feedback",
  "p4-quietness-and-touch": "Quiet Resonance",
};

const ROLE_BRIEFINGS: Record<RoleId, RoleBriefing> = {
  P1: {
    title: "校史档案员",
    keywords: ["考证", "脉络"],
    intro: "我受托整理一批被忽略的馆藏线索，希望重新拼出校史叙事里被遗漏的部分。",
    whyHere: "我来到展厅，是为了确认展品之间的真实捐赠脉络，而不是只停留在展示标签表面。",
    mission: "优先收集能说明捐赠关系、纪念意义与校际交流的关键线索。",
    nextStep: "先去扫描更多与馆藏和校史有关的展品，再找 NPC 核对细节。",
  },
  P2: {
    title: "海外生学友",
    keywords: ["跨文化", "语言"],
    intro: "我想从展品与人物叙述中找到跨文化表达真正成立的瞬间。",
    whyHere: "我来到这里，是为了理解语言、谐音与书写背后的文化含义如何被传递给国际学生。",
    mission: "优先收集与翻译、谐音、书写温度相关的线索。",
    nextStep: "先扫描可能包含语言象征的展品，再向不同 NPC 追问文化解释。",
  },
  P3: {
    title: "校报记者",
    keywords: ["纪实", "观察"],
    intro: "我正在尝试写出一篇真正有温度的报道，而不是只记录展品信息。",
    whyHere: "我来到展厅，是为了找出人物、规则和情感之间如何交织成一条完整故事线。",
    mission: "优先收集能体现人物视角、制度变化和真实情绪的线索。",
    nextStep: "先找到最能触发采访价值的展品，再通过 NPC 对话补齐背景。",
  },
  P4: {
    title: "博物馆志愿者",
    keywords: ["互动", "导览"],
    intro: "我想把这场展览真正变成观众可以参与、回应并留下痕迹的现场。",
    whyHere: "我来到这里，是为了判断哪些展品与互动线索，最能支撑一次真正有效的教育展示。",
    mission: "优先收集与留言、共鸣、互动和对话有关的线索。",
    nextStep: "先扫描与公共参与相关的展品，再通过 NPC 对话补上现场反馈。",
  },
};

const ROLE_BRIEFINGS_EN: Record<RoleId, RoleBriefing> = {
  P1: {
    title: "History Archivist",
    keywords: ["Trace", "Archive"],
    intro: "I have been asked to sort through overlooked collection clues and piece back together the parts of campus history that slipped out of view.",
    whyHere: "I am here to verify how these objects were really donated and connected, not just to repeat what is already printed on the labels.",
    mission: "Prioritise clues that reveal donation routes, commemorative meaning, and the history of exchange between universities.",
    nextStep: "Scan more exhibits tied to collections and campus history first, then check the details with NPCs.",
  },
  P2: {
    title: "Global Buddy",
    keywords: ["Teach", "Share"],
    intro: "I want to find the moments where language and cultural explanation truly land across different backgrounds.",
    whyHere: "I am here to understand how homophones, wording, and handwriting carry meaning for international students beyond direct translation.",
    mission: "Prioritise clues related to translation, sound-based meaning, and the warmth inside handwritten expression.",
    nextStep: "Start with exhibits rich in language symbolism, then ask different NPCs for their cultural reading.",
  },
  P3: {
    title: "Press Fellow",
    keywords: ["Write", "Watch"],
    intro: "I want to write vivid, human stories, not just neat summaries of the exhibits, the people, and the moments around them.",
    whyHere: "I am here to see how people, systems, and emotion weave together into a complete narrative worth reporting.",
    mission: "Prioritise clues that reveal human perspective, changing rules, and genuine emotion.",
    nextStep: "Find the exhibits with the strongest interview potential first, then use NPC conversations to fill in the story.",
  },
  P4: {
    title: "Gallery Guide",
    keywords: ["Tour", "Help"],
    intro: "I want this exhibition to feel like a living space where visitors can respond, participate, and leave something behind.",
    whyHere: "I am here to judge which exhibits and interactive clues could support an educational display that actually works.",
    mission: "Prioritise clues related to comments, resonance, interaction, and conversation.",
    nextStep: "Scan exhibits tied to public participation first, then use NPC conversations to gather on-site feedback.",
  },
};

function sortStoriesForHome(stories: EndingRule[], language: AppLanguage) {
  return [...stories].sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title, language === "en" ? "en-US" : "zh-CN");
  });
}

function groupStoriesByScore(stories: EndingRule[], language: AppLanguage) {
  const sortedStories = sortStoriesForHome(stories, language);
  const groups: EndingRule[][] = [];

  for (const story of sortedStories) {
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup[0].score !== story.score) {
      groups.push([story]);
    } else {
      lastGroup.push(story);
    }
  }

  return groups;
}

function getMatchedCount(story: EndingRule, collectedClueIds: ClueId[]) {
  return story.requiresAll.filter((clueId) => collectedClueIds.includes(clueId)).length;
}

function isStoryComplete(story: EndingRule, collectedClueIds: ClueId[], viewedEndingStoryIds: string[]) {
  return (
    viewedEndingStoryIds.includes(story.storyId) ||
    story.requiresAll.every((clueId) => collectedClueIds.includes(clueId))
  );
}

function getHomeStoryChip(
  story: EndingRule,
  collectedClueIds: ClueId[],
  viewedEndingStoryIds: string[],
  language: AppLanguage,
): HomeTierStoryChip {
  const labels = language === "en" ? STORY_CHIP_LABELS_EN : STORY_CHIP_LABELS;
  return {
    storyId: story.storyId,
    label: labels[story.storyId] ?? story.title,
    isComplete: isStoryComplete(story, collectedClueIds, viewedEndingStoryIds),
  };
}

export function getRoleBriefing(roleId: RoleId, language: AppLanguage = "zh") {
  return language === "en" ? ROLE_BRIEFINGS_EN[roleId] : ROLE_BRIEFINGS[roleId];
}

function getMissingClueIds(activeStory: EndingRule | null, collectedClueIds: ClueId[]) {
  if (!activeStory) {
    return [];
  }

  return activeStory.requiresAll.filter((clueId) => !collectedClueIds.includes(clueId));
}

function getHomeHintAction(
  roleId: RoleId,
  activeStory: EndingRule | null,
  collectedClueIds: ClueId[],
  scannedExhibits: ExhibitId[],
  consumedTriggerIds: string[],
  lastScannedExhibitId: ExhibitId | null,
  language: AppLanguage,
): HomeHintAction {
  const missingClueIds = getMissingClueIds(activeStory, collectedClueIds);
  if (!missingClueIds.length) {
    return { type: "fallback" };
  }

  const activeContextDialogueClue = missingClueIds.find((clueId) => {
    if (Number(clueId.slice(1)) <= 8 || !lastScannedExhibitId) {
      return false;
    }

    const trigger = getTriggerByRewardClue(roleId, clueId as DialogueClueId);
    return (
      !!trigger &&
      trigger.exhibitId === lastScannedExhibitId &&
      !consumedTriggerIds.includes(trigger.triggerId)
    );
  });

  if (activeContextDialogueClue) {
    const trigger = getTriggerByRewardClue(roleId, activeContextDialogueClue as DialogueClueId, language);
    if (trigger) {
      return {
        type: "talk",
        exhibitId: trigger.exhibitId,
        npcId: trigger.npcId,
      };
    }
  }

  for (const clueId of missingClueIds) {
    const exhibitId = getExhibitIdForClue(roleId, clueId);
    if (!exhibitId) {
      continue;
    }

    if (Number(clueId.slice(1)) <= 8) {
      return { type: "scan", exhibitId, needsRescan: false };
    }

    const trigger = getTriggerByRewardClue(roleId, clueId as DialogueClueId, language);
    if (!trigger) {
      return { type: "scan", exhibitId, needsRescan: false };
    }

    if (!scannedExhibits.includes(exhibitId)) {
      return {
        type: "scan",
        exhibitId,
        needsRescan: false,
        npcId: trigger.npcId,
      };
    }

    if (lastScannedExhibitId !== exhibitId) {
      return {
        type: "scan",
        exhibitId,
        needsRescan: true,
        npcId: trigger.npcId,
      };
    }

    if (!consumedTriggerIds.includes(trigger.triggerId)) {
      return {
        type: "talk",
        exhibitId,
        npcId: trigger.npcId,
      };
    }
  }

  return { type: "fallback" };
}

function formatHomeHint(action: HomeHintAction, language: AppLanguage) {
  const exhibitHints = language === "en" ? EXHIBIT_HINTS_EN : EXHIBIT_HINTS;
  const npcHints = language === "en" ? NPC_HINTS_EN : NPC_HINTS;

  if (action.type === "done") {
    return language === "en" ? "HINT: All clues collected" : "HINT ：全部线索已集齐";
  }

  if (action.type === "talk") {
    return language === "en" ? `HINT: ${npcHints[action.npcId]}` : `HINT ：${npcHints[action.npcId]}`;
  }

  if (action.type === "scan") {
    return language === "en"
      ? `HINT: ${exhibitHints[action.exhibitId]}`
      : `HINT ：${exhibitHints[action.exhibitId]}`;
  }

  return language === "en" ? "HINT: Take another look around" : "HINT ：再四处看看";
}

export function getHomeProgressState(
  roleId: RoleId,
  collectedClueIds: ClueId[],
  viewedEndingStoryIds: string[],
  language: AppLanguage = "zh",
): HomeProgressState {
  const storyGroups = groupStoriesByScore(getRoleStories(roleId, language), language);
  const activeGroup = storyGroups.find(
    (group) => !group.every((story) => isStoryComplete(story, collectedClueIds, viewedEndingStoryIds)),
  );

  if (!activeGroup) {
    const finalStory = storyGroups.at(-1)?.at(0) ?? null;
    const totalClueIds = finalStory?.requiresAll ?? [];

    return {
      activeStory: finalStory,
      currentTierStories: (storyGroups.at(-1) ?? []).map((story) =>
        getHomeStoryChip(story, collectedClueIds, viewedEndingStoryIds, language),
      ),
      matchedClueIds: totalClueIds,
      totalClueIds,
      completedCount: totalClueIds.length,
      totalCount: totalClueIds.length,
      isAllComplete: true,
    };
  }

  const incompleteStories = activeGroup.filter(
    (story) => !isStoryComplete(story, collectedClueIds, viewedEndingStoryIds),
  );
  const activeStory =
    [...incompleteStories].sort((a, b) => {
      const matchedDiff = getMatchedCount(b, collectedClueIds) - getMatchedCount(a, collectedClueIds);
      if (matchedDiff !== 0) {
        return matchedDiff;
      }
      if (a.requiresAll.length !== b.requiresAll.length) {
        return a.requiresAll.length - b.requiresAll.length;
      }
      return b.priority - a.priority;
    })[0] ?? activeGroup[0];

  const matchedClueIds = activeStory.requiresAll.filter((clueId) => collectedClueIds.includes(clueId));

  return {
    activeStory,
    currentTierStories: activeGroup.map((story) =>
      getHomeStoryChip(story, collectedClueIds, viewedEndingStoryIds, language),
    ),
    matchedClueIds,
    totalClueIds: activeStory.requiresAll,
    completedCount: matchedClueIds.length,
    totalCount: activeStory.requiresAll.length,
    isAllComplete: false,
  };
}

export function getHomeHint(
  roleId: RoleId,
  collectedClueIds: ClueId[],
  scannedExhibits: ExhibitId[],
  consumedTriggerIds: string[],
  lastScannedExhibitId: ExhibitId | null,
  viewedEndingStoryIds: string[],
  language: AppLanguage = "zh",
) {
  const progress = getHomeProgressState(roleId, collectedClueIds, viewedEndingStoryIds, language);

  if (progress.isAllComplete) {
    return formatHomeHint({ type: "done" }, language);
  }

  return formatHomeHint(
    getHomeHintAction(
      roleId,
      progress.activeStory,
      collectedClueIds,
      scannedExhibits,
      consumedTriggerIds,
      lastScannedExhibitId,
      language,
    ),
    language,
  );
}
