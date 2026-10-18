export type AgentTask = "plan" | "audit";

export async function trackAgentTask(task: AgentTask, actions: {
  start: (task: AgentTask) => Promise<string>;
  execute: () => Promise<string>;
  finish: (id: string, status: "completed" | "failed", summary: string) => Promise<void>;
}) {
  const id = await actions.start(task);
  try {
    const summary = await actions.execute();
    await actions.finish(id, "completed", summary);
    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent task failed.";
    await actions.finish(id, "failed", message);
    throw error;
  }
}