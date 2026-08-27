import { connection } from "next/server";
import { getAdminCoursesWithStats } from "@/lib/actions/admin";
import CourseTable from "./CourseTable";

export default async function AdminCoursesPage() {
  await connection();
  const courses = await getAdminCoursesWithStats();

  const totalEnrollments = courses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const totalAssignments = courses.reduce((acc, c) => acc + c.assignmentCount, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-sm">school</span>
          Academic Curriculum Registry
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Course & Syllabus Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review institutional academic courses, student enrollments, syllabus modules and faculty assignments.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              Active Courses
            </span>
            <span className="text-3xl font-black text-slate-900">{courses.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              Total Enrollments
            </span>
            <span className="text-3xl font-black text-indigo-600">{totalEnrollments}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">groups</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              Published Assignments
            </span>
            <span className="text-3xl font-black text-purple-600">{totalAssignments}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">assignment</span>
          </div>
        </div>
      </div>

      {/* Course Table Component */}
      <CourseTable courses={courses} />
    </div>
  );
}
