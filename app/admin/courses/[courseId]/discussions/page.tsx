import { notFound } from "next/navigation";

import CourseDiscussionsPage from "@/components/courses/discussions/CourseDiscussionsPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseDiscussionsRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return (
    <CourseDiscussionsPage courseId={courseId} courseTitle={course.title} />
  );
}
