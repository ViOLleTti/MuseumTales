import type { AppLanguage } from "./i18n";
import { getClueKeyword, getRelevantClueIdsForRole, getRelevantExhibitIdsForRole } from "./narrative-rules";
import type { DialogueClueId, GameEvent } from "./narrative-types";
import type { ExhibitId, RoleId } from "./types";

const RECENT_SCAN_CHIP_EN: Record<ExhibitId, string> = {
  E1: "Plate",
  E2: "Coin",
  E3: "Silk",
  E4: "Elephant",
  E5: "Chess",
  E6: "Wagon",
  E7: "Brush",
  E8: "Ship",
};

const RECENT_DIALOGUE_CHIP_EN: Record<DialogueClueId, string> = {
  F10: "Donation",
  F11: "Gifts",
  F12: "Growth",
  F13: "Longing",
  F14: "Pun",
  F15: "Ink",
  F16: "Blessing",
  F17: "Warmth",
  F18: "Origins",
  F19: "Lines",
  F20: "Rules",
  F21: "Home",
  F22: "Dual",
  F23: "Wall",
  F24: "Resonance",
  F25: "Touch",
};

export function getRecentClueTopChip(eventHistory: GameEvent[], roleId: RoleId, language: AppLanguage) {
  const relevantClueIds = new Set(getRelevantClueIdsForRole(roleId));
  const relevantExhibitIds = new Set(getRelevantExhibitIdsForRole(roleId));
  const latestRelevantEvent = [...eventHistory]
    .reverse()
    .find((event) =>
      event.type === "scan" ? relevantExhibitIds.has(event.exhibitId) : relevantClueIds.has(event.clueId),
    );

  if (!latestRelevantEvent) {
    return null;
  }

  if (language === "en") {
    return latestRelevantEvent.type === "scan"
      ? RECENT_SCAN_CHIP_EN[latestRelevantEvent.exhibitId]
      : RECENT_DIALOGUE_CHIP_EN[latestRelevantEvent.clueId];
  }

  return getClueKeyword(latestRelevantEvent.clueId, language);
}
