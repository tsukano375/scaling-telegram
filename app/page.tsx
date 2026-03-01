"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, getSessions } from "@/lib/storage";
import { CATEGORY_LABELS } from "@/lib/exercises";
import type { UserProgress, ExerciseCategory } from "@/types";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-4 gap-1">
      <span className="text-3xl font-black text-indigo-600">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function WeeklyChart({ data }: { data: { date: string; score: number }[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="flex items-end gap-1.5 h-20">
      {days.map((day) => {
        const entry = data.find((d) => d.date === day);
        const score = entry?.score ?? 0;
        const height = score > 0 ? Math.max((score / 100) * 72, 6) : 4;
        const isToday = day === new Date().toISOString().split("T")[0];
        return (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-sm transition-all duration-500 ${
                score > 0
                  ? isToday
                    ? "bg-indigo-500"
                    : "bg-indigo-300"
                  : "bg-gray-200"
              }`}
              style={{ height }}
            />
            <span className="text-[10px] text-gray-400">
              {new Date(day + "T12:00:00").toLocaleDateString("ja-JP", { weekday: "narrow" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [recentCount, setRecentCount] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setProgress(getProgress());
    const sessions = getSessions();
    const todayCount = sessions.filter(
      (s) => s.completedAt.startsWith(today)
    ).length;
    setRecentCount(todayCount);
  }, [today]);

  const avgScore = (cat: ExerciseCategory) => {
    if (!progress) return 0;
    const scores = progress.categoryScores[cat];
    if (!scores || scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const categories: ExerciseCategory[] = [
    "emotion", "abstract", "scene", "opinion", "introspection"
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-gradient-to-b from-indigo-50 to-white">
        <p className="text-sm text-indigo-400 font-medium">
          {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" })}
        </p>
        <h1 className="text-3xl font-black text-gray-900 mt-1">
          言語化<br />トレーニング
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          思考を言葉にする力を、毎日少しずつ。
        </p>
      </div>

      <div className="px-6 flex flex-col gap-6">
        {/* Today CTA */}
        <div className="bg-indigo-600 rounded-3xl p-6 text-white">
          <p className="text-sm opacity-75">今日の練習</p>
          <p className="text-xl font-bold mt-1">
            {recentCount > 0
              ? `${recentCount}問完了！続けましょう`
              : "今日の問題に挑戦しよう"}
          </p>
          <Link
            href="/practice"
            className="mt-4 inline-block bg-white text-indigo-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            練習を始める →
          </Link>
        </div>

        {/* Stats */}
        {progress && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="連続日数"
              value={`${progress.currentStreak}日`}
            />
            <StatCard
              label="総セッション"
              value={progress.totalSessions}
            />
            <StatCard
              label="最高連続"
              value={`${progress.longestStreak}日`}
            />
          </div>
        )}

        {/* Weekly chart */}
        {progress && progress.weeklyScores.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              直近7日のスコア
            </h2>
            <WeeklyChart data={progress.weeklyScores} />
          </div>
        )}

        {/* Category progress */}
        {progress && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500">
              カテゴリ別平均スコア
            </h2>
            {categories.map((cat) => {
              const avg = avgScore(cat);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 shrink-0">
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                      style={{ width: avg > 0 ? `${avg}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">
                    {avg > 0 ? avg : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Intro for new users */}
        {(!progress || progress.totalSessions === 0) && (
          <div className="border border-indigo-100 rounded-2xl p-5 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-2">
              言語化トレーニングとは
            </p>
            <p>
              感情・抽象概念・場面・意見・内省の5つのカテゴリで、
              思考を言葉に変える練習をします。
              問題が毎日更新されるので、続けるほど力がつきます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
