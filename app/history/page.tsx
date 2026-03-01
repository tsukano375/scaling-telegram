"use client";

import { useEffect, useState } from "react";
import { getSessions } from "@/lib/storage";
import { CATEGORY_LABELS, CATEGORY_COLORS, DIFFICULTY_LABELS } from "@/lib/exercises";
import type { SessionRecord } from "@/types";

function SessionItem({ record }: { record: SessionRecord }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(record.completedAt);
  const score = record.feedback.score;
  const scoreColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
      ? "text-indigo-600"
      : score >= 40
      ? "text-amber-600"
      : "text-red-500";

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                CATEGORY_COLORS[record.exercise.category]
              }`}
            >
              {CATEGORY_LABELS[record.exercise.category]}
            </span>
            <span className="text-xs text-gray-400">
              {DIFFICULTY_LABELS[record.exercise.difficulty]}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {record.exercise.title}
          </p>
          <p className="text-xs text-gray-400">
            {date.toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" "}· {record.durationSeconds}秒
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-2xl font-black ${scoreColor}`}>{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">問い</p>
            <p className="text-sm text-gray-700">{record.exercise.prompt}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">あなたの回答</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
              {record.userResponse}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">フィードバック</p>
            <p className="text-sm text-gray-700">{record.feedback.summary}</p>
          </div>
          {record.feedback.rewriteSuggestion && (
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-indigo-600 mb-1">言語化の例</p>
              <p className="text-sm text-indigo-800">
                {record.feedback.rewriteSuggestion}
              </p>
            </div>
          )}

          {/* Sub scores */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                ["明確さ", record.feedback.clarity],
                ["表現力", record.feedback.expressiveness],
                ["構造性", record.feedback.structure],
              ] as [string, number][]
            ).map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl py-2">
                <p className="text-lg font-bold text-gray-800">{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  // Group by date
  const grouped = sessions.reduce<Record<string, SessionRecord[]>>((acc, s) => {
    const date = s.completedAt.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col">
      <div className="px-6 pt-10 pb-4">
        <h2 className="text-2xl font-black text-gray-900">練習履歴</h2>
        <p className="text-sm text-gray-400 mt-1">{sessions.length}回のセッション</p>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="text-4xl mb-4">✎</p>
          <p className="text-gray-500 text-sm">
            まだ練習を完了していません。<br />
            「練習」タブから始めましょう！
          </p>
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-6 pb-6">
          {sortedDates.map((date) => (
            <div key={date} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {new Date(date + "T12:00:00").toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </h3>
              {grouped[date].map((record) => (
                <SessionItem key={record.id} record={record} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
