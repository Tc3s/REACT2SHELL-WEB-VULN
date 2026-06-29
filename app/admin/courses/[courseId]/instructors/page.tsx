import { notFound } from "next/navigation";

import CourseInstructorsPage from "@/components/courses/instructors/CourseInstructorsPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseInstructorsRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return (
    <CourseInstructorsPage courseId={courseId} courseTitle={course.title} />
  );
}
