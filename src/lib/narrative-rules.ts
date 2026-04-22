import rulesJson from "./narrative-rules.json";
import type { AppLanguage } from "./i18n";
import { ENGLISH_ENDING_OVERRIDES, ENGLISH_EXHIBIT_OVERRIDES, ENGLISH_FALLBACK_DIALOGUE, ENGLISH_TRIGGER_OVERRIDES } from "./narrative-english";
import type {
  ClueId,
  DialogueCheckResult,
  DialogueClueId,
  EndingReconstruction,
  EndingCheckResult,
  EndingRule,
  NarrativeExhibitDef,
  NarrativeRules,
  RoleRuleSet,
  ScanResult,
  StoryProgress,
  TriggerRule,
} from "./narrative-types";
import { getClueKeywordCopy, getStoryReconstructionCopy } from "./narrative-reconstruction";
import type { ExhibitId, NpcId, RoleId } from "./types";

export const NARRATIVE_RULES = rulesJson as NarrativeRules;

export function getRoleRuleSet(roleId: RoleId): RoleRuleSet {
  return NARRATIVE_RULES.roles[roleId];
}

function localizeEnding(ending: EndingRule, language: AppLanguage): EndingRule {
  if (language === "zh") {
    return ending;
  }

  const override = ENGLISH_ENDING_OVERRIDES[ending.storyId];
  return override ? { ...ending, ...override } : ending;
}

function localizeTrigger(trigger: TriggerRule, language: AppLanguage): TriggerRule {
  if (language === "zh") {
    return trigger;
  }

  const override = ENGLISH_TRIGGER_OVERRIDES[trigger.triggerId];
  return override ? { ...trigger, ...override } : trigger;
}

function localizeExhibit(exhibit: NarrativeExhibitDef, language: AppLanguage): NarrativeExhibitDef {
  if (language === "zh") {
    return exhibit;
  }

  const override = ENGLISH_EXHIBIT_OVERRIDES[exhibit.id];
  return override ? { ...exhibit, ...override } : exhibit;
}

export function getRoleStories(roleId: RoleId, language: AppLanguage = "zh"): EndingRule[] {
  return [...getRoleRuleSet(roleId).endings].map((ending) => localizeEnding(ending, language)).sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.title.localeCompare(b.title, language === "en" ? "en-US" : "zh-CN");
  });
}

export function getStoryRule(storyId: string, language: AppLanguage = "zh"): (EndingRule & { roleId: RoleId }) | undefined {
  const roleIds = Object.keys(NARRATIVE_RULES.roles) as RoleId[];

  for (const roleId of roleIds) {
    const ending = NARRATIVE_RULES.roles[roleId].endings.find((entry) => entry.storyId === storyId);
    if (ending) {
      return { ...localizeEnding(ending, language), roleId };
    }
  }

  return undefined;
}

export function getStoryReconstruction(storyId: string, language: AppLanguage = "zh"): EndingReconstruction | undefined {
  return getStoryReconstructionCopy(storyId, language);
}

export function getClueKeyword(clueId: ClueId, language: AppLanguage = "zh"): string {
  return getClueKeywordCopy(clueId, language);
}

export function getExhibitRule(exhibitId: ExhibitId, language: AppLanguage = "zh"): NarrativeExhibitDef {
  return localizeExhibit(NARRATIVE_RULES.exhibits[exhibitId], language);
}

export function getAllExhibitRules(language: AppLanguage = "zh"): NarrativeExhibitDef[] {
  return (Object.values(NARRATIVE_RULES.exhibits) as NarrativeExhibitDef[]).map((exhibit) =>
    localizeExhibit(exhibit, language),
  );
}

export function getExhibitRuleByTargetImageId(targetImageId: string, language: AppLanguage = "zh"): NarrativeExhibitDef | undefined {
  return getAllExhibitRules(language).find((exhibit) => exhibit.targetImageId === targetImageId);
}

