"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, Plus, Trash2, Utensils } from "lucide-react"
import { format } from "date-fns"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Progress } from "~/components/ui/progress"
import { toast } from "sonner"
import type { DailyMeals, Meal } from "~/types/types"

export function MealLog() {
  const [date, setDate] = useState<Date>(new Date())
  const [mealName, setMealName] = useState("")
  const [mealTime, setMealTime] = useState(format(new Date(), 'HH:00'))
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [notes, setNotes] = useState("")
  const [dailyNotes, setDailyNotes] = useState("")

  const [dailyMeals, setDailyMeals] = useState<DailyMeals[]>([])

  const calorieGoal = 2200

  useEffect(() => {
    const meal_data = JSON.parse(localStorage.getItem('meal') || '[]')
    const notes = meal_data.find(({ date }: { date: Date }) => new Date(date).toDateString() === new Date(date).toDateString())?.notes || ''
    setDailyMeals(meal_data)
    setDailyNotes(notes)
  }, [date])

  useEffect(() => {
    const timer = setInterval(() => {
      setMealTime(format(new Date(), 'HH:00'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addMeal = () => {
    if (!mealName.trim() || !calories.trim()) return

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: mealName,
      time: mealTime,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      notes: notes.trim() || undefined,
    }

    setDailyMeals((prev) => {
      const dateIndex = prev.findIndex((dm) => new Date(dm.date).toDateString() === new Date(date).toDateString())

      if (dateIndex >= 0) {
        const updated = [...prev]
        updated[dateIndex] = {
          ...updated[dateIndex],
          meals: [...updated[dateIndex].meals, newMeal],
          notes: dailyNotes.trim() || updated[dateIndex].notes,
        }
        localStorage.setItem('meal', JSON.stringify(updated))
        return updated
      }

      const data = [
        ...prev,
        {
          date: new Date(date),
          meals: [newMeal],
          notes: dailyNotes.trim() || undefined,
        },
      ]

      localStorage.setItem('meal', JSON.stringify(data))
      return data
    })

    setMealName("")
    setCalories("")
    setProtein("")
    setCarbs("")
    setFat("")
    setNotes("")
    toast.success('Successful Created.')
  }

  const removeMeal = (mealId: string) => {
    setDailyMeals((prev) => {
      const dateIndex = prev.findIndex((dm) => new Date(dm.date).toDateString() === new Date(date).toDateString())
      if (dateIndex < 0) return prev

      const updated = [...prev]
      updated[dateIndex] = {
        ...updated[dateIndex],
        meals: updated[dateIndex].meals.filter((meal) => meal.id !== mealId),
      }

      if (updated[dateIndex].meals.length === 0) {
        return prev.filter((_, i) => i !== dateIndex)
      }

      localStorage.setItem('meal', JSON.stringify(updated))

      return updated
    })
    toast.success('Successful Remove.')
  }

  const getMealsForDate = (date: Date) => {
    return dailyMeals.find((dm) => new Date(dm.date).toDateString() === new Date(date).toDateString())
  }

  const addMealScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const currentDayMeals = getMealsForDate(date)

  const totalCalories = currentDayMeals?.meals.reduce((sum, meal) => sum + meal.calories, 0) || 0
  const totalProtein = currentDayMeals?.meals.reduce((sum, meal) => sum + meal.protein, 0) || 0
  const totalCarbs = currentDayMeals?.meals.reduce((sum, meal) => sum + meal.carbs, 0) || 0
  const totalFat = currentDayMeals?.meals.reduce((sum, meal) => sum + meal.fat, 0) || 0

  const caloriePercentage = Math.min(Math.round((totalCalories / calorieGoal) * 100), 100)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Add Meal</CardTitle>
            <CardDescription>Log your food intake</CardDescription>
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
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  placeholder="What did you eat?"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal-time">Time</Label>
                <div className="flex items-center">
                  <Select value={mealTime} onValueChange={setMealTime}>
                    <SelectTrigger id="meal-time" className="w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                          {hour.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="grams"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="grams"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="grams"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                className="w-full rounded-md border p-2"
                rows={2}
                placeholder="Any notes about this meal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={addMeal} disabled={!mealName.trim() || !calories.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add Meal
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
            <CardDescription>Nutrition summary for {format(date, "MMMM d, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm">
                  {totalCalories} / {calorieGoal} kcal
                </span>
              </div>
              <Progress value={caloriePercentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {calorieGoal - totalCalories > 0
                  ? `${calorieGoal - totalCalories} kcal remaining`
                  : `${totalCalories - calorieGoal} kcal over goal`}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{totalProtein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{totalCarbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{totalFat}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>

            {currentDayMeals && currentDayMeals.meals.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Macronutrient Ratio</h4>
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${Math.round(
                        (totalProtein * 4 * 100) / (totalProtein * 4 + totalCarbs * 4 + totalFat * 9),
                      )}%`,
                    }}
                  />
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${Math.round(
                        (totalCarbs * 4 * 100) / (totalProtein * 4 + totalCarbs * 4 + totalFat * 9),
                      )}%`,
                    }}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${Math.round(
                        (totalFat * 9 * 100) / (totalProtein * 4 + totalCarbs * 4 + totalFat * 9),
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-500">Protein</span>
                  <span className="text-green-500">Carbs</span>
                  <span className="text-yellow-500">Fat</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="daily-notes">Daily Notes (Optional)</Label>
              <textarea
                id="daily-notes"
                className="w-full rounded-md border p-2"
                rows={2}
                placeholder="Notes about today's meals..."
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Meal History</CardTitle>
            <CardDescription>Recent meals and nutrition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyMeals.slice(0, 3).map((dayMeal) => (
                <div key={new Date(dayMeal.date).toISOString()} className="space-y-2">
                  <div className="font-medium">{format(dayMeal.date, "MMMM d, yyyy")}</div>
                  <div className="space-y-2">
                    {dayMeal.meals.slice(0, 3).map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between rounded-md border p-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900">
                            <Utensils className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{meal.name}</div>
                            <div className="text-xs text-muted-foreground">{meal.time}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{meal.calories} kcal</div>
                      </div>
                    ))}
                    {dayMeal.meals.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{dayMeal.meals.length - 3} more meals
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{`Today's Meals`}</CardTitle>
          <CardDescription>All meals for {format(date, "MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentDayMeals && currentDayMeals.meals.length > 0 ? (
            <div className="space-y-4">
              {currentDayMeals.meals
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900">
                        <Utensils className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-sm text-muted-foreground">{meal.time}</div>
                        {meal.notes && <div className="mt-1 text-sm">{meal.notes}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{meal.calories} kcal</div>
                        <div className="text-sm text-muted-foreground">
                          P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeMeal(meal.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Utensils className="mx-auto h-10 w-10 opacity-50" />
                <p className="mt-2">No meals logged for this date</p>
                <Button variant="outline" className="mt-4" onClick={addMealScrollTop}>
                  Add Your First Meal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
