"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NPCS } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { getRoleBriefing, getHomeProgressState } from "@/lib/home-briefing";
import { getClueKeyword, getExhibitRule } from "@/lib/narrative-rules";
import type { GameEvent } from "@/lib/narrative-types";

function SoftChip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "cream-accent" | "muted";
}) {
  const className =
    tone === "cream-accent"
      ? "bg-[#f1efe7] text-[#527a67] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
      : tone === "muted"
        ? "bg-[#ebe7de] text-[#8a9287] shadow-[inset_2px_2px_4px_#d7d2c8,inset_-2px_-2px_4px_#f7f4ee]"
        : "bg-[#f1efe7] text-[#4e5751] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function getNpcLabel(npcId: string) {
  const npc = NPCS.find((entry) => entry.id === npcId);
  return npc ? `${npc.name}（${npc.id}）` : npcId;
}

function getEventTitle(event: GameEvent) {
  if (event.type === "scan") {
    return `${getExhibitRule(event.exhibitId).name}（${event.exhibitId}）`;
  }

  return getNpcLabel(event.npcId);
}

function getEventDescription(event: GameEvent) {
  if (event.type === "scan") {
    return `扫描展品后记录到 ${getClueKeyword(event.clueId)}（${event.clueId}）`;
  }

  return `有效对话得到 ${getClueKeyword(event.clueId)}（${event.clueId}）`;
}

export default function MapHomePage() {
  const router = useRouter();
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const eventHistory = useGameStore((state) => state.eventHistory);

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
    }
  }, [roleId, router]);

  if (!roleId) {
    return null;
  }

  const briefing = getRoleBriefing(roleId);
  const progress = getHomeProgressState(roleId, collectedClueIds);

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <main className="relative flex min-h-full flex-col overflow-x-visible overflow-y-auto bg-[#f1efe7] text-[#424542]">
          <div className="sticky top-0 z-10 bg-[#f1efe7]/92 px-4 pb-4 pt-6 backdrop-blur">
            <div className="mx-auto max-w-[290px] rounded-[26px] bg-[#f1efe7] px-6 py-3 text-center shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#94b5a9]">Mission Hub</p>
              <h1 className="mt-1 text-[15px] font-bold tracking-[0.12em] text-[#424542]">任务中枢</h1>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <SoftChip tone="cream-accent">{briefing.title}</SoftChip>
              {progress.activeStory ? <SoftChip tone="cream-accent">{progress.activeStory.title}</SoftChip> : null}
            </div>
          </div>

          <div className="relative z-30 flex-1 overflow-visible px-4 pb-6">
            <section className="mt-1 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="flex items-center justify-center">
                <div className="min-w-[270px] rounded-full bg-[#f1efe7] px-6 py-3 shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-center text-sm font-semibold text-[#6f7e76]">
                    {progress.activeStory ? `当前目标：${progress.activeStory.title}` : "当前目标已全部完成"}
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
                    <SoftChip key={story.storyId} tone="muted">
                      {story.grade} · {story.title}
                    </SoftChip>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="grid grid-cols-[0.9fr_1.1fr] gap-4">
                <div className="space-y-4">
                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">当前身份</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <SoftChip tone="cream-accent">{briefing.title}</SoftChip>
                      <SoftChip tone="muted">任务简报</SoftChip>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">剧情导语</p>
                    <p className="mt-2 text-sm leading-6 text-[#6d756c]">{briefing.intro}</p>
                  </div>

                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">为什么来到这里</p>
                    <p className="mt-2 text-sm leading-6 text-[#6d756c]">{briefing.whyHere}</p>
                  </div>

                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">本轮任务</p>
                    <p className="mt-2 text-sm leading-6 text-[#6d756c]">{briefing.mission}</p>
                  </div>

                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">推荐下一步</p>
                    <p className="mt-2 text-sm leading-6 text-[#6d756c]">{briefing.nextStep}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">探索记录</p>
                    <div className="mt-3 space-y-3">
                      {eventHistory.length ? (
                        eventHistory.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-[22px] bg-[#f1efe7] p-3 shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <SoftChip tone="cream-accent">{event.type === "scan" ? "展品" : "NPC"}</SoftChip>
                              <p className="text-sm font-semibold text-[#465a51]">{getEventTitle(event)}</p>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#6d756c]">{getEventDescription(event)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-[#7e857b]">
                          还没有有效记录。先去扫描展品，或通过有效 NPC 对话拿到关键线索。
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                    <p className="text-sm font-semibold text-[#414640]">本轮已收集线索</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {collectedClueIds.length ? (
                        collectedClueIds.map((clueId) => (
                          <SoftChip key={clueId} tone="cream-accent">
                            {getClueKeyword(clueId)}
                          </SoftChip>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-[#7e857b]">还没有收集到有效线索。</p>
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
