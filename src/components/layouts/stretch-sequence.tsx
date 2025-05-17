"use client"

import { Badge } from "~/components/ui/badge"

import { useState, useRef, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Activity, Edit, Grip, Pause, Play, Plus, Trash2, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Progress } from "~/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

type Stretch = {
  id: string
  name: string
  duration: number // in seconds
  description?: string
  image?: string
}

type StretchSequence = {
  id: string
  name: string
  stretches: Stretch[]
  lastPerformed?: Date
}

export function StretchSequence() {
  const [sequences, setSequences] = useState<StretchSequence[]>([
    {
      id: "1",
      name: "Morning Flexibility",
      stretches: [
        {
          id: "1-1",
          name: "Neck Rolls",
          duration: 30,
          description: "Gently roll your neck in a circular motion, 5 times clockwise and 5 times counterclockwise.",
        },
        {
          id: "1-2",
          name: "Shoulder Stretch",
          duration: 45,
          description: "Pull each arm across your chest and hold, then release and repeat.",
        },
        {
          id: "1-3",
          name: "Standing Forward Bend",
          duration: 60,
          description: "Bend forward from the hips, keeping your legs straight but not locked.",
        },
        {
          id: "1-4",
          name: "Quad Stretch",
          duration: 30,
          description: "Stand on one leg, grab your ankle and pull your heel toward your buttocks.",
        },
      ],
      lastPerformed: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      id: "2",
      name: "Post-Workout Cool Down",
      stretches: [
        {
          id: "2-1",
          name: "Child's Pose",
          duration: 60,
          description: "Kneel on the floor, touch your big toes together, sit on your heels, and lay your torso down.",
        },
        {
          id: "2-2",
          name: "Butterfly Stretch",
          duration: 45,
          description: "Sit with the soles of your feet together, knees bent out to the sides.",
        },
        {
          id: "2-3",
          name: "Seated Forward Bend",
          duration: 60,
          description: "Sit with legs extended, bend forward from the hips, reaching toward your feet.",
        },
      ],
    },
  ])

  const [activeSequence, setActiveSequence] = useState<StretchSequence | null>(sequences[0])
  const [activeStretchIndex, setActiveStretchIndex] = useState<number>(-1)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isPerforming, setIsPerforming] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // New sequence form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSequenceName, setNewSequenceName] = useState("")
  const [newStretches, setNewStretches] = useState<Omit<Stretch, "id">[]>([])
  const [newStretchName, setNewStretchName] = useState("")
  const [newStretchDuration, setNewStretchDuration] = useState("30")
  const [newStretchDescription, setNewStretchDescription] = useState("")

  // Edit stretch state
  const [editStretchId, setEditStretchId] = useState<string | null>(null)
  const [editStretchName, setEditStretchName] = useState("")
  const [editStretchDuration, setEditStretchDuration] = useState("")
  const [editStretchDescription, setEditStretchDescription] = useState("")

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Timer completed
            if (isPerforming && activeSequence) {
              // Move to next stretch or end sequence
              const nextIndex = activeStretchIndex + 1
              if (nextIndex < activeSequence.stretches.length) {
                setActiveStretchIndex(nextIndex)
                return activeSequence.stretches[nextIndex].duration
              } else {
                // End of sequence
                completeSequence()
                return 0
              }
            }
            clearInterval(timerRef.current as NodeJS.Timeout)
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, activeStretchIndex, isPerforming, activeSequence])

  useEffect(() => {
    if (isPerforming && activeSequence && activeStretchIndex >= 0) {
      // Calculate overall progress
      const totalDuration = activeSequence.stretches.reduce((sum, stretch) => sum + stretch.duration, 0)
      const completedDuration = activeSequence.stretches
        .slice(0, activeStretchIndex)
        .reduce((sum, stretch) => sum + stretch.duration, 0)
      const currentProgress = completedDuration + (activeSequence.stretches[activeStretchIndex].duration - timer)
      setProgress(Math.round((currentProgress / totalDuration) * 100))
    }
  }, [timer, activeStretchIndex, isPerforming, activeSequence])

  const startSequence = () => {
    if (!activeSequence || activeSequence.stretches.length === 0) return

    setIsPerforming(true)
    setActiveStretchIndex(0)
    setTimer(activeSequence.stretches[0].duration)
    setIsTimerRunning(true)
    setProgress(0)
  }

  const pauseSequence = () => {
    setIsTimerRunning(false)
  }

  const resumeSequence = () => {
    setIsTimerRunning(true)
  }

  const stopSequence = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsTimerRunning(false)
    setIsPerforming(false)
    setActiveStretchIndex(-1)
    setTimer(0)
    setProgress(0)
  }

  const completeSequence = () => {
    if (!activeSequence) return

    // Mark sequence as completed
    setSequences((prev) =>
      prev.map((seq) => {
        if (seq.id === activeSequence.id) {
          return {
            ...seq,
            lastPerformed: new Date(),
          }
        }
        return seq
      }),
    )

    stopSequence()
  }

  const addStretchToNewSequence = () => {
    if (!newStretchName.trim()) return

    setNewStretches((prev) => [
      ...prev,
      {
        name: newStretchName,
        duration: Number(newStretchDuration),
        description: newStretchDescription.trim() || undefined,
      },
    ])

    // Reset form
    setNewStretchName("")
    setNewStretchDuration("30")
    setNewStretchDescription("")
  }

  const removeStretchFromNewSequence = (index: number) => {
    setNewStretches((prev) => prev.filter((_, i) => i !== index))
  }

  const saveNewSequence = () => {
    if (!newSequenceName.trim() || newStretches.length === 0) return

    const newSequence: StretchSequence = {
      id: Date.now().toString(),
      name: newSequenceName,
      stretches: newStretches.map((stretch, index) => ({
        ...stretch,
        id: `new-${Date.now()}-${index}`,
      })),
    }

    setSequences((prev) => [...prev, newSequence])
    setActiveSequence(newSequence)

    // Reset form
    setNewSequenceName("")
    setNewStretches([])
    setIsDialogOpen(false)
  }

  const startEditStretch = (stretch: Stretch) => {
    setEditStretchId(stretch.id)
    setEditStretchName(stretch.name)
    setEditStretchDuration(stretch.duration.toString())
    setEditStretchDescription(stretch.description || "")
  }

  const saveEditStretch = () => {
    if (!editStretchId || !editStretchName.trim() || !activeSequence) return

    setSequences((prev) =>
      prev.map((seq) => {
        if (seq.id === activeSequence.id) {
          return {
            ...seq,
            stretches: seq.stretches.map((stretch) => {
              if (stretch.id === editStretchId) {
                return {
                  ...stretch,
                  name: editStretchName,
                  duration: Number(editStretchDuration),
                  description: editStretchDescription.trim() || undefined,
                }
              }
              return stretch
            }),
          }
        }
        return seq
      }),
    )

    // Update active sequence
    if (activeSequence) {
      setActiveSequence({
        ...activeSequence,
        stretches: activeSequence.stretches.map((stretch) => {
          if (stretch.id === editStretchId) {
            return {
              ...stretch,
              name: editStretchName,
              duration: Number(editStretchDuration),
              description: editStretchDescription.trim() || undefined,
            }
          }
          return stretch
        }),
      })
    }

    // Reset edit state
    setEditStretchId(null)
  }

  const cancelEditStretch = () => {
    setEditStretchId(null)
  }

  const deleteStretch = (stretchId: string) => {
    if (!activeSequence) return

    setSequences((prev) =>
      prev.map((seq) => {
        if (seq.id === activeSequence.id) {
          return {
            ...seq,
            stretches: seq.stretches.filter((stretch) => stretch.id !== stretchId),
          }
        }
        return seq
      }),
    )

    // Update active sequence
    setActiveSequence({
      ...activeSequence,
      stretches: activeSequence.stretches.filter((stretch) => stretch.id !== stretchId),
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (result: any) => {
    if (!result.destination || !activeSequence) return

    const items = Array.from(activeSequence.stretches)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update sequences state
    setSequences((prev) =>
      prev.map((seq) => {
        if (seq.id === activeSequence.id) {
          return {
            ...seq,
            stretches: items,
          }
        }
        return seq
      }),
    )

    // Update active sequence
    setActiveSequence({
      ...activeSequence,
      stretches: items,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="sequence">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="sequence">Stretch Sequence</TabsTrigger>
            <TabsTrigger value="library">Sequence Library</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Sequence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Stretch Sequence</DialogTitle>
                <DialogDescription>Build a custom sequence of stretches</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sequence-name">Sequence Name</Label>
                  <Input
                    id="sequence-name"
                    placeholder="e.g., Morning Stretches"
                    value={newSequenceName}
                    onChange={(e) => setNewSequenceName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Stretches</Label>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {newStretches.map((stretch, index) => (
                          <div key={index} className="flex items-center justify-between rounded-md border p-2">
                            <div>
                              <div className="font-medium">{stretch.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Duration: {formatTime(stretch.duration)}
                              </div>
                              {stretch.description && (
                                <div className="mt-1 text-xs text-muted-foreground">{stretch.description}</div>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeStretchFromNewSequence(index)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="stretch-name">Stretch Name</Label>
                            <Input
                              id="stretch-name"
                              placeholder="e.g., Hamstring Stretch"
                              value={newStretchName}
                              onChange={(e) => setNewStretchName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="stretch-duration">Duration (seconds)</Label>
                            <Input
                              id="stretch-duration"
                              type="number"
                              min="5"
                              placeholder="Duration in seconds"
                              value={newStretchDuration}
                              onChange={(e) => setNewStretchDuration(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="stretch-description">Description (Optional)</Label>
                            <textarea
                              id="stretch-description"
                              className="w-full rounded-md border p-2"
                              rows={2}
                              placeholder="How to perform this stretch..."
                              value={newStretchDescription}
                              onChange={(e) => setNewStretchDescription(e.target.value)}
                            />
                          </div>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={addStretchToNewSequence}
                            disabled={!newStretchName.trim()}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add Stretch
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveNewSequence} disabled={!newSequenceName.trim() || newStretches.length === 0}>
                  Create Sequence
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="sequence" className="space-y-4 pt-4">
          {activeSequence ? (
            <>
              {isPerforming ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{activeSequence.name}</CardTitle>
                        <CardDescription>
                          Stretch {activeStretchIndex + 1} of {activeSequence.stretches.length}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isTimerRunning ? (
                          <Button variant="outline" size="icon" onClick={pauseSequence}>
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="icon" onClick={resumeSequence}>
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={stopSequence}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {activeStretchIndex >= 0 && activeStretchIndex < activeSequence.stretches.length && (
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-primary/20">
                          <div className="text-center">
                            <div className="text-4xl font-bold">{formatTime(timer)}</div>
                            <div className="text-sm text-muted-foreground">remaining</div>
                          </div>
                        </div>

                        <div className="text-center">
                          <h3 className="text-2xl font-bold">{activeSequence.stretches[activeStretchIndex].name}</h3>
                          {activeSequence.stretches[activeStretchIndex].description && (
                            <p className="mt-2 max-w-md text-muted-foreground">
                              {activeSequence.stretches[activeStretchIndex].description}
                            </p>
                          )}
                        </div>

                        <div className="flex w-full justify-between">
                          <Button
                            variant="outline"
                            disabled={activeStretchIndex === 0}
                            onClick={() => {
                              if (activeStretchIndex > 0) {
                                setActiveStretchIndex(activeStretchIndex - 1)
                                setTimer(activeSequence.stretches[activeStretchIndex - 1].duration)
                              }
                            }}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            disabled={activeStretchIndex === activeSequence.stretches.length - 1}
                            onClick={() => {
                              if (activeStretchIndex < activeSequence.stretches.length - 1) {
                                setActiveStretchIndex(activeStretchIndex + 1)
                                setTimer(activeSequence.stretches[activeStretchIndex + 1].duration)
                              }
                            }}
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{activeSequence.name}</CardTitle>
                        <CardDescription>
                          {activeSequence.stretches.length} stretches • Total duration:{" "}
                          {formatTime(activeSequence.stretches.reduce((sum, stretch) => sum + stretch.duration, 0))}
                        </CardDescription>
                      </div>
                      <Button onClick={startSequence} disabled={activeSequence.stretches.length === 0}>
                        <Play className="mr-2 h-4 w-4" /> Start Sequence
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="stretches">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {activeSequence.stretches.map((stretch, index) => (
                              <Draggable key={stretch.id} draggableId={stretch.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="rounded-lg border p-4"
                                  >
                                    {editStretchId === stretch.id ? (
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor={`edit-name-${stretch.id}`}>Stretch Name</Label>
                                          <Input
                                            id={`edit-name-${stretch.id}`}
                                            value={editStretchName}
                                            onChange={(e) => setEditStretchName(e.target.value)}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`edit-duration-${stretch.id}`}>Duration (seconds)</Label>
                                          <Input
                                            id={`edit-duration-${stretch.id}`}
                                            type="number"
                                            min="5"
                                            value={editStretchDuration}
                                            onChange={(e) => setEditStretchDuration(e.target.value)}
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor={`edit-description-${stretch.id}`}>
                                            Description (Optional)
                                          </Label>
                                          <textarea
                                            id={`edit-description-${stretch.id}`}
                                            className="w-full rounded-md border p-2"
                                            rows={2}
                                            value={editStretchDescription}
                                            onChange={(e) => setEditStretchDescription(e.target.value)}
                                          />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                          <Button variant="outline" size="sm" onClick={cancelEditStretch}>
                                            Cancel
                                          </Button>
                                          <Button size="sm" onClick={saveEditStretch}>
                                            Save
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                                          >
                                            <Grip className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{stretch.name}</span>
                                              <Badge variant="outline" className="ml-2">
                                                {formatTime(stretch.duration)}
                                              </Badge>
                                            </div>
                                            {stretch.description && (
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                {stretch.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Button variant="ghost" size="icon" onClick={() => startEditStretch(stretch)}>
                                            <Edit className="h-4 w-4 text-muted-foreground" />
                                          </Button>
                                          <Button variant="ghost" size="icon" onClick={() => deleteStretch(stretch.id)}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {activeSequence.stretches.length === 0 && (
                      <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                        <Activity className="h-16 w-16 text-muted-foreground opacity-50" />
                        <p className="mt-4 text-center text-muted-foreground">
                          No stretches in this sequence. Add some to get started.
                        </p>
                        <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                          Create New Sequence
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex h-[300px] flex-col items-center justify-center p-6">
                <Activity className="h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-xl font-medium">No Active Sequence</h3>
                <p className="text-center text-muted-foreground">
                  Select a sequence to start stretching or create a new one.
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Create New Sequence
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sequences.map((sequence) => (
              <Card key={sequence.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{sequence.name}</CardTitle>
                  <CardDescription>
                    {sequence.stretches.length} stretches • Total duration:{" "}
                    {formatTime(sequence.stretches.reduce((sum, stretch) => sum + stretch.duration, 0))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2">
                    {sequence.stretches.slice(0, 3).map((stretch) => (
                      <div key={stretch.id} className="flex items-center justify-between rounded-md border p-2">
                        <div className="font-medium">{stretch.name}</div>
                        <Badge variant="outline">{formatTime(stretch.duration)}</Badge>
                      </div>
                    ))}
                    {sequence.stretches.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{sequence.stretches.length - 3} more stretches
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {sequence.lastPerformed
                      ? `Last performed: ${new Date(sequence.lastPerformed).toLocaleDateString()}`
                      : "Never performed"}
                  </div>
                  <Button
                    onClick={() => {
                      setActiveSequence(sequence)
                    }}
                  >
                    Select
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
