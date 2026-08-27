"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized: Authentication required.");
  }
  
  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    throw new Error("Forbidden: Only admins can delete users.");
  }

  // Prevent admin from deleting themselves
  if (session.user.id === id) {
    throw new Error("Cannot delete your own admin account.");
  }

  await prisma.user.delete({
    where: { id }
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function createCourse(data: { id?: string; title: string; description: string; instructorId?: string }) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized: Authentication required.");
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    throw new Error("Forbidden: Only admins can create courses.");
  }

  if (!data.title || !data.description) {
    throw new Error("Title and description are required.");
  }

  const course = await prisma.course.create({
    data: {
      id: data.id || `course-${Date.now().toString(36)}`,
      title: data.title.trim(),
      description: data.description.trim(),
      instructorId: data.instructorId || "inst-faculty",
    }
  });

  revalidatePath('/admin/courses');
  return { success: true, course };
}

export async function deleteCourse(id: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized: Authentication required.");
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    throw new Error("Forbidden: Only admins can delete courses.");
  }

  await prisma.course.delete({
    where: { id }
  });

  revalidatePath('/admin/courses');
  return { success: true };
}

export async function getAdminCoursesWithStats() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized: Authentication required.");
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    throw new Error("Forbidden: Only admins can view courses registry.");
  }

  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' }
  });

  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const [enrolledCount, assignmentCount] = await Promise.all([
        prisma.enrollment.count({ where: { courseId: course.id } }),
        prisma.assignment.count({ where: { courseId: course.id } })
      ]);

      return {
        ...course,
        enrolledCount,
        assignmentCount
      };
    })
  );

  return coursesWithStats;
}
