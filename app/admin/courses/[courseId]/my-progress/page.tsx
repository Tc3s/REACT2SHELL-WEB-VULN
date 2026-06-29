import { notFound } from "next/navigation";

import CourseMyProgressPage from "@/components/courses/progress/CourseMyProgressPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseMyProgressRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return (
    <CourseMyProgressPage courseId={courseId} courseTitle={course.title} />
  );
}
