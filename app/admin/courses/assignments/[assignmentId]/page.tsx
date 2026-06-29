import { notFound } from "next/navigation";

import AssignmentWorkspacePage from "@/components/courses/assignments/workspace/AssignmentWorkspacePage";
import { getAssignmentWorkspaceById } from "@/components/courses/assignments/workspace/mockData";

type PageParams = { assignmentId: string };

export default async function AssignmentWorkspaceFallbackRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { assignmentId } = await params;
  const workspace = getAssignmentWorkspaceById(assignmentId);

  if (!workspace) notFound();

  return (
    <AssignmentWorkspacePage
      assignmentId={assignmentId}
      backHref="/admin/courses/assignments"
    />
  );
}
