"use client"

import { format } from "date-fns"
import { Droplets, Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

type WaterEntry = {
  time: Date
  amount: string | number
}

export function WaterIntake() {
  const [waterGoal] = useState(2500)
  const [waterIntake, setWaterIntake] = useState(0)
  const [cupSize, setCupSize] = useState(250)
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([])

  useEffect(() => {
    const water_data = JSON.parse(localStorage.getItem('water') || '[]');
    const water_take = water_data.reduce((sum: number, { amount }: { amount: number }) => sum + amount, 0)
    setWaterEntries(water_data)
    setWaterIntake(water_take)
  }, [])

  const addWater = (amount: number) => {
    const time = new Date()
    setWaterIntake((prev) => Math.min(prev + amount, waterGoal * 1.5))
    setWaterEntries(prev => {
      const data = [...prev, { time, amount }]
      localStorage.setItem('water', JSON.stringify(data));
      return data;
    })
    toast.success('Successfully Added Water.')
  }

  const removeWater = (amount: number) => {
    setWaterIntake((prev) => Math.max(prev - amount, 0))
  }

  const percentComplete = Math.round((waterIntake / waterGoal) * 100)

  const chartConfig = {
    amount: {
      label: "Litre",
      color: "var(--color-sky-500)",
    },
  } satisfies ChartConfig


  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chart_data = weekDays.map(day => {
    const total = waterEntries.reduce((sum, { time, amount }) => {
      return format(new Date(time), 'EEE') === day ? sum + +amount : sum;
    }, 0);
    return { day, amount: (total / 1000).toFixed(1) };
  });

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
              <div className="relative flex size-48 items-center justify-center rounded-full border-8 border-primary/20 overflow-hidden">
                <div
                  className="absolute inset-x-0 bottom-0 bg-sky-500/80 transition-all duration-500"
                  style={{ height: `${Math.min(percentComplete, 100)}%`, borderRadius: "50%" }}
                />
                <div className="relative z-10 text-center">
                  <Droplets className="mx-auto size-12 text-sky-500" />
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

              <div className="grid grid-cols-1 gap-2">
                <Button onClick={() => addWater(cupSize)}>Add Water</Button>
                <Button className="hidden" variant="outline" onClick={() => removeWater(cupSize)} disabled={waterIntake === 0}>
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
              {waterEntries.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-500 dark:bg-sky-900">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <span>{format(new Date(entry.time), 'h:mm a')}</span>
                  </div>
                  <div className="font-medium">{entry.amount}ml</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Water Intake</CardTitle>
          <CardDescription>Your hydration patterns over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chart_data}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                type="category"
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={8}>
                <LabelList
                  position="insideBottom"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Average: 2.1L per day</div>
            <div className="text-sm text-muted-foreground">Goal: 2.5L per day</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
