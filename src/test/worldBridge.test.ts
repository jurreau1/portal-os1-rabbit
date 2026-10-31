import { beforeEach, describe, expect, it } from "vitest";

import { useWorldMode } from "../state/worldMode";
import { resetStores } from "./resetState";

describe("Portal World Bridge", () => {
  beforeEach(() => {
    resetStores();
  });

  it("starts in portal mode", () => {
    expect(useWorldMode.getState().worldEnabled).toBe(false);
  });

  it("enters world", () => {
    useWorldMode.getState().enterWorld();

    expect(useWorldMode.getState().worldEnabled).toBe(true);
  });

  it("returns to portal", () => {
    useWorldMode.getState().enterWorld();
    useWorldMode.getState().exitWorld();

    expect(useWorldMode.getState().worldEnabled).toBe(false);
  });

  it("completes world roundtrip", () => {
    useWorldMode.getState().enterWorld();

    expect(useWorldMode.getState().worldEnabled).toBe(true);

    useWorldMode.getState().exitWorld();

    expect(useWorldMode.getState().worldEnabled).toBe(false);
  });
});
