"use client";

import { Stats } from "./GoalDashboard";

interface StatsBarProps {
  stats: Stats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const statCards = [
    {
      label: "Total Goals",
      value: stats.total,
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-theme-tertiary",
      textColor: "text-theme-secondary",
    },
    {
      label: "Active",
      value: stats.active,
      color: "from-secondary-500 to-secondary-600",
      bgColor: "bg-secondary-500/10",
      textColor: "text-secondary-600 dark:text-secondary-400",
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Avg Progress",
      value: `${stats.avgProgress}%`,
      color: "from-accent-500 to-accent-600",
      bgColor: "bg-accent-500/10",
      textColor: "text-accent-600 dark:text-accent-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-theme-card rounded-2xl p-5 border border-theme shadow-theme-sm hover:shadow-theme-md transition-shadow animate-fade-in"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.textColor}`}>
              <span className="text-sm font-bold">{typeof stat.value === "number" ? "#" : "%"}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-theme-primary">{stat.value}</div>
          <div className="text-xs font-medium text-theme-muted mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
