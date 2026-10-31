import { describe, expect, it } from "vitest";

import { useWorldMode } from "../state/worldMode";

describe("Portal World Bridge", () => {
  it("starts in portal mode", () => {
    const state = useWorldMode.getState();
    expect(state.worldEnabled).toBe(false);
  });

  it("enters world", () => {
    useWorldMode.getState().enterWorld();
    expect(useWorldMode.getState().worldEnabled).toBe(true);
  });

  it("returns to portal", () => {
    useWorldMode.getState().exitWorld();
    expect(useWorldMode.getState().worldEnabled).toBe(false);
  });
});
