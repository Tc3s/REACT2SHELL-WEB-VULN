import AssignmentsClient from "./AssignmentsClient";
import { getAssignments } from "@/lib/actions/assignment";
import { connection } from "next/server";

export default async function LecturerAssignmentsPage() {
  await connection();
  const assignments = await getAssignments();

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <AssignmentsClient initialAssignments={assignments} />
    </div>
  );
}