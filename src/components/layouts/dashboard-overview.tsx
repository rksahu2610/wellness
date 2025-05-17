"use client"

import { Activity, Calendar, Droplets, Heart, Moon, Scale, Timer, Utensils } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"

export function DashboardOverview() {

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Today's Mood`}</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">😊 Happy</div>
            <p className="text-xs text-muted-foreground">+10% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplets className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2L / 2.5L</div>
            <Progress className="mt-2" value={48} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep Duration</CardTitle>
            <Moon className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7h 20m</div>
            <p className="text-xs text-muted-foreground">+45m from average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Utensils className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,840</div>
            <p className="text-xs text-muted-foreground">Goal: 2,200</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <WeeklyHealthChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{`Today's Activities`}</CardTitle>
            <CardDescription>Your scheduled activities for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Morning Run</p>
                  <p className="text-sm text-muted-foreground">7:00 AM - 30 minutes</p>
                </div>
                <div className="ml-auto font-medium">Completed</div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Meditation</p>
                  <p className="text-sm text-muted-foreground">12:30 PM - 15 minutes</p>
                </div>
                <div className="ml-auto font-medium">Upcoming</div>
              </div>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                  <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Evening Yoga</p>
                  <p className="text-sm text-muted-foreground">6:00 PM - 45 minutes</p>
                </div>
                <div className="ml-auto font-medium">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/breathing" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent">
              <Timer className="h-5 w-5 text-blue-500" />
              <div className="font-medium">Breathing Exercise</div>
            </Link>
            <Link href="/mood" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent">
              <Heart className="h-5 w-5 text-rose-500" />
              <div className="font-medium">Mood Check-in</div>
            </Link>
            <Link href="/water" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent">
              <Droplets className="h-5 w-5 text-sky-500" />
              <div className="font-medium">Water Tracker</div>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Your progress this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Exercise</span>
                </div>
                <span className="text-sm">3/5 days</span>
              </div>
              <Progress value={60} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-sky-500" />
                  <span className="text-sm font-medium">Water Intake</span>
                </div>
                <span className="text-sm">12.5/17.5L</span>
              </div>
              <Progress value={71} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">Sleep</span>
                </div>
                <span className="text-sm">36/49 hours</span>
              </div>
              <Progress value={73} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Scheduled for the next few days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
                <Calendar className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{`Doctor's Appointment`}</p>
                <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Scale className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Weekly Weigh-in</p>
                <p className="text-xs text-muted-foreground">Saturday, 8:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Group Fitness Class</p>
                <p className="text-xs text-muted-foreground">Sunday, 9:30 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function WeeklyHealthChart() {
  return (
    <div className="h-[200px] w-full">
      <div className="flex h-full items-end gap-2 pb-4">
        {[40, 60, 75, 65, 80, 95, 70].map((value, i) => (
          <div key={i} className="relative flex h-full w-full flex-col justify-end">
            <div className="w-full rounded-md bg-primary" style={{ height: `${value}%` }} />
            <span className="mt-1 text-center text-xs text-muted-foreground">
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
