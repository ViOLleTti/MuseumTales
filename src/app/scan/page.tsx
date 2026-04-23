"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ExhibitHole, ExhibitSticker } from "@/components/exhibit-stickers";
import {
  SCAN_RUNTIME_DETECTED_EVENT,
  SCAN_RUNTIME_HOST_CLASSNAME,
  SCAN_RUNTIME_SLOT_ATTRIBUTE,
} from "@/components/scan/runtime-events";
import { ROLES } from "@/lib/game-data";
import { scanExhibit, useGameStore } from "@/lib/game-store";
import { PAGE_HEADER_COPY, ROLE_SHORT_LABELS, SCAN_PAGE_COPY, pickText } from "@/lib/i18n";
import { getExhibitRule, scanExhibitResult } from "@/lib/narrative-rules";
import type { NarrativeExhibitDef } from "@/lib/narrative-types";
import { getRecentClueTopChip } from "@/lib/top-status-chip";
import { useUiStore } from "@/lib/ui-store";
import type { ExhibitId } from "@/lib/types";

type ChipTone = "default" | "cream-accent" | "accent-rose" | "accent-gold";
type BurstSlot = "primary" | "secondary" | "tertiary";

const FLIGHT_DURATION_MS = 620;
const BURST_SLOT_SEQUENCE: BurstSlot[] = ["primary", "secondary", "tertiary"];
const BURST_SLOT_DELAYS: Record<BurstSlot, number> = {
  primary: 1240,
  secondary: 1380,
  tertiary: 1520,
};
const SLOT_TO_SOFT_TONE: Record<BurstSlot, ChipTone> = {
  primary: "cream-accent",
  secondary: "accent-rose",
  tertiary: "accent-gold",
};
const INITIAL_BURST_VISIBILITY: Record<BurstSlot, boolean> = {
  primary: false,
  secondary: false,
  tertiary: false,
};

function SoftChip({
  children,
  tone = "default",
  className = "",
  chipRef,
  style,
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  className?: string;
  chipRef?: (element: HTMLSpanElement | null) => void;
  style?: CSSProperties;
}) {
  const toneClassName =
    tone === "cream-accent"
      ? "bg-[#f1efe7] text-[#527a67] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
      : tone === "accent-rose"
        ? "bg-[#f1efe7] text-[#cb7a8d] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
        : tone === "accent-gold"
          ? "bg-[#f1efe7] text-[#a68b71] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
      : "bg-[#f1efe7] text-[#4e5751] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]";

  return (
    <span
      ref={chipRef}
      style={style}
      className={`inline-flex max-w-full items-center justify-center rounded-full px-3 py-1.5 text-center text-xs font-semibold leading-tight whitespace-normal ${toneClassName} ${className}`}
    >
      {children}
    </span>
  );
}

type ScanBurst = {
  key: number;
  exhibitId: ExhibitId;
  words: [string, string, string];
};

type FlyingChip = {
  key: string;
  slot: BurstSlot;
  word: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startScale: number;
};

function buildScanBurstWords(exhibit: NarrativeExhibitDef): [string, string, string] {
  const uniqueWords = Array.from(
    new Set(
      [
        exhibit.highlightKeyword,
        ...exhibit.fuzzyKeywords,
        ...exhibit.scanKeywords,
        exhibit.scanClueName,
        exhibit.name,
      ].filter(Boolean),
    ),
  );

  const words = uniqueWords.slice(0, 3);

  while (words.length < 3) {
    words.push(exhibit.name);
  }

  return [words[0], words[1], words[2]];
}

