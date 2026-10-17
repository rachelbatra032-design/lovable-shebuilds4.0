import { expect, it } from "vitest";
import { isModuleLoadError, recoverModuleLoad } from "./module-recovery";

it("recognizes stale dynamic module failures without treating application errors as load errors", () => {
  expect(isModuleLoadError(new TypeError("Failed to fetch dynamically imported module: /src/routes/roles.tsx?t=123"))).toBe(true);
  expect(isModuleLoadError(new Error("destroy is not a function"))).toBe(false);
});
it("does not reload repeatedly when a module is still unavailable", () => {
  sessionStorage.setItem(`kaimaaral-module-recovery:${location.pathname}`, String(Date.now()));
  expect(recoverModuleLoad(new Error("Failed to fetch dynamically imported module"))).toBe(false);
  sessionStorage.clear();
});