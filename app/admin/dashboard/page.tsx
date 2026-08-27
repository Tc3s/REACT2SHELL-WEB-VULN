import StatsCards from "../components/StatsCards"
import { connection } from "next/server"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  await connection();
  const [userCount, courseCount, submissionCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.submission.count(),
  ])

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 max-w-xl">
          Overview of your academic platform.
        </p>
      </div>

      <StatsCards 
        userCount={userCount} 
        courseCount={courseCount} 
        submissionCount={submissionCount} 
      />
    </div>
  )
}