"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Reminder } from "./GoalDashboard";

const categoryEmoji: Record<string, string> = {
  Personal: "🌟",
  Health: "💪",
  Career: "💼",
  Education: "📚",
  Finance: "💰",
  Fitness: "🏃",
  Creative: "🎨",
  Travel: "✈️",
  Social: "👥",
  Other: "📌",
};

export default function ReminderBell() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      const data: Reminder[] = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 30000);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    if (showPanel) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPanel]);

  const upcoming = reminders.filter(
    (r) => r.isActive && !r.fired && new Date(r.reminderTime) > new Date()
  );
  const upcomingCount = upcoming.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center
                   bg-theme-tertiary border border-theme text-theme-secondary
                   hover:bg-theme-hover hover:text-theme-primary
                   transition-all duration-200 cursor-pointer focus-brand"
        aria-label="Reminders"
      >
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {upcomingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
            {upcomingCount > 9 ? "9+" : upcomingCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-theme-card border border-theme rounded-2xl shadow-theme-lg z-50 overflow-hidden animate-scale-in">
          <div className="px-4 py-3 border-b border-theme flex items-center justify-between">
            <h3 className="text-sm font-semibold text-theme-primary">Upcoming Reminders</h3>
            <span className="text-xs text-theme-muted">{upcomingCount} active</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {upcoming.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-theme-muted">No upcoming reminders</p>
                <p className="text-xs text-theme-muted mt-1">
                  Open a goal to schedule smart multi-day reminders
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-color)]">
                {upcoming
                  .sort(
                    (a, b) =>
                      new Date(a.reminderTime).getTime() -
                      new Date(b.reminderTime).getTime()
                  )
                  .slice(0, 10)
                  .map((r) => (
                    <li key={r.id} className="px-4 py-3 hover:bg-theme-hover/50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <span className="text-base mt-0.5">
                          {categoryEmoji[r.goalCategory || ""] || "🎯"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-theme-primary truncate">
                            {r.goalTitle || "Goal"}
                          </p>
                          <p className="text-xs text-theme-muted truncate mt-0.5">
                            {r.message}
                          </p>
                          <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-medium">
                            {new Date(r.reminderTime).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
