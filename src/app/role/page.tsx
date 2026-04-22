"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { ROLE_PAGE_COPY, pickText } from "@/lib/i18n";
import { useUiStore } from "@/lib/ui-store";
import type { RoleId } from "@/lib/types";

const COLORS = {
  bg: "#f1efe7",
  sage: "#94b5a9",
  sageDeep: "#7a9e91",
  textMain: "#465a51",
  textMuted: "#7f938a",
  white: "#ffffff",
};

const shadowRaised = "shadow-[8px_8px_16px_rgba(206,202,189,0.5),-8px_-8px_16px_rgba(255,255,255,0.9)]";
const shadowRaisedSm = "shadow-[4px_4px_10px_rgba(206,202,189,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)]";
const shadowInsetPanel =
  "shadow-[inset_4px_4px_8px_rgba(225,220,210,0.95),inset_-4px_-4px_8px_rgba(255,255,255,0.95)]";
const shadowInsetPanelSm =
  "shadow-[inset_2px_2px_4px_rgba(225,220,210,0.9),inset_-2px_-2px_4px_rgba(255,255,255,0.95)]";
const shadowInsetCircle =
  "shadow-[inset_6px_6px_12px_rgba(206,202,189,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]";
const shadowRaisedCircle =
  "shadow-[6px_6px_12px_rgba(206,202,189,0.5),-6px_-6px_12px_rgba(255,255,255,0.9)]";

type RoleCard = {
  id: RoleId;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
};

const ROLE_CARDS: RoleCard[] = [
  {
    id: "P1",
    title: ROLE_PAGE_COPY.cards.P1.title,
    description: ROLE_PAGE_COPY.cards.P1.description,
  },
  {
    id: "P2",
    title: ROLE_PAGE_COPY.cards.P2.title,
    description: ROLE_PAGE_COPY.cards.P2.description,
  },
  {
    id: "P3",
    title: ROLE_PAGE_COPY.cards.P3.title,
    description: ROLE_PAGE_COPY.cards.P3.description,
  },
  {
    id: "P4",
    title: ROLE_PAGE_COPY.cards.P4.title,
    description: ROLE_PAGE_COPY.cards.P4.description,
  },
];

function ArchiveIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect x="4" y="5" width="16" height="4" rx="1.6" />
      <path d="M6 9h12v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" />
      <path d="M10 13h4" />
    </svg>
  );
}

function BookOpenIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M12 7a3 3 0 0 0-3-2H5v14h4a3 3 0 0 1 3 2" />
      <path d="M12 7a3 3 0 0 1 3-2h4v14h-4a3 3 0 0 0-3 2" />
    </svg>
  );
}

function NewspaperIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5H18v12.5a1.5 1.5 0 0 1-3 0V8H5v9.5A1.5 1.5 0 0 0 6.5 19H17" />
      <path d="M8 11h4" />
      <path d="M8 14h6" />
      <path d="M8 17h6" />
    </svg>
  );
}

function LandmarkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M3 10h18" />
      <path d="M12 4 4 8v2h16V8l-8-4Z" />
      <path d="M6 10v7" />
      <path d="M10 10v7" />
      <path d="M14 10v7" />
      <path d="M18 10v7" />
      <path d="M3 20h18" />
    </svg>
  );
}

const ROLE_ICONS: Record<RoleId, ({ className }: { className?: string }) => JSX.Element> = {
  P1: ArchiveIcon,
  P2: BookOpenIcon,
  P3: NewspaperIcon,
  P4: LandmarkIcon,
};