export function getExhibitRuleByTargetImageFilename(
  targetImageFilename: string,
  language: AppLanguage = "zh",
): NarrativeExhibitDef | undefined {
  return getAllExhibitRules(language).find((exhibit) => exhibit.targetImageFilename === targetImageFilename);
}

export function getNpcFallbackDialogue(npcId: NpcId, language: AppLanguage = "zh"): string {
  return language === "en" ? ENGLISH_FALLBACK_DIALOGUE[npcId] : NARRATIVE_RULES.fallbackDialogue[npcId];
}

export function hasRemainingDialogueTriggers(
  roleId: RoleId,
  scannedExhibits: ExhibitId[],
  consumedTriggerIds: string[],
): boolean {
  return getRoleRuleSet(roleId).triggers.some(
    (trigger) =>
      scannedExhibits.includes(trigger.exhibitId) && !consumedTriggerIds.includes(trigger.triggerId),
  );
}

export function getTriggerRule(
  roleId: RoleId,
  exhibitId: ExhibitId,
  npcId: NpcId,
  language: AppLanguage = "zh",
): TriggerRule | undefined {
  const trigger = getRoleRuleSet(roleId).triggers.find(
    (trigger) => trigger.exhibitId === exhibitId && trigger.npcId === npcId,
  );
  return trigger ? localizeTrigger(trigger, language) : undefined;
}

export function getTriggerByRewardClue(
  roleId: RoleId,
  clueId: DialogueClueId,
  language: AppLanguage = "zh",
): TriggerRule | undefined {
  const trigger = getRoleRuleSet(roleId).triggers.find((trigger) => trigger.rewardClueId === clueId);
  return trigger ? localizeTrigger(trigger, language) : undefined;
}

export function getRequiredExhibitIdsForStory(storyId: string): ExhibitId[] {
  const story = getStoryRule(storyId);

  if (!story) {
    return [];
  }

  const exhibitIds = story.requiresAll
    .map((clueId) => getExhibitIdForClue(story.roleId, clueId))
    .filter((value): value is ExhibitId => Boolean(value));

  return Array.from(new Set(exhibitIds));
}

export function getRequiredTriggersForStory(storyId: string): TriggerRule[] {
  const story = getStoryRule(storyId);

  if (!story) {
    return [];
  }

  return story.requiresAll
    .map((clueId) =>
      clueId.startsWith("F") && Number(clueId.slice(1)) >= 10
        ? getTriggerByRewardClue(story.roleId, clueId as DialogueClueId)
        : undefined,
    )
    .filter((value): value is TriggerRule => Boolean(value));
}

export function getRelevantExhibitIdsForRole(roleId: RoleId): ExhibitId[] {
  const exhibitIds = getRoleStories(roleId, "zh")
    .flatMap((story) => story.requiresAll)
    .map((clueId) => getExhibitIdForClue(roleId, clueId))
    .filter((value): value is ExhibitId => Boolean(value));

  return Array.from(new Set(exhibitIds));
}

export function getRelevantClueIdsForRole(roleId: RoleId): ClueId[] {
  const relevantExhibitScanClueIds = getRelevantExhibitIdsForRole(roleId).map(
    (exhibitId) => NARRATIVE_RULES.exhibits[exhibitId].scanClueId,
  );
  const endingRequiredClueIds = getRoleStories(roleId, "zh").flatMap((story) => story.requiresAll);

  return Array.from(new Set([...relevantExhibitScanClueIds, ...endingRequiredClueIds]));
}

export function getStoryProgress(
  storyId: string,
  collectedClueIds: ClueId[],
  scannedExhibits: ExhibitId[],
): StoryProgress {
  const story = getStoryRule(storyId);

  if (!story) {
    return {
      requiredClueIds: [],
      requiredExhibitIds: [],
      collectedRequiredClues: [],
      scannedRequiredExhibits: [],
    };
  }

  const requiredExhibitIds = getRequiredExhibitIdsForStory(storyId);

  return {
    requiredClueIds: story.requiresAll,
    requiredExhibitIds,
    collectedRequiredClues: story.requiresAll.filter((clueId) => collectedClueIds.includes(clueId)),
    scannedRequiredExhibits: requiredExhibitIds.filter((exhibitId) => scannedExhibits.includes(exhibitId)),
  };
}

