"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Timer from "@/components/Timer";
import FeedbackPanel from "@/components/FeedbackPanel";
import { saveSession } from "@/lib/storage";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/lib/exercises";
import type { DailyContent, Exercise, FeedbackResult, SessionRecord } from "@/types";

type Phase = "loading" | "select" | "ready" | "writing" | "submitting" | "feedback" | "done";

export default function PracticePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [daily, setDaily] = useState<DailyContent | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [userText, setUserText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`/api/daily-exercises?date=${today}`)
      .then((r) => r.json())
      .then((data: DailyContent & { error?: string }) => {
        if (data.error) {
          setError(data.error);
          setPhase("select");
        } else {
          setDaily(data);
          setPhase("select");
        }
      })
      .catch(() => {
        setError("問題の読み込みに失敗しました。");
        setPhase("select");
      });
  }, [today]);

  const handleSelectExercise = useCallback((ex: Exercise) => {
    setSelectedExercise(ex);
    setUserText("");
    setFeedback(null);
    setElapsed(0);
    setPhase("ready");
  }, []);

  const handleStart = useCallback(() => {
    setPhase("writing");
    setTimerRunning(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedExercise || userText.trim().length === 0) return;
    setTimerRunning(false);
    setPhase("submitting");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: selectedExercise,
          userResponse: userText,
          durationSeconds: elapsed,
        }),
      });
      const fb = (await res.json()) as FeedbackResult & { error?: string };

      if (fb.error) throw new Error(fb.error);

      const record: SessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        exerciseId: selectedExercise.id,
        exercise: selectedExercise,
        userResponse: userText,
        feedback: fb,
        completedAt: new Date().toISOString(),
        durationSeconds: elapsed,
      };
      saveSession(record);
      setFeedback(fb);
      setPhase("feedback");
    } catch {
      setError("フィードバックの取得に失敗しました。");
      setPhase("writing");
    }
  }, [selectedExercise, userText, elapsed]);

  const handleTimeUp = useCallback(() => {
    if (userText.trim().length > 0) {
      handleSubmit();
    } else {
      setTimerRunning(false);
      setPhase("writing"); // stay in writing, let user submit empty
    }
  }, [userText, handleSubmit]);

  const handleNext = useCallback(() => {
    setSelectedExercise(null);
    setUserText("");
    setFeedback(null);
    setPhase("select");
  }, []);

  // ── Render ──────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">今日の問題を生成中…</p>
      </div>
    );
  }

  if (phase === "select") {
    return (
      <div className="flex flex-col">
        <div className="px-6 pt-10 pb-4">
          <h2 className="text-2xl font-black text-gray-900">今日の問題</h2>
          {daily && (
            <div className="mt-2 bg-indigo-50 rounded-2xl px-4 py-3">
              <p className="text-xs text-indigo-500 font-semibold">本日のテーマ</p>
              <p className="text-base font-bold text-indigo-800">{daily.theme}</p>
              <p className="text-xs text-indigo-600 mt-0.5">{daily.themeDescription}</p>
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="px-6 flex flex-col gap-3 pb-6">
          {daily?.exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExercise(ex)}
              className="text-left border border-gray-100 rounded-2xl p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all active:scale-[0.98] flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[ex.category]}`}
                >
                  {CATEGORY_LABELS[ex.category]}
                </span>
                <span
                  className={`text-xs font-semibold ${DIFFICULTY_COLORS[ex.difficulty]}`}
                >
                  {DIFFICULTY_LABELS[ex.difficulty]}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{ex.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {ex.prompt}
              </p>
              <p className="text-xs text-gray-400">
                制限時間: {Math.floor(ex.timeLimit / 60)}分
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "ready" && selectedExercise) {
    return (
      <div className="flex flex-col items-center px-6 pt-12 gap-6">
        <div className="text-center">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[selectedExercise.category]}`}
          >
            {CATEGORY_LABELS[selectedExercise.category]}
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-3">
            {selectedExercise.title}
          </h2>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 w-full">
          <p className="text-gray-700 leading-relaxed">{selectedExercise.prompt}</p>
          {selectedExercise.hint && (
            <p className="mt-3 text-xs text-gray-400 border-t pt-2">
              ヒント: {selectedExercise.hint}
            </p>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          制限時間:{" "}
          <span className="font-semibold text-gray-700">
            {Math.floor(selectedExercise.timeLimit / 60)}分
          </span>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all"
        >
          スタート
        </button>
        <button
          onClick={() => setPhase("select")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          問題を選び直す
        </button>
      </div>
    );
  }

  if ((phase === "writing" || phase === "submitting") && selectedExercise) {
    return (
      <div className="flex flex-col px-6 pt-8 gap-4">
        <Timer
          totalSeconds={selectedExercise.timeLimit}
          running={timerRunning}
          onExpire={handleTimeUp}
          onTick={setElapsed}
        />

        <div className="bg-indigo-50 rounded-2xl p-4">
          <p className="text-sm text-indigo-800 leading-relaxed font-medium">
            {selectedExercise.prompt}
          </p>
        </div>

        <textarea
          ref={textareaRef}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="ここに言語化してみましょう…"
          disabled={phase === "submitting"}
          className="w-full min-h-48 resize-none rounded-2xl border border-gray-200 p-4 text-gray-800 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-60"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{userText.length}文字</span>
          <button
            onClick={handleSubmit}
            disabled={userText.trim().length === 0 || phase === "submitting"}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-2"
          >
            {phase === "submitting" ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                評価中…
              </>
            ) : (
              "提出する"
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (phase === "feedback" && feedback) {
    return (
      <div className="px-6 pt-8 pb-6">
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            フィードバック
          </p>
          <h2 className="text-lg font-bold text-gray-900">
            {selectedExercise?.title}
          </h2>
        </div>

        {/* User's response */}
        <div className="mb-4 bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">あなたの回答</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {userText}
          </p>
        </div>

        <FeedbackPanel feedback={feedback} onNext={handleNext} />
      </div>
    );
  }

  return null;
}
