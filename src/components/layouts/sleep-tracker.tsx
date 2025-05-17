"use client"

import { useState } from "react"
import { CalendarIcon, Clock, Moon } from "lucide-react"
import { format, subDays } from "date-fns"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

type SleepEntry = {
  date: Date
  bedTime: string
  wakeTime: string
  duration: number // in minutes
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export function SleepTracker() {
  const today = new Date()

  const [date, setDate] = useState<Date>(today)
  const [bedTime, setBedTime] = useState("22:30")
  const [wakeTime, setWakeTime] = useState("06:30")
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4)
  const [notes, setNotes] = useState("")

  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([
    {
      date: subDays(today, 1),
      bedTime: "23:00",
      wakeTime: "07:00",
      duration: 480,
      quality: 4,
    },
    {
      date: subDays(today, 2),
      bedTime: "23:30",
      wakeTime: "06:45",
      duration: 435,
      quality: 3,
      notes: "Woke up once during the night",
    },
    {
      date: subDays(today, 3),
      bedTime: "22:15",
      wakeTime: "06:30",
      duration: 495,
      quality: 5,
      notes: "Great sleep!",
    },
    {
      date: subDays(today, 4),
      bedTime: "00:30",
      wakeTime: "07:15",
      duration: 405,
      quality: 2,
      notes: "Went to bed too late",
    },
    {
      date: subDays(today, 5),
      bedTime: "22:45",
      wakeTime: "06:45",
      duration: 480,
      quality: 4,
    },
    {
      date: subDays(today, 6),
      bedTime: "23:15",
      wakeTime: "07:00",
      duration: 465,
      quality: 4,
    },
    {
      date: subDays(today, 7),
      bedTime: "22:30",
      wakeTime: "06:15",
      duration: 465,
      quality: 3,
      notes: "Woke up too early",
    },
  ])

  const calculateDuration = (bedTime: string, wakeTime: string) => {
    const [bedHours, bedMinutes] = bedTime.split(":").map(Number)
    const [wakeHours, wakeMinutes] = wakeTime.split(":").map(Number)

    let durationMinutes = wakeHours * 60 + wakeMinutes - (bedHours * 60 + bedMinutes)

    // If negative, it means sleep went past midnight
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
      // Replace if entry for this date already exists
      const exists = prev.findIndex((entry) => entry.date.toDateString() === date.toDateString())

      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newEntry
        return updated
      }

      return [...prev, newEntry].sort((a, b) => b.date.getTime() - a.date.getTime())
    })

    setNotes("")
  }

  const getSleepEntryForDate = (date: Date) => {
    return sleepEntries.find((entry) => entry.date.toDateString() === date.toDateString())
  }

  const currentEntry = getSleepEntryForDate(date)

  const averageSleepDuration = Math.round(
    sleepEntries.reduce((sum, entry) => sum + entry.duration, 0) / sleepEntries.length,
  )

  const averageSleepQuality =
    Math.round((sleepEntries.reduce((sum, entry) => sum + entry.quality, 0) / sleepEntries.length) * 10) / 10

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Log Sleep</CardTitle>
            <CardDescription>Record your sleep for a specific date</CardDescription>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bed Time</label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Select value={bedTime} onValueChange={(value) => setBedTime(value)}>
                    <SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Wake Time</label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Select value={wakeTime} onValueChange={(value) => setWakeTime(value)}>
                    <SelectTrigger>
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Full History
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sleep Patterns</CardTitle>
          <CardDescription>Visualize your sleep duration over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <div className="flex h-full items-end gap-2 pb-4">
              {sleepEntries
                .slice(0, 7)
                .reverse()
                .map((entry, i) => {
                  const heightPercentage = (entry.duration / (10 * 60)) * 100

                  return (
                    <div key={i} className="relative flex h-full w-full flex-col justify-end">
                      <div
                        className={cn(
                          "w-full rounded-md",
                          entry.quality >= 4 ? "bg-indigo-500" : entry.quality >= 3 ? "bg-indigo-400" : "bg-indigo-300",
                        )}
                        style={{ height: `${heightPercentage}%` }}
                      />
                      <div className="absolute bottom-0 w-full">
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium">{formatDuration(entry.duration)}</div>
                          <div className="text-xs text-muted-foreground">{format(entry.date, "E")}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Average: {formatDuration(averageSleepDuration)}</div>
            <div className="text-sm text-muted-foreground">Recommended: 7-9 hours</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
