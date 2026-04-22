"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { RECONSTRUCT_PAGE_COPY, pickText } from "@/lib/i18n";
import { ensureRunTracking } from "@/lib/leaderboard-client";
import { getStoryReconstruction, getStoryRule } from "@/lib/narrative-rules";
import { useUiStore } from "@/lib/ui-store";

const STORY_END_TRANSITION_KEY = "story-end-transition";

export default function ReconstructStoryPage() {
  const params = useParams<{ storyId: string }>();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLSpanElement | null>(null);
  const sourceRef = useRef<HTMLSpanElement | null>(null);
  const submitTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const roleId = useGameStore((state) => state.selectedRole);
  const collectedClueIds = useGameStore((state) => state.collectedClueIds);
  const submitStory = useGameStore((state) => state.submitStory);
  const language = useUiStore((state) => state.language);
  const story = useMemo(() => getStoryRule(params.storyId, language), [language, params.storyId]);
  const reconstruction = useMemo(() => getStoryReconstruction(params.storyId, language), [language, params.storyId]);
  const isUnlocked = useMemo(
    () => (story ? story.requiresAll.every((clueId) => collectedClueIds.includes(clueId)) : false),
    [collectedClueIds, story],
  );
  const [animationStage, setAnimationStage] = useState(0);
  const [filledAnswer, setFilledAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPageExiting, setIsPageExiting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [flyData, setFlyData] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  useEffect(() => {
    if (!roleId) {
      router.replace("/role");
      return;
    }

    if (!story || !reconstruction || story.roleId !== roleId) {
      router.replace("/scan");
      return;
    }

    if (!isUnlocked) {
      router.replace("/npc");
    }
  }, [isUnlocked, reconstruction, roleId, router, story]);

  useEffect(() => {
    if (reconstruction) {
      setFilledAnswer(null);
      setIsAnswered(false);
      setFeedback("");
      setFlyData(null);
      setAnimationStage(0);
      setIsPageExiting(false);
    }
  }, [reconstruction]);

  useEffect(() => {
    if (!roleId || !story) {
      return;
    }

    ensureRunTracking(roleId, story.storyId);
  }, [roleId, story]);

  useEffect(() => {
    if (!reconstruction) {
      return;
    }

    const timer1 = window.setTimeout(() => setAnimationStage(1), 1200);
    const timer2 = window.setTimeout(() => setAnimationStage(2), 2200);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [reconstruction]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
      }
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  if (!story || !reconstruction || !roleId || story.roleId !== roleId) {
    return null;
  }

  const isEnglish = language === "en";
  const options = [reconstruction.correctOption, reconstruction.distractorOption];

  const handleWrongAnswer = () => {
    if (isAnswered) {
      return;
    }

    setFeedback(pickText(RECONSTRUCT_PAGE_COPY.wrongAnswer, language));
  };

  const handleCorrectAnswer = () => {
    if (isAnswered || !containerRef.current || !targetRef.current || !sourceRef.current) {
      return;
    }

    const container = containerRef.current.getBoundingClientRect();
    const target = targetRef.current.getBoundingClientRect();
    const source = sourceRef.current.getBoundingClientRect();

    setFeedback("");
    setFlyData({
      startX: source.left - container.left,
      startY: source.top - container.top,
      endX: target.left - container.left,
      endY: target.top - container.top,
    });
    setIsAnswered(true);

    settleTimerRef.current = window.setTimeout(() => {
      setFilledAnswer(reconstruction.correctOption);
      setFlyData(null);
    }, 620);

    exitTimerRef.current = window.setTimeout(() => {
      setIsPageExiting(true);
    }, 700);

    submitTimerRef.current = window.setTimeout(() => {
      window.sessionStorage.setItem(STORY_END_TRANSITION_KEY, "1");
      submitStory({
        storyId: story.storyId,
        orderedCardIds: [],
        blankAnswers: [reconstruction.correctOption],
        perfectOrder: true,
        perfectBlanks: true,
        submittedAt: new Date().toISOString(),
      });
      router.push(`/end/${story.storyId}`);
    }, 980);
  };

  return (
    <div className="phone-stage bg-[#e8e5dd]">
      <div className="phone-shell border-none bg-[#f1efe7] shadow-[12px_12px_28px_#d5d2c8,-10px_-10px_26px_#ffffff]">
        <main className="relative flex min-h-full items-center justify-center overflow-hidden bg-[#f1efe9] font-sans">
          <div ref={containerRef} className="relative flex h-[600px] w-full max-w-[400px] items-center justify-center">
          <div
            className="absolute flex w-full flex-col items-center"
            style={{
              top: "50%",
              transform: animationStage >= 1 ? "translateY(calc(-50% - 100px))" : "translateY(-50%)",
              transition: "transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 10,
            }}
          >
            <h1
              className="relative inline-block whitespace-nowrap text-[44px] font-bold tracking-wide text-[#41474d] drop-shadow-sm"
              style={{
                opacity: 1,
                transform: animationStage >= 1 ? "scale(1)" : "scale(1.4)",
                transition: "transform 1000ms cubic-bezier(0.4, 0, 0.2, 1), opacity 800ms ease",
              }}
            >
              <span>{pickText(RECONSTRUCT_PAGE_COPY.successLead, language)}</span>
              <span aria-hidden="true" className="absolute left-full top-0">
                ！
              </span>
            </h1>
          </div>

          <div
            className="absolute flex w-full flex-col items-center px-8"
            style={{
              top: "50%",
              opacity: animationStage >= 2 ? 1 : 0,
              transform: animationStage >= 2 ? "translateY(calc(-50% + 10px))" : "translateY(calc(-50% + 40px))",
              transition: "opacity 800ms cubic-bezier(0.4, 0, 0.2, 1), transform 800ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <p className={`text-center font-medium leading-relaxed text-[#646a70] ${isEnglish ? "text-[17px]" : "text-[19px]"}`}>
              {reconstruction.sentencePrefix}
              <span className="relative mx-1 inline-block min-w-[64px] text-center">
                <span className="absolute bottom-0 left-0 right-0 border-b-[3px] border-[#84a998]/60" />
                <span
                  ref={targetRef}
                  className={`inline-block text-[20px] font-bold leading-none ${
                    filledAnswer ? "text-[#84a998] opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {filledAnswer ?? reconstruction.correctOption}
                </span>
              </span>
              {reconstruction.sentenceSuffix}
            </p>
          </div>

          <div
            className="absolute flex w-full justify-center gap-6 px-6"
            style={{
              top: "50%",
              opacity: animationStage >= 2 ? 1 : 0,
              transform:
                animationStage >= 2
                  ? isAnswered
                    ? "translateY(calc(-50% + 150px)) scale(0.95)"
                    : "translateY(calc(-50% + 140px)) scale(1)"
                  : "translateY(calc(-50% + 140px)) scale(0.8)",
              transition: isAnswered
                ? "opacity 500ms ease, transform 800ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "opacity 500ms ease, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              pointerEvents: isAnswered ? "none" : animationStage >= 2 ? "auto" : "none",
            }}
          >
            {options.map((option) => {
              const isCorrect = option === reconstruction.correctOption;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={isCorrect ? handleCorrectAnswer : handleWrongAnswer}
                  className="flex max-w-[140px] flex-1 items-center justify-center rounded-[20px] bg-[#f1efe9] px-6 py-4 text-[17px] font-bold text-[#555d64] shadow-[6px_6px_14px_#d1cfca,-6px_-6px_14px_#ffffff] outline-none transition-all hover:text-[#84a998] active:shadow-[inset_4px_4px_8px_#d1cfca,inset_-4px_-4px_8px_#ffffff]"
                  style={{
                    opacity: isAnswered ? 0 : 1,
                    transition: "opacity 500ms ease, color 200ms ease, box-shadow 200ms ease",
                  }}
                >
                  {isCorrect ? (
                    <span ref={sourceRef} className={isAnswered ? "opacity-0" : "opacity-100"}>
                      {option}
                    </span>
                  ) : (
                    option
                  )}
                </button>
              );
            })}
          </div>

          {feedback ? (
            <div className="absolute bottom-14 px-8 text-center text-sm text-[#a07d7d] transition-opacity duration-300">
              {feedback}
            </div>
          ) : null}

          {isAnswered && flyData ? (
            <span
              className="pointer-events-none absolute z-50 font-bold leading-none text-[#84a998]"
              style={{
                left: `${flyData.endX}px`,
                top: `${flyData.endY}px`,
                fontSize: "20px",
                transform: "translate(0, 0)",
                animation: "reconstruct-word-fly 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                ["--fly-start-x" as string]: `${flyData.startX - flyData.endX}px`,
                ["--fly-start-y" as string]: `${flyData.startY - flyData.endY}px`,
              }}
            >
              {reconstruction.correctOption}
            </span>
          ) : null}
          </div>

          <div
            className={`pointer-events-none absolute inset-0 z-[120] bg-[#f1efe9] transition-opacity duration-300 ${
              isPageExiting ? "opacity-100" : "opacity-0"
            }`}
          />
        </main>
      </div>
    </div>
  );
}
