import type { NpcId, RoleId } from "./types";

export type AppLanguage = "zh" | "en";

export type LocalizedText = {
  zh: string;
  en: string;
};

export function pickText(text: LocalizedText, language: AppLanguage) {
  return language === "en" ? text.en : text.zh;
}

export const ROLE_SHORT_LABELS: Record<RoleId, LocalizedText> = {
  P1: { zh: "档案员", en: "Archivist" },
  P2: { zh: "学友", en: "Buddy" },
  P3: { zh: "校报记者", en: "Reporter" },
  P4: { zh: "志愿者", en: "Guide" },
};

export const NPC_NAME_LABELS: Record<NpcId, LocalizedText> = {
  N1: { zh: "校史档案员", en: "Archivist" },
  N2: { zh: "英国交换生", en: "Exchange Student" },
  N3: { zh: "保安", en: "Security Guard" },
};

export const ROLE_PAGE_COPY = {
  title: { zh: "请选择您的专属身份", en: "Choose Your Role" },
  cta: { zh: "确认出发", en: "Start Journey" },
  cards: {
    P1: {
      title: { zh: "校史档案员", en: "History Archivist" },
      description: {
        zh: "发掘校史底蕴，整理档案资料，成为校园历史的守护者与传承人。",
        en: "Trace donation histories, organize archival evidence, and become a keeper of the university's shared memory.",
      },
    },
    P2: {
      title: { zh: "海外生学友", en: "Global Buddy" },
      description: {
        zh: "辅助国际学生汉语教学，搭建中外文化交流的友好桥梁。",
        en: "Support international students in learning Chinese and build a welcoming bridge between cultures.",
      },
    },
    P3: {
      title: { zh: "校报记者", en: "Press Fellow" },
      description: {
        zh: "奔走校园一线，洞察师生百态，用文字与镜头记录真实瞬间。",
        en: "Follow the most human stories on campus and capture real moments through words and reporting.",
      },
    },
    P4: {
      title: { zh: "博物馆志愿者", en: "Gallery Guide" },
      description: {
        zh: "探秘高校博物馆，普及文物知识，讲述藏品背后鲜为人知的故事。",
        en: "Guide visitors through the museum, introduce the collection, and share the stories behind each object.",
      },
    },
  },
} as const;

export const PAGE_HEADER_COPY = {
  home: {
    eyebrow: "MISSION HUB",
    title: { zh: "任务中枢", en: "Pending Tasks" },
  },
  scan: {
    eyebrow: "INVESTIGATION",
    title: { zh: "展品扫描", en: "Scan Exhibits" },
  },
  npc: {
    eyebrow: "INVESTIGATION",
    title: { zh: "展馆事件", en: "Conversations" },
  },
  profile: {
    eyebrow: "PROFILE",
    title: { zh: "个人主页", en: "My Page" },
  },
} as const;

export const HOME_PAGE_COPY = {
  backAria: { zh: "返回身份选择", en: "Back to role selection" },
  languageAria: { zh: "切换语言", en: "Change language" },
  currentRole: { zh: "当前身份", en: "Current Role" },
  whyHere: { zh: "为什么来到这里", en: "Why I'm Here" },
  explorationLog: { zh: "探索记录", en: "Activity Log" },
  noLog: {
    zh: "还没有有效记录。先去扫描展品，或通过有效 NPC 对话拿到关键线索。",
    en: "No useful activity yet. Start by scanning an exhibit or unlocking a clue through a valid NPC conversation.",
  },
  cluesThisRun: { zh: "本轮已收集线索", en: "Clues Collected" },
  noClues: { zh: "还没有收集到有效线索。", en: "No useful clues collected yet." },
  scanChip: { zh: "展品", en: "Exhibit" },
  npcChip: { zh: "NPC", en: "NPC" },
} as const;

export const SCAN_PAGE_COPY = {
  emptyExhibit: { zh: "未扫描展品", en: "No Exhibit Yet" },
  prompt: { zh: "对准展品完成识别", en: "Align the Camera with an Exhibit" },
  waitingTitle: { zh: "等待识别展品", en: "Waiting for an Exhibit" },
  waitingBody: {
    zh: "将 target image 对准上方取景区域。识别成功后，这里会显示对应展品名称、观察文案和线索关键词。",
    en: "Point the target image at the camera frame above. Once it is recognized, this panel will show the exhibit name, observation notes, and clue keywords.",
  },
} as const;

