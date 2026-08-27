"use client";

import { useState, useTransition } from "react";
import { createCourse } from "@/lib/actions/admin";
import Button from "@/components/ui/Button";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function CourseModal({ isOpen, onClose, onSuccess, onError }: CourseModalProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState("lecturer@elearning.com");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      onError("Please fill in course title and description.");
      return;
    }

    startTransition(async () => {
      try {
        const fullTitle = code.trim() ? `${title.trim()} (${code.trim()})` : title.trim();
        const courseId = code.trim() ? `course-${code.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}` : undefined;

        await createCourse({
          id: courseId,
          title: fullTitle,
          description: description.trim(),
          instructorId,
        });

        onSuccess("Course created successfully!");
        onClose();
        setTitle("");
        setCode("");
        setDescription("");
      } catch (err: any) {
        onError(err.message || "Failed to create course.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 sm:p-10 relative border border-slate-100 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-sm font-bold">close</span>
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Create New Course</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Add a new academic module to the curriculum registry</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Cloud Architecture"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CSC-301"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono text-slate-800 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Lead Instructor
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium text-slate-800 bg-white"
              >
                <option value="lecturer@elearning.com">lecturer@elearning.com (Faculty)</option>
                <option value="admin@elearning.com">admin@elearning.com (Admin)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a concise curriculum syllabus summary..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-800 resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <Button loading={isPending}>
              Create Course Module
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
