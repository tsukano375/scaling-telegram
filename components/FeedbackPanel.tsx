"use client";

import type { FeedbackResult } from "@/types";

interface FeedbackPanelProps {
  feedback: FeedbackResult;
  onNext: () => void;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80
      ? "bg-emerald-400"
      : value >= 60
      ? "bg-indigo-400"
      : value >= 40
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">
        {value}
      </span>
    </div>
  );
}

export default function FeedbackPanel({ feedback, onNext }: FeedbackPanelProps) {
  const scoreColor =
    feedback.score >= 80
      ? "text-emerald-600"
      : feedback.score >= 60
      ? "text-indigo-600"
      : feedback.score >= 40
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score */}
      <div className="text-center">
        <div className={`text-6xl font-black ${scoreColor}`}>
          {feedback.score}
          <span className="text-2xl text-gray-400">/100</span>
        </div>
        <p className="mt-2 text-gray-600 leading-relaxed">{feedback.summary}</p>
      </div>

      {/* Sub-scores */}
      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          詳細スコア
        </h3>
        <ScoreBar label="明確さ" value={feedback.clarity} />
        <ScoreBar label="表現力" value={feedback.expressiveness} />
        <ScoreBar label="構造性" value={feedback.structure} />
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-emerald-700">
            ✓ 良かった点
          </h3>
          <ul className="flex flex-col gap-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-amber-700">
            △ 改善のヒント
          </h3>
          <ul className="flex flex-col gap-1">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rewrite suggestion */}
      {feedback.rewriteSuggestion && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-indigo-700 mb-2">
            言語化の例
          </h3>
          <p className="text-sm text-indigo-900 leading-relaxed">
            {feedback.rewriteSuggestion}
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-95 transition-all"
      >
        次の問題へ
      </button>
    </div>
  );
}
