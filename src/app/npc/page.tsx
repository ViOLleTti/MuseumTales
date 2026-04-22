"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyDialogueResult, useGameStore } from "@/lib/game-store";
import { NPCS, ROLES } from "@/lib/game-data";
import { NPC_PAGE_COPY, PAGE_HEADER_COPY, ROLE_SHORT_LABELS, pickText } from "@/lib/i18n";
import {
  checkEndingUnlock,
  checkNpcDialogueTrigger,
  getExhibitRule,
  getNpcFallbackDialogue,
  getTriggerByRewardClue,
} from "@/lib/narrative-rules";
import { getRecentClueTopChip } from "@/lib/top-status-chip";
import type { DialogueCheckResult, DialogueGameEvent } from "@/lib/narrative-types";
import type { NpcId, RoleId } from "@/lib/types";
import { useUiStore } from "@/lib/ui-store";
import girlSmile from "@/assets/png/npc_0.png";
import boyNeutral from "@/assets/png/npc_1.png";
import guardNeutral from "@/assets/png/npc_2.png";
import girlNeutral from "@/assets/png/npc_3.png";
import boySmile from "@/assets/png/npc_4.png";
import guardSmile from "@/assets/png/npc_10.png";

const NPC_SCAN_HINTS: Record<NpcId, string> = {
  N1: "也许先去看看别的展品，会有更清楚的线索浮出来，到时再聊可能更容易串起故事。",
  N2: "你可以先沿着展品再找一点观察线索，说不定下一次回来问，我会更想倾诉点什么。",
  N3: "不妨先去展柜那边转转，等你抓到新的展品线索，我们再继续往下说。",
};

const NPC_SCAN_HINTS_EN: Record<NpcId, string> = {
  N1: "You may want to explore a few more exhibits first. The thread may feel clearer when you come back.",
  N2: "Try picking up a few more details from nearby exhibits. I might have more to say next time.",
  N3: "Take another walk around the gallery first. Once you find a new clue, we can keep going.",
};

const DIALOGUE_SECONDARY_TAGS: Record<string, [string, string]> = {
  "P1-E1-N1-F10": ["库房", "初心"],
  "P1-E7-N1-F11": ["书法", "船模"],
  "P1-E2-N2-F12": ["成长", "见证"],
  "P1-E8-N3-F13": ["水路", "思念"],
  "P2-E4-N1-F14": ["吉祥", "双关"],
  "P2-E7-N1-F16": ["字面", "语气"],
  "P2-E7-N2-F15": ["语气", "留白"],
  "P2-E7-N3-F17": ["气力", "印刷字"],
  "P3-E3-N1-F18": ["创造", "智慧"],
  "P3-E8-N3-F21": ["异乡", "故乡"],
  "P3-E7-N2-F19": ["线条", "呼吸"],
  "P3-E5-N2-F20": ["规则", "样子"],
  "P3-E6-N1-F22": ["协作", "征服"],
  "P4-E7-N1-F23": ["礼物", "旅程"],
  "P4-E4-N2-F24": ["瓷器", "停下"],
  "P4-E5-N3-F25": ["挪动", "参与"],
};

const DIALOGUE_SECONDARY_TAGS_EN: Record<string, [string, string]> = {
  "P1-E1-N1-F10": ["Storage", "Origins"],
  "P1-E7-N1-F11": ["Calligraphy", "Boat Model"],
  "P1-E2-N2-F12": ["Growth", "Witness"],
  "P1-E8-N3-F13": ["Waterway", "Longing"],
  "P2-E4-N1-F14": ["Blessing", "Wordplay"],
  "P2-E7-N1-F16": ["Wording", "Tone"],
  "P2-E7-N2-F15": ["Tone", "Negative Space"],
  "P2-E7-N3-F17": ["Warmth", "Print"],
  "P3-E3-N1-F18": ["Creation", "Wisdom"],
  "P3-E8-N3-F21": ["Away", "Home"],
  "P3-E7-N2-F19": ["Lines", "Breath"],
  "P3-E5-N2-F20": ["Rules", "Form"],
  "P3-E6-N1-F22": ["Collaboration", "Conquest"],
  "P4-E7-N1-F23": ["Gift", "Journey"],
  "P4-E4-N2-F24": ["Ceramics", "Pause"],
  "P4-E5-N3-F25": ["Movement", "Participation"],
};

