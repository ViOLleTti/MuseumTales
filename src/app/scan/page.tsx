"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MindArScanner } from "@/components/scan/mindar-scanner";
import { CluePill, PageShell, Panel, StatusBadge } from "@/components/game-ui";
import { scanExhibit, useGameStore } from "@/lib/game-store";
import { getExhibitRule, scanExhibitResult } from "@/lib/narrative-rules";
import type { ExhibitId } from "@/lib/types";

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

  return (
    <PageShell
      title={`${roleId} · 展品扫描`}
      subtitle="进入页面后会自动打开 MindAR 扫描。识别成功后，下方会直接显示当前展品信息。"
      bottomNav="scan"
    >
      <div className="mobile-section space-y-4">
        <Panel>
          <MindArScanner onDetect={handleDetectedExhibit} autoStart showControls={false} />
        </Panel>

        <Panel>
          {currentExhibit && currentScanResult ? (
            <div className="rounded-3xl bg-emerald-50 p-5">
              <h3 className="text-2xl font-semibold text-slate-900">{currentExhibit.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{currentExhibit.observation}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge tone="emerald">{currentExhibit.targetImageFilename}</StatusBadge>
                <StatusBadge>{currentExhibit.targetImagePath}</StatusBadge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <CluePill>{currentExhibit.highlightKeyword}</CluePill>
                {currentExhibit.fuzzyKeywords.map((keyword) => (
                  <StatusBadge key={keyword}>{keyword}</StatusBadge>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#202521] p-5">
              <h3 className="text-xl font-semibold text-white">等待识别展品</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                将 target image 对准上方摄像头区域。识别成功后，这里会显示对应展品名称、观察文案和线索关键词。
              </p>
            </div>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
