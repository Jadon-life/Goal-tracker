"use client";

import { Reminder } from "@/lib/storage";

interface ReminderAlertOverlayProps {
  reminders: Reminder[];
  onDismiss: (id: number) => void;
  onDismissAll: () => void;
}

export default function ReminderAlertOverlay({ reminders, onDismiss, onDismissAll }: ReminderAlertOverlayProps) {
  if (reminders.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pointer-events-none">
      <div className="w-full max-w-md space-y-3 pointer-events-auto">
        {reminders.map((r, i) => (
          <div key={r.id} className="bg-theme-card border border-theme rounded-2xl shadow-2xl p-4 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-theme-primary text-sm">Reminder: {r.goalTitle || "Your goal"}</p>
                <p className="text-sm text-theme-secondary mt-0.5">{r.message}</p>
              </div>
              <button onClick={() => onDismiss(r.id)} className="p-1 rounded-lg hover:bg-theme-hover text-theme-muted cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {reminders.length > 1 && (
          <button onClick={onDismissAll} className="w-full py-2.5 rounded-xl bg-theme-tertiary text-sm font-medium text-theme-secondary hover:bg-theme-hover cursor-pointer">
            Dismiss all
          </button>
        )}
      </div>
    </div>
  );
}
