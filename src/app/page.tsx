"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const COLORS = {
  bg: "#f1efe7",
  sage: "#94b5a9",
};

export default function HomePage() {
  const router = useRouter();
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 500),
      window.setTimeout(() => setStage(2), 1800),
      window.setTimeout(() => setStage(3), 3100),
      window.setTimeout(() => setIsExiting(true), 4500),
      window.setTimeout(() => router.replace("/role"), 5600),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-4 sm:p-8">
      <div
        className="relative flex h-[844px] w-full max-w-[390px] flex-col overflow-hidden rounded-[55px] border-[12px] border-[#f8f7f4] ring-1 ring-[#e5e3db] shadow-[0_25px_50px_-12px_rgba(148,181,169,0.25)]"
        style={{ backgroundColor: COLORS.bg }}
      >
        <div
          className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#f1efe7] transition-[opacity,filter,transform] duration-[1200ms] ease-in-out ${
            isExiting ? "scale-105 opacity-0 blur-[5px]" : "scale-100 opacity-100 blur-0"
          }`}
        >
          <div className="relative -top-10 flex flex-col items-center justify-center space-y-5 px-8 text-center">
            <div
              className={`font-serif text-[42px] font-medium tracking-[0.08em] transition-all duration-[1200ms] ease-out ${
                stage >= 1 ? "translate-y-0 opacity-100" : "translate-y-[15px] opacity-0"
              }`}
              style={{ color: COLORS.sage }}
            >
              Welcome
            </div>
            <div
              className={`font-serif text-[24px] italic tracking-[0.3em] transition-opacity duration-[1200ms] ease-out ${
                stage >= 2 ? "opacity-100" : "opacity-0"
              }`}
              style={{ color: COLORS.sage }}
            >
              to
            </div>
            <div
              className={`font-serif text-[32px] font-medium leading-relaxed tracking-[0.1em] transition-all duration-[1200ms] ease-out ${
                stage >= 3 ? "translate-y-0 opacity-100" : "-translate-y-[10px] opacity-0"
              }`}
              style={{ color: COLORS.sage }}
            >
              our story journey
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
