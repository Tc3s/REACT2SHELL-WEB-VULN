import { notFound } from "next/navigation";

import CourseAssignmentsPage from "@/components/courses/assignments/CourseAssignmentsPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseAssignmentsRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return <CourseAssignmentsPage courseTitle={course.title} />;
}