function BurstPill({
  word,
  tone,
  className,
  chipRef,
  isHidden = false,
}: {
  word: string;
  tone: "primary" | "secondary" | "tertiary";
  className: string;
  chipRef?: (element: HTMLSpanElement | null) => void;
  isHidden?: boolean;
}) {
  const toneClassName =
    tone === "primary"
      ? "bg-[rgba(247,244,238,0.95)] shadow-[0_18px_35px_rgba(155,148,131,0.34)]"
      : tone === "secondary"
        ? "bg-[rgba(247,244,238,0.92)] text-[#cb7a8d] shadow-[0_14px_28px_rgba(170,164,147,0.28)]"
        : "bg-[rgba(247,244,238,0.88)] text-[#a68b71] shadow-[0_12px_24px_rgba(186,181,166,0.22)]";
  const wordClassName =
    tone === "primary" ? "text-[#5c8f74] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]" : "";

  return (
    <span
      ref={chipRef}
      style={isHidden ? { visibility: "hidden" } : undefined}
      className={`scan-burst-pill inline-flex max-w-[69vw] items-center justify-center rounded-full border border-white/60 px-6 py-3 text-center text-[16px] font-semibold leading-tight tracking-[0.08em] backdrop-blur-[8px] sm:max-w-[270px] ${toneClassName} ${className}`}
    >
      <span className={wordClassName}>{word}</span>
    </span>
  );
}

function ScanBurstOverlay({
  burst,
  hiddenSlots,
  onBurstRef,
}: {
  burst: ScanBurst | null;
  hiddenSlots: Record<BurstSlot, boolean>;
  onBurstRef: (slot: BurstSlot, element: HTMLSpanElement | null) => void;
}) {
  if (!burst) {
    return null;
  }

  const [primaryWord, secondaryWord, tertiaryWord] = burst.words;

  return (
    <div key={burst.key} className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden="true">
      <div className="scan-burst-aura absolute left-1/2 top-[28%] h-24 w-24 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_72%)] blur-xl" />

      <div className="absolute bottom-[15%] left-[16%]">
        <BurstPill
          word={primaryWord}
          tone="primary"
          className="scan-burst-pill-primary"
          chipRef={(element) => onBurstRef("primary", element)}
          isHidden={hiddenSlots.primary}
        />
      </div>

      <div className="absolute right-[-15px] top-[43%]">
        <BurstPill
          word={secondaryWord}
          tone="secondary"
          className="scan-burst-pill-secondary"
          chipRef={(element) => onBurstRef("secondary", element)}
          isHidden={hiddenSlots.secondary}
        />
      </div>

      <div className="absolute left-[52%] top-[12%] -translate-x-1/2">
        <BurstPill
          word={tertiaryWord}
          tone="tertiary"
          className="scan-burst-pill-tertiary"
          chipRef={(element) => onBurstRef("tertiary", element)}
          isHidden={hiddenSlots.tertiary}
        />
      </div>
    </div>
  );
}

