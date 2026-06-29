import { notFound } from "next/navigation";

import AssignmentWorkspacePage from "@/components/courses/assignments/workspace/AssignmentWorkspacePage";
import { getAssignmentWorkspaceById } from "@/components/courses/assignments/workspace/mockData";
import { getCourseById } from "@/components/courses/mockData";

type PageParams = { courseId: string; assignmentId: string };

export default async function CourseAssignmentWorkspaceRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { courseId, assignmentId } = await params;
  const course = getCourseById(courseId);
  const workspace = getAssignmentWorkspaceById(assignmentId);

  if (!course) notFound();
  if (!workspace) notFound();

  return (
    <AssignmentWorkspacePage
      assignmentId={assignmentId}
      backHref={`/admin/courses/${courseId}/assignments`}
    />
  );
}