function buildScanHint(roleId: RoleId, npcId: NpcId, language: "zh" | "en"): DialogueCheckResult {
  return {
    success: true,
    isValidTrigger: false,
    isRepeatedTrigger: false,
    roleId,
    npcId,
    fallbackDialogue: language === "en" ? NPC_SCAN_HINTS_EN[npcId] : NPC_SCAN_HINTS[npcId],
  };
}

type VisualNpcConfig = {
  activeImage: StaticImageData;
  neutralImage: StaticImageData;
  bubbleAlign: "left" | "center" | "right";
  bubbleAnchorOffsetTop: number;
  imageClassName: string;
};

type BubblePosition = {
  left: number;
  top: number;
  align: "left" | "center" | "right";
};

const BUBBLE_WIDTH = 230;
const BUBBLE_SIDE_PADDING = 8;
const BUBBLE_TAIL_RATIOS = {
  left: 0.25,
  center: 0.5,
  right: 0.75,
} as const;

const VISUAL_NPCS: Record<NpcId, VisualNpcConfig> = {
  N1: {
    activeImage: girlSmile,
    neutralImage: girlNeutral,
    bubbleAlign: "left",
    bubbleAnchorOffsetTop: 70,
    imageClassName: "w-[160%] h-[85%] max-w-none",
  },
  N2: {
    activeImage: boySmile,
    neutralImage: boyNeutral,
    bubbleAlign: "center",
    bubbleAnchorOffsetTop: 30,
    imageClassName: "w-[190%] h-[92%] max-w-none",
  },
  N3: {
    activeImage: guardSmile,
    neutralImage: guardNeutral,
    bubbleAlign: "right",
    bubbleAnchorOffsetTop: 70,
    imageClassName: "w-[160%] h-[85%] max-w-none",
  },
};

function getDialogueTone(result: DialogueCheckResult, npcId: NpcId, language: "zh" | "en") {
  if (result.isValidTrigger) {
    return result.isRepeatedTrigger
      ? pickText(NPC_PAGE_COPY.dialogueTone.repeated, language)
      : pickText(NPC_PAGE_COPY.dialogueTone.valid, language);
  }

  const scanHint = language === "en" ? NPC_SCAN_HINTS_EN[npcId] : NPC_SCAN_HINTS[npcId];
  return result.fallbackDialogue === scanHint
    ? pickText(NPC_PAGE_COPY.dialogueTone.hint, language)
    : pickText(NPC_PAGE_COPY.dialogueTone.regular, language);
}

function getDialogueTitle(
  result: DialogueCheckResult,
  npcName: string,
  exhibitName: string | undefined,
  language: "zh" | "en",
) {
  if (result.prompt) {
    return result.prompt;
  }

  if (result.fallbackDialogue === (language === "en" ? NPC_SCAN_HINTS_EN[result.npcId] : NPC_SCAN_HINTS[result.npcId])) {
    return language === "en" ? `${npcName}'s hint` : `${npcName} 的提示`;
  }

  return exhibitName
    ? language === "en"
      ? `${npcName} on ${exhibitName}`
      : `关于 ${exhibitName}，${npcName} 的回应`
    : language === "en"
      ? `${npcName}'s response`
      : `${npcName} 的回应`;
}

function getNpcSpeechLabel(npcId: NpcId, language: "zh" | "en") {
  const npc = NPCS.find((entry) => entry.id === npcId);
  return npc ? (language === "en" ? npc.nameEn : npc.name) : npcId;
}

function getDialogueLogResponse(roleId: RoleId, event: DialogueGameEvent, language: "zh" | "en") {
  const trigger = getTriggerByRewardClue(roleId, event.clueId, language);
  return trigger?.response ?? pickText(NPC_PAGE_COPY.logFallback, language);
}

