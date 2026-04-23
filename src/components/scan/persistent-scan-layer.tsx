"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MindArScanner } from "@/components/scan/mindar-scanner";
import type { ExhibitId } from "@/lib/types";
import {
  SCAN_RUNTIME_DETECTED_EVENT,
  SCAN_RUNTIME_HOST_CLASSNAME,
  SCAN_RUNTIME_KEEP_ALIVE_MS,
  SCAN_RUNTIME_SLOT_ATTRIBUTE,
  SCAN_RUNTIME_STATUS_CLASSNAME,
} from "./runtime-events";

const TARGETS_MIND_URL = "/targets/targets.mind";

function getScanSlot() {
  return document.querySelector<HTMLElement>(`[${SCAN_RUNTIME_SLOT_ATTRIBUTE}="true"]`);
}

export function PersistentScanLayer() {
  const pathname = usePathname();
  const hideTimerRef = useRef<number | null>(null);
  const [hasActivated, setHasActivated] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [slotRect, setSlotRect] = useState<DOMRect | null>(null);
  const isScanRoute = pathname === "/scan";

  useEffect(() => {
    if (isScanRoute) {
      setHasActivated(true);
      setScannerEnabled(true);
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      void fetch(TARGETS_MIND_URL, { cache: "force-cache" }).catch(() => {
        // MindAR will surface a more actionable error if the compiled targets are unavailable.
      });
      return;
    }

    if (!hasActivated) {
      return;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setScannerEnabled(false);
      hideTimerRef.current = null;
    }, SCAN_RUNTIME_KEEP_ALIVE_MS);

    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [hasActivated, isScanRoute]);

  useEffect(() => {
    if (!hasActivated) {
      return;
    }

    const updateSlotRect = () => {
      if (!isScanRoute) {
        setSlotRect(null);
        return;
      }

      const slot = getScanSlot();
      setSlotRect(slot ? slot.getBoundingClientRect() : null);
    };

    updateSlotRect();

    const slot = getScanSlot();
    const resizeObserver = new ResizeObserver(updateSlotRect);
    if (slot) {
      resizeObserver.observe(slot);
    }

    window.addEventListener("resize", updateSlotRect);
    window.addEventListener("scroll", updateSlotRect, true);

    const mutationObserver = new MutationObserver(() => {
      resizeObserver.disconnect();
      const nextSlot = getScanSlot();
      if (nextSlot && isScanRoute) {
        resizeObserver.observe(nextSlot);
      }
      updateSlotRect();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateSlotRect);
      window.removeEventListener("scroll", updateSlotRect, true);
    };
  }, [hasActivated, isScanRoute, pathname]);

  useEffect(
    () => () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    },
    [],
  );

  const layerStyle = useMemo<CSSProperties>(() => {
    if (!isScanRoute || !slotRect) {
      return {
        position: "fixed",
        left: -9999,
        top: -9999,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 12,
      };
    }

    return {
      position: "fixed",
      left: slotRect.left,
      top: slotRect.top,
      width: slotRect.width,
      height: slotRect.height,
      pointerEvents: "none",
      zIndex: 12,
    };
  }, [isScanRoute, slotRect]);

  if (!hasActivated) {
    return null;
  }

  return (
    <div style={layerStyle} aria-hidden="true">
      <MindArScanner
        enabled={scannerEnabled}
        onDetect={(exhibitId: ExhibitId) => {
          window.dispatchEvent(
            new CustomEvent<{ exhibitId: ExhibitId }>(SCAN_RUNTIME_DETECTED_EVENT, {
              detail: { exhibitId },
            }),
          );
        }}
        autoStart
        showControls={false}
        wrapperClassName="h-full w-full"
        hostClassName={`h-full w-full ${SCAN_RUNTIME_HOST_CLASSNAME}`}
        statusClassName={SCAN_RUNTIME_STATUS_CLASSNAME}
      />
    </div>
  );
}
