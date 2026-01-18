
export interface DailyEntry {
  date: string; // ISO format YYYY-MM-DD
  workout_done: boolean;
  sleep_planned: boolean;
  meals: Record<string, boolean>;
  posture: Record<string, boolean>;
  exercises: Record<number, boolean>;
  daily_xp: number;
  manual?: boolean;
}

export interface RankTier {
  minXP: number;
  rom: string;
  name: string;
  subtitle: string;
  tooltip: string;
  color: string;
  shape: string;
  anim: string;
}

export interface WorkoutPlan {
  muscle: string;
  exercises: string[];
  masai: boolean;
}

export type TabId = 'dashboard' | 'workout' | 'nutrition' | 'alignment' | 'rank';

export interface TimeContext {
  season: number;
  chapter: number;
  dayInChapter: number;
  totalDays: number;
}
