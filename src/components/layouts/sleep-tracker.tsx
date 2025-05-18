"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, Moon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { toast } from "sonner"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import type { SleepEntry } from "~/types/types"

export function SleepTracker() {
  const today = new Date()

  const [date, setDate] = useState<Date>(today)
  const [bedTime, setBedTime] = useState("00:00")
  const [wakeTime, setWakeTime] = useState("00:00")
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4)
  const [notes, setNotes] = useState("")

  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])

  useEffect(() => {
    const sleep_data = JSON.parse(localStorage.getItem('sleep') || '[]');
    setSleepEntries(sleep_data)
  }, [])

  const calculateDuration = (bedTime: string, wakeTime: string) => {
    const [bedHours, bedMinutes] = bedTime.split(":").map(Number)
    const [wakeHours, wakeMinutes] = wakeTime.split(":").map(Number)

    let durationMinutes = wakeHours * 60 + wakeMinutes - (bedHours * 60 + bedMinutes)

    if (durationMinutes < 0) {
      durationMinutes += 24 * 60
    }

    return durationMinutes
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const saveSleepEntry = () => {
    const duration = calculateDuration(bedTime, wakeTime)

    const newEntry: SleepEntry = {
      date: new Date(date),
      bedTime,
      wakeTime,
      duration,
      quality,
      notes: notes.trim() || undefined,
    }

    setSleepEntries((prev) => {
      const exists = prev.findIndex((entry) => new Date(entry.date).toDateString() === new Date(date).toDateString())

      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newEntry
        localStorage.setItem('sleep', JSON.stringify(updated))
        return updated
      }

      const data = [...prev, newEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      localStorage.setItem('sleep', JSON.stringify(data))
      return data
    })

    setNotes("")
    toast.success('Sleep Entry Created.')
  }

  const getSleepEntryForDate = (date: Date) => {
    return sleepEntries.find((entry) => new Date(entry.date).toDateString() === new Date(date).toDateString())
  }

  const currentEntry = getSleepEntryForDate(date)

  const averageSleepDuration = sleepEntries?.length > 0 ? Math.round(
    sleepEntries.reduce((sum, entry) => sum + entry.duration, 0) / sleepEntries.length,
  ) : 0

  const averageSleepQuality = sleepEntries?.length > 0 ?
    Math.round((sleepEntries.reduce((sum, entry) => sum + entry.quality, 0) / sleepEntries.length) * 10) / 10 : 0

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartData = weekDays.map(day => {
    const entry = sleepEntries.find(({ date }) => format(new Date(date), 'EEE') === day);
    return {
      day,
      hrs: entry ? +(entry.duration / 60).toFixed(1) : 0
    };
  });


  const chartConfig = {
    hrs: {
      label: "Hours",
      color: "var(--color-indigo-500)",
    },
  } satisfies ChartConfig

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Log Sleep</CardTitle>
            <CardDescription>Record your sleep for a specific date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Bed Time</label>
                <div className="flex items-center">
                  <Select value={bedTime} onValueChange={(value) => setBedTime(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const hour = Math.floor(i / 2) % 24
                        const minute = (i % 2) * 30
                        const formattedHour = hour.toString().padStart(2, "0")
                        const formattedMinute = minute.toString().padStart(2, "0")
                        const timeString = `${formattedHour}:${formattedMinute}`

                        return (
                          <SelectItem key={i} value={timeString}>
                            {timeString}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Wake Time</label>
                <div className="flex items-center">
                  <Select value={wakeTime} onValueChange={(value) => setWakeTime(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const hour = Math.floor(i / 2) % 24
                        const minute = (i % 2) * 30
                        const formattedHour = hour.toString().padStart(2, "0")
                        const formattedMinute = minute.toString().padStart(2, "0")
                        const timeString = `${formattedHour}:${formattedMinute}`

                        return (
                          <SelectItem key={i} value={timeString}>
                            {timeString}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Sleep Quality</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={quality === value ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setQuality(value as 1 | 2 | 3 | 4 | 5)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                className="w-full rounded-md border p-2"
                rows={2}
                placeholder="Any notes about your sleep..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={saveSleepEntry}>
              Save Sleep Entry
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sleep Summary</CardTitle>
            <CardDescription>Your sleep statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentEntry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium">{format(currentEntry.date, "MMM d, yyyy")}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentEntry.bedTime} - {currentEntry.wakeTime}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{formatDuration(currentEntry.duration)}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{currentEntry.quality}/5</div>
                    <div className="text-xs text-muted-foreground">Quality</div>
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
                  <Moon className="mx-auto h-10 w-10 opacity-50" />
                  <p className="mt-2">No sleep data for this date</p>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <h4 className="font-medium">Weekly Averages</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold">{formatDuration(averageSleepDuration)}</div>
                  <div className="text-xs text-muted-foreground">Avg. Duration</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold">{averageSleepQuality}/5</div>
                  <div className="text-xs text-muted-foreground">Avg. Quality</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Sleep</CardTitle>
            <CardDescription>Your sleep history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sleepEntries.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium leading-none">{format(entry.date, "MMM d, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">{formatDuration(entry.duration)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.bedTime} - {entry.wakeTime} • Quality: {entry.quality}/5
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sleep Patterns</CardTitle>
          <CardDescription>Visualize your sleep duration over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" label={'hello'} />}
              />
              <Bar dataKey="hrs" fill="var(--color-hrs)" radius={8}>
                <LabelList
                  position="insideBottom"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Average: {formatDuration(averageSleepDuration)}</div>
            <div className="text-sm text-muted-foreground">Recommended: 7-9 hours</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
