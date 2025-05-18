"use client"

import { usePathname } from "next/navigation";
import { BreathingExercise } from "~/components/layouts/breathing-exercise";
import { MealLog } from "~/components/layouts/meal-log";
import { MentalHealthJournal } from "~/components/layouts/mental-health-journal";
import { MoodTracker } from "~/components/layouts/mood-tracker";
import { SleepTracker } from "~/components/layouts/sleep-tracker";
import { WaterIntake } from "~/components/layouts/water-intake";
import { WeightTracker } from "~/components/layouts/weight-tracker";

export default function Page() {
    const pathname = usePathname();
    
    if (pathname === '/mood') return <MoodTracker />
    if (pathname === '/water') return <WaterIntake />
    if (pathname === '/breathing') return <BreathingExercise />
    if (pathname === '/sleep') return <SleepTracker />
    if (pathname === '/weight') return <WeightTracker />
    if (pathname === '/meal') return <MealLog />
    if (pathname === '/mental') return <MentalHealthJournal />
    return null;
}