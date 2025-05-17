const user_data = {
    name: 'Rahul Kumar',
    short_name: 'RK',
    email: 'rksahu2601@gmail.com'
}

const moods = [
  { emoji: "😊", label: "Happy", color: "bg-green-100 dark:bg-green-900 text-green-500" },
  { emoji: "😐", label: "Neutral", color: "bg-blue-100 dark:bg-blue-900 text-blue-500" },
  { emoji: "😢", label: "Sad", color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-500" },
  { emoji: "😡", label: "Angry", color: "bg-red-100 dark:bg-red-900 text-red-500" },
  { emoji: "😴", label: "Tired", color: "bg-purple-100 dark:bg-purple-900 text-purple-500" },
  { emoji: "🤔", label: "Thoughtful", color: "bg-amber-100 dark:bg-amber-900 text-amber-500" },
  { emoji: "😀", label: "Excited", color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-500" },
  { emoji: "😌", label: "Calm", color: "bg-teal-100 dark:bg-teal-900 text-teal-500" },
]

const mood_entries = [
    { date: new Date(2025, 4, 15), mood: moods[0], note: "Had a great day at work!" },
    { date: new Date(2025, 4, 14), mood: moods[4], note: "Didn't sleep well last night" },
    { date: new Date(2025, 4, 13), mood: moods[1], note: "Regular day, nothing special" },
    { date: new Date(2025, 4, 12), mood: moods[6], note: "Got a promotion at work!" },
    { date: new Date(2025, 4, 11), mood: moods[2], note: "Missed my family today" },
  ]

export { user_data, moods, mood_entries }