"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ButtonHTMLAttributes } from "react";
import { ROLES } from "@/lib/game-data";
import archivistHalf from "@/assets/png/archivistHalf.png";
import securityHalf from "@/assets/png/securityHalf.png";
import studentHalf from "@/assets/png/studentHalf.png";
import { ExhibitHole, ExhibitSticker } from "@/components/exhibit-stickers";
import {
  clearRunTracking,
  ensureRunTracking,
  LAST_RUN_RESULT_STORAGE_KEY,
  PLAYER_ID_STORAGE_KEY,
  PLAYER_NICKNAME_STORAGE_KEY,
  type LastRunResult,
  type PlayerInitResponse,
  type SubmitRunResponse,
} from "@/lib/leaderboard-client";
import {
  END_PAGE_COPY,
  pickText,
  ROLE_SHORT_LABELS,
} from "@/lib/i18n";
import {
  getStoryResult,
  isStoryUnlocked,
  markEndingViewed,
  resetProgressForNextEnding,
  useGameStore,
} from "@/lib/game-store";
import { getRequiredExhibitIdsForStory, getRequiredTriggersForStory, getStoryRule } from "@/lib/narrative-rules";
import { useUiStore } from "@/lib/ui-store";
import type { NpcId } from "@/lib/types";

const STORY_END_TRANSITION_KEY = "story-end-transition";

const NPC_HALF_PORTRAITS: Record<NpcId, StaticImageData> = {
  N1: archivistHalf,
  N2: studentHalf,
  N3: securityHalf,
};

const NPC_HALF_ALT: Record<NpcId, { zh: string; en: string }> = {
  N1: END_PAGE_COPY.rolePortraitAlt.N1,
  N2: END_PAGE_COPY.rolePortraitAlt.N2,
  N3: END_PAGE_COPY.rolePortraitAlt.N3,
};

function ActionButton({
  children,
  accent = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean }) {
  return (
    <button
      {...props}
      className={`flex w-full items-center justify-center rounded-2xl bg-[#F2F0EC] px-5 py-4 text-center transition-all active:shadow-[inset_4px_4px_8px_#D1CDC3,inset_-4px_-4px_8px_#FFFFFF] disabled:cursor-not-allowed disabled:opacity-60 ${
        accent
          ? "text-[17px] font-bold text-[#82A696]"
          : "font-semibold text-[#6A6A6A]"
      } shadow-[6px_6px_12px_#D1CDC3,-6px_-6px_12px_#FFFFFF]`}
    >
      {children}
    </button>
  );
}

