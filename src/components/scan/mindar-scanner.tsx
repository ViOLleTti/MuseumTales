"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAllExhibitRules } from "@/lib/narrative-rules";
import type { ExhibitId } from "@/lib/types";

declare global {
  interface Window {
    MINDAR?: {
      Compiler: new () => {
        compileImageTargets: (
          images: HTMLImageElement[],
          onProgress?: (progress: number) => void,
        ) => Promise<unknown>;
        exportData: () => Promise<ArrayBuffer>;
      };
    };
  }
}

const AFRAME_SCRIPT_URL = "https://aframe.io/releases/1.5.0/aframe.min.js";
const MINDAR_CORE_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js";
const MINDAR_AFRAME_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js";
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`加载 target image 失败：${url}`));
    img.src = url;
  });
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

async function ensureCameraPermission(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("当前浏览器不支持相机访问。");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {
        ideal: "environment",
      },
    },
    audio: false,
  });

  stream.getTracks().forEach((track) => track.stop());
}

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
}: {
  onDetect: (exhibitId: ExhibitId) => void;
}) {
  const sceneHostRef = useRef<HTMLDivElement | null>(null);
  const cleanupSceneRef = useRef<(() => void) | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const lastDetectedRef = useRef<{ exhibitId: ExhibitId; at: number } | null>(null);
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [statusText, setStatusText] = useState("点击下方按钮启动 MindAR 扫描。");
  const [compileProgress, setCompileProgress] = useState<number | null>(null);
  const [imageTargetSrc, setImageTargetSrc] = useState<string | null>(null);

  const targetRules = useMemo(
    () =>
      getAllExhibitRules().sort(
        (a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)),
      ),
    [],
  );

  useEffect(() => {
    return () => {
      cleanupSceneRef.current?.();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
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
        setStatusText("正在申请相机权限并加载 MindAR...");
        setCompileProgress(null);

        await ensureCameraPermission();
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

        await loadScriptOnce(MINDAR_CORE_SCRIPT_URL);

        if (cancelled) {
          return;
        }

        if (!window.MINDAR?.Compiler) {
          throw new Error("MindAR 编译器未加载成功。");
        }

        setStatusText("未找到 targets.mind，正在使用 8 张 target image 临时编译...");

        const images = await Promise.all(
          targetRules.map((rule) => loadImage(rule.targetImagePath)),
        );
        const compiler = new window.MINDAR.Compiler();
        await compiler.compileImageTargets(images, (progress) => {
          if (!cancelled) {
            setCompileProgress(progress);
            setStatusText(`正在编译 target image：${progress.toFixed(0)}%`);
          }
        });

        const exportedBuffer = await compiler.exportData();
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        objectUrlRef.current = URL.createObjectURL(
          new Blob([exportedBuffer], { type: "application/octet-stream" }),
        );

        if (cancelled) {
          return;
        }

        setImageTargetSrc(objectUrlRef.current);
        setStatus("loading");
        setStatusText("已完成临时编译，正在启动相机识别...");
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
        renderer="colorManagement: true, physicallyCorrectLights"
        style="width: 100%; height: 100%; position: relative;"
        mindar-image="imageTargetSrc: ${escapedSrc}; autoStart: false; uiLoading: yes; uiScanning: yes; maxTrack: 1;"
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
        ${targetRules
          .map(
            (rule, index) => `
              <a-entity data-exhibit-id="${rule.id}" mindar-image-target="targetIndex: ${index}">
                <a-plane color="#cdee71" opacity="0.35" width="1" height="0.65" position="0 0 0"></a-plane>
              </a-entity>
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
        onDetect(exhibitId);
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
  }, [imageTargetSrc, onDetect, scannerEnabled, targetRules]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setScannerEnabled((value) => !value)}
          className="rounded-2xl bg-[#cdee71] px-5 py-3 text-sm font-semibold text-[#101110] transition hover:bg-[#d8f290]"
        >
          {scannerEnabled ? "关闭 MindAR 扫描" : "启动 MindAR 扫描"}
        </button>
      </div>

      <div className="rounded-2xl bg-[#202521] p-4 text-sm text-slate-300">
        <p>{statusText}</p>
        {compileProgress !== null ? (
          <p className="mt-2 text-xs text-slate-400">
            临时编译进度：{compileProgress.toFixed(0)}%
          </p>
        ) : null}
        {status === "ready" ? (
          <p className="mt-2 text-xs text-slate-400">
            target 顺序固定为 E1-E8，对应 `/targets/` 目录中的 8 张 jpeg。
          </p>
        ) : null}
      </div>

      <div
        ref={sceneHostRef}
        className={`overflow-hidden rounded-[2rem] border-4 border-dashed border-emerald-500 bg-slate-950/90 ${
          scannerEnabled ? "min-h-[24rem]" : "hidden"
        }`}
      />
    </div>
  );
}
