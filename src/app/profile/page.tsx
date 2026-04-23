"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/game-store";
import { ROLES } from "@/lib/game-data";
import { PAGE_HEADER_COPY, PROFILE_PAGE_COPY, ROLE_SHORT_LABELS, formatDuration, formatScore, pickText } from "@/lib/i18n";
import { getStoryRule } from "@/lib/narrative-rules";
import { useUiStore } from "@/lib/ui-store";
import {
  type LeaderboardBundleResponse,
  LAST_RUN_RESULT_STORAGE_KEY,
  PLAYER_ID_STORAGE_KEY,
  PLAYER_NICKNAME_STORAGE_KEY,
  type LastRunResult,
  type LeaderboardItem,
} from "@/lib/leaderboard-client";

type LeaderboardTab = "role" | "global";

function SoftChip({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "default" | "cream-accent" | "muted" | "accent-rose" | "accent-gold";
  className?: string;
}) {
  const toneClassName =
    tone === "cream-accent"
      ? "bg-[#f1efe7] text-[#527a67] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
      : tone === "accent-rose"
        ? "bg-[#f1efe7] text-[#cb7a8d] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
        : tone === "accent-gold"
          ? "bg-[#f1efe7] text-[#a68b71] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
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

export default function ProfilePage() {
  const router = useRouter();
  const roleId = useGameStore((state) => state.selectedRole);
  const language = useUiStore((state) => state.language);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("role");
  const [playerNickname, setPlayerNickname] = useState("");
  const [lastRunResult, setLastRunResult] = useState<LastRunResult | null>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardBundleResponse["global"] | null>(null);
  const [roleLeaderboard, setRoleLeaderboard] = useState<LeaderboardBundleResponse["role"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
    }
  }, [roleId, router]);

  useEffect(() => {
    if (!roleId) {
      return;
    }

    const currentRoleId = roleId;
    const storedNickname = window.localStorage.getItem(PLAYER_NICKNAME_STORAGE_KEY);
    const playerId = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
    const rawLastRun = window.sessionStorage.getItem(LAST_RUN_RESULT_STORAGE_KEY);

    if (storedNickname) {
      setPlayerNickname(storedNickname);
    }

    if (rawLastRun) {
      try {
        setLastRunResult(JSON.parse(rawLastRun) as LastRunResult);
      } catch {
        setLastRunResult(null);
      }
    }

    async function loadLeaderboards() {
      setIsLoading(true);
      setError("");

      try {
        const leaderboardUrl = new URL("/api/leaderboard", window.location.origin);
        leaderboardUrl.searchParams.set("scope", "bundle");
        leaderboardUrl.searchParams.set("roleId", currentRoleId);
        leaderboardUrl.searchParams.set("limit", "10");
        if (playerId) {
          leaderboardUrl.searchParams.set("playerId", playerId);
        }

        const response = await fetch(leaderboardUrl.toString());
        const data = (await response.json()) as LeaderboardBundleResponse | { error?: string };

        if (!response.ok || !("global" in data) || !("role" in data)) {
          throw new Error(language === "en" ? pickText(PROFILE_PAGE_COPY.leaderboardError, language) : ("error" in data && data.error) || "加载排行榜失败。");
        }

        setGlobalLeaderboard(data.global);
        setRoleLeaderboard(data.role);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : pickText(PROFILE_PAGE_COPY.leaderboardError, language));
      } finally {
        setIsLoading(false);
      }
    }

    void loadLeaderboards();
  }, [language, roleId]);

  if (!roleId) {
    return null;
  }

  const isEnglish = language === "en";
  const displayNickname = playerNickname || pickText(PROFILE_PAGE_COPY.anonymousPlayer, language);
  const currentRole = ROLES.find((role) => role.id === roleId);
  const currentRoleTitle = currentRole?.[isEnglish ? "titleEn" : "title"] ?? roleId;
  const topRoleLabel = pickText(ROLE_SHORT_LABELS[roleId], language);
  const activeLeaderboard = activeTab === "role" ? roleLeaderboard : globalLeaderboard;
  const bestItem = roleLeaderboard?.myBest ?? globalLeaderboard?.myBest ?? null;

  function renderLeaderboardItems(items: LeaderboardItem[]) {
    if (!items.length) {
      return <p className="mt-3 text-sm leading-6 text-[#7e857b]">{pickText(PROFILE_PAGE_COPY.noLeaderboardItems, language)}</p>;
    }

    return (
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={`${item.rank}-${item.playerId}-${item.storyId}`}
            className="rounded-[24px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-[#414640]">
                  #{item.rank} · {item.nickname}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6d756c]">
                  {getStoryRule(item.storyId, language)?.title ?? item.storyTitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <SoftChip tone="cream-accent">{item.grade}</SoftChip>
                <p className="text-xs text-[#8a9287]">{formatDuration(item.durationSeconds, language)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#94b5a9]">{PAGE_HEADER_COPY.profile.eyebrow}</p>
              <h1 className={`mt-1 font-bold text-[#424542] ${isEnglish ? "text-[14px] tracking-[0.08em]" : "text-[15px] tracking-[0.12em]"}`}>
                {pickText(PAGE_HEADER_COPY.profile.title, language)}
              </h1>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <SoftChip tone="cream-accent" className={isEnglish ? "min-w-[10ch]" : ""}>
                {topRoleLabel}
              </SoftChip>
              <SoftChip tone="muted" className={isEnglish ? "min-w-[10ch]" : ""}>
                {displayNickname}
              </SoftChip>
            </div>
          </div>

          <div className="relative z-30 flex-1 overflow-visible px-4 pb-6">
            <section className="mt-1 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="flex items-center justify-center">
                <div className="min-w-[270px] rounded-full bg-[#f1efe7] px-8 py-3 shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-center text-sm font-semibold text-[#6f7e76]">{pickText(PROFILE_PAGE_COPY.heroSubtitle, language)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                <p className="text-sm font-semibold text-[#414640]">{pickText(PROFILE_PAGE_COPY.personalInfo, language)}</p>
                <div className="mt-3 space-y-3 text-sm text-[#6d756c]">
                  <div className="flex items-center justify-between gap-3">
                    <span>{pickText(PROFILE_PAGE_COPY.nickname, language)}</span>
                    <SoftChip tone="cream-accent">{displayNickname}</SoftChip>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{pickText(PROFILE_PAGE_COPY.currentRole, language)}</span>
                    <SoftChip tone="cream-accent">{currentRoleTitle}</SoftChip>
                  </div>
                  <div className="rounded-[22px] bg-[#f1efe7] p-3 shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94b5a9]">Best Result</p>
                    <p className="mt-2 text-sm leading-6 text-[#6d756c]">
                      {bestItem
                        ? `${bestItem.grade} - ${formatScore(bestItem.score, language)} - ${
                            getStoryRule(bestItem.storyId, language)?.title ?? bestItem.storyTitle
                          }`
                        : pickText(PROFILE_PAGE_COPY.noBestResult, language)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <p className="text-sm font-semibold text-[#414640]">{pickText(PROFILE_PAGE_COPY.leaderboard, language)}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("role")}
                  className={`rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
                    activeTab === "role"
                      ? "bg-[#94b5a9] text-[#f6f4ee] shadow-[4px_4px_10px_#d0cbc1,-4px_-4px_10px_#ffffff]"
                      : "bg-[#ebe7de] text-[#7b8379] shadow-[inset_2px_2px_4px_#d7d2c8,inset_-2px_-2px_4px_#f7f4ee]"
                  }`}
                >
                  {currentRoleTitle}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("global")}
                  className={`rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
                    activeTab === "global"
                      ? "bg-[#94b5a9] text-[#f6f4ee] shadow-[4px_4px_10px_#d0cbc1,-4px_-4px_10px_#ffffff]"
                      : "bg-[#ebe7de] text-[#7b8379] shadow-[inset_2px_2px_4px_#d7d2c8,inset_-2px_-2px_4px_#f7f4ee]"
                  }`}
                >
                  {pickText(PROFILE_PAGE_COPY.globalTab, language)}
                </button>
              </div>
              {isLoading ? <p className="mt-4 text-sm leading-6 text-[#7e857b]">{pickText(PROFILE_PAGE_COPY.loading, language)}</p> : null}
              {error ? <p className="mt-4 text-sm leading-6 text-rose-500">{error}</p> : null}
              {!isLoading && !error && activeLeaderboard ? renderLeaderboardItems(activeLeaderboard.items) : null}
            </section>

            <section className="mt-4 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <p className="text-sm font-semibold text-[#414640]">{pickText(PROFILE_PAGE_COPY.recentRuns, language)}</p>
              {!globalLeaderboard?.recentRuns.length ? (
                <p className="mt-3 text-sm leading-6 text-[#7e857b]">{pickText(PROFILE_PAGE_COPY.noRecentRuns, language)}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {globalLeaderboard.recentRuns.map((item) => (
                    <div
                      key={`${item.submittedAt}-${item.storyId}`}
                      className="rounded-[24px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#414640]">
                            {getStoryRule(item.storyId, language)?.title ?? item.storyTitle}
                          </p>
                          <p className="mt-1 text-xs text-[#8a9287]">
                            {new Date(item.submittedAt).toLocaleString(isEnglish ? "en-US" : "zh-CN")}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <SoftChip tone="cream-accent">{item.grade}</SoftChip>
                          <p className="text-xs text-[#8a9287]">{formatScore(item.score, language)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                const isActive = item.href === "/profile";
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
