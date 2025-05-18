"use client"

import { isSameDay } from "date-fns"
import { Droplets, Heart, Moon, Timer, Utensils } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { formatDuration } from "~/lib/utils"
import type { DailyMeals, Meal, MoodEntry, SleepEntry, WaterEntry } from "~/types/types"


export function DashboardOverview() {
  const [waterGoal] = useState(2500);
  const [calorieGoal] = useState(2200);

  const [todayMood, setTodayMood] = useState({ emoji: '', label: '' });
  const [todayWater, setTodayWater] = useState(0);
  const [todaySleep, setTodaySleep] = useState('');
  const [todayMeal, setTodayMeal] = useState(0);

  const [weeklySleep, setWeeklySleep] = useState(0);
  const [weeklyWater, setWeeklyWater] = useState(0)

  useEffect(() => {
    const today = new Date();

    const parse = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');

    const moodEntries = parse('mood');
    const waterEntries = parse('water');
    const sleepEntries = parse('sleep');
    const mealEntries = parse('meal');

    const mood = moodEntries.find((item: MoodEntry) => isSameDay(new Date(item.date), today))?.mood || { emoji: '', label: '' };

    const waterToday = waterEntries
      .filter((item: WaterEntry) => isSameDay(new Date(item.time), today))
      .reduce((sum: number, item: WaterEntry) => sum + +item.amount, 0);

    const sleepTodayMin = sleepEntries.find((item: SleepEntry) => isSameDay(new Date(item.date), today))?.duration || 0;

    const mealToday = mealEntries.find((item: DailyMeals) => isSameDay(new Date(item.date), today));
    const caloriesToday = mealToday?.meals?.reduce((sum: number, meal: Meal) => sum + meal.calories, 0) || 0;

    const averageSleepMin = sleepEntries.length
      ? sleepEntries.reduce((sum: number, entry: SleepEntry) => sum + entry.duration, 0) / sleepEntries.length
      : 0;

    const averageWater = waterEntries.length
      ? waterEntries.reduce((sum: number, entry: WaterEntry) => sum + +entry.amount, 0) / waterEntries.length
      : 0;

    setTodayMood(mood);
    setTodayWater(waterToday);
    setTodaySleep(formatDuration(sleepTodayMin));
    setTodayMeal(caloriesToday);

    setWeeklySleep(Math.floor(averageSleepMin / 60));
    setWeeklyWater(Math.round(averageWater));
  }, []);

  const percentComplete = Math.round((todayWater / waterGoal) * 100)

  const weeklySleepPercent = Math.round((weeklySleep / (8 * 7)) * 100)
  const weeklyWaterPercent = Math.round((weeklyWater / (2.5 * 7)) * 100)


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Today's Mood`}</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMood?.emoji} {todayMood?.label}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplets className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(+todayWater / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L</div>
            <Progress className="mt-2" value={percentComplete} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep Duration</CardTitle>
            <Moon className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySleep}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Utensils className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMeal}</div>
            <p className="text-xs text-muted-foreground">Goal: {calorieGoal}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/breathing" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent">
              <Timer className="h-5 w-5 text-blue-500" />
              <div className="font-medium">Breathing Exercise</div>
            </Link>
            <Link href="/mood" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent">
              <Heart className="h-5 w-5 text-rose-500" />
              <div className="font-medium">Mood Check-in</div>
            </Link>
            <Link href="/water" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent">
              <Droplets className="h-5 w-5 text-sky-500" />
              <div className="font-medium">Water Tracker</div>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Your progress this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-sky-500" />
                  <span className="text-sm font-medium">Water Intake</span>
                </div>
                <span className="text-sm">{(weeklyWaterPercent / 1000).toFixed(1)}/17.5 L</span>
              </div>
              <Progress value={(weeklyWaterPercent / 1000)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">Sleep</span>
                </div>
                <span className="text-sm">{weeklySleepPercent}/{8 * 7} hours</span>
              </div>
              <Progress value={weeklySleepPercent} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Scheduled for the next few days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="text-lg font-bold text-center">No Upcoming Scheduled</h1>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
