"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { deleteCourse } from "@/lib/actions/admin";
import Toast from "@/components/ui/Toast";
import CourseModal from "./CourseModal";

export type AdminCourse = {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  enrolledCount: number;
  assignmentCount: number;
};

interface CourseTableProps {
  courses: AdminCourse[];
}

export default function CourseTable({ courses }: CourseTableProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewCourse, setViewCourse] = useState<AdminCourse | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"? This will remove all associated assignments and student enrollments.`)) return;

    startTransition(async () => {
      try {
        await deleteCourse(id);
        showToast(`Course "${title}" deleted successfully.`, "success");
      } catch (err: any) {
        showToast(err.message || "Failed to delete course.", "error");
      }
    });
  };

  const getCourseBadge = (title: string, index: number) => {
    const match = title.match(/\(([A-Z0-9-]+)\)/);
    const text = match ? match[1] : title.substring(0, 3).toUpperCase();
    const colors = [
      "bg-indigo-50 border-indigo-200/80 text-indigo-700",
      "bg-purple-50 border-purple-200/80 text-purple-700",
      "bg-emerald-50 border-emerald-200/80 text-emerald-700",
      "bg-cyan-50 border-cyan-200/80 text-cyan-700",
      "bg-amber-50 border-amber-200/80 text-amber-700",
    ];
    return { text, color: colors[index % colors.length] };
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => showToast(msg, "success")}
        onError={(msg) => showToast(msg, "error")}
      />

      {/* View Course Details Modal */}
      {viewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 relative border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewCourse(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-sm font-bold">close</span>
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-mono font-black text-xs shadow-md shadow-indigo-600/20">
                {viewCourse.title.match(/\(([A-Z0-9-]+)\)/)?.[1] || "COURSE"}
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">{viewCourse.title}</h3>
                <span className="text-xs font-mono text-slate-400">{viewCourse.id}</span>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Description</span>
                <p className="text-slate-700 font-medium leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                  {viewCourse.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Lead Instructor</span>
                  <p className="text-slate-800 font-bold">{viewCourse.instructorId}</p>
                </div>
                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Enrolled Students</span>
                  <p className="text-indigo-600 font-extrabold text-base">{viewCourse.enrolledCount} Students</p>
                </div>
              </div>

              <div>
                <span className="font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Published Assignments</span>
                <p className="text-purple-600 font-extrabold text-base">{viewCourse.assignmentCount} Assignments</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewCourse(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Search & Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course title, code or instructor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Add New Course
        </button>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Course Module
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Instructor
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                Enrollments
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                Assignments
              </th>
              <th className="px-6 py-5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 block">
                    search_off
                  </span>
                  <p className="text-xs font-bold">No academic courses found matching &quot;{search}&quot;</p>
                </td>
              </tr>
            ) : (
              filteredCourses.map((c, index) => {
                const badge = getCourseBadge(c.title, index);
                return (
                  <tr key={c.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-mono font-black text-[11px] shrink-0 shadow-sm ${badge.color}`}>
                          {badge.text}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 text-xs sm:text-sm">{c.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono line-clamp-1">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-semibold text-slate-700">{c.instructorId}</div>
                      <span className="text-[10px] text-slate-400 font-medium">Faculty Member</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                        <span className="material-symbols-outlined text-xs">group</span>
                        {c.enrolledCount}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs">
                        <span className="material-symbols-outlined text-xs">assignment</span>
                        {c.assignmentCount}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewCourse(c)}
                          className="w-8 h-8 rounded-full bg-slate-50 text-indigo-600 hover:text-white hover:bg-indigo-600 flex items-center justify-center transition-all shadow-sm"
                          title="View Course Details"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          disabled={isPending}
                          className="w-8 h-8 rounded-full bg-slate-50 text-rose-500 hover:text-white hover:bg-rose-500 flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
                          title="Delete Course"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
