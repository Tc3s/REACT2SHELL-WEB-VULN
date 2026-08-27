"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireStudent() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "STUDENT") {
    throw new Error("Forbidden: Not a student");
  }
  return session.user.id;
}

export async function getStudentCourses() {
  const studentId = await requireStudent();

  let enrollments = await prisma.enrollment.findMany({
    where: { studentId },
  });

  if (enrollments.length === 0) {
    const courses = await prisma.course.findMany({ take: 2 });
    for (const course of courses) {
      await prisma.enrollment.create({
        data: {
          studentId,
          courseId: course.id,
        },
      });
    }
    enrollments = await prisma.enrollment.findMany({
      where: { studentId },
    });
  }

  const courseIds = enrollments.map((e) => e.courseId);
  const enrolledCourses = await prisma.course.findMany({
    where: {
      id: { in: courseIds },
    },
  });

  return enrolledCourses;
}

export async function getStudentAssignments(courseId?: string) {
  const studentId = await requireStudent();

  let courseIds = [courseId].filter(Boolean) as string[];
  if (courseIds.length === 0) {
    const enrollments = await prisma.enrollment.findMany({ where: { studentId } });
    courseIds = enrollments.map(e => e.courseId);
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      courseId: { in: courseIds }
    },
    orderBy: { dueDate: 'desc' }
  });

  return assignments;
}

export async function getAssignmentDetails(assignmentId: string) {
  const studentId = await requireStudent();

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!assignment) throw new Error("Assignment not found");

  const submissions = await prisma.submission.findMany({
    where: {
      assignmentId,
      studentId
    },
    orderBy: { submittedAt: 'desc' }
  });

  return { assignment, submissions };
}

export async function submitAssignment(assignmentId: string, fileUrl: string) {
  const studentId = await requireStudent();

  await prisma.submission.create({
    data: {
      assignmentId,
      studentId,
      fileUrl,
    }
  });

  revalidatePath(`/student/assignments/${assignmentId}`);
  return { success: true };
}
