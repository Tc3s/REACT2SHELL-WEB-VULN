import { notFound } from "next/navigation";

import CourseNotesPage from "@/components/courses/notes/CourseNotesPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseNotesRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return <CourseNotesPage courseId={courseId} courseTitle={course.title} />;
}
