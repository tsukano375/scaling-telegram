import Anthropic from "@anthropic-ai/sdk";
import type { Exercise, FeedbackResult, ExerciseCategory, DifficultyLevel } from "@/types";
import { getDailyTheme, getTimeLimitByDifficulty } from "./exercises";

const client = new Anthropic();

export async function generateDailyExercises(
  date: string
): Promise<Exercise[]> {
  const { theme, description } = getDailyTheme(date);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `あなたは「言語化力」を鍛えるトレーニングアプリの問題作成者です。

今日のテーマ: 「${theme}」
テーマ説明: ${description}

以下の5種類のカテゴリそれぞれについて、今日のテーマに関連した言語化トレーニングの問題を1つずつ作成してください。

カテゴリ:
- emotion (感情)
- abstract (抽象概念)
- scene (場面・状況)
- opinion (意見・考え)
- introspection (自己内省)

各問題について、難易度（beginner/intermediate/advanced）をバランスよく割り当ててください。

必ず以下のJSON配列形式で出力してください（説明文なし）：
[
  {
    "category": "emotion",
    "difficulty": "beginner",
    "title": "問題タイトル",
    "prompt": "ユーザーへの問いかけ文（具体的で実践的なもの、100文字以内）",
    "hint": "ヒント（任意、50文字以内）"
  },
  ...
]`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse exercises from Claude");

  const rawExercises = JSON.parse(jsonMatch[0]) as Array<{
    category: ExerciseCategory;
    difficulty: DifficultyLevel;
    title: string;
    prompt: string;
    hint?: string;
  }>;

  return rawExercises.map((ex, i) => ({
    id: `${date}-${ex.category}-${i}`,
    category: ex.category,
    difficulty: ex.difficulty,
    title: ex.title,
    prompt: ex.prompt,
    hint: ex.hint,
    timeLimit: getTimeLimitByDifficulty(ex.difficulty),
    date,
  }));
}

export async function getFeedback(
  exercise: Exercise,
  userResponse: string,
  durationSeconds: number
): Promise<FeedbackResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `あなたは言語化力を評価する専門コーチです。以下のユーザーの回答を評価してください。

問題カテゴリ: ${exercise.category}
難易度: ${exercise.difficulty}
問い: ${exercise.prompt}
回答時間: ${durationSeconds}秒
ユーザーの回答:
${userResponse}

以下の観点で評価し、必ずJSON形式で出力してください（説明文なし）：

{
  "score": 総合スコア(0-100),
  "clarity": 明確さ(0-100)（伝えたいことが明確か）,
  "expressiveness": 表現力(0-100)（豊かで適切な言葉を使えているか）,
  "structure": 構造性(0-100)（論理的・体系的に表現されているか）,
  "summary": "全体的な評価（2文程度）",
  "strengths": ["良かった点1", "良かった点2"],
  "improvements": ["改善点1", "改善点2"],
  "rewriteSuggestion": "より良い言語化の例（任意）"
}

回答が5文字未満の場合はスコアをすべて0にし、summaryに「もう少し詳しく書いてみましょう」と入れてください。`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse feedback from Claude");

  return JSON.parse(jsonMatch[0]) as FeedbackResult;
}
