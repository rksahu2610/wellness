"use client"

import { useState } from "react"
import { CalendarIcon, Scale, TrendingDown, TrendingUp } from "lucide-react"
import { format, subDays } from "date-fns"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"

type WeightEntry = {
  date: Date
  weight: number
  notes?: string
}

export function WeightTracker() {
  const today = new Date()

  const [date, setDate] = useState<Date>(today)
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [unit, setUnit] = useState<"kg" | "lb">("kg")

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([
    { date: subDays(today, 30), weight: 75.5 },
    { date: subDays(today, 25), weight: 75.2 },
    { date: subDays(today, 20), weight: 74.8 },
    { date: subDays(today, 15), weight: 74.3 },
    { date: subDays(today, 10), weight: 73.9 },
    { date: subDays(today, 5), weight: 73.5 },
    { date: subDays(today, 0), weight: 73.2 },
  ])

  const saveWeightEntry = () => {
    if (!weight.trim()) return

    const weightValue = Number.parseFloat(weight)
    if (isNaN(weightValue)) return

    const newEntry: WeightEntry = {
      date: new Date(date),
      weight: weightValue,
      notes: notes.trim() || undefined,
    }

    setWeightEntries((prev) => {
      // Replace if entry for this date already exists
      const exists = prev.findIndex((entry) => entry.date.toDateString() === date.toDateString())

      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newEntry
        return updated
      }

      return [...prev, newEntry].sort((a, b) => a.date.getTime() - b.date.getTime())
    })

    setWeight("")
    setNotes("")
  }

  const getWeightEntryForDate = (date: Date) => {
    return weightEntries.find((entry) => entry.date.toDateString() === date.toDateString())
  }

  const currentEntry = getWeightEntryForDate(date)

  const convertWeight = (weight: number, to: "kg" | "lb") => {
    if (to === "kg") return weight
    return weight * 2.20462
  }

  const displayWeight = (weight: number) => {
    const converted = convertWeight(weight, unit)
    return converted.toFixed(1)
  }

  const getWeightChange = () => {
    if (weightEntries.length < 2) return null

    const first = weightEntries[0].weight
    const last = weightEntries[weightEntries.length - 1].weight
    const change = last - first

    return {
      value: Math.abs(change).toFixed(1),
      direction: change < 0 ? "loss" : "gain",
      percentage: ((Math.abs(change) / first) * 100).toFixed(1),
    }
  }

  const weightChange = getWeightChange()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Log Weight</CardTitle>
            <CardDescription>Record your weight for a specific date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weight</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Weight in ${unit}`}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  step="0.1"
                  min="0"
                />
                <Tabs defaultValue={unit} onValueChange={(value) => setUnit(value as "kg" | "lb")}>
                  <TabsList>
                    <TabsTrigger value="kg">kg</TabsTrigger>
                    <TabsTrigger value="lb">lb</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                className="w-full rounded-md border p-2"
                rows={2}
                placeholder="Any notes about your weight..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={saveWeightEntry} disabled={!weight.trim()}>
              Save Weight Entry
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Weight Summary</CardTitle>
            <CardDescription>Your weight statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentEntry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{format(currentEntry.date, "MMM d, yyyy")}</span>
                  </div>
                </div>

                <div className="rounded-lg border p-4 text-center">
                  <div className="text-3xl font-bold">
                    {displayWeight(currentEntry.weight)} {unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {unit === "kg"
                      ? `${(currentEntry.weight * 2.20462).toFixed(1)} lb`
                      : `${(currentEntry.weight / 2.20462).toFixed(1)} kg`}
                  </div>
                </div>

                {currentEntry.notes && (
                  <div className="rounded-lg border p-3">
                    <div className="text-xs font-medium text-muted-foreground">Notes</div>
                    <div className="text-sm">{currentEntry.notes}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Scale className="mx-auto h-10 w-10 opacity-50" />
                  <p className="mt-2">No weight data for this date</p>
                </div>
              </div>
            )}

            {weightChange && (
              <div className="space-y-2">
                <h4 className="font-medium">Progress</h4>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {weightChange.direction === "loss" ? "Weight Lost" : "Weight Gained"}
                      </div>
                      <div className="text-xl font-bold">
                        {displayWeight(Number.parseFloat(weightChange.value))} {unit}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        weightChange.direction === "loss"
                          ? "bg-green-100 text-green-500 dark:bg-green-900"
                          : "bg-orange-100 text-orange-500 dark:bg-orange-900",
                      )}
                    >
                      {weightChange.direction === "loss" ? (
                        <TrendingDown className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {weightChange.percentage}% {weightChange.direction === "loss" ? "decrease" : "increase"} over{" "}
                    {weightEntries.length} entries
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your weight history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weightEntries
                .slice(-5)
                .reverse()
                .map((entry, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium leading-none">{format(entry.date, "MMM d, yyyy")}</p>
                        <p className="font-medium">
                          {displayWeight(entry.weight)} {unit}
                        </p>
                      </div>
                      {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                    </div>
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
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Visualize your weight changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <svg width="100%" height="100%" viewBox="0 0 700 300" preserveAspectRatio="none">
              {/* Grid lines */}
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={`grid-${i}`}
                  x1="0"
                  y1={50 * i}
                  x2="700"
                  y2={50 * i}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                />
              ))}

              {/* Weight line */}
              {weightEntries.length > 1 && (
                <>
                  <path
                    d={weightEntries
                      .map((entry, i) => {
                        const x = (i / (weightEntries.length - 1)) * 700
                        const minWeight = Math.min(...weightEntries.map((e) => e.weight))
                        const maxWeight = Math.max(...weightEntries.map((e) => e.weight))
                        const range = maxWeight - minWeight
                        const normalizedWeight = range === 0 ? 150 : 250 - ((entry.weight - minWeight) / range) * 200

                        return `${i === 0 ? "M" : "L"} ${x} ${normalizedWeight}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Area under the line */}
                  <path
                    d={`
                      ${weightEntries
                        .map((entry, i) => {
                          const x = (i / (weightEntries.length - 1)) * 700
                          const minWeight = Math.min(...weightEntries.map((e) => e.weight))
                          const maxWeight = Math.max(...weightEntries.map((e) => e.weight))
                          const range = maxWeight - minWeight
                          const normalizedWeight = range === 0 ? 150 : 250 - ((entry.weight - minWeight) / range) * 200

                          return `${i === 0 ? "M" : "L"} ${x} ${normalizedWeight}`
                        })
                        .join(" ")}
                      L ${700} 300
                      L 0 300
                      Z
                    `}
                    fill="hsl(var(--primary))"
                    fillOpacity="0.1"
                  />

                  {/* Data points */}
                  {weightEntries.map((entry, i) => {
                    const x = (i / (weightEntries.length - 1)) * 700
                    const minWeight = Math.min(...weightEntries.map((e) => e.weight))
                    const maxWeight = Math.max(...weightEntries.map((e) => e.weight))
                    const range = maxWeight - minWeight
                    const normalizedWeight = range === 0 ? 150 : 250 - ((entry.weight - minWeight) / range) * 200

                    return <circle key={`point-${i}`} cx={x} cy={normalizedWeight} r="4" fill="hsl(var(--primary))" />
                  })}
                </>
              )}
            </svg>
          </div>

          <div className="mt-4 flex justify-between">
            {weightEntries.length > 1 && (
              <>
                <div className="text-sm text-muted-foreground">{format(weightEntries[0].date, "MMM d")}</div>
                <div className="text-sm text-muted-foreground">
                  {format(weightEntries[weightEntries.length - 1].date, "MMM d")}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
