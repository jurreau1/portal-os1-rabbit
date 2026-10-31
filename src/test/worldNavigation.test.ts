import { describe, expect, it } from "vitest";

import { teleportTo } from "../world/navigation/teleport";
import { useWorldState } from "../world/core/WorldState";

describe("District Navigation", () => {
  it("teleports to games", () => {
    teleportTo("games");
    expect(useWorldState.getState().currentDistrict).toBe("games");
  });

  it("teleports to apps", () => {
    teleportTo("apps");
    expect(useWorldState.getState().currentDistrict).toBe("apps");
  });
});
