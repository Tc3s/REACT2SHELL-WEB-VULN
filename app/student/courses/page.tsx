import Link from "next/link";
import { getStudentCourses } from "@/lib/actions/student";
import { connection } from "next/server";

export default async function StudentCoursesPage() {
  await connection();
  const courses = await getStudentCourses();

  // Supplementary curriculum metadata for authentic academic portal feel
  const courseDetails = [
    {
      code: "PHY-402",
      title: "Advanced Quantum Mechanics & Field Theory",
      credits: 4.0,
      term: "Fall Semester 2026",
      instructor: "Dr. Julian Vance",
      instructorRole: "Chair of Quantum Information",
      schedule: "Mon, Wed 10:00 - 11:30 AM",
      location: "Dirac Hall, Rm 304",
      syllabus: [
        "Module 1: Mathematical Foundations of Hilbert Space",
        "Module 2: Spin Systems & Non-Locality",
        "Module 3: Path Integral Formulation",
        "Module 4: Quantum Entanglement & Bell Inequality",
      ],
      materials: [
        { name: "Syllabus_PHY402_Fall2026.pdf", size: "1.2 MB", type: "PDF" },
        { name: "Lecture_01_Mathematical_Foundations.pdf", size: "4.8 MB", type: "PDF" },
        { name: "Bell_Inequality_Simulation_Kit.zip", size: "18.5 MB", type: "Archive" },
      ],
    },
    {
      code: "CSC-301",
      title: "Distributed Systems & Cloud Computing",
      credits: 3.5,
      term: "Fall Semester 2026",
      instructor: "Prof. Elena Lopez",
      instructorRole: "Associate Professor of Computer Science",
      schedule: "Tue, Thu 01:00 - 02:30 PM",
      location: "Turing Lab, Station 12",
      syllabus: [
        "Module 1: Consensus Protocols (Paxos, Raft)",
        "Module 2: CAP Theorem & Consistency Models",
        "Module 3: RPC Architecture & Microservices",
        "Module 4: Distributed Storage & PostgreSQL Sharding",
      ],
      materials: [
        { name: "Syllabus_CSC301_Fall2026.pdf", size: "980 KB", type: "PDF" },
        { name: "Distributed_Consensus_Lab_Guide.pdf", size: "3.1 MB", type: "PDF" },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header Banner */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-10 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">
              <span className="material-symbols-outlined text-sm">school</span>
              Academic Registry • Fall 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
              Curriculum & Course Hub
            </h1>
            <p className="text-slate-400 text-base max-w-xl">
              Access enrolled academic modules, downloadable lecture resources, syllabus schedules, and faculty contacts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/60 text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Credits</div>
              <div className="text-2xl font-black text-indigo-400">7.5 <span className="text-xs text-slate-400 font-medium">/ 18.0 Max</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* Courses List */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">menu_book</span>
            Active Enrolled Courses ({courses.length > 0 ? courses.length : courseDetails.length})
          </h2>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Term Status: Enrolled & Active
          </span>
        </div>

        <div className="space-y-8">
          {courseDetails.map((c, index) => (
            <div
              key={c.code}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-xl hover:border-indigo-100"
            >
              {/* Course Top Info */}
              <div className="p-8 md:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-mono font-bold text-sm shadow-sm">
                      {c.code}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {c.credits} Credits • {c.term}
                    </span>
                  </div>
                  
                  <Link
                    href="/student/assignments"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors self-start md:self-auto"
                  >
                    <span className="material-symbols-outlined text-base">assignment</span>
                    View Course Assignments
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                  {c.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-base">person</span>
                    <span><strong>Instructor:</strong> {c.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-base">schedule</span>
                    <span><strong>Schedule:</strong> {c.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500 text-base">location_on</span>
                    <span><strong>Location:</strong> {c.location}</span>
                  </div>
                </div>
              </div>

              {/* Course Syllabus & Materials Grid */}
              <div className="p-8 md:p-10 grid md:grid-cols-12 gap-8">
                {/* Syllabus Modules */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-indigo-500">list_alt</span>
                    Curriculum Syllabus & Objectives
                  </h4>
                  <div className="space-y-2.5">
                    {c.syllabus.map((mod, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Downloads & Resources */}
                <div className="md:col-span-5 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-indigo-500">download</span>
                    Lecture Slides & Resources
                  </h4>
                  <div className="space-y-2.5">
                    {c.materials.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="material-symbols-outlined text-indigo-500 text-xl group-hover:scale-110 transition-transform">
                            {m.type === "PDF" ? "picture_as_pdf" : "folder_zip"}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-slate-800 text-xs block truncate">{m.name}</span>
                            <span className="text-[10px] text-slate-400">{m.size} • {m.type}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold text-[11px] transition-colors shrink-0 shadow-sm"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
