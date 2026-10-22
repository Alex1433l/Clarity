export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  date: string; // ISO date (YYYY-MM-DD)
  time: string | null; // HH:MM format or null
  category: string | null;
  sort_order: number;
  created_at?: string;
}

export type TaskInput = {
  title: string;
  priority: Priority;
  date: string;
  time?: string | null;
  category?: string | null;
  sort_order?: number;
};

export interface TaskCategory {
  id: string;
  name: string;
  color: string | null;
  sort_order: number;
  created_at?: string;
}

export type TaskCategoryInput = {
  name: string;
  color?: string | null;
  sort_order?: number;
};

export interface LearningDocument {
  id: string;
  title: string;
  content: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export type LearningDocumentInput = {
  title: string;
  content?: string | null;
  parent_id?: string | null;
  sort_order?: number;
};

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly';
  days_of_week: number[] | null;
  color: string | null;
  sort_order: number;
  created_at?: string;
}

export type HabitInput = {
  name: string;
  description?: string | null;
  frequency: 'daily' | 'weekly';
  days_of_week?: number[] | null;
  color?: string | null;
  sort_order?: number;
};

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  created_at?: string;
}

export interface HabitWithStats extends Habit {
  doneToday: boolean;
  streak: number;
  completionRate: number; // 0-100, based on last 30 days
  totalCheckins: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  life_area_id: string | null;
  deadline: string;
  progress: number; // 0-100
  sort_order: number;
  created_at?: string;
}

export type GoalInput = {
  title: string;
  description?: string | null;
  life_area_id?: string | null;
  deadline: string;
  progress?: number;
  sort_order?: number;
};

export interface LifeArea {
  id: string;
  name: string;
  color: string | null;
  created_at?: string;
}

export type LifeAreaInput = {
  name: string;
  color?: string | null;
};

export interface Prayer {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'answered';
  frequency: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  preview: string;
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  folder_id: string | null;
  sort_order: number;
  created_at?: string;
}

export interface LinkFolder {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
}

export type LinkInput = {
  name: string;
  url: string;
  folder_id?: string | null;
  sort_order?: number;
};

export type LinkFolderInput = {
  name: string;
  sort_order?: number;
};

export interface MoodReading {
  id: string;
  anxiety: number; // 1-5
  energy: number; // 1-5
  mood: number; // 1-5
  date: string;
  created_at?: string;
}

export interface GratitudeItem {
  id: string;
  text: string;
}

export type PageId =
  | 'today'
  | 'tasks'
  | 'habits'
  | 'goals'
  | 'mood'
  | 'reports'
  | 'spiritual'
  | 'journal'
  | 'links'
  | 'settings';
