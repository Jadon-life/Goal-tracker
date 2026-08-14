export interface DailyTask {
  id: number;
  title: string;
  emoji: string;
  reminderTime: string; // "HH:MM" or ""
  completedDates: string[]; // YYYY-MM-DD
  createdAt: string;
}

const KEY = "jadons_daily_tasks";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getNextId(items: { id: number }[]) {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

export function getTasks(): DailyTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: DailyTask[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function addTask(title: string, emoji: string, reminderTime: string): DailyTask {
  const tasks = getTasks();
  const task: DailyTask = {
    id: getNextId(tasks),
    title: title.trim(),
    emoji: emoji || "⭐",
    reminderTime,
    completedDates: [],
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function toggleToday(id: number): DailyTask | null {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const today = todayStr();
  const dates = tasks[idx].completedDates;
  if (dates.includes(today)) {
    tasks[idx].completedDates = dates.filter((d) => d !== today);
  } else {
    tasks[idx].completedDates = [...dates, today];
  }
  saveTasks(tasks);
  return tasks[idx];
}

export function deleteTask(id: number) {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

export function updateTask(id: number, updates: Partial<DailyTask>) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasks(tasks);
  return tasks[idx];
}

export function getStreak(task: DailyTask): number {
  if (task.completedDates.length === 0) return 0;
  const sorted = [...task.completedDates].sort().reverse();
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const str = d.toISOString().slice(0, 10);
    if (sorted.includes(str)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      // today not done yet – still count previous days
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function isDoneToday(task: DailyTask): boolean {
  return task.completedDates.includes(todayStr());
}