export function isStoryUnlocked(storyId: string, collectedClueIds: ClueId[]): boolean {
  const story = getStoryRule(storyId, "zh");
  return story ? story.requiresAll.every((clueId) => collectedClueIds.includes(clueId)) : false;
}

export function scanExhibitResult(
  exhibitId: ExhibitId,
  ownedClueIds: ClueId[],
  language: AppLanguage = "zh",
): ScanResult {
  const exhibit = getExhibitRule(exhibitId, language);

  return {
    success: true,
    exhibitId,
    exhibitName: exhibit.name,
    grantedClueId: exhibit.scanClueId,
    alreadyOwned: ownedClueIds.includes(exhibit.scanClueId),
    showNpcOptions: ["N1", "N2", "N3"],
  };
}

export function checkNpcDialogueTrigger(args: {
  roleId: RoleId;
  exhibitId: ExhibitId;
  npcId: NpcId;
  scannedExhibits: ExhibitId[];
  consumedTriggerIds: string[];
  language?: AppLanguage;
}): DialogueCheckResult {
  const { roleId, exhibitId, npcId, scannedExhibits, consumedTriggerIds, language = "zh" } = args;

  if (!scannedExhibits.includes(exhibitId)) {
    return {
      success: true,
      isValidTrigger: false,
      isRepeatedTrigger: false,
      roleId,
      exhibitId,
      npcId,
      fallbackDialogue:
        language === "en"
          ? "Scan this exhibit first, then come back to talk to the NPC."
          : "请先完成该展品的扫描，再来和 NPC 对话。",
    };
  }

  const trigger = getTriggerRule(roleId, exhibitId, npcId, language);

  if (!trigger) {
    return {
      success: true,
      isValidTrigger: false,
      isRepeatedTrigger: false,
      roleId,
      exhibitId,
      npcId,
      fallbackDialogue: getNpcFallbackDialogue(npcId, language),
    };
  }

  return {
    success: true,
    isValidTrigger: true,
    isRepeatedTrigger: consumedTriggerIds.includes(trigger.triggerId),
    roleId,
    exhibitId,
    npcId,
    rewardClueId: trigger.rewardClueId,
    rewardClueName: trigger.rewardClueName,
    prompt: trigger.prompt,
    response: trigger.response,
    keywords: trigger.keywords,
    matchedTriggerId: trigger.triggerId,
    isSecret: trigger.isSecret,
  };
}

export function checkEndingUnlock(
  roleId: RoleId,
  collectedClueIds: ClueId[],
): EndingCheckResult {
  const endings = getRoleRuleSet(roleId).endings;
  const matchedEndings = endings.filter((ending) =>
    ending.requiresAll.every((clueId) => collectedClueIds.includes(clueId)),
  );

  const sorted = [...matchedEndings].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.requiresAll.length !== a.requiresAll.length) {
      return b.requiresAll.length - a.requiresAll.length;
    }
    return a.storyId.localeCompare(b.storyId);
  });

  return {
    hasUnlockedEnding: sorted.length > 0,
    ending: sorted[0],
    matchedEndings: sorted,
  };
}

export function getExhibitIdForClue(roleId: RoleId, clueId: ClueId): ExhibitId | undefined {
  if (Number(clueId.slice(1)) <= 8) {
    const exhibitEntries = Object.values(NARRATIVE_RULES.exhibits) as NarrativeExhibitDef[];
    return exhibitEntries.find((exhibit) => exhibit.scanClueId === clueId)?.id;
  }

  return getTriggerByRewardClue(roleId, clueId as DialogueClueId)?.exhibitId;
}
