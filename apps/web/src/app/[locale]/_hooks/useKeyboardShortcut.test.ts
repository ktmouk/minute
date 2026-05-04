import { cleanup } from "@testing-library/react";
import { renderHook, act } from "src/test-utils";
import { useKeyboardShortcut } from "./useKeyboardShortcut";

// Mock navigator.platform
const originalPlatform = navigator.platform;
const mockPlatform = (platform: string) => {
  Object.defineProperty(navigator, "platform", {
    value: platform,
    configurable: true,
  });
};

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  Object.defineProperty(navigator, "platform", {
    value: originalPlatform,
    configurable: true,
  });
});

describe("useKeyboardShortcut", () => {
  it("calls callback when Ctrl+S is pressed (non-Mac)", async () => {
    mockPlatform("Win32");
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardShortcut({ key: "s", callback }),
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls callback when Meta+S is pressed (Mac)", async () => {
    mockPlatform("MacIntel");
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardShortcut({ key: "s", callback }),
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does NOT call callback when S is pressed without modifiers", async () => {
    mockPlatform("Win32");
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardShortcut({ key: "s", callback }),
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does NOT call callback when Ctrl+Wrong is pressed", async () => {
    mockPlatform("Win32");
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardShortcut({ key: "s", callback }),
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "a",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does NOT fire inside an input element", async () => {
    mockPlatform("Win32");
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({ key: "s", callback, ignoreOnFormElements: true }),
    );

    act(() => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      });
      input.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("fires when disabled is false", async () => {
    mockPlatform("Win32");
    const callback = vi.fn();

    const { result, rerender } = renderHook(({ enabled }) =>
      useKeyboardShortcut({ key: "s", callback, enabled }),
    );

    rerender({ enabled: false });

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("respects empty modifiers array (no modifier required)", async () => {
    mockPlatform("Win32");
    const callback = vi.fn();

    renderHook(() =>
      useKeyboardShortcut({ key: "s", callback, modifiers: [] }),
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        bubbles: true,
      });
      window.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
