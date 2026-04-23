import { useEffect, useCallback } from "react";

type ModifierKey = "ctrlKey" | "shiftKey" | "altKey" | "metaKey";

interface KeyboardShortcutOptions {
  /**
   * The key to listen for (e.g., "s", " ", "Enter").
   * Case-insensitive.
   */
  key: string;
  /**
   * Which modifier keys must be held. Default: ["ctrlKey"] on non-mac, ["metaKey"] on mac.
   * Pass an empty array to require no modifiers.
   * Pass specific modifiers to override default behavior.
   */
  modifiers?: ModifierKey[];
  /**
   * Called when the shortcut is triggered.
   */
  callback: () => void;
  /**
   * Whether the shortcut is active. Default: true.
   */
  enabled?: boolean;
  /**
   * Tag name filter — prevents firing on inputs, textareas, etc. Default: true.
   */
  ignoreOnFormElements?: boolean;
}

/**
 * Determines whether we're on a Mac for default modifier key selection.
 */
const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/**
 * Returns the default modifier key based on platform.
 */
const defaultModifier = (): ModifierKey =>
  isMac() ? "metaKey" : "ctrlKey";

/**
 * Registers a keyboard shortcut using keydown event listener.
 * Fires callback when all conditions are met.
 */
export function useKeyboardShortcut({
  key,
  modifiers,
  callback,
  enabled = true,
  ignoreOnFormElements = true,
}: KeyboardShortcutOptions) {
  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't fire if user is typing in an input/textarea/contenteditable
      if (ignoreOnFormElements) {
        const target = event.target as HTMLElement;
        const tagName = target?.tagName?.toLowerCase();
        const isFormElement =
          tagName === "input" ||
          tagName === "textarea" ||
          target?.isContentEditable;
        if (isFormElement) return;
      }

      const requiredModifiers = modifiers ?? [defaultModifier()];

      // Check all required modifiers are pressed
      const modifiersMatch = requiredModifiers.every(
        (mod) => event[mod] === true,
      );

      const keyMatches =
        event.key.toLowerCase() === key.toLowerCase() ||
        event.code.toLowerCase() === key.toLowerCase();

      if (modifiersMatch && keyMatches) {
        event.preventDefault();
        callback();
      }
    },
    [key, modifiers, callback, enabled, ignoreOnFormElements],
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler, enabled]);
}