function ScanFlightOverlay({
  chips,
}: {
  chips: FlyingChip[];
}) {
  if (!chips.length) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible" aria-hidden="true">
      {chips.map((chip) => {
        const tone = SLOT_TO_SOFT_TONE[chip.slot];
        const animationStyle = {
          left: `${chip.endX}px`,
          top: `${chip.endY}px`,
          transform: "translate(0, 0)",
          animation: `scan-chip-fly ${FLIGHT_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
          ["--fly-start-x" as string]: `${chip.startX - chip.endX}px`,
          ["--fly-start-y" as string]: `${chip.startY - chip.endY}px`,
          ["--fly-start-scale" as string]: `${chip.startScale}`,
        } as CSSProperties & Record<string, string>;

        return (
          <SoftChip
            key={chip.key}
            tone={tone}
            className="pointer-events-none absolute z-50 origin-top-left"
            style={animationStyle}
          >
            {chip.word}
          </SoftChip>
        );
      })}
    </div>
  );
}

export default function ScanPage() {
  const router = useRouter();
  const animationContainerRef = useRef<HTMLDivElement | null>(null);
  const burstChipRefs = useRef<Record<BurstSlot, HTMLSpanElement | null>>({
    primary: null,
    secondary: null,
    tertiary: null,
  });
  const targetChipRefs = useRef<Record<BurstSlot, HTMLSpanElement | null>>({
    primary: null,
    secondary: null,
    tertiary: null,
  });
  const animationTimerRefs = useRef<number[]>([]);
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const lastScannedExhibitId = useGameStore((state) => state.lastScannedExhibitId);
  const eventHistory = useGameStore((state) => state.eventHistory);
  const language = useUiStore((state) => state.language);
  const [selectedExhibitId, setSelectedExhibitId] = useState<ExhibitId | null>(lastScannedExhibitId);
  const [displayedHoleExhibitId, setDisplayedHoleExhibitId] = useState<ExhibitId | null>(lastScannedExhibitId);
  const [isHoleVisible, setIsHoleVisible] = useState(Boolean(lastScannedExhibitId));
  const [scanBurst, setScanBurst] = useState<ScanBurst | null>(null);
  const [hiddenBurstSlots, setHiddenBurstSlots] = useState(INITIAL_BURST_VISIBILITY);
  const [landedChipSlots, setLandedChipSlots] = useState(INITIAL_BURST_VISIBILITY);
  const [flyingChips, setFlyingChips] = useState<FlyingChip[]>([]);

  const clearAnimationTimers = useCallback(() => {
    animationTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
    animationTimerRefs.current = [];
  }, []);

  const setBurstChipRef = useCallback((slot: BurstSlot, element: HTMLSpanElement | null) => {
    burstChipRefs.current[slot] = element;
  }, []);

  const setTargetChipRef = useCallback((slot: BurstSlot, element: HTMLSpanElement | null) => {
    targetChipRefs.current[slot] = element;
  }, []);

  const triggerChipFlight = useCallback(
    (burstKey: number, slot: BurstSlot, word: string) => {
      const container = animationContainerRef.current?.getBoundingClientRect();
      const source = burstChipRefs.current[slot]?.getBoundingClientRect();
      const target = targetChipRefs.current[slot]?.getBoundingClientRect();

      setHiddenBurstSlots((current) => ({ ...current, [slot]: true }));

      if (!container || !source || !target) {
        setLandedChipSlots((current) => ({ ...current, [slot]: true }));
        return;
      }

      const startScale = source.width && target.width ? source.width / target.width : 1;
      setFlyingChips((current) => [
        ...current.filter((chip) => chip.slot !== slot),
        {
          key: `${burstKey}-${slot}`,
          slot,
          word,
          startX: source.left - container.left,
          startY: source.top - container.top,
          endX: target.left - container.left,
          endY: target.top - container.top,
          startScale,
        },
      ]);

      const settleTimer = window.setTimeout(() => {
        setLandedChipSlots((current) => ({ ...current, [slot]: true }));

        const removeFlightTimer = window.setTimeout(() => {
          setFlyingChips((current) => current.filter((chip) => chip.slot !== slot));
        }, 34);

        animationTimerRefs.current.push(removeFlightTimer);
      }, FLIGHT_DURATION_MS);

      animationTimerRefs.current.push(settleTimer);
    },
    [],
  );

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
    }
  }, [roleId, router]);

  useEffect(() => () => clearAnimationTimers(), [clearAnimationTimers]);

  useEffect(() => {
    if (lastScannedExhibitId && !scanBurst) {
      setSelectedExhibitId(lastScannedExhibitId);
      setDisplayedHoleExhibitId(lastScannedExhibitId);
      setIsHoleVisible(true);
    }
  }, [lastScannedExhibitId, scanBurst]);

  useEffect(() => {
    if (!scanBurst) {
      return;
    }

    clearAnimationTimers();

    BURST_SLOT_SEQUENCE.forEach((slot, index) => {
      const timer = window.setTimeout(() => {
        triggerChipFlight(scanBurst.key, slot, scanBurst.words[index]);
      }, BURST_SLOT_DELAYS[slot]);

      animationTimerRefs.current.push(timer);
    });

    const revealHoleTimer = window.setTimeout(() => {
      setDisplayedHoleExhibitId(scanBurst.exhibitId);
      setIsHoleVisible(true);
    }, BURST_SLOT_DELAYS.tertiary + FLIGHT_DURATION_MS);

    animationTimerRefs.current.push(revealHoleTimer);

    const clearTimer = window.setTimeout(() => {
      setScanBurst((current) => (current?.key === scanBurst.key ? null : current));
      setFlyingChips([]);
    }, 2280);

    animationTimerRefs.current.push(clearTimer);

    return () => {
      clearAnimationTimers();
    };
  }, [clearAnimationTimers, scanBurst, triggerChipFlight]);

  const handleDetectedExhibit = useCallback(
    (exhibitId: ExhibitId) => {
      const exhibit = getExhibitRule(exhibitId, language);
      const burstKey = Date.now();

      clearAnimationTimers();
      scanExhibit(exhibitId);
      setSelectedExhibitId(exhibitId);
      setIsHoleVisible(false);
      setFlyingChips([]);
      setHiddenBurstSlots(INITIAL_BURST_VISIBILITY);
      setLandedChipSlots(INITIAL_BURST_VISIBILITY);
      setScanBurst({
        key: burstKey,
        exhibitId,
        words: buildScanBurstWords(exhibit),
      });
    },
    [clearAnimationTimers, language],
  );

  useEffect(() => {
    const handleRuntimeDetect = (event: Event) => {
      const exhibitId = (event as CustomEvent<{ exhibitId?: ExhibitId }>).detail?.exhibitId;
      if (exhibitId) {
        handleDetectedExhibit(exhibitId);
      }
    };

    window.addEventListener(SCAN_RUNTIME_DETECTED_EVENT, handleRuntimeDetect);
    return () => {
      window.removeEventListener(SCAN_RUNTIME_DETECTED_EVENT, handleRuntimeDetect);
    };
  }, [handleDetectedExhibit]);

  if (!roleId) {
    return null;
  }

  const isEnglish = language === "en";
  const currentExhibit = selectedExhibitId ? getExhibitRule(selectedExhibitId, language) : null;
  const currentScanResult = selectedExhibitId
    ? scanExhibitResult(selectedExhibitId, collectedClueIds, language)
    : null;
  const currentRoleLabel =
    pickText(ROLE_SHORT_LABELS[roleId], language) ??
    ROLES.find((role) => role.id === roleId)?.[isEnglish ? "titleEn" : "title"] ??
    roleId;
  const recentClueTopChip = getRecentClueTopChip(eventHistory, roleId, language);
  const shouldShowTargetChip = (slot: BurstSlot) => !scanBurst || landedChipSlots[slot];
  const shouldShowExhibitPreview = Boolean(displayedHoleExhibitId) && isHoleVisible;

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <main className="relative flex min-h-full flex-col overflow-x-visible overflow-y-auto bg-[#f1efe7] text-[#424542]">
          <div className="sticky top-0 z-10 bg-[#f1efe7]/92 px-4 pb-4 pt-6 backdrop-blur">
            <div
              className={`mx-auto rounded-[26px] bg-[#f1efe7] px-6 py-3 text-center shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff] ${
                isEnglish ? "max-w-[320px]" : "max-w-[290px]"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#94b5a9]">{PAGE_HEADER_COPY.scan.eyebrow}</p>
              <h1 className={`mt-1 font-bold text-[#424542] ${isEnglish ? "text-[14px] tracking-[0.08em]" : "text-[15px] tracking-[0.12em]"}`}>
                {pickText(PAGE_HEADER_COPY.scan.title, language)}
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

          <div ref={animationContainerRef} className="relative flex-1 overflow-visible px-4 pb-6">
            <section className="relative mt-1 overflow-visible">
              <div className="relative rounded-[36px] px-3 pb-3 pt-5">
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[36px] bg-[#e8e5dd] shadow-[inset_0_10px_20px_rgba(213,210,200,0.55)]">
                  <div className="absolute -left-[15%] -top-[10%] h-[350px] w-[350px] rounded-full bg-[#e8e5dd] opacity-90 shadow-[inset_15px_15px_40px_#d5d2c8,inset_-15px_-15px_40px_#ffffff]" />
                  <div className="absolute -right-[25%] top-[25%] h-[400px] w-[400px] rounded-full bg-[#e8e5dd] opacity-90 shadow-[25px_25px_50px_#d5d2c8,-25px_-25px_50px_#ffffff]" />
                  <div className="absolute -bottom-[10%] left-1/2 h-[250px] w-[500px] -translate-x-1/2 rounded-[100%] bg-[#e8e5dd] opacity-80 shadow-[inset_0_20px_50px_#d5d2c8,inset_0_-10px_20px_#ffffff]" />
                </div>

                <div className="relative overflow-visible">
                  <div
                    {...{ [SCAN_RUNTIME_SLOT_ATTRIBUTE]: "true" }}
                    className={`pointer-events-none min-h-[24rem] rounded-[32px] ${SCAN_RUNTIME_HOST_CLASSNAME}`}
                    aria-hidden="true"
                  />
                  <ScanBurstOverlay burst={scanBurst} hiddenSlots={hiddenBurstSlots} onBurstRef={setBurstChipRef} />
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="flex items-center justify-center">
                <div className="min-w-[270px] rounded-full bg-[#f1efe7] px-8 py-3 shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-center text-sm font-semibold text-[#6f7e76]">{pickText(SCAN_PAGE_COPY.prompt, language)}</p>
                </div>
              </div>

              {currentExhibit && currentScanResult ? (
                <>
                  <div className="mt-4 rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">{currentExhibit.name}</p>
                    <p className="mt-2 text-sm leading-6 text-[#6d756c]">{currentExhibit.observation}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <SoftChip
                        tone="cream-accent"
                        chipRef={(element) => setTargetChipRef("primary", element)}
                        className={shouldShowTargetChip("primary") ? "visible opacity-100" : "invisible opacity-0"}
                      >
                        {currentExhibit.highlightKeyword}
                      </SoftChip>
                      {currentExhibit.fuzzyKeywords.map((keyword, index) => (
                        <SoftChip
                          key={keyword}
                          tone={index === 0 ? "accent-rose" : index === 1 ? "accent-gold" : "default"}
                          chipRef={
                            index === 0
                              ? (element) => setTargetChipRef("secondary", element)
                              : index === 1
                                ? (element) => setTargetChipRef("tertiary", element)
                                : undefined
                          }
                          className={`${
                            index === 0
                              ? shouldShowTargetChip("secondary")
                                ? "visible opacity-100"
                                : "invisible opacity-0"
                              : index === 1
                                ? shouldShowTargetChip("tertiary")
                                  ? "visible opacity-100"
                                  : "invisible opacity-0"
                                : "visible opacity-100"
                          }`}
                        >
                          {keyword}
                        </SoftChip>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`mt-4 rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 ${
                      shouldShowExhibitPreview ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="flex justify-center">
                      <ExhibitHole className="h-24 w-32 shadow-[6px_6px_14px_#d7d2c8,-6px_-6px_14px_#ffffff]">
                        <div className="scale-[0.88]">
                          {displayedHoleExhibitId ? <ExhibitSticker exhibitId={displayedHoleExhibitId} /> : null}
                        </div>
                      </ExhibitHole>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-sm font-semibold text-[#414640]">{pickText(SCAN_PAGE_COPY.waitingTitle, language)}</p>
                  <p className="mt-2 text-sm leading-6 text-[#7e857b]">
                    {pickText(SCAN_PAGE_COPY.waitingBody, language)}
                  </p>
                </div>
              )}
            </section>
            <ScanFlightOverlay chips={flyingChips} />
          </div>

          <nav className="border-t border-white/50 bg-[#f1efe7] px-4 pb-5 pt-3">
            <div className="grid grid-cols-4 gap-2 rounded-[28px] bg-[#ece8df] p-2 shadow-[inset_4px_4px_8px_#d8d3c9,inset_-4px_-4px_8px_#fbf7f1]">
              {[
                { href: "/home", label: "Home" },
                { href: "/scan", label: "Scan" },
                { href: "/npc", label: "Chat" },
                { href: "/profile", label: "Profile" },
              ].map((item) => {
                const isActive = item.href === "/scan";
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
