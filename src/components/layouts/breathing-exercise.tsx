"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RefreshCw } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Slider } from "~/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { toast } from "sonner"

export function BreathingExercise() {
  const [isActive, setIsActive] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale")
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [totalTime, setTotalTime] = useState(0)
  const [breathingPattern, setBreathingPattern] = useState({
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 2,
  })

  const box = { inhale: 4, hold: 4, exhale: 4, rest: 4 };
  const relaxing = { inhale: 4, hold: 7, exhale: 8, rest: 0 };
  const energizing = { inhale: 6, hold: 0, exhale: 2, rest: 0 };

  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            switch (currentPhase) {
              case "inhale":
                setCurrentPhase("hold")
                return breathingPattern.hold
              case "hold":
                setCurrentPhase("exhale")
                return breathingPattern.exhale
              case "exhale":
                setCurrentPhase("rest")
                return breathingPattern.rest
              case "rest":
                setCurrentPhase("inhale")
                return breathingPattern.inhale
            }
          }
          return prev - 1
        })

        setTotalTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, currentPhase, breathingPattern])

  useEffect(() => {
    if (!circleRef.current) return
    const circle = circleRef.current
    circle.style.animation = "none"
    void circle.offsetWidth

    if (isActive) {
      switch (currentPhase) {
        case "inhale":
          circle.style.animation = `breatheIn ${breathingPattern.inhale}s ease-in-out forwards`
          break
        case "hold":
          break
        case "exhale":
          circle.style.animation = `breatheOut ${breathingPattern.exhale}s ease-in-out forwards`
          break
        case "rest":
          break
      }
    }
  }, [currentPhase, isActive, breathingPattern])

  const toggleExercise = () => {
    if (isActive) {
      setIsActive(false)
    } else {
      setIsActive(true)
      setCurrentPhase("inhale")
      setSecondsLeft(breathingPattern.inhale)
    }
  }

  const resetExercise = () => {
    setIsActive(false)
    setCurrentPhase("inhale")
    setSecondsLeft(breathingPattern.inhale)
    setTotalTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getInstructions = () => {
    switch (currentPhase) {
      case "inhale":
        return "Breathe in slowly through your nose"
      case "hold":
        return "Hold your breath"
      case "exhale":
        return "Exhale slowly through your mouth"
      case "rest":
        return "Rest before the next breath"
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Breathing Exercise</CardTitle>
            <CardDescription>Follow the animation to regulate your breathing</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="relative flex h-64 w-64 items-center justify-center">
              <div
                ref={circleRef}
                className="absolute h-32 w-32 rounded-full bg-primary/40 transition-all duration-500"
                style={{
                  transform: "scale(1)",
                  opacity: 0.4,
                }}
              />
              <div className="relative z-10 text-center">
                <div className="text-4xl font-bold">{secondsLeft}</div>
                <div className="mt-2 text-sm font-medium uppercase tracking-wider">{currentPhase}</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium">{getInstructions()}</p>
              <p className="text-sm text-muted-foreground">Total time: {formatTime(totalTime)}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={toggleExercise}>
                {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isActive ? "Pause" : "Start"}
              </Button>
              <Button variant="outline" onClick={resetExercise}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Customize Breathing Pattern</CardTitle>
            <CardDescription>Adjust the duration of each breathing phase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Inhale</label>
                <span className="text-sm text-muted-foreground">{breathingPattern.inhale} seconds</span>
              </div>
              <Slider
                value={[breathingPattern.inhale]}
                min={2}
                max={8}
                step={1}
                onValueChange={(value) => setBreathingPattern((prev) => ({ ...prev, inhale: value[0] }))}
                disabled={isActive}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Hold</label>
                <span className="text-sm text-muted-foreground">{breathingPattern.hold} seconds</span>
              </div>
              <Slider
                value={[breathingPattern.hold]}
                min={0}
                max={8}
                step={1}
                onValueChange={(value) => setBreathingPattern((prev) => ({ ...prev, hold: value[0] }))}
                disabled={isActive}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Exhale</label>
                <span className="text-sm text-muted-foreground">{breathingPattern.exhale} seconds</span>
              </div>
              <Slider
                value={[breathingPattern.exhale]}
                min={2}
                max={8}
                step={1}
                onValueChange={(value) => setBreathingPattern((prev) => ({ ...prev, exhale: value[0] }))}
                disabled={isActive}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Rest</label>
                <span className="text-sm text-muted-foreground">{breathingPattern.rest} seconds</span>
              </div>
              <Slider
                value={[breathingPattern.rest]}
                min={0}
                max={4}
                step={1}
                onValueChange={(value) => setBreathingPattern((prev) => ({ ...prev, rest: value[0] }))}
                disabled={isActive}
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="space-y-2 w-full">
              <h4 className="font-medium">Breathing Techniques</h4>
              <Tabs defaultValue="box">
                <TabsList className="w-full">
                  <TabsTrigger value="box">Box</TabsTrigger>
                  <TabsTrigger value="relaxing">Relaxing</TabsTrigger>
                  <TabsTrigger value="energizing">Energizing</TabsTrigger>
                </TabsList>
                <TabsContent value="box" className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setBreathingPattern(box)
                      toast.success('Apply Box Breathing')
                    }}
                    disabled={isActive || JSON.stringify(breathingPattern) === JSON.stringify(box)}
                  >
                    Apply Box Breathing (4-4-4-4)
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Equal parts inhale, hold, exhale, and rest. Great for stress reduction and focus.
                  </p>
                </TabsContent>
                <TabsContent value="relaxing" className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setBreathingPattern(relaxing)
                      toast.success('Apply Relaxing Breathing')
                    }}
                    disabled={isActive || JSON.stringify(breathingPattern) === JSON.stringify(relaxing)}
                  >
                    Apply Relaxing Breathing (4-7-8-0)
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Inhale for 4, hold for 7, exhale for 8 and reset for 0. Helps with anxiety and sleep.
                  </p>
                </TabsContent>
                <TabsContent value="energizing" className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setBreathingPattern(energizing)
                      toast.success('Apply Energizing Breathing')
                    }}
                    disabled={isActive || JSON.stringify(breathingPattern) === JSON.stringify(energizing)}
                  >
                    Apply Energizing Breath (6-0-2-0)
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Long inhale, short exhale. Increases alertness and energy.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </CardFooter>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes breatheIn {
          from {
            transform: scale(1);
            opacity: 0.4;
          }
          to {
            transform: scale(2);
            opacity: 0.8;
          }
        }
        
        @keyframes breatheOut {
          from {
            transform: scale(2);
            opacity: 0.8;
          }
          to {
            transform: scale(1);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  )
}
