"use client"

import { useState, useEffect, useRef } from "react"
import { Activity, AlarmClock, CheckCircle2, Circle, Edit, Plus, Timer, Trash2, X } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Progress } from "~/components/ui/progress"

type Exercise = {
  id: string
  name: string
  duration: number // in seconds
  sets: number
  reps: number
  completed: boolean
}

type Routine = {
  id: string
  name: string
  exercises: Exercise[]
  lastCompleted?: Date
}

export function FitnessRoutine() {
  const [, setActiveTab] = useState("today")
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: "1",
      name: "Morning Workout",
      exercises: [
        {
          id: "1-1",
          name: "Push-ups",
          duration: 0,
          sets: 3,
          reps: 15,
          completed: false,
        },
        {
          id: "1-2",
          name: "Squats",
          duration: 0,
          sets: 3,
          reps: 20,
          completed: false,
        },
        {
          id: "1-3",
          name: "Plank",
          duration: 60,
          sets: 3,
          reps: 0,
          completed: false,
        },
        {
          id: "1-4",
          name: "Jumping Jacks",
          duration: 60,
          sets: 2,
          reps: 0,
          completed: false,
        },
      ],
    },
    {
      id: "2",
      name: "Quick HIIT",
      exercises: [
        {
          id: "2-1",
          name: "Burpees",
          duration: 30,
          sets: 3,
          reps: 0,
          completed: false,
        },
        {
          id: "2-2",
          name: "Mountain Climbers",
          duration: 30,
          sets: 3,
          reps: 0,
          completed: false,
        },
        {
          id: "2-3",
          name: "High Knees",
          duration: 30,
          sets: 3,
          reps: 0,
          completed: false,
        },
      ],
      lastCompleted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  ])

  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(routines[0])
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // New routine form state
  const [newRoutineName, setNewRoutineName] = useState("")
  const [newExerciseName, setNewExerciseName] = useState("")
  const [newExerciseDuration, setNewExerciseDuration] = useState("0")
  const [newExerciseSets, setNewExerciseSets] = useState("3")
  const [newExerciseReps, setNewExerciseReps] = useState("10")
  const [newExercises, setNewExercises] = useState<Omit<Exercise, "id" | "completed">[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Edit exercise state
  const [editExerciseId, setEditExerciseId] = useState<string | null>(null)
  const [editExerciseName, setEditExerciseName] = useState("")
  const [editExerciseDuration, setEditExerciseDuration] = useState("0")
  const [editExerciseSets, setEditExerciseSets] = useState("3")
  const [editExerciseReps, setEditExerciseReps] = useState("10")

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
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
  }, [isTimerRunning])

  const startExerciseTimer = (exerciseId: string, duration: number) => {
    // Stop any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      setIsTimerRunning(false)
    }

    setActiveExerciseId(exerciseId)
    setTimer(duration)
    setIsTimerRunning(true)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsTimerRunning(false)
    setActiveExerciseId(null)
  }

  const toggleExerciseCompletion = (routineId: string, exerciseId: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === routineId) {
          return {
            ...routine,
            exercises: routine.exercises.map((exercise) => {
              if (exercise.id === exerciseId) {
                return {
                  ...exercise,
                  completed: !exercise.completed,
                }
              }
              return exercise
            }),
          }
        }
        return routine
      }),
    )
  }

  const completeRoutine = (routineId: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === routineId) {
          return {
            ...routine,
            lastCompleted: new Date(),
            exercises: routine.exercises.map((exercise) => ({
              ...exercise,
              completed: true,
            })),
          }
        }
        return routine
      }),
    )
  }

  const resetRoutine = (routineId: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === routineId) {
          return {
            ...routine,
            exercises: routine.exercises.map((exercise) => ({
              ...exercise,
              completed: false,
            })),
          }
        }
        return routine
      }),
    )
  }

  const addExerciseToNewRoutine = () => {
    if (!newExerciseName.trim()) return

    setNewExercises((prev) => [
      ...prev,
      {
        name: newExerciseName,
        duration: Number(newExerciseDuration),
        sets: Number(newExerciseSets),
        reps: Number(newExerciseReps),
      },
    ])

    // Reset form
    setNewExerciseName("")
    setNewExerciseDuration("0")
    setNewExerciseSets("3")
    setNewExerciseReps("10")
  }

  const removeExerciseFromNewRoutine = (index: number) => {
    setNewExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const saveNewRoutine = () => {
    if (!newRoutineName.trim() || newExercises.length === 0) return

    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: newRoutineName,
      exercises: newExercises.map((exercise, index) => ({
        ...exercise,
        id: `new-${Date.now()}-${index}`,
        completed: false,
      })),
    }

    setRoutines((prev) => [...prev, newRoutine])
    setActiveRoutine(newRoutine)

    // Reset form
    setNewRoutineName("")
    setNewExercises([])
    setIsDialogOpen(false)
  }

  const startEditExercise = (exercise: Exercise) => {
    setEditExerciseId(exercise.id)
    setEditExerciseName(exercise.name)
    setEditExerciseDuration(exercise.duration.toString())
    setEditExerciseSets(exercise.sets.toString())
    setEditExerciseReps(exercise.reps.toString())
  }

  const saveEditExercise = (routineId: string) => {
    if (!editExerciseId || !editExerciseName.trim()) return

    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === routineId) {
          return {
            ...routine,
            exercises: routine.exercises.map((exercise) => {
              if (exercise.id === editExerciseId) {
                return {
                  ...exercise,
                  name: editExerciseName,
                  duration: Number(editExerciseDuration),
                  sets: Number(editExerciseSets),
                  reps: Number(editExerciseReps),
                }
              }
              return exercise
            }),
          }
        }
        return routine
      }),
    )

    // Reset edit state
    setEditExerciseId(null)
  }

  const cancelEditExercise = () => {
    setEditExerciseId(null)
  }

  const deleteExercise = (routineId: string, exerciseId: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === routineId) {
          return {
            ...routine,
            exercises: routine.exercises.filter((exercise) => exercise.id !== exerciseId),
          }
        }
        return routine
      }),
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getRoutineProgress = (routine: Routine) => {
    const totalExercises = routine.exercises.length
    const completedExercises = routine.exercises.filter((exercise) => exercise.completed).length
    return Math.round((completedExercises / totalExercises) * 100)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="today" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="today">{`Today's Workout`}</TabsTrigger>
            <TabsTrigger value="routines">My Routines</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>


          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-4">
                <Plus className="mr-2 h-4 w-4" /> New Routine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Routine</DialogTitle>
                <DialogDescription>Build a custom workout routine</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="routine-name">Routine Name</Label>
                  <Input
                    id="routine-name"
                    placeholder="e.g., Morning Workout"
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exercises</Label>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {newExercises.map((exercise, index) => (
                          <div key={index} className="flex items-center justify-between rounded-md border p-2">
                            <div>
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {exercise.sets > 0 && `${exercise.sets} sets`}
                                {exercise.sets > 0 && exercise.reps > 0 && " × "}
                                {exercise.reps > 0 && `${exercise.reps} reps`}
                                {exercise.duration > 0 &&
                                  (exercise.sets > 0 || exercise.reps > 0 ? " • " : "") +
                                  `${formatTime(exercise.duration)} duration`}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeExerciseFromNewRoutine(index)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="exercise-name">Exercise Name</Label>
                              <Input
                                id="exercise-name"
                                placeholder="e.g., Push-ups"
                                value={newExerciseName}
                                onChange={(e) => setNewExerciseName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exercise-duration">Duration (seconds)</Label>
                              <Input
                                id="exercise-duration"
                                type="number"
                                min="0"
                                placeholder="0 for rep-based"
                                value={newExerciseDuration}
                                onChange={(e) => setNewExerciseDuration(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="exercise-sets">Sets</Label>
                              <Input
                                id="exercise-sets"
                                type="number"
                                min="0"
                                placeholder="Number of sets"
                                value={newExerciseSets}
                                onChange={(e) => setNewExerciseSets(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exercise-reps">Reps</Label>
                              <Input
                                id="exercise-reps"
                                type="number"
                                min="0"
                                placeholder="0 for time-based"
                                value={newExerciseReps}
                                onChange={(e) => setNewExerciseReps(e.target.value)}
                              />
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={addExerciseToNewRoutine}
                            disabled={!newExerciseName.trim()}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add Exercise
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
                <Button onClick={saveNewRoutine} disabled={!newRoutineName.trim() || newExercises.length === 0}>
                  Create Routine
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="today" className="space-y-4">
          {activeRoutine ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{activeRoutine.name}</CardTitle>
                      <CardDescription>
                        {activeRoutine.exercises.length} exercises •{" "}
                        {activeRoutine.exercises.filter((e) => e.completed).length} completed
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={activeRoutine.id}
                        onValueChange={(value: string) => {
                          const routine = routines.find((r) => r.id === value)
                          if (routine) setActiveRoutine(routine)
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select routine" />
                        </SelectTrigger>
                        <SelectContent>
                          {routines.map((routine) => (
                            <SelectItem key={routine.id} value={routine.id}>
                              {routine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Progress value={getRoutineProgress(activeRoutine)} className="h-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeRoutine.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={cn(
                          "rounded-lg border p-4 transition-colors",
                          exercise.completed && "bg-muted",
                          activeExerciseId === exercise.id && "border-primary",
                        )}
                      >
                        {editExerciseId === exercise.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-name-${exercise.id}`}>Exercise Name</Label>
                                <Input
                                  id={`edit-name-${exercise.id}`}
                                  value={editExerciseName}
                                  onChange={(e) => setEditExerciseName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edit-duration-${exercise.id}`}>Duration (seconds)</Label>
                                <Input
                                  id={`edit-duration-${exercise.id}`}
                                  type="number"
                                  min="0"
                                  value={editExerciseDuration}
                                  onChange={(e) => setEditExerciseDuration(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-sets-${exercise.id}`}>Sets</Label>
                                <Input
                                  id={`edit-sets-${exercise.id}`}
                                  type="number"
                                  min="0"
                                  value={editExerciseSets}
                                  onChange={(e) => setEditExerciseSets(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edit-reps-${exercise.id}`}>Reps</Label>
                                <Input
                                  id={`edit-reps-${exercise.id}`}
                                  type="number"
                                  min="0"
                                  value={editExerciseReps}
                                  onChange={(e) => setEditExerciseReps(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={cancelEditExercise}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => saveEditExercise(activeRoutine.id)}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="outline"
                                size="icon"
                                className={cn(
                                  "h-8 w-8 rounded-full p-0",
                                  exercise.completed && "bg-primary text-primary-foreground",
                                )}
                                onClick={() => toggleExerciseCompletion(activeRoutine.id, exercise.id)}
                              >
                                {exercise.completed ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </Button>
                              <div>
                                <div className="font-medium">{exercise.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {exercise.sets > 0 && `${exercise.sets} sets`}
                                  {exercise.sets > 0 && exercise.reps > 0 && " × "}
                                  {exercise.reps > 0 && `${exercise.reps} reps`}
                                  {exercise.duration > 0 &&
                                    (exercise.sets > 0 || exercise.reps > 0 ? " • " : "") +
                                    `${formatTime(exercise.duration)} duration`}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {exercise.duration > 0 && (
                                <Button
                                  variant={activeExerciseId === exercise.id ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    if (activeExerciseId === exercise.id) {
                                      stopTimer()
                                    } else {
                                      startExerciseTimer(exercise.id, exercise.duration)
                                    }
                                  }}
                                >
                                  {activeExerciseId === exercise.id ? (
                                    <>
                                      <Timer className="mr-2 h-4 w-4" /> {formatTime(timer)}
                                    </>
                                  ) : (
                                    <>
                                      <AlarmClock className="mr-2 h-4 w-4" /> Start Timer
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => startEditExercise(exercise)}>
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteExercise(activeRoutine.id, exercise.id)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => resetRoutine(activeRoutine.id)}>
                    Reset
                  </Button>
                  <Button onClick={() => completeRoutine(activeRoutine.id)}>Complete Workout</Button>
                </CardFooter>
              </Card>

              {isTimerRunning && (
                <Card className="border-primary">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {activeRoutine.exercises.find((e) => e.id === activeExerciseId)?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">Timer Running</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold">{formatTime(timer)}</div>
                        <Button variant="outline" size="icon" onClick={stopTimer}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex h-[300px] flex-col items-center justify-center p-6">
                <Activity className="h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-xl font-medium">No Active Routine</h3>
                <p className="text-center text-muted-foreground">
                  Select a routine to start your workout or create a new one.
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Create New Routine
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="routines" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardDescription>
                    {routine.exercises.length} exercises • Last completed:{" "}
                    {routine.lastCompleted ? new Date(routine.lastCompleted).toLocaleDateString() : "Never"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2">
                    {routine.exercises.slice(0, 3).map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between rounded-md border p-2">
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.sets > 0 && `${exercise.sets} sets`}
                          {exercise.sets > 0 && exercise.reps > 0 && " × "}
                          {exercise.reps > 0 && `${exercise.reps} reps`}
                          {exercise.duration > 0 &&
                            (exercise.sets > 0 || exercise.reps > 0 ? " • " : "") + `${formatTime(exercise.duration)}`}
                        </div>
                      </div>
                    ))}
                    {routine.exercises.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{routine.exercises.length - 3} more exercises
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setActiveRoutine(routine)
                      setActiveTab("today")
                    }}
                  >
                    Start Workout
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Your recent completed workouts</CardDescription>
            </CardHeader>
            <CardContent>
              {routines.filter((r) => r.lastCompleted).length > 0 ? (
                <div className="space-y-4">
                  {routines
                    .filter((r) => r.lastCompleted)
                    .sort(
                      (a, b) => new Date(b.lastCompleted as Date).getTime() - new Date(a.lastCompleted as Date).getTime(),
                    )
                    .map((routine) => (
                      <div key={routine.id} className="flex items-center justify-between rounded-md border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{routine.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(routine.lastCompleted as Date).toLocaleDateString()} • {routine.exercises.length}{" "}
                              exercises
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveRoutine(routine)
                            setActiveTab("today")
                          }}
                        >
                          Repeat
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center">
                  <Activity className="h-16 w-16 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-xl font-medium">No Workout History</h3>
                  <p className="text-center text-muted-foreground">Complete a workout to see it in your history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  )
}