import { getRoleStories } from "./narrative-rules";
import type { ClueId, EndingRule } from "./narrative-types";
import type { RoleId } from "./types";

export interface RoleBriefing {
  title: string;
  intro: string;
  whyHere: string;
  mission: string;
  nextStep: string;
}

export interface HomeProgressState {
  activeStory: EndingRule | null;
  currentTierStories: EndingRule[];
  matchedClueIds: ClueId[];
  totalClueIds: ClueId[];
  completedCount: number;
  totalCount: number;
  isAllComplete: boolean;
}

const ROLE_BRIEFINGS: Record<RoleId, RoleBriefing> = {
  P1: {
    title: "校史档案员",
    intro: "你受托整理一批被忽略的馆藏线索，希望重新拼出校史叙事里被遗漏的部分。",
    whyHere: "你来到展厅，是为了确认展品之间的真实捐赠脉络，而不是只停留在展示标签表面。",
    mission: "优先收集能说明捐赠关系、纪念意义与校际交流的关键线索。",
    nextStep: "先去扫描更多与馆藏和校史有关的展品，再找 NPC 核对细节。",
  },
  P2: {
    title: "汉教助理",
    intro: "你想从展品与人物叙述中找到跨文化表达真正成立的瞬间。",
    whyHere: "你来到这里，是为了理解语言、谐音与书写背后的文化含义如何被传递给国际学生。",
    mission: "优先收集与翻译、谐音、书写温度相关的线索。",
    nextStep: "先扫描可能包含语言象征的展品，再向不同 NPC 追问文化解释。",
  },
  P3: {
    title: "校报记者",
    intro: "你正在尝试写出一篇真正有温度的报道，而不是只记录展品信息。",
    whyHere: "你来到展厅，是为了找出人物、规则和情感之间如何交织成一条完整故事线。",
    mission: "优先收集能体现人物视角、制度变化和真实情绪的线索。",
    nextStep: "先找到最能触发采访价值的展品，再通过 NPC 对话补齐背景。",
  },
  P4: {
    title: "博物馆志愿者",
    intro: "你想把这场展览真正变成观众可以参与、回应并留下痕迹的现场。",
    whyHere: "你来到这里，是为了判断哪些展品与互动线索，最能支撑一次真正有效的教育展示。",
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

function isStoryComplete(story: EndingRule, collectedClueIds: ClueId[]) {
  return story.requiresAll.every((clueId) => collectedClueIds.includes(clueId));
}

export function getRoleBriefing(roleId: RoleId) {
  return ROLE_BRIEFINGS[roleId];
}

export function getHomeProgressState(roleId: RoleId, collectedClueIds: ClueId[]): HomeProgressState {
  const storyGroups = groupStoriesByScore(getRoleStories(roleId));
  const activeGroup = storyGroups.find(
    (group) => !group.every((story) => isStoryComplete(story, collectedClueIds)),
  );

  if (!activeGroup) {
    const finalStory = storyGroups.at(-1)?.at(0) ?? null;
    const totalClueIds = finalStory?.requiresAll ?? [];

    return {
      activeStory: finalStory,
      currentTierStories: storyGroups.at(-1) ?? [],
      matchedClueIds: totalClueIds,
      totalClueIds,
      completedCount: totalClueIds.length,
      totalCount: totalClueIds.length,
      isAllComplete: true,
    };
  }

  const incompleteStories = activeGroup.filter((story) => !isStoryComplete(story, collectedClueIds));
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
    currentTierStories: activeGroup,
    matchedClueIds,
    totalClueIds: activeStory.requiresAll,
    completedCount: matchedClueIds.length,
    totalCount: activeStory.requiresAll.length,
    isAllComplete: false,
  };
}