export default function RolePage() {
  const router = useRouter();
  const selectRole = useGameStore((state) => state.selectRole);
  const language = useUiStore((state) => state.language);
  const [activeRole, setActiveRole] = useState<RoleId>("P1");
  const [isReady, setIsReady] = useState(false);
  const [shouldSpringCards, setShouldSpringCards] = useState(false);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => setIsReady(true), 120);
    const springTimer = window.setTimeout(() => setShouldSpringCards(true), 1550);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(springTimer);
    };
  }, []);

  const activeCard = useMemo(
    () => ROLE_CARDS.find((card) => card.id === activeRole) ?? ROLE_CARDS[0],
    [activeRole],
  );
  const isEnglish = language === "en";

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <div className="absolute inset-0 z-0 bg-[#f1efe7]" />
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <div className={`absolute -right-[20%] -top-[10%] h-[380px] w-[380px] rounded-full ${shadowInsetCircle}`} style={{ backgroundColor: COLORS.bg }} />
          <div className={`absolute -right-[5%] top-[5%] h-[200px] w-[200px] rounded-full ${shadowRaisedCircle}`} style={{ backgroundColor: COLORS.bg }} />
          <div className={`absolute -left-[30%] top-[30%] h-[320px] w-[320px] rounded-full ${shadowRaisedCircle}`} style={{ backgroundColor: COLORS.bg }} />
          <div className={`absolute -left-[15%] top-[42%] h-[180px] w-[180px] rounded-full ${shadowInsetCircle}`} style={{ backgroundColor: COLORS.bg }} />
          <div className={`absolute -bottom-[5%] -right-[15%] h-[350px] w-[350px] rounded-full ${shadowInsetCircle}`} style={{ backgroundColor: COLORS.bg }} />
        </div>

        <main className="relative z-10 flex min-h-full flex-col overflow-y-auto pb-32 role-scrollbar-hide">
          <div className="px-7 pb-6 pt-16">
            <div
              className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out ${
                isReady ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className={`rounded-full px-6 py-2 ${shadowRaisedSm}`} style={{ backgroundColor: COLORS.bg }}>
                <span className="tracking-[0.15em]" style={{ color: COLORS.sage, fontSize: 13, fontWeight: 600 }}>
                  Select Role
                </span>
              </div>

              <h1
                className="mt-2 text-center"
                style={{
                  color: COLORS.textMain,
                  fontSize: isEnglish ? 18 : 19,
                  fontWeight: 600,
                  letterSpacing: isEnglish ? "0.02em" : "0.05em",
                }}
              >
                {pickText(ROLE_PAGE_COPY.title, language)}
              </h1>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS.sage, opacity: 0.3 }} />
                <span className="h-[2px] w-8 rounded-full" style={{ backgroundColor: COLORS.sage, opacity: 0.3 }} />
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS.sage }} />
                <span className="h-[2px] w-8 rounded-full" style={{ backgroundColor: COLORS.sage, opacity: 0.3 }} />
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS.sage, opacity: 0.3 }} />
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-5 px-6">
            {ROLE_CARDS.map((role, index) => {
              const isSelected = activeRole === role.id;
              const Icon = ROLE_ICONS[role.id];

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActiveRole(role.id)}
                  className={`w-full rounded-[28px] border p-4 text-left transition-[border-color,box-shadow,transform,background-color] duration-300 ${
                    shouldSpringCards
                      ? "role-card-spring-up"
                      : isReady
                        ? "role-card-reveal"
                        : "role-card-preenter"
                  } ${isSelected ? "border-[#c7d8d1]" : "border-[rgba(255,255,255,0.45)]"} ${
                    isSelected ? shadowRaised : shadowInsetPanel
                  }`}
                  style={{
                    backgroundColor: isSelected ? COLORS.bg : "#f6f4ee",
                    animationDelay: shouldSpringCards
                      ? `${index * 0.15}s`
                      : isReady
                        ? `${0.4 + index * 0.15}s`
                        : undefined,
                    ["--role-card-final-scale" as string]: isSelected ? "1.02" : "1",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-[20px] border border-white/60 ${
                        isSelected ? shadowRaisedSm : shadowInsetPanelSm
                      }`}
                      style={{ backgroundColor: COLORS.bg }}
                    >
                      <Icon
                        className={`h-[24px] w-[24px] ${
                          isSelected ? "text-[#94b5a9]" : "text-[#b7c4be]"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3
                          style={{
                            color: COLORS.textMain,
                            fontSize: isEnglish ? 16 : 17,
                            fontWeight: 600,
                            letterSpacing: isEnglish ? "0.01em" : "0.04em",
                          }}
                        >
                          {pickText(role.title, language)}
                        </h3>
                      </div>
                      <p
                        style={{
                          color: COLORS.textMuted,
                          fontSize: 13,
                          lineHeight: 1.6,
                          fontWeight: 400,
                        }}
                      >
                        {pickText(role.description, language)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        <div
          className={`absolute bottom-0 left-0 z-20 w-full px-7 py-8 transition-all duration-700 ease-out ${
            isReady ? "translate-y-0 opacity-100" : "translate-y-[50px] opacity-0"
          }`}
          style={{
            background: `linear-gradient(to top, ${COLORS.bg} 80%, transparent)`,
            transitionDelay: "980ms",
          }}
        >
          <button
            type="button"
            onClick={() => {
              selectRole(activeCard.id);
              router.push("/home");
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-[22px] py-4 transition-all duration-300 ${
              activeCard ? shadowRaised : shadowRaisedSm
            }`}
            style={{
              backgroundColor: activeCard ? COLORS.sage : COLORS.bg,
            }}
          >
            <span
              style={{
                color: activeCard ? COLORS.white : COLORS.textMuted,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: isEnglish ? "0.04em" : "0.08em",
              }}
            >
              {pickText(ROLE_PAGE_COPY.cta, language)}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.white}
              strokeWidth="2.5"
              className="h-[18px] w-[18px]"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
}
