"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MindArScanner } from "@/components/scan/mindar-scanner";
import { ROLES } from "@/lib/game-data";
import { scanExhibit, useGameStore } from "@/lib/game-store";
import { getExhibitRule, scanExhibitResult } from "@/lib/narrative-rules";
import type { ExhibitId } from "@/lib/types";

function SoftChip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "cream-accent";
}) {
  const className =
    tone === "cream-accent"
      ? "bg-[#f1efe7] text-[#527a67] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]"
      : "bg-[#f1efe7] text-[#4e5751] shadow-[4px_4px_10px_#d7d2c8,-4px_-4px_10px_#ffffff]";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export default function ScanPage() {
  const router = useRouter();
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const lastScannedExhibitId = useGameStore((state) => state.lastScannedExhibitId);
  const [selectedExhibitId, setSelectedExhibitId] = useState<ExhibitId | null>(lastScannedExhibitId);

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
    }
  }, [roleId, router]);

  useEffect(() => {
    if (lastScannedExhibitId) {
      setSelectedExhibitId(lastScannedExhibitId);
    }
  }, [lastScannedExhibitId]);

  const handleDetectedExhibit = useCallback((exhibitId: ExhibitId) => {
    scanExhibit(exhibitId);
    setSelectedExhibitId(exhibitId);
  }, []);

  if (!roleId) {
    return null;
  }

  const currentExhibit = selectedExhibitId ? getExhibitRule(selectedExhibitId) : null;
  const currentScanResult = selectedExhibitId
    ? scanExhibitResult(selectedExhibitId, collectedClueIds)
    : null;
  const currentRoleLabel =
    {
      P1: "档案员",
      P2: "汉教助理",
      P3: "校报记者",
      P4: "志愿者",
    }[roleId] ?? ROLES.find((role) => role.id === roleId)?.title ?? roleId;

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <main className="relative flex min-h-full flex-col overflow-x-visible overflow-y-auto bg-[#f1efe7] text-[#424542]">
          <div className="sticky top-0 z-10 bg-[#f1efe7]/92 px-4 pb-4 pt-6 backdrop-blur">
            <div className="mx-auto max-w-[290px] rounded-[26px] bg-[#f1efe7] px-6 py-3 text-center shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#94b5a9]">Investigation</p>
              <h1 className="mt-1 text-[15px] font-bold tracking-[0.12em] text-[#424542]">展品扫描</h1>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <SoftChip tone="cream-accent">{currentRoleLabel}</SoftChip>
              <SoftChip tone="cream-accent">{currentExhibit ? currentExhibit.name : "未扫描展品"}</SoftChip>
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

                <div className="relative z-10">
                  <MindArScanner
                    onDetect={handleDetectedExhibit}
                    autoStart
                    showControls={false}
                    hostClassName="min-h-[24rem] rounded-[32px] border border-[rgba(255,255,255,0.65)] bg-[#f6f4ee] shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff,inset_3px_3px_8px_#e5e0d6,inset_-3px_-3px_8px_#ffffff]"
                    statusClassName="bg-[rgba(241,239,231,0.92)] text-[#68756b] shadow-[4px_4px_10px_rgba(213,210,200,0.65),-4px_-4px_10px_rgba(255,255,255,0.8)] backdrop-blur border border-white/40"
                  />
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[32px] bg-[#f1efe7] p-5 shadow-[8px_8px_18px_#d5d2c8,-8px_-8px_18px_#ffffff]">
              <div className="flex items-center justify-center">
                <div className="min-w-[270px] rounded-full bg-[#f1efe7] px-8 py-3 shadow-[inset_4px_4px_8px_#d5d2c8,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-center text-sm font-semibold text-[#6f7e76]">对准展品完成识别</p>
                </div>
              </div>

              {currentExhibit && currentScanResult ? (
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
              ) : (
                <div className="mt-4 rounded-[28px] bg-[#f6f4ee] p-4 shadow-[inset_4px_4px_8px_#e1dcd2,inset_-4px_-4px_8px_#ffffff]">
                  <p className="text-sm font-semibold text-[#414640]">等待识别展品</p>
                  <p className="mt-2 text-sm leading-6 text-[#7e857b]">
                    将 target image 对准上方取景区域。识别成功后，这里会显示对应展品名称、观察文案和线索关键词。
                  </p>
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
