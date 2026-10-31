import { describe, expect, it } from "vitest";

import { worldDistricts } from "../world/core/WorldProvider";

describe("District Registry", () => {
  it("contains unique ids", () => {
    const ids = worldDistricts.map((district) => district.id);
    const unique = new Set(ids);

    expect(unique.size).toBe(ids.length);
  });
});
