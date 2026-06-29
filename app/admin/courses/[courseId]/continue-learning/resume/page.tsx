import { notFound } from "next/navigation";

import CourseResumeJourneyPage from "@/components/courses/continue-learning/resume-journey/CourseResumeJourneyPage";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string };

export default async function CourseResumeJourneyRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) notFound();

  return <CourseResumeJourneyPage courseId={courseId} />;
}
