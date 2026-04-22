"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NPCS } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { getHomeHint, getRoleBriefing, getHomeProgressState } from "@/lib/home-briefing";
import { HOME_PAGE_COPY, PAGE_HEADER_COPY, ROLE_SHORT_LABELS, pickText } from "@/lib/i18n";
import { getClueKeyword, getExhibitRule, getRelevantClueIdsForRole } from "@/lib/narrative-rules";
import { getRecentClueTopChip } from "@/lib/top-status-chip";
import { useUiStore } from "@/lib/ui-store";
import type { GameEvent } from "@/lib/narrative-types";

function SoftChip({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "default" | "cream-accent" | "muted";
  className?: string;
}) {
  const toneClassName =
    tone === "cream-accent"
      ? "bg-[#f1efe7] text-[#527a67] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
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

function getNpcLabel(npcId: string, language: "zh" | "en") {
  const npc = NPCS.find((entry) => entry.id === npcId);
  return npc ? (language === "en" ? npc.nameEn : npc.name) : npcId;
}

function getEventTitle(event: GameEvent, language: "zh" | "en") {
  if (event.type === "scan") {
    return getExhibitRule(event.exhibitId, language).name;
  }

  return getNpcLabel(event.npcId, language);
}

function getEventDescription(event: GameEvent, language: "zh" | "en") {
  if (event.type === "scan") {
    return language === "en"
      ? `Scanned clue: ${getClueKeyword(event.clueId, language)}`
      : `AR Scan for ${getClueKeyword(event.clueId, language)}`;
  }

  return language === "en"
    ? `NPC clue: ${getClueKeyword(event.clueId, language)}`
    : `Message ${getClueKeyword(event.clueId, language)}`;
}

export default function MapHomePage() {
  const router = useRouter();
  const logScrollRef = useRef<HTMLDivElement | null>(null);
  const logItemsRef = useRef<HTMLDivElement | null>(null);
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const scannedExhibits = useGameStore((state) => state.scannedExhibits);
  const consumedTriggerIds = useGameStore((state) => state.consumedTriggerIds);
  const lastScannedExhibitId = useGameStore((state) => state.lastScannedExhibitId);
  const viewedEndingStoryIds = useGameStore((state) => state.viewedEndingStoryIds);
  const eventHistory = useGameStore((state) => state.eventHistory);
  const resetRun = useGameStore((state) => state.resetRun);
  const language = useUiStore((state) => state.language);
  const toggleLanguage = useUiStore((state) => state.toggleLanguage);
  const [logViewportHeight, setLogViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
    }
  }, [roleId, router]);

  useEffect(() => {
    if (eventHistory.length <= 3) {
      setLogViewportHeight(null);
      return;
    }

    const measureLogViewport = () => {
      const itemsHost = logItemsRef.current;
      if (!itemsHost) {
        return;
      }

      const [firstItem, secondItem, thirdItem] = Array.from(itemsHost.children) as HTMLElement[];
      if (!firstItem || !secondItem || !thirdItem) {
        return;
      }

      const gap = Number.parseFloat(window.getComputedStyle(itemsHost).rowGap || "0");
      const nextHeight =
        firstItem.getBoundingClientRect().height +
        secondItem.getBoundingClientRect().height +
        thirdItem.getBoundingClientRect().height +
        gap * 2;
      setLogViewportHeight(nextHeight);
    };

    measureLogViewport();
    window.addEventListener("resize", measureLogViewport);

    return () => window.removeEventListener("resize", measureLogViewport);
  }, [eventHistory]);

  useEffect(() => {
    if (eventHistory.length <= 3 || !logScrollRef.current) {
      return;
    }

    const container = logScrollRef.current;
    container.scrollTop = container.scrollHeight;
  }, [eventHistory]);

  if (!roleId) {
    return null;
  }

  const isEnglish = language === "en";
  const briefing = getRoleBriefing(roleId, language);
  const progress = getHomeProgressState(roleId, collectedClueIds, viewedEndingStoryIds, language);
  const relevantCollectedClueIds = collectedClueIds.filter((clueId) => getRelevantClueIdsForRole(roleId).includes(clueId));
  const recentClueTopChip = getRecentClueTopChip(eventHistory, roleId, language);
  const homeHint = getHomeHint(
    roleId,
    collectedClueIds,
    scannedExhibits,
    consumedTriggerIds,
    lastScannedExhibitId,
    viewedEndingStoryIds,
    language,
  );
  const handleBackToRole = () => {
    resetRun();
    router.push("/role");
  };

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <main className="relative flex min-h-full flex-col overflow-x-visible overflow-y-auto bg-[#f1efe7] text-[#424542]">
          <div className="sticky top-0 z-10 bg-[#f1efe7]/92 px-4 pb-4 pt-6 backdrop-blur">
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={handleBackToRole}
                aria-label={pickText(HOME_PAGE_COPY.backAria, language)}
                className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f1efe7] text-[#6f7e76] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff] transition hover:bg-[#f6f4ee]"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={pickText(HOME_PAGE_COPY.languageAria, language)}
                className="absolute right-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f1efe7] text-[#6f7e76] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff] transition hover:bg-[#f6f4ee]"
              >
                <span className="text-lg leading-none">⇆</span>
              </button>
              <div
                className={`w-full rounded-[26px] bg-[#f1efe7] px-6 py-3 text-center shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff] ${
                  isEnglish ? "max-w-[320px]" : "max-w-[290px]"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#94b5a9]">
                  {PAGE_HEADER_COPY.home.eyebrow}
                </p>
                <h1
                  className={`mt-1 font-bold text-[#424542] ${isEnglish ? "text-[14px] tracking-[0.08em]" : "text-[15px] tracking-[0.12em]"}`}
                >
                  {pickText(PAGE_HEADER_COPY.home.title, language)}
                </h1>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <SoftChip tone="cream-accent" className={isEnglish ? "min-w-[10ch]" : ""}>
                {pickText(ROLE_SHORT_LABELS[roleId], language)}
              </SoftChip>
              {recentClueTopChip ? (
                <SoftChip tone="cream-accent" className={isEnglish ? "min-w-[10ch]" : ""}>
                  {recentClueTopChip}
                </SoftChip>
              ) : null}
            </div>
          </div>

          <div className="relative z-30 flex-1 overflow-visible px-4 pb-6">
            <section className="mt-1 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="flex items-center justify-center">
                <div className="min-w-[270px] rounded-full bg-[#f1efe7] px-6 py-3 shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-center text-sm font-semibold text-[#6f7e76]">
                    {homeHint}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mx-auto flex max-w-[280px] gap-2">
                  {progress.totalClueIds.map((clueId, index) => {
                    const isFilled = index < progress.completedCount;

                    return (
                      <div
                        key={clueId}
                        className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[#d5d2c9]"
                      >
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                            isFilled ? "w-full bg-[#f7f4ee]" : "w-0"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {progress.currentTierStories.map((story) => (
                    <SoftChip key={story.storyId} tone={story.isComplete ? "cream-accent" : "muted"}>
                      {story.label}
                    </SoftChip>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="grid grid-cols-[0.9fr_1.1fr] gap-4">
                <div className="space-y-4">
                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">{pickText(HOME_PAGE_COPY.currentRole, language)}</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <SoftChip tone="cream-accent">{briefing.title}</SoftChip>
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {briefing.keywords.map((keyword) => (
                        <SoftChip key={keyword} tone="muted">
                          {keyword}
                        </SoftChip>
                      ))}
                    </div>
                    <p className={`mt-3 text-sm leading-6 text-[#6d756c] ${language === "en" ? "text-center" : ""}`}>
                      {briefing.intro}
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">{pickText(HOME_PAGE_COPY.whyHere, language)}</p>
                    <p className={`mt-3 text-sm leading-6 text-[#6d756c] ${language === "en" ? "text-center" : ""}`}>
                      {briefing.whyHere}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">{pickText(HOME_PAGE_COPY.explorationLog, language)}</p>
                    <div
                      ref={logScrollRef}
                      className={`mt-3 ${eventHistory.length > 3 ? "overflow-y-auto pr-1 home-log-scroll" : ""}`}
                      style={eventHistory.length > 3 && logViewportHeight ? { maxHeight: `${logViewportHeight}px` } : undefined}
                    >
                      <div ref={logItemsRef} className="flex flex-col gap-3">
                      {eventHistory.length ? (
                        eventHistory.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-[22px] bg-[#f1efe7] p-3 shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
                          >
                            <div className={`gap-2 ${language === "en" ? "flex flex-col items-start" : "flex flex-wrap items-center"}`}>
                              <SoftChip tone="cream-accent">
                                {pickText(event.type === "scan" ? HOME_PAGE_COPY.scanChip : HOME_PAGE_COPY.npcChip, language)}
                              </SoftChip>
                              <p className="text-sm font-semibold text-[#465a51]">{getEventTitle(event, language)}</p>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#6d756c]">{getEventDescription(event, language)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-[#7e857b]">
                          {pickText(HOME_PAGE_COPY.noLog, language)}
                        </p>
                      )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">{pickText(HOME_PAGE_COPY.cluesThisRun, language)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {relevantCollectedClueIds.length ? (
                        relevantCollectedClueIds.map((clueId) => (
                          <SoftChip key={clueId} tone="cream-accent">
                            {getClueKeyword(clueId, language)}
                          </SoftChip>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-[#7e857b]">{pickText(HOME_PAGE_COPY.noClues, language)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                const isActive = item.href === "/home";
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
