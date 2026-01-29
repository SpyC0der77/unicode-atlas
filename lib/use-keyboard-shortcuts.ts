"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  preventDefault?: boolean
  handler: (e: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey === undefined ? true : shortcut.ctrlKey === (e.ctrlKey || e.metaKey)
        const metaMatch = shortcut.metaKey === undefined ? true : shortcut.metaKey === e.metaKey
        const shiftMatch = shortcut.shiftKey === undefined ? true : shortcut.shiftKey === e.shiftKey
        const altMatch = shortcut.altKey === undefined ? true : shortcut.altKey === e.altKey

        // For Ctrl/Cmd shortcuts, allow either ctrlKey or metaKey
        const ctrlOrMeta = shortcut.ctrlKey !== undefined && (e.ctrlKey || e.metaKey)
        const metaOnly = shortcut.metaKey !== undefined && e.metaKey
        const ctrlOnly = shortcut.ctrlKey !== undefined && !shortcut.metaKey && e.ctrlKey

        if (
          keyMatch &&
          (shortcut.ctrlKey === undefined ? true : ctrlOrMeta || metaOnly || ctrlOnly) &&
          (shortcut.metaKey === undefined ? true : metaMatch) &&
          shiftMatch &&
          altMatch
        ) {
          // Check if we're in an input/textarea/contenteditable
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || 
                         target.tagName === "TEXTAREA" || 
                         target.isContentEditable ||
                         target.closest("[contenteditable]")

          // Allow shortcuts even in inputs for most cases, but skip if it's a text input shortcut
          // (like Ctrl+K for search, which should work in inputs)
          if (isInput && shortcut.key.toLowerCase() !== "k" && shortcut.key.toLowerCase() !== "/") {
            // Skip shortcuts that conflict with text editing
            if (shortcut.key.toLowerCase() === "a" && shortcut.ctrlKey) {
              // Allow Ctrl+A (select all) in inputs
            } else if (shortcut.key.toLowerCase() !== "escape") {
              continue
            }
          }

          if (shortcut.preventDefault !== false) {
            e.preventDefault()
          }
          shortcut.handler(e)
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, enabled])
}