function getDialogueLogTitle(roleId: RoleId, event: DialogueGameEvent, language: "zh" | "en") {
  const trigger = getTriggerByRewardClue(roleId, event.clueId, language);
  const exhibitName = trigger ? getExhibitRule(trigger.exhibitId, language).name : getExhibitRule(event.exhibitId, language).name;
  const npcName = getNpcSpeechLabel(event.npcId, language);
  return language === "en" ? `${npcName} on ${exhibitName}:` : `关于 ${exhibitName}， ${npcName} 说 ：`;
}

function getDialogueLogChips(roleId: RoleId, event: DialogueGameEvent, language: "zh" | "en") {
  const trigger = getTriggerByRewardClue(roleId, event.clueId, language);
  const primaryKeyword = trigger?.keywords[0] ?? pickText(NPC_PAGE_COPY.keywordFallbacks.clue, language);
  const secondaryKeywords = (language === "en" ? DIALOGUE_SECONDARY_TAGS_EN : DIALOGUE_SECONDARY_TAGS)[event.triggerId] ?? [
    trigger?.keywords[1] ?? pickText(NPC_PAGE_COPY.keywordFallbacks.detail, language),
    getExhibitRule(event.exhibitId, language).highlightKeyword,
  ];

  return {
    primaryKeyword,
    secondaryKeywords,
  };
}

function SoftChip({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "muted" | "cream-accent";
  className?: string;
}) {
  const toneClassName =
    tone === "cream-accent"
      ? "bg-[#f1efe7] text-[#527a67] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
      : tone === "accent"
      ? "bg-[#dbe9dd] text-[#527a67] shadow-[inset_2px_2px_4px_#c8d5ca,inset_-2px_-2px_4px_#eff5f0]"
      : tone === "muted"
        ? "bg-[#ebe7de] text-[#8a9287] shadow-[inset_2px_2px_4px_#d7d2c8,inset_-2px_-2px_4px_#f7f4ee]"
        : "bg-[#f1efe7] text-[#4e5751] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]";

  return (
    <span
      className={`inline-flex max-w-full items-center justify-center rounded-full px-3 py-1.5 text-center text-xs font-semibold leading-tight whitespace-normal ${toneClassName} ${className}`}
    >
      {children}
    </span>
  );
}

function CloudBubble({
  children,
  align,
}: {
  children: React.ReactNode;
  align: "left" | "center" | "right";
}) {
  return (
    <div
      className={`relative flex flex-col drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${
        align === "left" ? "items-start" : align === "right" ? "items-end" : "items-center"
      }`}
    >
      <div className="relative z-10 mt-2 mb-[-9px] flex min-h-[70px] min-w-[220px] w-full items-center justify-center rounded-2xl bg-[#f4f4f4] px-5 py-4 text-sm font-medium leading-6 text-[#1a1a1a]">
        <div
          className={`absolute -bottom-[12px] z-20 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-[#f4f4f4] ${
            align === "left"
              ? "left-[25%]"
              : align === "right"
                ? "right-[25%]"
                : "left-1/2 -translate-x-1/2"
          }`}
        />
        <div className="relative z-30 w-full whitespace-pre-wrap text-left tracking-wide">{children}</div>
      </div>
    </div>
  );
}

