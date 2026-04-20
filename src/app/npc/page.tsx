"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { applyDialogueResult, useGameStore } from "@/lib/game-store";
import { NPCS, ROLES } from "@/lib/game-data";
import {
  checkEndingUnlock,
  checkNpcDialogueTrigger,
  getExhibitRule,
  getClueKeyword,
  getNpcFallbackDialogue,
  hasRemainingDialogueTriggers,
} from "@/lib/narrative-rules";
import type { DialogueCheckResult } from "@/lib/narrative-types";
import type { NpcId, RoleId } from "@/lib/types";
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

function buildScanHint(roleId: RoleId, npcId: NpcId): DialogueCheckResult {
  return {
    success: true,
    isValidTrigger: false,
    isRepeatedTrigger: false,
    roleId,
    npcId,
    fallbackDialogue: NPC_SCAN_HINTS[npcId],
  };
}

type VisualNpcConfig = {
  activeImage: StaticImageData;
  neutralImage: StaticImageData;
  bubbleAlign: "left" | "center" | "right";
  imageClassName: string;
  bubblePositionClassName: string;
};

const VISUAL_NPCS: Record<NpcId, VisualNpcConfig> = {
  N1: {
    activeImage: girlSmile,
    neutralImage: girlNeutral,
    bubbleAlign: "left",
    imageClassName: "w-[160%] h-[85%] max-w-none",
    bubblePositionClassName: "left-1 bottom-[calc(100%-70px)]",
  },
  N2: {
    activeImage: boySmile,
    neutralImage: boyNeutral,
    bubbleAlign: "center",
    imageClassName: "w-[190%] h-[92%] max-w-none",
    bubblePositionClassName: "left-1/2 bottom-[calc(100%-30px)] -translate-x-1/2",
  },
  N3: {
    activeImage: guardSmile,
    neutralImage: guardNeutral,
    bubbleAlign: "right",
    imageClassName: "w-[160%] h-[85%] max-w-none",
    bubblePositionClassName: "right-1 bottom-[calc(100%-70px)]",
  },
};

function getDialogueTone(result: DialogueCheckResult, npcId: NpcId) {
  if (result.isValidTrigger) {
    return result.isRepeatedTrigger ? "已记录过" : "有效对话";
  }

  return result.fallbackDialogue === NPC_SCAN_HINTS[npcId] ? "探索提示" : "普通对话";
}

function getDialogueTitle(result: DialogueCheckResult, npcName: string, exhibitName?: string) {
  if (result.prompt) {
    return result.prompt;
  }

  if (result.fallbackDialogue === NPC_SCAN_HINTS[result.npcId]) {
    return `${npcName} 的提示`;
  }

  return exhibitName ? `关于 ${exhibitName}，${npcName} 的回应` : `${npcName} 的回应`;
}

