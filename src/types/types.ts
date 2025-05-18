import { moods } from "~/constants/data"

export type MoodEntry = {
  date: Date
  mood: (typeof moods)[number]
  note?: string
}

export type WaterEntry = {
  time: Date
  amount: string | number
}

export type SleepEntry = {
  date: Date
  bedTime: string
  wakeTime: string
  duration: number
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export type Meal = {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes?: string
}

export type DailyMeals = {
  date: Date
  meals: Meal[]
  notes?: string
}

export type Exercise = {
  id: string
  name: string
  duration: number
  sets: number
  reps: number
  completed: boolean
}

export type Routine = {
  id: string
  name: string
  exercises: Exercise[]
  lastCompleted?: Date
}

export type JournalEntry = {
  id: string
  date: Date
  content: string
  mood: number
  tags: string[]
}

export type WeightEntry = {
  date: Date
  weight: number
  notes?: string
}