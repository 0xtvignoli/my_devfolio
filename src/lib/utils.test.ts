import { describe, expect, test } from "bun:test";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn (className merger)", () => {
    test("merges class names correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    test("handles conditional classes", () => {
      expect(cn("px-2", false && "py-2", "text-white")).toBe("px-2 text-white");
    });

    test("handles undefined and null", () => {
      expect(cn("px-2", undefined, null, "py-1")).toBe("px-2 py-1");
    });

    test("handles empty input", () => {
      expect(cn()).toBe("");
    });
  });
});

