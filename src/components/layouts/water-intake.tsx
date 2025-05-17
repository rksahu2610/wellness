"use client"

import { useState } from "react"
import { Droplets, Plus, Minus } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

export function WaterIntake() {
  const [waterGoal] = useState(2500) // in ml
  const [waterIntake, setWaterIntake] = useState(1200) // in ml
  const [cupSize, setCupSize] = useState(250) // in ml

  const addWater = (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, waterGoal * 1.5))
  }

  const removeWater = (amount: number) => {
    setWaterIntake((prev) => Math.max(prev - amount, 0))
  }

  const percentComplete = Math.round((waterIntake / waterGoal) * 100)

  const waterHistory = [
    { time: "8:00 AM", amount: 250 },
    { time: "10:30 AM", amount: 250 },
    { time: "12:15 PM", amount: 500 },
    { time: "2:45 PM", amount: 200 },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Daily Water Intake</CardTitle>
            <CardDescription>Track your hydration throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-primary/20 overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-sky-500/80 transition-all duration-500"
                  style={{ height: `${Math.min(percentComplete, 100)}%`, borderRadius: "50%" }}
                />
                <div className="relative z-10 text-center">
                  <Droplets className="mx-auto h-12 w-12 text-sky-500" />
                  <div className="mt-2 text-3xl font-bold">{(waterIntake / 1000).toFixed(1)}L</div>
                  <div className="text-sm text-muted-foreground">of {(waterGoal / 1000).toFixed(1)}L goal</div>
                </div>
              </div>

              <Progress value={percentComplete} className="h-2 w-full" />
              <div className="text-sm text-muted-foreground">{percentComplete}% of daily goal</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Add Water</CardTitle>
            <CardDescription>Log your water consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{cupSize}ml</div>
                <div className="text-sm text-muted-foreground">Current cup size</div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCupSize((prev) => Math.max(prev - 50, 50))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-500 dark:bg-sky-900">
                  <Droplets className="h-10 w-10" />
                </div>
                <Button variant="outline" size="icon" onClick={() => setCupSize((prev) => Math.min(prev + 50, 500))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => addWater(cupSize)}>Add Water</Button>
                <Button variant="outline" onClick={() => removeWater(cupSize)} disabled={waterIntake === 0}>
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="text-xs" onClick={() => setCupSize(150)}>
                  Small
                  <br />
                  (150ml)
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => setCupSize(250)}>
                  Medium
                  <br />
                  (250ml)
                </Button>
                <Button variant="outline" className="text-xs" onClick={() => setCupSize(500)}>
                  Large
                  <br />
                  (500ml)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>{`Today's Log`}</CardTitle>
            <CardDescription>Your water intake history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waterHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-500 dark:bg-sky-900">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <span>{entry.time}</span>
                  </div>
                  <div className="font-medium">{entry.amount}ml</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Full History
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Water Intake</CardTitle>
          <CardDescription>Your hydration patterns over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <div className="flex h-full items-end gap-2 pb-4">
              {[65, 80, 95, 70, 85, 60, 75].map((value, i) => (
                <div key={i} className="relative flex h-full w-full flex-col justify-end">
                  <div className="w-full rounded-md bg-sky-500" style={{ height: `${value}%` }} />
                  <span className="mt-1 text-center text-xs text-muted-foreground">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Average: 2.1L per day</div>
            <div className="text-sm text-muted-foreground">Goal: 2.5L per day</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
