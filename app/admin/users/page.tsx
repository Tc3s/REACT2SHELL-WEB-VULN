import UserTable from "../components/UserTable"
import { connection } from "next/server"
import { prisma } from "@/lib/prisma"

export default async function UsersPage() {
  await connection();
  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' }
  });

  const admins = users.filter(u => u.role === 'ADMIN');
  const lecturers = users.filter(u => u.role === 'LECTURER');
  const students = users.filter(u => u.role === 'STUDENT');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage students, lecturers and admins
          </p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-3 rounded-full flex items-center gap-2 hover:bg-indigo-700">
          <span className="material-symbols-outlined">
            person_add
          </span>
          Create User
        </button>
      </div>

      <div className="space-y-10">
        {admins.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500">shield_person</span>
              Administrators
            </h2>
            <UserTable users={admins} />
          </section>
        )}

        {lecturers.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500">school</span>
              Lecturers
            </h2>
            <UserTable users={lecturers} />
          </section>
        )}

        {students.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">person</span>
              Students
            </h2>
            <UserTable users={students} />
          </section>
        )}
      </div>
    </div>
  )
}