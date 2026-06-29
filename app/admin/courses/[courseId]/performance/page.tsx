import { notFound } from "next/navigation";

import CoursePerformancePage from "@/components/courses/performance/CoursePerformancePage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CoursePerformanceRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return (
    <CoursePerformancePage courseId={courseId} courseTitle={course.title} />
  );
}
