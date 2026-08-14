"use client";

import { Goal } from "./GoalDashboard";

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  high: { label: "High", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800", dot: "bg-red-500" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800", dot: "bg-amber-500" },
  low: { label: "Low", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
};

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

export default function GoalCard({ goal, onClick }: GoalCardProps) {
  const priority = priorityConfig[goal.priority] || priorityConfig.medium;
  const emoji = categoryEmoji[goal.category] || "🎯";

  const isOverdue =
    goal.targetDate &&
    new Date(goal.targetDate) < new Date() &&
    goal.status === "active";

  return (
    <div
      onClick={onClick}
      className={`group bg-theme-card rounded-2xl p-5 border transition-all duration-200 cursor-pointer
                  hover:shadow-theme-md hover:-translate-y-0.5
                  ${goal.status === "completed" ? "border-emerald-300/50 dark:border-emerald-700/50" : "border-theme"}
                  ${isOverdue ? "border-red-300 dark:border-red-700" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-xs font-medium text-theme-muted">
            {goal.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priority.color}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${priority.dot} mr-1`} />
            {priority.label}
          </span>
        </div>
      </div>

      <h3
        className={`font-semibold text-theme-primary mb-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors ${
          goal.status === "completed" ? "line-through text-theme-muted" : ""
        }`}
      >
        {goal.title}
      </h3>

      {goal.description && (
        <p className="text-sm text-theme-muted line-clamp-2 mb-4">
          {goal.description}
        </p>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-theme-muted">Progress</span>
          <span className="text-xs font-bold text-theme-secondary">{goal.progress}%</span>
        </div>
        <div className="w-full h-2 bg-theme-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 animate-progress ${
              goal.progress === 100
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : goal.progress >= 50
                ? "bg-gradient-to-r from-brand-400 to-secondary-500"
                : "bg-gradient-to-r from-amber-400 to-accent-500"
            }`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {goal.targetDate && (
        <div className="flex items-center gap-1.5 text-xs text-theme-muted">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className={isOverdue ? "text-red-500 font-medium" : ""}>
            {isOverdue ? "Overdue: " : "Due: "}
            {new Date(goal.targetDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
