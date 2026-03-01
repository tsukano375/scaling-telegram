import type { ExerciseCategory, DifficultyLevel } from "@/types";

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  emotion: "感情",
  abstract: "抽象概念",
  scene: "場面・状況",
  opinion: "意見・考え",
  introspection: "自己内省",
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  emotion: "bg-rose-100 text-rose-700 border-rose-200",
  abstract: "bg-violet-100 text-violet-700 border-violet-200",
  scene: "bg-amber-100 text-amber-700 border-amber-200",
  opinion: "bg-sky-100 text-sky-700 border-sky-200",
  introspection: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: "text-green-600",
  intermediate: "text-orange-500",
  advanced: "text-red-600",
};

// Daily themes rotate based on day of year
const DAILY_THEMES = [
  { theme: "喜びを言葉に", description: "今日のテーマは「喜び」。小さな喜びも大きな喜びも、できるだけ具体的な言葉で表現してみましょう。" },
  { theme: "変化を捉える", description: "変化や移り変わりを観察し、それを鮮明な言葉で記述する練習をします。" },
  { theme: "関係性を語る", description: "人と人、物と物の関係性を言葉で明確にする力を養います。" },
  { theme: "内なる声", description: "自分の内側にある感覚や思いを外の言葉として取り出す練習です。" },
  { theme: "日常の発見", description: "見慣れた日常の中に潜む特別な瞬間を言語化します。" },
  { theme: "矛盾と葛藤", description: "複雑な感情や矛盾した気持ちを丁寧に言葉にする練習です。" },
  { theme: "未来を描く", description: "漠然としたイメージや希望を具体的な言葉で形にします。" },
];

export function getDailyTheme(dateStr: string) {
  const date = new Date(dateStr);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return DAILY_THEMES[dayOfYear % DAILY_THEMES.length];
}

export function getTimeLimitByDifficulty(difficulty: DifficultyLevel): number {
  return { beginner: 180, intermediate: 120, advanced: 90 }[difficulty];
}