export default function EndPage() {
  const params = useParams<{ storyId: string }>();
  const router = useRouter();
  const language = useUiStore((state) => state.language);
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const scannedExhibits = useGameStore((state) => state.scannedExhibits);
  const story = useMemo(() => getStoryRule(params.storyId, language), [language, params.storyId]);
  const reconstructionResult = story ? getStoryResult(story.storyId) : undefined;
  const [lastRunResult, setLastRunResult] = useState<LastRunResult | null>(null);
  const [nickname, setNickname] = useState("");
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingRank, setIsSubmittingRank] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(false);

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
      return;
    }

    if (!story || story.roleId !== roleId) {
      router.replace("/scan");
      return;
    }

    if (!isStoryUnlocked(story.storyId)) {
      router.replace("/scan");
      return;
    }

    if (!reconstructionResult) {
      router.replace(`/reconstruct/${story.storyId}`);
      return;
    }

    markEndingViewed(story.storyId);
  }, [reconstructionResult, roleId, router, story]);

  useEffect(() => {
    if (!story) {
      return;
    }

    const storedNickname = window.localStorage.getItem(PLAYER_NICKNAME_STORAGE_KEY) ?? "";
    setNickname(storedNickname);

    const rawValue = window.sessionStorage.getItem(LAST_RUN_RESULT_STORAGE_KEY);
    if (!rawValue) {
      setLastRunResult(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawValue) as LastRunResult;
      setLastRunResult(parsed.storyId === story.storyId ? parsed : null);
    } catch {
      setLastRunResult(null);
    }
  }, [story]);

  useEffect(() => {
    const hasTransition = window.sessionStorage.getItem(STORY_END_TRANSITION_KEY) === "1";
    if (hasTransition) {
      window.sessionStorage.removeItem(STORY_END_TRANSITION_KEY);
      const rafId = window.requestAnimationFrame(() => setIsPageVisible(true));
      return () => window.cancelAnimationFrame(rafId);
    }

    setIsPageVisible(true);
  }, []);

  if (!story || !roleId || !reconstructionResult) {
    return null;
  }

  const currentStory = story;
  const currentRoleId = roleId;
  const currentReconstructionResult = reconstructionResult;
  const isEnglish = language === "en";
  const currentRoleTitle = ROLES.find((entry) => entry.id === roleId)?.[isEnglish ? "titleEn" : "title"] ?? roleId;
  const requiredExhibitIds = getRequiredExhibitIdsForStory(currentStory.storyId);
  const requiredDialogueNpcIds = getRequiredTriggersForStory(currentStory.storyId).map((trigger) => trigger.npcId);
  const isExhibitStripScrollable = requiredExhibitIds.length > 2;
  const isDialogueStripScrollable = requiredDialogueNpcIds.length > 2;

  function returnToScanForNextEnding() {
    resetProgressForNextEnding();
    router.push("/scan");
  }

  function switchRoleForNextRun() {
    resetProgressForNextEnding();
    router.push("/role");
  }

  async function createAnonymousPlayer(rawNickname: string) {
    const normalizedNickname = rawNickname.trim().replace(/\s+/g, " ");
    if (!normalizedNickname) {
      throw new Error(pickText(END_PAGE_COPY.rankingInputRequired, language));
    }

    const response = await fetch("/api/player/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: normalizedNickname }),
    });

    const data = (await response.json()) as PlayerInitResponse | { error?: string };
    if (!response.ok || !("playerId" in data)) {
      throw new Error(("error" in data && data.error) || pickText(END_PAGE_COPY.playerInitFailed, language));
    }

    window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, data.playerId);
    window.localStorage.setItem(PLAYER_NICKNAME_STORAGE_KEY, data.nickname);
    setNickname(data.nickname);
    return data.playerId;
  }

  async function submitRanking(playerId: string) {
    const tracking = ensureRunTracking(currentRoleId, currentStory.storyId);
    const durationSeconds = Math.max(
      0,
      Math.round((Date.parse(currentReconstructionResult.submittedAt) - tracking.startedAt) / 1000),
    );
    const sessionId = `${playerId}:${tracking.sessionId}`;

    const response = await fetch("/api/run/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId,
        sessionId,
        roleId: currentRoleId,
        storyId: currentStory.storyId,
        perfectOrder: currentReconstructionResult.perfectOrder,
        perfectBlanks: currentReconstructionResult.perfectBlanks,
        durationSeconds,
        submittedAt: currentReconstructionResult.submittedAt,
        collectedClueIds,
        scannedExhibitIds: scannedExhibits,
      }),
    });

    const data = (await response.json()) as SubmitRunResponse | { error?: string };
    if (!response.ok || !("runId" in data)) {
      throw new Error(("error" in data && data.error) || pickText(END_PAGE_COPY.rankingFailed, language));
    }

    const nextResult: LastRunResult = {
      storyId: currentStory.storyId,
      runId: data.runId,
      score: data.score,
      grade: data.grade,
      globalRank: data.globalRank,
      roleRank: data.roleRank,
      isPersonalBest: data.isPersonalBest,
    };

    window.sessionStorage.setItem(LAST_RUN_RESULT_STORAGE_KEY, JSON.stringify(nextResult));
    clearRunTracking(currentRoleId, currentStory.storyId);
    setLastRunResult(nextResult);
  }

  async function handleViewRanking() {
    if (isSubmittingRank) {
      return;
    }

    setSubmitError("");
    const existingPlayerId = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);

    if (!existingPlayerId) {
      setShowNicknameInput(true);
      return;
    }

    try {
      setIsSubmittingRank(true);
      await submitRanking(existingPlayerId);
      resetProgressForNextEnding();
      router.push("/profile");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : pickText(END_PAGE_COPY.rankingFailed, language));
    } finally {
      setIsSubmittingRank(false);
    }
  }

  async function handleNicknameSubmit() {
    if (isSubmittingRank) {
      return;
    }

    try {
      setIsSubmittingRank(true);
      setSubmitError("");
      const playerId = await createAnonymousPlayer(nickname);
      await submitRanking(playerId);
      resetProgressForNextEnding();
      router.push("/profile");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : pickText(END_PAGE_COPY.rankingFailed, language));
    } finally {
      setIsSubmittingRank(false);
    }
  }

  return (
    <div className={`transition-opacity duration-300 ${isPageVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="phone-stage bg-[#e8e5dd]">
        <div className="phone-shell border-none bg-[#F2F0EC] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
          <main className="relative flex min-h-full flex-col overflow-hidden bg-[#F2F0EC] text-[#404040]">
            <div className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full opacity-50 shadow-[20px_20px_40px_#D1CDC3,-20px_-20px_40px_#FFFFFF]" />
            <div className="pointer-events-none absolute right-[-5rem] top-1/3 h-80 w-80 rounded-full opacity-60 shadow-[inset_15px_15px_30px_#D1CDC3,inset_-15px_-15px_30px_#FFFFFF]" />
            <div className="pointer-events-none absolute -bottom-20 -left-32 h-96 w-96 rounded-full opacity-40 shadow-[25px_25px_50px_#D1CDC3,-25px_-25px_50px_#FFFFFF]" />
            <div className="pointer-events-none absolute right-[5%] top-[15%] h-48 w-48 rounded-full bg-[#82A696] opacity-10 blur-[100px]" />

            <div className="relative z-10 flex-1 overflow-y-auto p-6 pb-12">
              <header className="mb-10 mt-4 flex items-start justify-between">
                <div className="flex min-h-[104px] items-center">
                  <h1
                    className="flex items-baseline gap-2 text-[2.2rem] font-black text-[#404040] drop-shadow-sm"
                    style={{
                      transform: "translateX(10px)",
                      fontFamily: '"Snell Roundhand", "Brush Script MT", "STKaiti", "KaiTi", cursive',
                    }}
                  >
                    <span className="text-[7.2rem] leading-none text-[#abb9db]">{story.grade}</span>
                    <span className="leading-none">· END</span>
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={returnToScanForNextEnding}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F2F0EC] text-[#8A8A8A] shadow-[6px_6px_12px_#D1CDC3,-6px_-6px_12px_#FFFFFF] transition-all active:shadow-[inset_4px_4px_8px_#D1CDC3,inset_-4px_-4px_8px_#FFFFFF]"
                >
                  <span className="text-sm font-bold">{pickText(END_PAGE_COPY.back, language)}</span>
                </button>
              </header>

              <section className="relative mb-8 flex flex-col items-start overflow-hidden rounded-[2rem] bg-[#F2F0EC] p-8 shadow-[10px_10px_20px_#D1CDC3,-10px_-10px_20px_#FFFFFF]">
                <div className="pointer-events-none absolute right-[-15%] top-[-10%] h-48 w-48 rounded-full opacity-40 shadow-[inset_10px_10px_20px_#D1CDC3,inset_-10px_-10px_20px_#FFFFFF]" />
                <div className="relative z-10 mb-5 text-xs font-bold tracking-[0.2em] text-[#82A696]">ENDING UNLOCKED</div>
                <h2 className="relative z-10 mb-8 text-4xl font-black leading-tight tracking-wide text-[#404040] drop-shadow-sm">
                  {story.title}
                </h2>
                <p className="relative z-10 mb-12 text-[15px] leading-relaxed text-[#7A7A7A]">{story.feedback}</p>
                <div className="relative z-10 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-[#8A8A8A] shadow-[inset_4px_4px_8px_#D1CDC3,inset_-4px_-4px_8px_#FFFFFF]">
                  {currentRoleTitle}
                </div>
              </section>

              <section className="mb-8 rounded-[2rem] bg-[#F2F0EC] p-8 shadow-[10px_10px_20px_#D1CDC3,-10px_-10px_20px_#FFFFFF]">
                <h3 className="mb-8 text-xl font-bold text-[#404040]">{pickText(END_PAGE_COPY.unlockClues, language)}</h3>

                <div className="space-y-6 text-[15px] leading-relaxed text-[#7A7A7A]">
                  <div className="flex flex-col gap-5 border-b border-[#E8E4DB] pb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#82A696]">{pickText(END_PAGE_COPY.requiredExhibits, language)}</span>
                    <div className="overflow-hidden">
                      <div
                        className={`role-scrollbar-hide flex flex-row items-center gap-5 pb-4 ${
                          isExhibitStripScrollable
                            ? "snap-x snap-mandatory overflow-x-auto pr-5 touch-pan-x"
                            : "overflow-x-visible"
                        }`}
                        style={{
                          WebkitOverflowScrolling: "touch",
                          cursor: isExhibitStripScrollable ? "grab" : "default",
                        }}
                      >
                        {requiredExhibitIds.map((exhibitId) => {
                          return (
                            <ExhibitHole key={exhibitId}>
                              <ExhibitSticker exhibitId={exhibitId} />
                            </ExhibitHole>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 border-b border-[#E8E4DB] pb-6 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#82A696]">{pickText(END_PAGE_COPY.requiredDialogue, language)}</span>
                    <div className="relative overflow-hidden">
                      {isDialogueStripScrollable ? (
                        <>
                          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#F2F0EC] via-[#F2F0EC]/85 to-transparent" />
                          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#F2F0EC] via-[#F2F0EC]/85 to-transparent" />
                        </>
                      ) : null}
                      <div
                        className={`role-scrollbar-hide flex flex-row items-center gap-5 pb-4 ${
                          isDialogueStripScrollable
                            ? "snap-x snap-mandatory overflow-x-auto pr-5 touch-pan-x"
                            : "overflow-x-visible"
                        }`}
                        style={{
                          WebkitOverflowScrolling: "touch",
                          cursor: isDialogueStripScrollable ? "grab" : "default",
                        }}
                      >
                        {requiredDialogueNpcIds.map((npcId, index) => (
                          <ExhibitHole key={`${npcId}-${index}`}>
                            <div className="flex h-full w-full items-center justify-center p-3">
                              <Image
                                src={NPC_HALF_PORTRAITS[npcId]}
                                alt={pickText(NPC_HALF_ALT[npcId], language)}
                                width={220}
                                height={220}
                                className="h-[72%] w-auto object-contain drop-shadow-sm"
                              />
                            </div>
                          </ExhibitHole>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#82A696]">{pickText(END_PAGE_COPY.description, language)}</span>
                    <span className="text-[#5A5A5A]">{story.description}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] bg-[#F2F0EC] p-8 shadow-[10px_10px_20px_#D1CDC3,-10px_-10px_20px_#FFFFFF]">
                <h3 className="mb-8 text-xl font-bold text-[#404040]">{pickText(END_PAGE_COPY.nextStep, language)}</h3>

                <div className="space-y-5">
                  <Link
                    href="/scan"
                    onClick={(event) => {
                      event.preventDefault();
                      returnToScanForNextEnding();
                    }}
                    className="flex w-full items-center justify-center rounded-2xl bg-[#F2F0EC] px-5 py-4 text-center text-[17px] font-bold text-[#82A696] shadow-[6px_6px_12px_#D1CDC3,-6px_-6px_12px_#FFFFFF] transition-all active:shadow-[inset_4px_4px_8px_#D1CDC3,inset_-4px_-4px_8px_#FFFFFF]"
                  >
                    {pickText(END_PAGE_COPY.continueScan, language)}
                  </Link>

                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/role"
                      onClick={(event) => {
                        event.preventDefault();
                        switchRoleForNextRun();
                      }}
                      className="flex w-full items-center justify-center rounded-2xl bg-[#F2F0EC] px-5 py-4 text-center font-semibold text-[#6A6A6A] shadow-[6px_6px_12px_#D1CDC3,-6px_-6px_12px_#FFFFFF] transition-all active:shadow-[inset_4px_4px_8px_#D1CDC3,inset_-4px_-4px_8px_#FFFFFF]"
                    >
                      {pickText(END_PAGE_COPY.switchRole, language)}
                    </Link>

                    <ActionButton type="button" onClick={() => void handleViewRanking()} disabled={isSubmittingRank}>
                      {pickText(END_PAGE_COPY.viewRanking, language)}
                    </ActionButton>
                  </div>
                </div>

                {showNicknameInput ? (
                  <div className="mt-6 rounded-[1.5rem] bg-[#F2F0EC] p-5 shadow-[inset_6px_6px_12px_#D1CDC3,inset_-6px_-6px_12px_#FFFFFF]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#82A696]" htmlFor="leaderboard-nickname">
                      {pickText(END_PAGE_COPY.nicknameLabel, language)}
                    </label>
                    <input
                      id="leaderboard-nickname"
                      type="text"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder={pickText(END_PAGE_COPY.nicknamePlaceholder, language)}
                      maxLength={20}
                      className="mt-4 w-full rounded-2xl bg-[#F2F0EC] px-4 py-3 text-sm text-[#5A5A5A] shadow-[inset_4px_4px_8px_#D1CDC3,inset_-4px_-4px_8px_#FFFFFF] outline-none placeholder:text-[#A3A09A]"
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <ActionButton type="button" onClick={() => void handleNicknameSubmit()} disabled={isSubmittingRank} accent>
                        {isSubmittingRank
                          ? pickText(END_PAGE_COPY.submitting, language)
                          : pickText(END_PAGE_COPY.submitRanking, language)}
                      </ActionButton>
                      <ActionButton
                        type="button"
                        onClick={() => {
                          setShowNicknameInput(false);
                          setSubmitError("");
                        }}
                        disabled={isSubmittingRank}
                      >
                        {pickText(END_PAGE_COPY.cancel, language)}
                      </ActionButton>
                    </div>
                    {submitError ? <p className="mt-4 text-sm text-[#B27B7B]">{submitError}</p> : null}
                  </div>
                ) : submitError ? (
                  <p className="mt-6 text-sm text-[#B27B7B]">{submitError}</p>
                ) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
