"use client"

import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { moods } from "~/constants/data"
type MoodEntry = {
  date: Date
  mood: (typeof moods)[number]
  note?: string
}

export function MoodTracker() {
  const [date, setDate] = useState<Date>(new Date())
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState<(typeof moods)[number] | null>(null)
  const [note, setNote] = useState("")

  useEffect(() => {
    const mood_data = JSON.parse(localStorage.getItem('mood') || '[]');
    setMoodEntries(mood_data)
  }, [])

  const saveMood = () => {
    if (!selectedMood) return

    const newEntry: MoodEntry = {
      date: new Date(date),
      mood: selectedMood,
      note: note.trim() || undefined,
    }

    setMoodEntries((prev) => {
      const exists = prev.findIndex((entry) => new Date(entry.date).toDateString() === new Date(date).toDateString())

      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newEntry
        return updated
      }

      const data = [...prev, newEntry];

      localStorage.setItem('mood', JSON.stringify(data))

      return data;
    })

    setNote("")
    setSelectedMood(null)
  }

  const getMoodForDate = (date: Date) => {
    return moodEntries.find((entry) => new Date(entry.date).toDateString() === new Date(date).toDateString())
  }

  const currentMood = getMoodForDate(date)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to track your mood</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
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
                    modifiers={{
                      mood: moodEntries.map((entry) => entry.date),
                    }}
                    modifiersStyles={{
                      mood: {
                        fontWeight: "bold",
                        border: "2px solid var(--primary)",
                      },
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            {currentMood && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-xl",
                    currentMood.mood.color,
                  )}
                >
                  {currentMood.mood.emoji}
                </div>
                <div>
                  <p className="font-medium">{currentMood.mood.label}</p>
                  <p className="text-sm text-muted-foreground">{format(currentMood.date, "MMM d, yyyy")}</p>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>Select your current mood</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {moods.map((mood) => (
                <Button
                  key={mood.label}
                  variant="outline"
                  className={cn("h-12 p-0", selectedMood?.label === mood.label && "ring-2 ring-primary")}
                  onClick={() => setSelectedMood(mood)}
                >
                  <span className="text-xl">{mood.emoji}</span>
                </Button>
              ))}
            </div>

            {selectedMood && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Add a note (optional)</p>
                <textarea
                  className="w-full rounded-md border p-2"
                  rows={3}
                  placeholder="How are you feeling today?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={saveMood} disabled={!selectedMood}>
              Save Mood
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Mood History</CardTitle>
            <CardDescription>Your recent mood entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moodEntries.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={cn("flex h-10 w-10 items-center justify-center rounded-full text-xl", entry.mood.color)}
                  >
                    {entry.mood.emoji}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">{entry.mood.label}</p>
                    <p className="text-sm text-muted-foreground">{format(entry.date, "MMM d, yyyy")}</p>
                    {entry.note && <p className="text-sm">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood Calendar</CardTitle>
          <CardDescription>Visualize your mood patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const d = new Date(2025, 4, i - 5)
              const entry = getMoodForDate(d)

              return (
                <div
                  key={i}
                  className={cn("aspect-square rounded-md border p-1", entry ? entry.mood.color : "hover:bg-accent")}
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="text-xs">{d.getDate()}</span>
                    {entry && <span className="text-lg">{entry.mood.emoji}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
