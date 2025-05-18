"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, Scale, TrendingDown, TrendingUp } from "lucide-react"
import { format } from "date-fns"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { toast } from "sonner"
import type { WeightEntry } from "~/types/types"

export function WeightTracker() {
  const today = new Date()

  const [date, setDate] = useState<Date>(today)
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [unit, setUnit] = useState<"kg" | "lb">("kg")

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])

  useEffect(() => {
    const weight_data = JSON.parse(localStorage.getItem('weight') || '[]')
    setWeightEntries(weight_data)
  }, [])

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
      const exists = prev.findIndex((entry) => new Date(entry.date).toDateString() === new Date(date).toDateString())

      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newEntry
        localStorage.setItem('weight', JSON.stringify(updated))
        return updated
      }

      const created = [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      localStorage.setItem('weight', JSON.stringify(created))
      return created;
    })

    setWeight("")
    setNotes("")
    toast.success('Successfully Added Entry.')
  }

  const getWeightEntryForDate = (date: Date) => {
    return weightEntries.find((entry) => new Date(entry.date).toDateString() === new Date(date).toDateString())
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

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


  const chartData = months.map(month => {
    const entries = weightEntries
      .filter(({ date }) => format(new Date(date), 'MMM') === month)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));

    return {
      month,
      weight: entries.length > 0 ? entries[0].weight : 0
    };
  });

  console.info(chartData)

  const chartConfig = {
    weight: {
      label: "Weight",
      color: "var(--color-green-500)",
    }
  } satisfies ChartConfig

  console.info(weightEntries);

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
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Visualize your weight changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="weight"
                type="natural"
                stroke="var(--color-weight)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-weight)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
