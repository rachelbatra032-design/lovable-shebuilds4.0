import { describe, it, expect, vi } from "vitest";
import { trackAgentTask } from "./agent-task";

describe("tracked handover agents", () => {
  it("records completed task results", async () => {
    const start = vi.fn().mockResolvedValue("run-1");
    const finish = vi.fn().mockResolvedValue(undefined);
    await expect(trackAgentTask("plan", { start, finish, execute: async () => "Draft — 4 gaps" })).resolves.toBe("Draft — 4 gaps");
    expect(start).toHaveBeenCalledWith("plan");
    expect(finish).toHaveBeenCalledWith("run-1", "completed", "Draft — 4 gaps");
  });
  it("records failures without reporting completion", async () => {
    const finish = vi.fn().mockResolvedValue(undefined);
    await expect(trackAgentTask("audit", { start: async () => "run-2", finish, execute: async () => { throw new Error("Permission denied"); } })).rejects.toThrow("Permission denied");
    expect(finish).toHaveBeenCalledWith("run-2", "failed", "Permission denied");
  });
  it("does not execute when run creation is denied", async () => {
    const execute = vi.fn();
    await expect(trackAgentTask("plan", { start: async () => { throw new Error("Forbidden"); }, execute, finish: vi.fn() })).rejects.toThrow("Forbidden");
    expect(execute).not.toHaveBeenCalled();
  });
});