function SoftChip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "muted" | "cream-accent";
}) {
  const className =
    tone === "cream-accent"
      ? "bg-[#f1efe7] text-[#527a67] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
      : tone === "accent"
      ? "bg-[#dbe9dd] text-[#527a67] shadow-[inset_2px_2px_4px_#c8d5ca,inset_-2px_-2px_4px_#eff5f0]"
      : tone === "muted"
        ? "bg-[#ebe7de] text-[#8a9287] shadow-[inset_2px_2px_4px_#d7d2c8,inset_-2px_-2px_4px_#f7f4ee]"
        : "bg-[#f1efe7] text-[#4e5751] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}>
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
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const scannedExhibits = useGameStore((state) => state.scannedExhibits);
  const consumedTriggerIds = useGameStore((state) => state.consumedTriggerIds);
  const lastScannedExhibitId = useGameStore((state) => state.lastScannedExhibitId);
  const [dialogueResult, setDialogueResult] = useState<DialogueCheckResult | null>(null);

  const unlockedEnding = useMemo(
    () => (roleId ? checkEndingUnlock(roleId, collectedClueIds).ending : undefined),
    [collectedClueIds, roleId],
  );

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
    }
  }, [roleId, router]);

  if (!roleId) {
    return null;
  }

  const currentRoleId = roleId;
  const currentRoleLabel =
    {
      P1: "档案员",
      P2: "汉教助理",
      P3: "校报记者",
      P4: "志愿者",
    }[currentRoleId] ?? ROLES.find((role) => role.id === currentRoleId)?.title ?? currentRoleId;
  const currentExhibit = lastScannedExhibitId ? getExhibitRule(lastScannedExhibitId) : null;
  const hasRemainingTriggers = hasRemainingDialogueTriggers(
    currentRoleId,
    scannedExhibits,
    consumedTriggerIds,
  );
  const activeNpcId = dialogueResult?.npcId ?? null;

  function handleNpcClick(npcId: NpcId) {
    let result: DialogueCheckResult;

    if (!currentExhibit || !hasRemainingTriggers) {
      result = buildScanHint(currentRoleId, npcId);
    } else {
      const checkedResult = checkNpcDialogueTrigger({
        roleId: currentRoleId,
        exhibitId: currentExhibit.id,
        npcId,
        scannedExhibits,
        consumedTriggerIds,
      });

      result = checkedResult.isValidTrigger
        ? checkedResult
        : {
            ...checkedResult,
            isValidTrigger: false,
            fallbackDialogue: getNpcFallbackDialogue(npcId),
          };
    }

    setDialogueResult(result);
    if (result.isValidTrigger) {
      applyDialogueResult(result);
    }
  }

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <main className="relative flex min-h-full flex-col overflow-x-visible overflow-y-auto bg-[#f1efe7] text-[#424542]">
          <div className="sticky top-0 z-10 bg-[#f1efe7]/92 px-4 pb-4 pt-6 backdrop-blur">
            <div className="mx-auto max-w-[290px] rounded-[26px] bg-[#f1efe7] px-6 py-3 text-center shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#94b5a9]">Investigation</p>
              <h1 className="mt-1 text-[15px] font-bold tracking-[0.12em] text-[#424542]">展馆事件</h1>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <SoftChip tone="cream-accent">{currentRoleLabel}</SoftChip>
              <SoftChip tone="cream-accent">
                {currentExhibit ? currentExhibit.name : "未扫描展品"}
              </SoftChip>
            </div>
          </div>

          <div className="relative z-30 flex-1 overflow-visible px-4 pb-6">
            <section className="relative z-30 mt-1 overflow-visible">
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
                        onClick={() => handleNpcClick(npcId)}
                        className="relative flex h-full w-1/3 cursor-pointer flex-col items-center overflow-visible bg-transparent text-left"
                      >
                        <div className="absolute inset-x-2 bottom-4 h-20 rounded-full bg-[#d9d4ca]/60 blur-xl" />

                        {dialogueResult?.npcId === npcId ? (
                          <div className={`absolute z-[70] w-[230px] origin-bottom pointer-events-none ${visualNpc.bubblePositionClassName}`}>
                            <CloudBubble align={visualNpc.bubbleAlign}>
                              {dialogueResult.response ?? dialogueResult.fallbackDialogue}
                            </CloudBubble>
                          </div>
                        ) : null}

                        <Image
                          src={currentImage}
                          alt={npc.name}
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
                            className={`rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide ${
                              isSpeaking
                                ? "bg-[#f7f4ee] text-[#77a08e] shadow-[4px_4px_10px_#d3d0c7,-4px_-4px_10px_#fff]"
                                : "bg-[#f7f4ee] text-[#70786f] shadow-[4px_4px_10px_#d3d0c7,-4px_-4px_10px_#fff]"
                            }`}
                          >
                            {npc.name}
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
                    分别点击不同人物获取线索
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
                <p className="text-sm font-semibold text-[#414640]">本轮已收集线索</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {collectedClueIds.length ? (
                    collectedClueIds.map((clueId) => (
                      <SoftChip key={clueId} tone="cream-accent">
                        {getClueKeyword(clueId)}
                      </SoftChip>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[#7e857b]">还没有有效线索，先尝试点击上方人物。</p>
                  )}
                </div>
              </div>

              {unlockedEnding ? (
                <button
                  type="button"
                  className="mt-4 w-full rounded-[28px] bg-[#f1efe7] px-5 py-4 text-sm font-bold text-[#527a67] shadow-[6px_6px_12px_#d5d2c8,-6px_-6px_12px_#ffffff] transition hover:text-[#456a5d]"
                  onClick={() => router.push(`/reconstruct/${unlockedEnding.storyId}`)}
                >
                  已满足结局条件，进入故事还原页
                </button>
              ) : (
                <p className="mt-4 text-center text-sm leading-6 text-[#7b8379]">
                  如未触发有效对话，可以返回 Scan 重新输入其他展品编号继续探索。
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
                        ? "bg-[#dce9df] text-[#456a5d] shadow-[4px_4px_10px_#d0cbc1,-4px_-4px_10px_#ffffff]"
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
