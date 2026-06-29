import { notFound } from "next/navigation";

import ResourceDetailPage from "@/components/resources/ResourceDetailPage";
import { MOCK_RESOURCES } from "@/components/resources/mockData";

type Params = {
  resourceId: string;
};

export default async function ResourceDetailRoute({
  params,
}: {
  params: Promise<Params>;
}) {
  const { resourceId } = await params;
  const resource = MOCK_RESOURCES.find((item) => item.id === resourceId);

  if (!resource) notFound();

  return <ResourceDetailPage resource={resource} />;
}
