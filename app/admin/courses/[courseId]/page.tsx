import { notFound } from "next/navigation";

import CourseOverviewPage from "@/components/courses/overview/CourseOverviewPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function AdminCourseDetailsPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return <CourseOverviewPage course={course} />;
}
