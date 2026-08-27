"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

type Props = {
  role: "admin" | "lecturer" | "student";
};

export default function Sidebar({ role }: Props) {
  const pathname = usePathname();

  const menu = {
    admin: [
      { name: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
      { name: "Users", icon: "group", path: "/admin/users" },
      { name: "Courses", icon: "school", path: "/admin/courses" },
    ],

    lecturer: [
      { name: "Dashboard", icon: "dashboard", path: "/lecturer/dashboard" },
      { name: "Assignments", icon: "assignment", path: "/lecturer/assignments" },
    ],

    student: [
      { name: "Dashboard", icon: "dashboard", path: "/student/dashboard" },
      { name: "My Learning", icon: "school", path: "/student/courses" },
      { name: "Assignments", icon: "assignment", path: "/student/assignments" },
    ],
  };

  const items = menu[role];
  const isLecturer = role === "lecturer";
  const isStudent = role === "student";

  // ✅ Chiều cao taskbar/topbar: h-16 = 64px
  // Nếu header của bạn cao khác, đổi 2 chỗ này:
  // - top-16
  // - h-[calc(100vh-64px)]
  return (
    <aside
      className={[
        // ✅ Đẩy xuống dưới header để không bị đè
        "hidden md:flex w-64 fixed left-0 top-16 flex-col py-6",
        // ✅ Trừ chiều cao header khỏi chiều cao sidebar
        "h-[calc(100vh-64px)]",
        isStudent ? "border-r border-slate-200 bg-slate-50" : "",
        // ✅ lecturer theo hình: nền trắng sạch
        isLecturer ? "bg-white" : "bg-slate-50",
      ].join(" ")}
    >
      {isStudent ? (
        <div className="mb-8 px-4">
          <div className="mb-1 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                school
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight text-slate-900">
                Student Portal
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Learning Hub
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <span className="material-symbols-outlined">school</span>
          </div>

          <div>
            <h1 className="text-lg font-black text-gray-900">
              Academic Curator
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Enterprise Learning
            </p>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav
        className={[
          "flex-1",
          // lecturer theo hình: padding giống “gọn”
          isLecturer
            ? "px-6 space-y-2"
            : isStudent
              ? "px-4 space-y-1"
              : "px-2 space-y-1",
        ].join(" ")}
      >
        {items.map((item) => {
          const active = pathname === item.path;

          // ✅ lecturer style theo hình
          if (isLecturer) {
            return (
              <Link
                key={item.path}
                href={item.path}
                className={[
                  "w-full flex items-center gap-3",
                  "rounded-full px-4 py-2.5",
                  "text-[12px] font-semibold uppercase tracking-[0.14em]",
                  "transition-colors",
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "material-symbols-outlined text-[20px]",
                    active ? "text-indigo-700" : "text-slate-400",
                  ].join(" ")}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          }

          if (isStudent) {
            return (
              <Link
                key={item.path}
                href={item.path}
                className={
                  active
                    ? "flex items-center gap-3 rounded-xl bg-indigo-100 p-3 text-sm font-medium text-indigo-700 shadow-sm"
                    : "flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          }

          // ✅ admin/student giữ nguyên UI cũ của bạn
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`mx-2 px-4 py-3 flex items-center gap-3 rounded-full text-sm transition
              ${
                active
                  ? "bg-indigo-100 text-indigo-700 font-semibold"
                  : "text-gray-700 hover:bg-slate-200"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom - giữ nguyên */}
      <div
        className={[
          "mt-auto space-y-1 pt-4",
          isStudent ? "px-4" : "px-2 border-t",
        ].join(" ")}
      >
        <Link
          href={`/${role}/settings`}
          className={
            isStudent
              ? "flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
              : "mx-2 flex items-center gap-3 rounded-full px-4 py-3 text-sm text-gray-700 hover:bg-slate-200"
          }
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>

        <button
          onClick={() => logout()}
          className={
            isStudent
              ? "flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              : "mx-2 flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          }
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}