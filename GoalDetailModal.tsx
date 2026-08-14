"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Goal, Milestone, Reminder,
  getMilestonesForGoal, addMilestone, toggleMilestone, deleteMilestone,
  getRemindersForGoal, addReminder, updateReminder, deleteReminder,
  updateGoal, deleteGoal, generateDefaultReminders, saveReminders, getReminders,
} from "@/lib/storage";

interface GoalDetailModalProps {
  goal: Goal;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export default function GoalDetailModal({ goal, onClose, onUpdated, onDeleted }: GoalDetailModalProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newMilestone, setNewMilestone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDescription, setEditDescription] = useState(goal.description || "");
  const [editProgress, setEditProgress] = useState(goal.progress);
  const [editStatus, setEditStatus] = useState(goal.status);
  const [editTargetDate, setEditTargetDate] = useState(goal.targetDate || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"milestones" | "reminders">("milestones");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<number | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [reminderMessage, setReminderMessage] = useState("");

  const loadRelated = useCallback(() => {
    setMilestones(getMilestonesForGoal(goal.id));
    setReminders(
      getRemindersForGoal(goal.id).sort(
        (a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime()
      )
    );
  }, [goal.id]);

  useEffect(() => { loadRelated(); }, [loadRelated]);

  const handleSaveEdit = () => {
    updateGoal(goal.id, {
      title: editTitle.trim() || goal.title,
      description: editDescription,
      progress: Math.min(100, Math.max(0, editProgress)),
      status: editStatus,
      targetDate: editTargetDate,
    });
    setIsEditing(false);
    onUpdated();
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.trim()) return;
    addMilestone(goal.id, newMilestone.trim());
    setNewMilestone("");
    loadRelated();
    onUpdated();
  };

  const openAddReminder = () => {
    setEditingReminderId(null);
    setReminderDate("");
    setReminderTime("09:00");
    setReminderMessage(`Reminder for "${goal.title}"`);
    setShowReminderForm(true);
  };

  const openEditReminder = (r: Reminder) => {
    const t = new Date(r.reminderTime);
    setEditingReminderId(r.id);
    setReminderDate(t.toISOString().slice(0, 10));
    setReminderTime(`${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`);
    setReminderMessage(r.message);
    setShowReminderForm(true);
  };

  const handleSaveReminder = () => {
    if (!reminderDate || !reminderTime) return;
    const iso = new Date(`${reminderDate}T${reminderTime}:00`).toISOString();
    if (editingReminderId) {
      updateReminder(editingReminderId, { reminderTime: iso, message: reminderMessage });
    } else {
      addReminder({ goalId: goal.id, reminderTime: iso, message: reminderMessage || `Reminder for "${goal.title}"` });
    }
    setShowReminderForm(false);
    loadRelated();
  };

  const handleRegenerateReminders = () => {
    const date = editTargetDate || goal.targetDate;
    if (!date) return;
    const all = getReminders().filter((r) => r.goalId !== goal.id);
    const generated = generateDefaultReminders(goal.id, date, goal.title);
    let nextId = all.length === 0 ? 1 : Math.max(...getReminders().map((r) => r.id), 0) + 1;
    const withIds = generated.map((r) => ({ ...r, id: nextId++ }));
    saveReminders([...all, ...withIds]);
    loadRelated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-theme-card rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in border border-theme">
        <div className="sticky top-0 bg-theme-card/95 backdrop-blur border-b border-theme px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full text-xl font-bold bg-theme-tertiary border border-theme rounded-xl px-3 py-1.5 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
            ) : (
              <h2 className="text-xl font-bold text-theme-primary truncate">{goal.title}</h2>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">{goal.category}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${goal.priority === "high" ? "bg-red-500/10 text-red-500" : goal.priority === "low" ? "bg-slate-500/10 text-slate-500" : "bg-amber-500/10 text-amber-500"}`}>{goal.priority} priority</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-theme-tertiary text-theme-secondary capitalize">{goal.status}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-hover text-theme-muted cursor-pointer shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-theme-secondary">Progress</span>
              {isEditing ? (
                <input type="number" min={0} max={100} value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg bg-theme-tertiary border border-theme text-sm text-right" />
              ) : (
                <span className="text-sm font-bold">{goal.progress}%</span>
              )}
            </div>
            <div className="h-2.5 bg-theme-tertiary rounded-full overflow-hidden">
              <div className="h-full rounded-full gradient-brand transition-all" style={{ width: `${isEditing ? editProgress : goal.progress}%` }} />
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-theme-secondary">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-xl bg-theme-tertiary border border-theme text-theme-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-theme-secondary">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-theme-tertiary border border-theme text-theme-primary cursor-pointer">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-theme-secondary">Target date</label>
                  <input type="date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-theme-tertiary border border-theme text-theme-primary" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="px-4 py-2 rounded-xl text-sm font-medium text-white gradient-brand cursor-pointer">Save changes</button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-sm font-medium border border-theme text-theme-secondary cursor-pointer">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {goal.description && <p className="text-sm text-theme-secondary">{goal.description}</p>}
              {goal.targetDate && (
                <p className="text-sm text-theme-muted">
                  Due: {new Date(goal.targetDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-xl text-sm font-medium border border-theme text-theme-secondary hover:bg-theme-hover cursor-pointer">Edit goal</button>
                <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 cursor-pointer">Delete</button>
              </div>
            </>
          )}

          <div className="border-t border-theme pt-4">
            <div className="flex gap-1 mb-4 bg-theme-tertiary p-1 rounded-xl">
              <button onClick={() => setActiveTab("milestones")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "milestones" ? "bg-theme-card text-theme-primary shadow-sm" : "text-theme-muted"}`}>Milestones</button>
              <button onClick={() => setActiveTab("reminders")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === "reminders" ? "bg-theme-card text-theme-primary shadow-sm" : "text-theme-muted"}`}>Reminders</button>
            </div>

            {activeTab === "milestones" && (
              <div className="space-y-3">
                <form onSubmit={handleAddMilestone} className="flex gap-2">
                  <input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} placeholder="Add a milestone..." className="flex-1 px-3 py-2 rounded-xl bg-theme-tertiary border border-theme text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
                  <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white gradient-brand cursor-pointer">Add</button>
                </form>
                {milestones.length === 0 ? (
                  <p className="text-sm text-theme-muted text-center py-4">No milestones yet. Break your goal into smaller steps.</p>
                ) : (
                  <ul className="space-y-2">
                    {milestones.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-theme-tertiary group">
                        <button onClick={() => { toggleMilestone(m.id); loadRelated(); onUpdated(); }} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${m.completed ? "bg-brand-500 border-brand-500 text-white" : "border-theme-muted"}`}>
                          {m.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <span className={`flex-1 text-sm ${m.completed ? "line-through text-theme-muted" : "text-theme-primary"}`}>{m.title}</span>
                        <button onClick={() => { deleteMilestone(m.id); loadRelated(); onUpdated(); }} className="opacity-0 group-hover:opacity-100 text-theme-muted hover:text-red-500 cursor-pointer transition-opacity">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "reminders" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button onClick={openAddReminder} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white gradient-brand cursor-pointer">+ Add reminder</button>
                  {(goal.targetDate || editTargetDate) && (
                    <button onClick={handleRegenerateReminders} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-theme text-theme-secondary hover:bg-theme-hover cursor-pointer">
                      Regenerate default (3 days before + due day)
                    </button>
                  )}
                </div>
                <p className="text-xs text-theme-muted">Default reminders use a random time between 9:00–17:00. Edit any reminder to change its day or time.</p>

                {showReminderForm && (
                  <div className="bg-theme-tertiary rounded-xl p-4 space-y-3 border border-theme">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-theme-secondary">Date</label>
                        <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-theme-card border border-theme text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-theme-secondary">Time</label>
                        <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-theme-card border border-theme text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-theme-secondary">Message</label>
                      <input type="text" value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-theme-card border border-theme text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveReminder} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white gradient-brand cursor-pointer">{editingReminderId ? "Update" : "Save"}</button>
                      <button onClick={() => setShowReminderForm(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-theme cursor-pointer">Cancel</button>
                    </div>
                  </div>
                )}

                {reminders.length === 0 ? (
                  <p className="text-sm text-theme-muted text-center py-4">No reminders. Add a target date and regenerate, or create custom ones.</p>
                ) : (
                  <ul className="space-y-2">
                    {reminders.map((r) => {
                      const t = new Date(r.reminderTime);
                      const isPast = t.getTime() < Date.now();
                      return (
                        <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-theme-tertiary group">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.fired || isPast ? "bg-theme-hover text-theme-muted" : "bg-brand-500/15 text-brand-600"}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {t.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <p className="text-xs text-theme-muted truncate">{r.message}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditReminder(r)} className="p-1.5 rounded-lg hover:bg-theme-hover text-theme-muted cursor-pointer" title="Edit time / day">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => { deleteReminder(r.id); loadRelated(); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-theme-muted hover:text-red-500 cursor-pointer">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl p-6">
            <div className="bg-theme-card rounded-2xl p-6 max-w-sm w-full border border-theme shadow-xl">
              <h3 className="font-bold text-lg mb-2">Delete this goal?</h3>
              <p className="text-sm text-theme-muted mb-4">This will also remove all its milestones and reminders. This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl border border-theme text-sm font-medium cursor-pointer">Cancel</button>
                <button onClick={() => { deleteGoal(goal.id); onDeleted(); }} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
