"use client";

import type { SessionRecord, UserProgress, ExerciseCategory } from "@/types";

const KEYS = {
  sessions: "kotoba_sessions",
  progress: "kotoba_progress",
} as const;

export function getSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.sessions);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(record: SessionRecord): void {
  const sessions = getSessions();
  sessions.unshift(record);
  // Keep last 200 sessions
  const trimmed = sessions.slice(0, 200);
  localStorage.setItem(KEYS.sessions, JSON.stringify(trimmed));
  updateProgress(record);
}

function getDefaultProgress(): UserProgress {
  return {
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    categoryScores: {
      emotion: [],
      abstract: [],
      scene: [],
      opinion: [],
      introspection: [],
    },
    weeklyScores: [],
  };
}

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return getDefaultProgress();
  try {
    const raw = localStorage.getItem(KEYS.progress);
    return raw ? { ...getDefaultProgress(), ...JSON.parse(raw) } : getDefaultProgress();
  } catch {
    return getDefaultProgress();
  }
}

function updateProgress(record: SessionRecord): void {
  const progress = getProgress();
  const today = new Date().toISOString().split("T")[0];

  progress.totalSessions += 1;

  // Update streak
  if (progress.lastSessionDate === null) {
    progress.currentStreak = 1;
  } else {
    const last = new Date(progress.lastSessionDate);
    const diff = Math.floor(
      (new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) {
      // Same day, no streak change
    } else if (diff === 1) {
      progress.currentStreak += 1;
    } else {
      progress.currentStreak = 1;
    }
  }

  progress.longestStreak = Math.max(
    progress.longestStreak,
    progress.currentStreak
  );
  progress.lastSessionDate = today;

  // Category scores
  const cat = record.exercise.category as ExerciseCategory;
  if (!progress.categoryScores[cat]) {
    progress.categoryScores[cat] = [];
  }
  progress.categoryScores[cat].push(record.feedback.score);
  if (progress.categoryScores[cat].length > 20) {
    progress.categoryScores[cat] = progress.categoryScores[cat].slice(-20);
  }

  // Weekly scores (last 7 days)
  const existing = progress.weeklyScores.find((w) => w.date === today);
  if (existing) {
    existing.score = Math.round((existing.score + record.feedback.score) / 2);
  } else {
    progress.weeklyScores.push({ date: today, score: record.feedback.score });
    progress.weeklyScores = progress.weeklyScores.slice(-7);
  }

  localStorage.setItem(KEYS.progress, JSON.stringify(progress));
}
