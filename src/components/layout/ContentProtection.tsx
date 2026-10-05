"use client";

import { useEffect } from "react";

/**
 * Raises the bar for casually copying the site: no right-click menu, no text
 * selection or copying, no drag-out of images, and the usual keyboard routes
 * to the inspector and to view-source are swallowed. Clicks, links, buttons
 * and form fields work as normal, and typing into (or copying out of) an
 * input is left alone so checkout and search still behave.
 *
 * This is a deterrent, not a lock: anything a browser has downloaded can still
 * be read by someone determined (the browser menu, `view-source:`, another
 * device, scripting off). Nothing secret may depend on it; keys and prices stay
 * server-side. Rendered only when `NEXT_PUBLIC_ALLOW_INSPECT` is not "1" (see the root
 * layout), together with the `data-protect` attribute the CSS keys off.
 */

const EDITABLE = "input, textarea, select, [contenteditable='true'], [contenteditable='']";

function inEditable(node: EventTarget | null): boolean {
  const el = node instanceof Element ? node : node instanceof Node ? node.parentElement : null;
  return Boolean(el?.closest(EDITABLE));
}

export function ContentProtection() {
  useEffect(() => {
    const block = (event: Event) => event.preventDefault();

    const onContextMenu = block;
    const onDragStart = block;

    const onSelectStart = (event: Event) => {
      if (!inEditable(event.target)) event.preventDefault();
    };

    const onCopyCut = (event: Event) => {
      if (!inEditable(event.target)) event.preventDefault();
    };

    // Belt and braces for engines that still manage to select something.
    const onSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      if (!inEditable(selection.anchorNode)) selection.removeAllRanges();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;

      const inspector =
        event.key === "F12" ||
        (mod && event.shiftKey && ["i", "j", "c", "k"].includes(key)) ||
        (mod && event.altKey && ["i", "j", "c", "u"].includes(key));
      const source = mod && ["u", "s"].includes(key);
      const copy = mod && ["c", "x", "a"].includes(key) && !inEditable(event.target);

      if (inspector || source || copy) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("dragstart", onDragStart, true);
    document.addEventListener("selectstart", onSelectStart, true);
    document.addEventListener("copy", onCopyCut, true);
    document.addEventListener("cut", onCopyCut, true);
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("selectstart", onSelectStart, true);
      document.removeEventListener("copy", onCopyCut, true);
      document.removeEventListener("cut", onCopyCut, true);
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
