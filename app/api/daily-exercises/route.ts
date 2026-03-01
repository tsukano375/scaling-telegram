import { NextRequest, NextResponse } from "next/server";
import { generateDailyExercises } from "@/lib/claude";
import { getDailyTheme } from "@/lib/exercises";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  try {
    const exercises = await generateDailyExercises(date);
    const { theme, description: themeDescription } = getDailyTheme(date);

    return NextResponse.json({
      date,
      theme,
      themeDescription,
      exercises,
    });
  } catch (error) {
    console.error("Failed to generate exercises:", error);
    return NextResponse.json(
      { error: "問題の生成に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
