import {
  getExhibitIdForClue,
  getExhibitRule,
  getRoleStories,
  getTriggerByRewardClue,
} from "./narrative-rules";
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

const NPC_HINTS: Record<NpcId, string> = {
  N1: "也许她懂典故",
  N2: "也许他有共鸣",
  N3: "也许他见得多",
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
    title: "汉教助理",
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
    keywords: ["参与", "引导"],
    intro: "我想把这场展览真正变成观众可以参与、回应并留下痕迹的现场。",
    whyHere: "我来到这里，是为了判断哪些展品与互动线索，最能支撑一次真正有效的教育展示。",
    mission: "优先收集与留言、共鸣、互动和对话有关的线索。",
    nextStep: "先扫描与公共参与相关的展品，再通过 NPC 对话补上现场反馈。",
  },
};

function sortStoriesForHome(stories: EndingRule[]) {
  return [...stories].sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function groupStoriesByScore(stories: EndingRule[]) {
  const sortedStories = sortStoriesForHome(stories);
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
): HomeTierStoryChip {
  return {
    storyId: story.storyId,
    label: STORY_CHIP_LABELS[story.storyId] ?? story.title,
    isComplete: isStoryComplete(story, collectedClueIds, viewedEndingStoryIds),
  };
}

export function getRoleBriefing(roleId: RoleId) {
  return ROLE_BRIEFINGS[roleId];
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
    const trigger = getTriggerByRewardClue(roleId, activeContextDialogueClue as DialogueClueId);
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

    const trigger = getTriggerByRewardClue(roleId, clueId as DialogueClueId);
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

function formatHomeHint(action: HomeHintAction) {
  if (action.type === "done") {
    return "HINT ：全部线索已集齐";
  }

  if (action.type === "talk") {
    return `HINT ：${NPC_HINTS[action.npcId]}`;
  }

  if (action.type === "scan") {
    return `HINT ：${EXHIBIT_HINTS[action.exhibitId]}`;
  }

  return "HINT ：再四处看看";
}

export function getHomeProgressState(
  roleId: RoleId,
  collectedClueIds: ClueId[],
  viewedEndingStoryIds: string[],
): HomeProgressState {
  const storyGroups = groupStoriesByScore(getRoleStories(roleId));
  const activeGroup = storyGroups.find(
    (group) => !group.every((story) => isStoryComplete(story, collectedClueIds, viewedEndingStoryIds)),
  );

  if (!activeGroup) {
    const finalStory = storyGroups.at(-1)?.at(0) ?? null;
    const totalClueIds = finalStory?.requiresAll ?? [];

    return {
      activeStory: finalStory,
      currentTierStories: (storyGroups.at(-1) ?? []).map((story) =>
        getHomeStoryChip(story, collectedClueIds, viewedEndingStoryIds),
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
    currentTierStories: activeGroup.map((story) => getHomeStoryChip(story, collectedClueIds, viewedEndingStoryIds)),
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
) {
  const progress = getHomeProgressState(roleId, collectedClueIds, viewedEndingStoryIds);

  if (progress.isAllComplete) {
    return formatHomeHint({ type: "done" });
  }

  return formatHomeHint(
    getHomeHintAction(
      roleId,
      progress.activeStory,
      collectedClueIds,
      scannedExhibits,
      consumedTriggerIds,
      lastScannedExhibitId,
    ),
  );
}