export const NPC_PAGE_COPY = {
  emptyExhibit: { zh: "未扫描展品", en: "No Exhibit Yet" },
  panelPrompt: { zh: "分别点击不同人物获取线索", en: "Tap different people to gather clues" },
  noDialogueRecord: { zh: "还没有有效对话记录，先尝试点击上方人物。", en: "No valid conversation yet. Try tapping one of the people above first." },
  unlockCta: { zh: "已满足结局条件，进入故事还原页", en: "Ending unlocked. Continue to Story Reconstruction" },
  unlockHint: {
    zh: "如未触发有效对话，可以返回 Scan 重新输入其他展品编号继续探索。",
    en: "If no valid conversation was triggered, go back to Scan and try another exhibit to keep exploring.",
  },
  dialogueTone: {
    repeated: { zh: "已记录过", en: "Already Logged" },
    valid: { zh: "有效对话", en: "Valid Dialogue" },
    hint: { zh: "探索提示", en: "Exploration Hint" },
    regular: { zh: "普通对话", en: "Regular Dialogue" },
  },
  logFallback: { zh: "这段有效对话已记录。", en: "This valid conversation has been saved." },
  keywordFallbacks: {
    clue: { zh: "线索", en: "Clue" },
    detail: { zh: "细节", en: "Detail" },
  },
} as const;

export const PROFILE_PAGE_COPY = {
  heroSubtitle: { zh: "查看身份成绩、排行榜与最近记录", en: "View your best runs, rankings, and recent activity" },
  personalInfo: { zh: "个人信息", en: "Profile Details" },
  nickname: { zh: "昵称", en: "Nickname" },
  anonymousPlayer: { zh: "匿名玩家", en: "Anonymous Player" },
  currentRole: { zh: "当前身份", en: "Current Role" },
  noBestResult: { zh: "暂无最佳成绩", en: "No best result yet" },
  leaderboard: { zh: "排行榜", en: "Leaderboard" },
  globalTab: { zh: "总榜", en: "Overall" },
  loading: { zh: "排行榜加载中...", en: "Loading leaderboard..." },
  leaderboardError: { zh: "排行榜加载失败。", en: "Could not load the leaderboard." },
  noLeaderboardItems: { zh: "还没有人上榜，快来成为第一个。", en: "No one is on the board yet. Be the first." },
  recentRuns: { zh: "我的最近记录", en: "Recent Runs" },
  noRecentRuns: { zh: "完成并同步一局后，这里会展示你最近 3 次记录。", en: "Once you finish and sync a run, your latest three entries will appear here." },
  scoreUnit: { zh: "分", en: "pts" },
} as const;

export const RECONSTRUCT_PAGE_COPY = {
  successLead: { zh: "干得漂亮", en: "Nice Work" },
  wrongAnswer: { zh: "这个词偏得有点远，再试一次。", en: "That one is a bit off. Try again." },
} as const;

export const END_PAGE_COPY = {
  rolePortraitAlt: {
    N1: { zh: "档案员半身像", en: "Archivist portrait" },
    N2: { zh: "学生半身像", en: "Student portrait" },
    N3: { zh: "保安半身像", en: "Security guard portrait" },
  },
  back: { zh: "返回", en: "Back" },
  unlockClues: { zh: "解锁线索", en: "Unlocked Clues" },
  requiredExhibits: { zh: "所需展品", en: "Required Exhibits" },
  requiredDialogue: { zh: "所需对话", en: "Required Conversations" },
  description: { zh: "描述", en: "Overview" },
  nextStep: { zh: "下一步", en: "Next" },
  continueScan: { zh: "返回扫码页继续探索", en: "Back to Explore" },
  switchRole: { zh: "更换身份", en: "Switch Role" },
  viewRanking: { zh: "查看排名", en: "View Ranking" },
  nicknameLabel: { zh: "请输入昵称", en: "Choose a Nickname" },
  nicknamePlaceholder: { zh: "2-20 个字符", en: "2-20 characters" },
  submitRanking: { zh: "确认并查看排名", en: "Save and View Ranking" },
  submitting: { zh: "提交中...", en: "Submitting..." },
  cancel: { zh: "取消", en: "Cancel" },
  rankingInputRequired: { zh: "请输入昵称后再查看当前排名。", en: "Please enter a nickname before viewing your ranking." },
  playerInitFailed: { zh: "创建匿名玩家失败。", en: "Could not create an anonymous player." },
  rankingFailed: { zh: "排行榜同步失败。", en: "Could not sync the leaderboard." },
} as const;

export function formatScore(score: number, language: AppLanguage) {
  return language === "en" ? `${score} pts` : `${score} 分`;
}

export function formatDuration(durationSeconds: number | null, language: AppLanguage) {
  if (durationSeconds === null || durationSeconds === undefined) {
    return language === "en" ? "-- min -- sec" : "-- m -- s";
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (language === "en") {
    return `${minutes} min ${String(seconds).padStart(2, "0")} sec`;
  }

  return `${minutes} m ${String(seconds).padStart(2, "0")} s`;
}
