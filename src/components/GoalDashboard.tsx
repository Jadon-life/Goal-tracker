"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DailyTask,
  getTasks,
  addTask,
  toggleToday,
  deleteTask,
  getStreak,
  isDoneToday,
} from "@/lib/storage";

const EMOJIS = ["📚", "🏃", "🎸", "✏️", "🧹", "🍎", "💧", "🦷", "🛏️", "🎨", "🧠", "⭐", "🎵", "⚽", "🙏"];

export default function GoalDashboard() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [reminder, setReminder] = useState("");
  const [dark, setDark] = useState(false);
  const [popId, setPopId] = useState<number | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const load = useCallback(() => {
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    load();
    setDark(document.documentElement.classList.contains("dark"));
  }, [load]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, emoji, reminder);
    setTitle("");
    setEmoji("⭐");
    setReminder("");
    setShowAdd(false);
    load();
  };

  const handleToggle = (task: DailyTask, e: React.MouseEvent) => {
    const wasDone = isDoneToday(task);
    toggleToday(task.id);
    load();

    if (!wasDone) {
      setPopId(task.id);
      setTimeout(() => setPopId(null), 400);

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"];
      const pieces = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        color: colors[i % colors.length],
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), 900);
    }
  };

  const doneCount = tasks.filter((t) => isDoneToday(t)).length;
  const total = tasks.length;

  return (
    <div className="min-h-screen bg-app text-main">
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-piece fixed z-50"
          style={{
            left: c.x,
            top: c.y,
            background: c.color,
            transform: `translate(-50%, -50%)`,
          }}
        />
      ))}

      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-app">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="Jadon"
              className="w-10 h-10 rounded-full object-cover shadow-sm animate-float"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-main leading-tight truncate">
                Jadon&apos;s Goal Tracker
              </h1>
              <p className="text-[11px] text-soft -mt-0.5">Daily tasks made fun</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-soft flex items-center justify-center text-soft hover:text-main transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="h-9 px-4 rounded-full bg-brand-500 text-white text-sm font-semibold shadow-md hover:bg-brand-600 active:scale-95 transition cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6 animate-fade-up">
          <h2 className="text-2xl font-bold mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </h2>
          <p className="text-soft text-sm">
            {total === 0
              ? "Add your first daily task!"
              : doneCount === total
              ? "🎉 All done for today! Amazing!"
              : `${doneCount} of ${total} done today`}
          </p>

          {total > 0 && (
            <div className="mt-3 h-2.5 rounded-full bg-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
                style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
              />
            </div>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <img src="/logo.png" alt="" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-app animate-float" />
            <h3 className="text-lg font-semibold mb-2">No daily tasks yet</h3>
            <p className="text-soft text-sm mb-6 max-w-xs mx-auto">
              Add things you want to do every day — like reading, practicing, or helping at home.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 rounded-full bg-brand-500 text-white font-semibold shadow-md hover:bg-brand-600 active:scale-95 transition cursor-pointer"
            >
              Add my first task
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task, i) => {
              const done = isDoneToday(task);
              const streak = getStreak(task);
              return (
                <li key={task.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={`bg-card rounded-2xl border border-app shadow-app p-4 flex items-center gap-4 transition-all ${done ? "opacity-80" : ""}`}>
                    <button
                      onClick={(e) => handleToggle(task, e)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all cursor-pointer
                        ${done ? "bg-success-500 text-white shadow-md" : "bg-soft text-main animate-pulse-ring"}
                        ${popId === task.id ? "animate-pop" : ""}
                      `}
                    >
                      {done ? "✓" : task.emoji}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-base truncate ${done ? "line-through text-soft" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-soft">
                        {streak > 0 && (
                          <span className="font-medium text-fun-500">🔥 {streak} day{streak !== 1 ? "s" : ""}</span>
                        )}
                        {task.reminderTime && <span>⏰ {task.reminderTime}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm("Delete this task?")) {
                          deleteTask(task.id);
                          load();
                        }
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-soft hover:text-red-500 transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-card rounded-3xl shadow-xl w-full max-w-md p-6 animate-bounce-in border border-app">
            <h2 className="text-xl font-bold mb-1">New daily task</h2>
            <p className="text-soft text-sm mb-5">Something you want to do every day</p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-soft mb-1.5 block">What is it?</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read for 20 minutes"
                  className="w-full px-4 py-3 rounded-xl bg-soft border border-app text-main focus:outline-none focus:ring-2 focus:ring-brand-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-soft mb-1.5 block">Pick an emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition cursor-pointer
                        ${emoji === em ? "bg-brand-500 text-white scale-110 shadow" : "bg-soft"}
                      `}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-soft mb-1.5 block">Remind me at (optional)</label>
                <input
                  type="time"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-soft border border-app text-main focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl border border-app font-medium text-soft cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-semibold shadow-md cursor-pointer"
                >
                  Add task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
            }
