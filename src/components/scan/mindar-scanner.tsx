"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAllExhibitRules } from "@/lib/narrative-rules";
import type { ExhibitId } from "@/lib/types";

const AFRAME_SCRIPT_URL = "/vendor/aframe.min.js";
const MINDAR_AFRAME_SCRIPT_URL = "/vendor/mindar-image-aframe.prod.js";
const COMPILED_TARGETS_URL = "/targets/targets.mind";

const scriptCache = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
  const existingPromise = scriptCache.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existingTag = document.querySelector(`script[src="${src}"]`);
    if (existingTag) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`加载脚本失败：${src}`));
    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}

async function hasCompiledTargets(): Promise<boolean> {
  try {
    const response = await fetch(COMPILED_TARGETS_URL, {
      method: "HEAD",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

type ScannerStatus = "idle" | "loading" | "ready" | "error";

type MindArSystem = {
  start?: () => Promise<void> | void;
  stop?: () => Promise<void> | void;
};

type SceneWithMindAr = Element & {
  systems?: Record<string, MindArSystem>;
};

function ensureInlineVideoPlayback(host: HTMLElement) {
  const video = host.querySelector("video");
  if (!video) {
    return;
  }

  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("muted", "true");
  video.setAttribute("autoplay", "true");
  video.playsInline = true;
  video.muted = true;
  void video.play().catch(() => {
    // Safari may block autoplay until the underlying AR system fully starts.
  });
}

export function MindArScanner({
  onDetect,
  autoStart = false,
  showControls = true,
  hostClassName = "",
  statusClassName = "",
}: {
  onDetect: (exhibitId: ExhibitId) => void;
  autoStart?: boolean;
  showControls?: boolean;
  hostClassName?: string;
  statusClassName?: string;
}) {
  const sceneHostRef = useRef<HTMLDivElement | null>(null);
  const cleanupSceneRef = useRef<(() => void) | null>(null);
  const lastDetectedRef = useRef<{ exhibitId: ExhibitId; at: number } | null>(null);
  const onDetectRef = useRef(onDetect);
  const [scannerEnabled, setScannerEnabled] = useState(autoStart);
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [statusText, setStatusText] = useState("点击下方按钮启动 MindAR 扫描。");
  const [imageTargetSrc, setImageTargetSrc] = useState<string | null>(null);
  const resolvedHostClassName =
    hostClassName || "rounded-[2rem] border-4 border-dashed border-emerald-500 bg-slate-950/90";
  const resolvedStatusClassName = statusClassName || "bg-[rgba(16,17,16,0.72)] text-white";

  const targetRules = useMemo(
    () =>
      getAllExhibitRules().sort(
        (a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)),
      ),
    [],
  );

  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  useEffect(() => {
    return () => {
      cleanupSceneRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!scannerEnabled) {
      cleanupSceneRef.current?.();
      cleanupSceneRef.current = null;
      if (sceneHostRef.current) {
        sceneHostRef.current.innerHTML = "";
      }
      return;
    }

    let cancelled = false;

    async function prepareMindAr() {
      try {
        setStatus("loading");
        setStatusText("正在加载 MindAR 扫描环境...");

        await loadScriptOnce(AFRAME_SCRIPT_URL);
        await loadScriptOnce(MINDAR_AFRAME_SCRIPT_URL);

        if (cancelled) {
          return;
        }

        const compiledTargetsExist = await hasCompiledTargets();

        if (compiledTargetsExist) {
          setImageTargetSrc(COMPILED_TARGETS_URL);
          setStatus("ready");
          setStatusText("已加载预编译 targets.mind，等待识别目标图。");
          return;
        }
        throw new Error("未找到 /public/targets/targets.mind，无法启动本地 MindAR 扫描。");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setStatusText(error instanceof Error ? error.message : "MindAR 初始化失败。");
      }
    }

    void prepareMindAr();

    return () => {
      cancelled = true;
    };
  }, [scannerEnabled, targetRules]);

  useEffect(() => {
    if (!scannerEnabled || !imageTargetSrc || !sceneHostRef.current) {
      return;
    }

    cleanupSceneRef.current?.();
    const host = sceneHostRef.current;
    const escapedSrc = imageTargetSrc.replace(/"/g, "&quot;");

    host.innerHTML = `
      <a-scene
        embedded
        color-space="sRGB"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        renderer="colorManagement: true; physicallyCorrectLights: true; alpha: true"
        style="width: 100%; height: 100%; position: relative;"
        mindar-image="imageTargetSrc: ${escapedSrc}; autoStart: false; uiLoading: no; uiScanning: no; maxTrack: 1;"
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
        ${targetRules
          .map(
            (rule, index) => `
              <a-entity data-exhibit-id="${rule.id}" mindar-image-target="targetIndex: ${index}"></a-entity>
            `,
          )
          .join("")}
      </a-scene>
    `;

    const scene = host.querySelector("a-scene") as SceneWithMindAr | null;
    const entities = Array.from(host.querySelectorAll("[data-exhibit-id]"));

    const cleanupCallbacks: Array<() => void> = [];
    let pollingTimer: number | null = null;

    entities.forEach((entity) => {
      const exhibitId = entity.getAttribute("data-exhibit-id") as ExhibitId;
      const handleTargetFound = () => {
        const now = Date.now();
        const lastDetected = lastDetectedRef.current;
        if (
          lastDetected &&
          lastDetected.exhibitId === exhibitId &&
          now - lastDetected.at < 2000
        ) {
          return;
        }

        lastDetectedRef.current = { exhibitId, at: now };
        setStatus("ready");
        setStatusText(`识别成功：${exhibitId}`);
        onDetectRef.current(exhibitId);
      };

      entity.addEventListener("targetFound", handleTargetFound);
      cleanupCallbacks.push(() =>
        entity.removeEventListener("targetFound", handleTargetFound),
      );
    });

    const handleSceneError = () => {
      setStatus("error");
      setStatusText("MindAR 运行出错，请检查相机权限或 target 文件。");
    };

    const handleSceneReady = () => {
      setStatus("ready");
      setStatusText("相机已启动，等待识别目标图。");
      ensureInlineVideoPlayback(host);
    };

    const handleSceneLoaded = () => {
      const arSystem = scene?.systems?.["mindar-image-system"];
      if (!arSystem?.start) {
        setStatus("error");
        setStatusText("MindAR 系统没有正确初始化。");
        return;
      }

      setStatus("loading");
      setStatusText("正在启动相机视频流...");

      void Promise.resolve(arSystem.start())
        .then(() => {
          ensureInlineVideoPlayback(host);
          if (pollingTimer !== null) {
            window.clearInterval(pollingTimer);
          }
          pollingTimer = window.setInterval(() => ensureInlineVideoPlayback(host), 500);
        })
        .catch(() => {
          setStatus("error");
          setStatusText("MindAR 启动失败，请刷新后重试。");
        });
    };

    scene?.addEventListener("loaded", handleSceneLoaded);
    cleanupCallbacks.push(() => scene?.removeEventListener("loaded", handleSceneLoaded));
    scene?.addEventListener("arReady", handleSceneReady);
    cleanupCallbacks.push(() => scene?.removeEventListener("arReady", handleSceneReady));
    scene?.addEventListener("arError", handleSceneError);
    cleanupCallbacks.push(() => scene?.removeEventListener("arError", handleSceneError));

    cleanupSceneRef.current = () => {
      if (pollingTimer !== null) {
        window.clearInterval(pollingTimer);
        pollingTimer = null;
      }
      scene?.systems?.["mindar-image-system"]?.stop?.();
      cleanupCallbacks.forEach((cleanup) => cleanup());
      host.innerHTML = "";
    };

    return () => {
      cleanupSceneRef.current?.();
      cleanupSceneRef.current = null;
    };
  }, [imageTargetSrc, scannerEnabled, targetRules]);

  return (
    <div className="space-y-4">
      {showControls ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setScannerEnabled((value) => !value)}
            className="rounded-2xl bg-[#cdee71] px-5 py-3 text-sm font-semibold text-[#101110] transition hover:bg-[#d8f290]"
          >
            {scannerEnabled ? "关闭 MindAR 扫描" : "启动 MindAR 扫描"}
          </button>
        </div>
      ) : null}

      <div
        ref={sceneHostRef}
        className={`mindar-scene-host relative overflow-hidden ${
          scannerEnabled ? "min-h-[24rem]" : "hidden"
        } ${resolvedHostClassName}`}
      >
        <div
          className={`absolute inset-x-3 top-3 z-20 rounded-2xl px-3 py-2 text-xs leading-5 backdrop-blur ${resolvedStatusClassName}`}
        >
          <p>{statusText}</p>
        </div>
      </div>
    </div>
  );
}
