import { NextRequest, NextResponse } from "next/server";
import { getFeedback } from "@/lib/claude";
import type { Exercise } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      exercise: Exercise;
      userResponse: string;
      durationSeconds: number;
    };

    const { exercise, userResponse, durationSeconds } = body;

    if (!exercise || !userResponse || durationSeconds === undefined) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    const feedback = await getFeedback(exercise, userResponse, durationSeconds);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Failed to get feedback:", error);
    return NextResponse.json(
      { error: "フィードバックの取得に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
