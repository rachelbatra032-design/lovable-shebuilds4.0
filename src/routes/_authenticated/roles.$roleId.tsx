import { createFileRoute } from "@tanstack/react-router";
import { RoleWorkspace } from "@/components/role/RoleWorkspace";

export const Route = createFileRoute("/_authenticated/roles/$roleId")({
  head: () => ({
    meta: [
      { title: "Role map — Kaimaaral" },
      { name: "description", content: "How this role works: tasks, decisions, people, tools and edge cases." },
      { property: "og:title", content: "Role map — Kaimaaral" },
      { property: "og:description", content: "How this role works: tasks, decisions, people, tools and edge cases." },
    ],
  }),
  component: RolePage,
});

function RolePage() {
  const { roleId } = Route.useParams();
  return <RoleWorkspace roleId={roleId} />;
}
