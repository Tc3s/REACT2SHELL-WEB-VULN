import { notFound } from "next/navigation";

import CourseContinueLearningPage from "@/components/courses/continue-learning/CourseContinueLearningPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseContinueLearningRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return (
    <CourseContinueLearningPage
      courseId={courseId}
      courseTitle={course.title}
    />
  );
}
