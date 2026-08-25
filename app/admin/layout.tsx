import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavBar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <TopNavbar role="admin" />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 ml-64 pt-20 p-8 bg-slate-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
