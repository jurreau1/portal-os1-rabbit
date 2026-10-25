import { afterEach, expect, it, vi } from "vitest";
import { createId } from "../engine/id";
afterEach(() => vi.unstubAllGlobals());
it("uses the native UUID implementation when available", () => {
  const randomUUID = vi.fn(() => "d884e41c-d793-4af0-a42d-c76f315f689b");
  vi.stubGlobal("crypto", { randomUUID });
  expect(createId()).toBe("d884e41c-d793-4af0-a42d-c76f315f689b");
  expect(randomUUID).toHaveBeenCalledOnce();
});
it("creates an RFC 9562 version 4 UUID without randomUUID", () => {
  vi.stubGlobal("crypto", {
    getRandomValues: (bytes: Uint8Array) => {
      bytes.forEach((_, i) => {
        bytes[i] = i;
      });
      return bytes;
    },
  });
  expect(createId()).toBe("00010203-0405-4607-8809-0a0b0c0d0e0f");
});
