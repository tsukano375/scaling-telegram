export type ExerciseCategory =
  | "emotion"      // 感情を言語化する
  | "abstract"     // 抽象概念を言語化する
  | "scene"        // 場面・状況を言語化する
  | "opinion"      // 意見・考えを言語化する
  | "introspection"; // 自己内省を言語化する

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  category: ExerciseCategory;
  difficulty: DifficultyLevel;
  title: string;
  prompt: string;
  hint?: string;
  timeLimit: number; // seconds
  date: string; // YYYY-MM-DD
}

export interface SessionRecord {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  userResponse: string;
  feedback: FeedbackResult;
  completedAt: string; // ISO 8601
  durationSeconds: number;
}

export interface FeedbackResult {
  score: number; // 0-100
  clarity: number; // 明確さ 0-100
  expressiveness: number; // 表現力 0-100
  structure: number; // 構造性 0-100
  summary: string;
  strengths: string[];
  improvements: string[];
  rewriteSuggestion?: string;
}

export interface UserProgress {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  categoryScores: Record<ExerciseCategory, number[]>;
  weeklyScores: { date: string; score: number }[];
}

export interface DailyContent {
  date: string;
  theme: string;
  themeDescription: string;
  exercises: Exercise[];
}
