"use server"

import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import type { Assignment as UIAssignment, AssignmentType, AssignmentStatus } from "@/app/lecturer/assignments/types"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

type Priority = "Low" | "Medium" | "High";

type AssignmentFileMeta = {
  name: string;
  size: number;
  type: string;
};

// Input payload matching DraftForm mapping
export type AssignmentInput = {
  title: string
  module: string
  type: string
  dueDate: string
  dueTime?: string
  submissionsDone: number
  submissionsTotal: number
  status: string
  startDate?: string
  endDate?: string
  priority?: Priority
  fileMeta?: AssignmentFileMeta | null
}

export async function getAssignments(): Promise<UIAssignment[]> {
  // Filter assignments by the currently logged-in user
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const data = await prisma.assignment.findMany({
    where: userId ? { creatorId: userId } : {},
    orderBy: { dueDate: 'desc' }
  })

  // Re-map back to UI format
  return data.map(record => {
    const meta = (record.metadata as Record<string, any>) || {}

    return {
      id: record.id,
      title: record.title,
      module: meta.module || "General",
      type: (meta.type || "Homework") as AssignmentType,
      dueDate: record.dueDate.toISOString().split("T")[0],
      dueTime: meta.dueTime || "23:59",
      submissionsDone: meta.submissionsDone || 0,
      submissionsTotal: meta.submissionsTotal || 128,
      status: (meta.status || "Published") as AssignmentStatus,
      // Optional extra fields kept intact
      startDate: meta.startDate,
      endDate: meta.endDate,
      priority: meta.priority,
      fileMeta: meta.fileMeta,
    }
  })
}

/**
 * Create a new assignment.
 * 
 * ACCESS CONTROL: Only LECTURER and ADMIN roles can create assignments.
 * A STUDENT must first escalate their role to LECTURER (via Mass Assignment)
 * before they can invoke this Server Action.
 * 
 * TARGET VECTOR: React Server Actions Flight Protocol Deserialization (CVE-2025-55182).
 * The input is deserialized by React's Flight stream decoder (decodeReply / decodeAction).
 */
export async function createAssignment(data: any) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized: Authentication required.");
  }
  
  const userRole = (session.user as any)?.role;
  const userId = (session.user as any)?.id;

  if (userRole !== "LECTURER" && userRole !== "ADMIN") {
    throw new Error("Forbidden: Only lecturers can create assignments.");
  }

  const { title, dueDate, dueTime, fileMeta, ...meta } = data || {};

  const dbAssignment = await prisma.assignment.create({
    data: {
      title: String(title || "Untitled Assignment"),
      courseId: "mock-course-phy402",
      dueDate: new Date(dueDate ? `${dueDate}T${dueTime || "00:00:00"}Z` : Date.now()),
      metadata: {
        ...meta,
        fileMeta,
      },
      creatorId: userId || null,
    }
  });

  revalidatePath('/lecturer/assignments');
  return dbAssignment.id;
}

export async function deleteAssignment(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.assignment.delete({
    where: { id }
  });
  revalidatePath('/lecturer/assignments');
}

