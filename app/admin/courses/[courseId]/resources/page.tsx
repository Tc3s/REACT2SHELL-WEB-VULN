import { notFound } from "next/navigation";

import CourseResourcesPage from "@/components/courses/resources/CourseResourcesPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseResourcesRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return <CourseResourcesPage courseTitle={course.title} />;
}
