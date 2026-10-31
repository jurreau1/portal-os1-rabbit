import { describe, expect, it } from "vitest";

import { parseCommand } from "../command/engine/parser";

describe("World Commands", () => {
  it("parses world command", () => {
    const result = parseCommand("/world");

    expect(result?.action).toBe("world");
  });

  it("parses goto", () => {
    const result = parseCommand("/goto games");

    expect(result?.action).toBe("goto");
    expect(result?.target).toBe("games");
  });
});
