"use client"

import { useState } from "react"
import { CalendarIcon, Hash, Save, Search, Tag, Trash2 } from "lucide-react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"

type JournalEntry = {
  id: string
  date: Date
  content: string
  mood: number // 1-5
  tags: string[]
}

const moodEmojis = ["😢", "😕", "😐", "🙂", "😊"]

export function MentalHealthJournal() {
  const [date, setDate] = useState<Date>(new Date())
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<number>(3)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: new Date(2025, 4, 15),
      content:
        "Had a productive day at work. Completed the project ahead of schedule. Feeling accomplished and satisfied with my progress.",
      mood: 5,
      tags: ["work", "accomplishment", "productivity"],
    },
    {
      id: "2",
      date: new Date(2025, 4, 14),
      content:
        "Feeling a bit stressed about the upcoming deadline. Need to focus more tomorrow and avoid distractions.",
      mood: 2,
      tags: ["stress", "work", "deadline"],
    },
    {
      id: "3",
      date: new Date(2025, 4, 13),
      content:
        "Spent time with family today. It was refreshing to disconnect from work and enjoy quality time with loved ones.",
      mood: 4,
      tags: ["family", "relaxation", "balance"],
    },
    {
      id: "4",
      date: new Date(2025, 4, 12),
      content: "Feeling neutral today. Nothing particularly good or bad happened. Just an ordinary day.",
      mood: 3,
      tags: ["ordinary", "neutral"],
    },
    {
      id: "5",
      date: new Date(2025, 4, 11),
      content:
        "Had a disagreement with a colleague. Need to work on my communication skills and patience when dealing with difficult situations.",
      mood: 2,
      tags: ["conflict", "work", "communication"],
    },
    {
      id: "6",
      date: new Date(2025, 4, 10),
      content:
        "Started a new book today. It's been a while since I've read for pleasure, and I'm enjoying it immensely.",
      mood: 4,
      tags: ["reading", "hobby", "relaxation"],
    },
    {
      id: "7",
      date: new Date(2025, 4, 9),
      content:
        "Feeling overwhelmed with all the tasks I need to complete. Need to prioritize better and take things one step at a time.",
      mood: 1,
      tags: ["overwhelmed", "stress", "tasks"],
    },
  ])

  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim().toLowerCase())) return
    setTags((prev) => [...prev, tagInput.trim().toLowerCase()])
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const saveJournalEntry = () => {
    if (!content.trim()) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(date),
      content: content.trim(),
      mood,
      tags,
    }

    setJournalEntries((prev) => {
      // Replace if entry for this date already exists
      const exists = prev.findIndex((entry) => isSameDay(entry.date, date))

      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newEntry
        return updated
      }

      return [...prev, newEntry].sort((a, b) => b.date.getTime() - a.date.getTime())
    })

    // Reset form
    setContent("")
    setMood(3)
    setTags([])
  }

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const getEntryForDate = (date: Date) => {
    return journalEntries.find((entry) => isSameDay(entry.date, date))
  }

  const currentEntry = getEntryForDate(date)

  const getWeekDates = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }) // Start on Monday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
  }

  const weekDates = getWeekDates(date)

  const getFilteredEntries = () => {
    if (!searchQuery.trim()) return journalEntries

    const query = searchQuery.toLowerCase()
    return journalEntries.filter(
      (entry) =>
        entry.content.toLowerCase().includes(query) || entry.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  const filteredEntries = getFilteredEntries()

  const getMoodDistribution = () => {
    const distribution = [0, 0, 0, 0, 0] // For moods 1-5

    journalEntries.forEach((entry) => {
      distribution[entry.mood - 1]++
    })

    return distribution
  }

  const moodDistribution = getMoodDistribution()

  const getTopTags = () => {
    const tagCounts: Record<string, number> = {}

    journalEntries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }

  const topTags = getTopTags()

  return (
    <div className="space-y-4">
      <Tabs defaultValue="journal">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Mental Health Journal</CardTitle>
                <CardDescription>Record your thoughts and feelings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
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
                          entry: journalEntries.map((entry) => entry.date),
                        }}
                        modifiersStyles={{
                          entry: {
                            fontWeight: "bold",
                            border: "2px solid var(--primary)",
                          },
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>How are you feeling today?</Label>
                  <div className="flex justify-between">
                    {moodEmojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant={mood === index + 1 ? "default" : "outline"}
                        className="h-12 w-12 text-2xl"
                        onClick={() => setMood(index + 1)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Sad</span>
                    <span>Sad</span>
                    <span>Neutral</span>
                    <span>Happy</span>
                    <span>Very Happy</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="journal-entry">Journal Entry</Label>
                  <textarea
                    id="journal-entry"
                    className="min-h-[150px] w-full rounded-md border p-2"
                    placeholder="Write your thoughts and feelings here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeTag(tag)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button onClick={addTag} disabled={!tagInput.trim()}>
                      <Tag className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={saveJournalEntry} disabled={!content.trim()}>
                  <Save className="mr-2 h-4 w-4" /> Save Entry
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Current Entry</CardTitle>
                <CardDescription>
                  {currentEntry ? format(currentEntry.date, "MMMM d, yyyy") : "No entry for this date"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentEntry ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl">{moodEmojis[currentEntry.mood - 1]}</div>
                      <div className="flex flex-wrap gap-2">
                        {currentEntry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="whitespace-pre-wrap">{currentEntry.content}</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => deleteJournalEntry(currentEntry.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Entry
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-[300px] flex-col items-center justify-center">
                    <div className="text-6xl">📝</div>
                    <p className="mt-4 text-center text-muted-foreground">
                      No journal entry for this date. Write your thoughts in the form to create one.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Journal</CardTitle>
              <CardDescription>
                View your entries for the week of {format(weekDates[0], "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weekDates.map((weekDate) => {
                  const entry = getEntryForDate(weekDate)
                  return (
                    <div key={weekDate.toISOString()} className="flex flex-col items-center">
                      <div className="mb-2 text-center">
                        <div className="font-medium">{format(weekDate, "EEE")}</div>
                        <div className="text-sm text-muted-foreground">{format(weekDate, "d")}</div>
                      </div>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-16 w-16 rounded-full p-0",
                          isSameDay(weekDate, date) && "ring-2 ring-primary",
                          entry && "bg-primary/10",
                        )}
                        onClick={() => setDate(weekDate)}
                      >
                        {entry ? (
                          <div className="text-2xl">{moodEmojis[entry.mood - 1]}</div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No entry</div>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8">
                {getEntryForDate(date) ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{format(date, "EEEE, MMMM d")}</h3>
                      <div className="text-2xl">{moodEmojis[getEntryForDate(date)!.mood - 1]}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getEntryForDate(date)!.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="whitespace-pre-wrap">{getEntryForDate(date)!.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                    <p className="text-center text-muted-foreground">
                      No journal entry for {format(date, "EEEE, MMMM d")}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        document.getElementById("journal-tab")?.click()
                      }}
                    >
                      Create Entry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>Your emotional patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex h-[200px] items-end gap-4">
                    {moodDistribution.map((count, index) => {
                      const percentage = journalEntries.length > 0 ? (count / journalEntries.length) * 100 : 0
                      return (
                        <div key={index} className="flex flex-1 flex-col items-center justify-end">
                          <div
                            className="w-full rounded-t-md bg-primary"
                            style={{ height: `${Math.max(percentage, 5)}%` }}
                          />
                          <div className="mt-2 text-center">
                            <div className="text-xl">{moodEmojis[index]}</div>
                            <div className="text-xs text-muted-foreground">{count} entries</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Mood Insights</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {moodDistribution.indexOf(Math.max(...moodDistribution)) === 4
                        ? "You've been feeling very happy most of the time. Keep up the positive mindset!"
                        : moodDistribution.indexOf(Math.max(...moodDistribution)) === 0
                          ? "You've been feeling sad frequently. Consider talking to someone about your feelings."
                          : "Your mood has been balanced with some ups and downs. This is a normal pattern."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Themes</CardTitle>
                <CardDescription>Frequently mentioned topics in your journal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {topTags.map(([tag, count]) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="flex items-center gap-2 p-2 text-base"
                        style={{
                          fontSize: `${Math.min(1.5, 1 + count / 10)}rem`,
                        }}
                      >
                        {tag}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
                      </Badge>
                    ))}
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Tag Analysis</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {topTags.length > 0
                        ? `Your most common theme is "${topTags[0][0]}" which appears in ${topTags[0][1]
                        } entries. This suggests it's an important aspect of your life right now.`
                        : "Start adding tags to your entries to see patterns in your thoughts and feelings."}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Mood by Tag</h4>
                    <div className="mt-2 space-y-2">
                      {topTags.slice(0, 3).map(([tag]) => {
                        const entriesWithTag = journalEntries.filter((entry) => entry.tags.includes(tag))
                        const avgMood =
                          entriesWithTag.reduce((sum, entry) => sum + entry.mood, 0) / entriesWithTag.length

                        return (
                          <div key={tag} className="flex items-center justify-between">
                            <span className="font-medium">{tag}</span>
                            <div className="flex items-center">
                              <span className="mr-2 text-sm text-muted-foreground">Avg: {avgMood.toFixed(1)}/5</span>
                              <span className="text-xl">{moodEmojis[Math.round(avgMood) - 1]}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Journal History</CardTitle>
                  <CardDescription>Browse and search your past entries</CardDescription>
                </div>
                <div className="relative w-[250px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "rounded-lg border p-4 transition-colors",
                        isSameDay(entry.date, date) && "border-primary",
                      )}
                      onClick={() => setDate(new Date(entry.date))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{moodEmojis[entry.mood - 1]}</div>
                          <div>
                            <div className="font-medium">{format(entry.date, "EEEE, MMMM d, yyyy")}</div>
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Hash className="mr-1 h-3 w-3" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteJournalEntry(entry.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] flex-col items-center justify-center">
                    <div className="text-6xl">🔍</div>
                    <p className="mt-4 text-center text-muted-foreground">
                      {searchQuery
                        ? "No entries match your search. Try different keywords."
                        : "No journal entries yet. Start writing to build your history."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
