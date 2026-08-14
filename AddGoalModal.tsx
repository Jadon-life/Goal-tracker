"use client";

import { useState } from "react";
import { createGoal } from "@/lib/storage";

interface AddGoalModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const categories = [
  "Personal", "Health", "Career", "Education", "Finance",
  "Fitness", "Creative", "Travel", "Social", "Other",
];

export default function AddGoalModal({ onClose, onCreated }: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("medium");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enableReminders, setEnableReminders] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a goal title");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      createGoal({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        targetDate: targetDate || undefined,
      });
      onCreated();
    } catch {
      setError("Failed to create goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-theme-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in border border-theme">
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-xl font-bold text-theme-primary">Create New Goal</h2>
            <p className="text-sm text-theme-muted mt-1">Define what you want to achieve</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-hover transition-colors cursor-pointer text-theme-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-1.5">Goal title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish the project report"
              className="w-full px-4 py-2.5 rounded-xl bg-theme-tertiary border border-theme text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-theme-tertiary border border-theme text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-theme-tertiary border border-theme text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-theme-tertiary border border-theme text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-1.5">Target / Due date</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-theme-tertiary border border-theme text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>

          {targetDate && (
            <div className="bg-theme-tertiary rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="enableReminders" checked={enableReminders} onChange={(e) => setEnableReminders(e.target.checked)} className="rounded border-theme text-brand-500 focus:ring-brand-500" />
                <label htmlFor="enableReminders" className="text-sm font-medium text-theme-primary cursor-pointer">
                  Enable smart multi-day reminders
                </label>
              </div>
              <p className="text-xs text-theme-muted pl-6">
                Automatically creates reminders for the 3 days before the due date + the due day itself, at a random time between 9:00–17:00. You can edit the exact days and times later in the goal details.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-theme text-theme-secondary font-medium hover:bg-theme-hover transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium gradient-brand hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer">
              {submitting ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