export default function NpcPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);
  const npcButtonRefs = useRef<Partial<Record<NpcId, HTMLButtonElement | null>>>({});
  const language = useUiStore((state) => state.language);
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const scannedExhibits = useGameStore((state) => state.scannedExhibits);
  const consumedTriggerIds = useGameStore((state) => state.consumedTriggerIds);
  const lastScannedExhibitId = useGameStore((state) => state.lastScannedExhibitId);
  const eventHistory = useGameStore((state) => state.eventHistory);
  const [dialogueResult, setDialogueResult] = useState<DialogueCheckResult | null>(null);
  const [bubblePosition, setBubblePosition] = useState<BubblePosition | null>(null);

  const unlockedEnding = useMemo(
    () => (roleId ? checkEndingUnlock(roleId, collectedClueIds).ending : undefined),
    [collectedClueIds, roleId],
  );

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
    }
  }, [roleId, router]);

  const updateBubblePosition = useCallback((npcId: NpcId, anchorElement?: HTMLButtonElement | null) => {
    const mainElement = mainRef.current;
    const buttonElement = anchorElement ?? npcButtonRefs.current[npcId];
    if (!mainElement || !buttonElement) {
      setBubblePosition(null);
      return;
    }

    const mainRect = mainElement.getBoundingClientRect();
    const buttonRect = buttonElement.getBoundingClientRect();
    const visualNpc = VISUAL_NPCS[npcId];
    const tailRatio = BUBBLE_TAIL_RATIOS[visualNpc.bubbleAlign];
    const anchorX = buttonRect.left - mainRect.left + mainElement.scrollLeft + buttonRect.width * tailRatio;
    const maxLeft = Math.max(BUBBLE_SIDE_PADDING, mainElement.clientWidth - BUBBLE_WIDTH - BUBBLE_SIDE_PADDING);
    const left = Math.min(maxLeft, Math.max(BUBBLE_SIDE_PADDING, anchorX - BUBBLE_WIDTH * tailRatio));
    const top =
      buttonRect.top - mainRect.top + mainElement.scrollTop + visualNpc.bubbleAnchorOffsetTop - 6;

    setBubblePosition({
      left,
      top,
      align: visualNpc.bubbleAlign,
    });
  }, []);

  useEffect(() => {
    if (!dialogueResult) {
      setBubblePosition(null);
      return;
    }

    const handleResize = () => updateBubblePosition(dialogueResult.npcId);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [dialogueResult, updateBubblePosition]);

  if (!roleId) {
    return null;
  }

  const isEnglish = language === "en";
  const currentRoleId = roleId;
  const currentRoleLabel =
    pickText(ROLE_SHORT_LABELS[currentRoleId], language) ??
    ROLES.find((role) => role.id === currentRoleId)?.[isEnglish ? "titleEn" : "title"] ??
    currentRoleId;
  const currentExhibit = lastScannedExhibitId ? getExhibitRule(lastScannedExhibitId, language) : null;
  const dialogueHistory = eventHistory.filter((event): event is DialogueGameEvent => event.type === "dialogue");
  const latestDialogueEvent = dialogueHistory.at(-1) ?? null;
  const activeNpcId = dialogueResult?.npcId ?? null;
  const recentClueTopChip = getRecentClueTopChip(eventHistory, currentRoleId, language);

  function handleNpcClick(npcId: NpcId, anchorElement: HTMLButtonElement | null) {
    let result: DialogueCheckResult;

    if (!currentExhibit) {
      result = buildScanHint(currentRoleId, npcId, language);
    } else {
      const checkedResult = checkNpcDialogueTrigger({
        roleId: currentRoleId,
        exhibitId: currentExhibit.id,
        npcId,
        scannedExhibits,
        consumedTriggerIds,
        language,
      });

      result = checkedResult.isValidTrigger
        ? checkedResult
        : {
            ...checkedResult,
            isValidTrigger: false,
            fallbackDialogue: getNpcFallbackDialogue(npcId, language),
          };
    }

    setDialogueResult(result);
    updateBubblePosition(npcId, anchorElement);
    if (result.isValidTrigger) {
      applyDialogueResult(result);
    }
  }

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <main
          ref={mainRef}
          className="relative isolate flex min-h-full flex-col overflow-x-hidden overflow-y-auto bg-[#f1efe7] text-[#424542]"
        >
          <div className="sticky top-0 z-0 bg-[#f1efe7]/92 px-4 pb-4 pt-6">
            <div
              className={`mx-auto rounded-[26px] bg-[#f1efe7] px-6 py-3 text-center shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff] ${
                isEnglish ? "max-w-[320px]" : "max-w-[290px]"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#94b5a9]">{PAGE_HEADER_COPY.npc.eyebrow}</p>
              <h1 className={`mt-1 font-bold text-[#424542] ${isEnglish ? "text-[14px] tracking-[0.08em]" : "text-[15px] tracking-[0.12em]"}`}>
                {pickText(PAGE_HEADER_COPY.npc.title, language)}
              </h1>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <SoftChip tone="cream-accent" className={isEnglish ? "min-w-[10ch]" : ""}>
                {currentRoleLabel}
              </SoftChip>
              {recentClueTopChip ? (
                <SoftChip tone="cream-accent" className={isEnglish ? "min-w-[10ch]" : ""}>
                  {recentClueTopChip}
                </SoftChip>
              ) : null}
            </div>
          </div>

          {dialogueResult && bubblePosition ? (
            <div className="pointer-events-none absolute inset-0 z-[300] overflow-visible">
              <div
                className="absolute w-[230px]"
                style={{
                  left: `${bubblePosition.left}px`,
                  top: `${bubblePosition.top}px`,
                  transform: "translateY(-100%)",
                }}
              >
                <CloudBubble align={bubblePosition.align}>
                  {dialogueResult.response ?? dialogueResult.fallbackDialogue}
                </CloudBubble>
              </div>
            </div>
          ) : null}

          <div className="relative z-[80] flex-1 overflow-x-hidden overflow-y-visible px-4 pb-6">
            <section className="relative z-[120] isolate mt-1 overflow-visible">
              <div className="relative rounded-[36px] px-3 pb-3 pt-5">
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[36px] bg-[#e8e5dd] shadow-[inset_0_10px_20px_rgba(213,210,200,0.55)]">
                  <div className="absolute -left-[15%] -top-[10%] h-[350px] w-[350px] rounded-full bg-[#e8e5dd] opacity-90 shadow-[inset_15px_15px_40px_#d5d2c8,inset_-15px_-15px_40px_#ffffff]" />
                  <div className="absolute -right-[25%] top-[25%] h-[400px] w-[400px] rounded-full bg-[#e8e5dd] opacity-90 shadow-[25px_25px_50px_#d5d2c8,-25px_-25px_50px_#ffffff]" />
                  <div className="absolute -bottom-[10%] left-1/2 h-[250px] w-[500px] -translate-x-1/2 rounded-[100%] bg-[#e8e5dd] opacity-80 shadow-[inset_0_20px_50px_#d5d2c8,inset_0_-10px_20px_#ffffff]" />
                </div>

                <div className="relative z-10 h-[118px]" />

                <div className="absolute inset-0 z-20 mt-0 flex h-full">
                  {NPCS.map((npc) => {
                    const npcId = npc.id as NpcId;
                    const visualNpc = VISUAL_NPCS[npcId];
                    const isSpeaking = activeNpcId === npcId;
                    const isEffective = dialogueResult?.npcId === npcId && dialogueResult.isValidTrigger;
                    const currentImage = isSpeaking && isEffective ? visualNpc.activeImage : visualNpc.neutralImage;
                    const poseClassName = isSpeaking
                      ? "scale-[1.05] -translate-y-3 brightness-105"
                      : activeNpcId !== null
                        ? "scale-[0.95] translate-y-2 brightness-90 grayscale-[20%]"
                        : "scale-100 translate-y-0 brightness-100";

                    return (
                      <button
                        key={npc.id}
                        type="button"
                        ref={(element) => {
                          npcButtonRefs.current[npcId] = element;
                        }}
                        onClick={(event) => handleNpcClick(npcId, event.currentTarget)}
                        className="relative flex h-full w-1/3 cursor-pointer flex-col items-center overflow-visible bg-transparent text-left"
                      >
                        <div className="absolute inset-x-2 bottom-4 h-20 rounded-full bg-[#d9d4ca]/60 blur-xl" />

                        <Image
                          src={currentImage}
                          alt={isEnglish ? npc.nameEn : npc.name}
                          priority
                          className={`pointer-events-none absolute bottom-[-20px] left-1/2 -translate-x-1/2 object-contain object-bottom transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visualNpc.imageClassName} ${poseClassName}`}
                          style={{
                            filter: isSpeaking
                              ? "drop-shadow(0 20px 30px rgba(180,175,160,0.8))"
                              : "drop-shadow(0 8px 15px rgba(213,210,200,0.5))",
                            zIndex: isSpeaking ? 15 : 10,
                          }}
                        />

                        <div className="absolute bottom-2 z-20 flex w-full justify-center">
                          <span
                            className={`inline-flex min-h-[2.25rem] max-w-[92%] items-center justify-center rounded-full px-3 py-1.5 text-center text-[11px] font-bold leading-tight tracking-wide whitespace-normal ${
                              isSpeaking
                                ? "bg-[#f7f4ee] text-[#77a08e] shadow-[4px_4px_10px_#d3d0c7,-4px_-4px_10px_#fff]"
                                : "bg-[#f7f4ee] text-[#70786f] shadow-[4px_4px_10px_#d3d0c7,-4px_-4px_10px_#fff]"
                            }`}
                          >
                            {isEnglish ? npc.nameEn : npc.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="relative z-10 mt-6 h-[440px]" />
              </div>
            </section>

            <section className="mt-4 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="flex items-center justify-center">
                <div className="min-w-[270px] rounded-full bg-[#f1efe7] px-8 py-3 shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-center text-sm font-semibold text-[#6f7e76]">
                    {pickText(NPC_PAGE_COPY.panelPrompt, language)}
                  </p>
                </div>
              </div>

              {currentExhibit ? (
                <div className="mt-4 rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-sm font-semibold text-[#414640]">{currentExhibit.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6d756c]">{currentExhibit.observation}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <SoftChip tone="cream-accent">{currentExhibit.highlightKeyword}</SoftChip>
                    {currentExhibit.fuzzyKeywords.map((keyword) => (
                      <SoftChip key={keyword}>{keyword}</SoftChip>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                {latestDialogueEvent ? (
                  <>
                    <p className="text-sm font-semibold text-[#414640]">
                      {getDialogueLogTitle(currentRoleId, latestDialogueEvent, language)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6d756c]">
                      {getDialogueLogResponse(currentRoleId, latestDialogueEvent, language)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <SoftChip tone="cream-accent">
                        {getDialogueLogChips(currentRoleId, latestDialogueEvent, language).primaryKeyword}
                      </SoftChip>
                      {getDialogueLogChips(currentRoleId, latestDialogueEvent, language).secondaryKeywords.map((keyword) => (
                        <SoftChip key={keyword}>{keyword}</SoftChip>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-[#7e857b]">{pickText(NPC_PAGE_COPY.noDialogueRecord, language)}</p>
                )}
              </div>

              {unlockedEnding ? (
                <button
                  type="button"
                  className="mt-4 w-full rounded-[28px] bg-[#f1efe7] px-5 py-4 text-sm font-bold text-[#527a67] shadow-[6px_6px_12px_#d5d2c8,-6px_-6px_12px_#ffffff] transition hover:text-[#456a5d]"
                  onClick={() => router.push(`/reconstruct/${unlockedEnding.storyId}`)}
                >
                  {pickText(NPC_PAGE_COPY.unlockCta, language)}
                </button>
              ) : (
                <p className="mt-4 text-center text-sm leading-6 text-[#7b8379]">
                  {pickText(NPC_PAGE_COPY.unlockHint, language)}
                </p>
              )}
            </section>
          </div>

          <nav className="border-t border-white/50 bg-[#f1efe7] px-4 pb-5 pt-3">
            <div className="grid grid-cols-4 gap-2 rounded-[28px] bg-[#ece8df] p-2 shadow-[inset_4px_4px_8px_#d8d3c9,inset_-4px_-4px_8px_#fbf7f1]">
              {[
                { href: "/home", label: "Home" },
                { href: "/scan", label: "Scan" },
                { href: "/npc", label: "Chat" },
                { href: "/profile", label: "Profile" },
              ].map((item) => {
                const isActive = item.href === "/npc";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-[20px] px-3 py-3 text-center text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#94b5a9] text-[#f6f4ee] shadow-[4px_4px_10px_#d0cbc1,-4px_-4px_10px_#ffffff]"
                        : "text-[#7b8379] hover:bg-white/40"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </main>
      </div>
    </div>
  );
}
