"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { UnicodeCharacter } from "@/lib/unicode-data"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Check } from "lucide-react"
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts"

interface CharacterGridProps {
  characters: UnicodeCharacter[]
  onSelectCharacter: (character: UnicodeCharacter) => void
  isLoading?: boolean
  selectionMode?: boolean
  selectedCodePoints?: Set<number>
  onToggleSelect?: (codePoint: number) => void
}

const BATCH_SIZE = 200
const LOAD_THRESHOLD = 300

export function CharacterGrid({ 
  characters, 
  onSelectCharacter, 
  isLoading,
  selectionMode = false,
  selectedCodePoints = new Set(),
  onToggleSelect,
}: CharacterGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [copiedCodePoint, setCopiedCodePoint] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const scrollPositionRef = useRef<number>(0)
  const previousCharactersLengthRef = useRef<number>(characters.length)
  const visibleCountRef = useRef<number>(BATCH_SIZE)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Keep ref in sync with state
  useEffect(() => {
    visibleCountRef.current = visibleCount
  }, [visibleCount])

  // Save scroll position continuously
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      scrollPositionRef.current = container.scrollTop
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle characters array changes - preserve scroll position when filtering
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const previousLength = previousCharactersLengthRef.current
    const currentLength = characters.length
    const savedScrollPosition = scrollPositionRef.current
    
    // Detect if this is likely a filter change (similar length, not a complete reset)
    const isLikelyFilterChange = previousLength > 0 && 
                                  currentLength > 0 &&
                                  Math.abs(currentLength - previousLength) < previousLength * 0.8 &&
                                  savedScrollPosition > 100

    if (isLikelyFilterChange) {
      // Preserve visible count for filtering - don't reset it
      // Restore scroll position after render using double RAF for better timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current && savedScrollPosition > 0) {
            containerRef.current.scrollTop = savedScrollPosition
          }
        })
      })
    } else {
      // Full reset - reset visible count and scroll to top
      setVisibleCount(BATCH_SIZE)
      scrollPositionRef.current = 0
      container.scrollTop = 0
    }

    previousCharactersLengthRef.current = currentLength
  }, [characters])

  const handleScroll = useCallback(() => {
    if (loadingRef.current) return
    
    const container = containerRef.current
    if (!container) return
    
    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    
    if (distanceFromBottom < LOAD_THRESHOLD && visibleCount < characters.length) {
      loadingRef.current = true
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, characters.length))
      setTimeout(() => {
        loadingRef.current = false
      }, 100)
    }
  }, [visibleCount, characters.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const handleCopy = async (character: UnicodeCharacter, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await navigator.clipboard.writeText(character.char)
      setCopiedCodePoint(character.codePoint)
      setTimeout(() => {
        setCopiedCodePoint(null)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const visibleCharacters = characters.slice(0, visibleCount)
  const hasMore = visibleCount < characters.length

  // Keyboard navigation shortcuts
  useKeyboardShortcuts(
    [
      {
        key: "ArrowRight",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (focusedIndex === null) {
            setFocusedIndex(0)
            buttonRefs.current[0]?.focus()
          } else if (focusedIndex < visibleCharacters.length - 1) {
            const newIndex = focusedIndex + 1
            setFocusedIndex(newIndex)
            buttonRefs.current[newIndex]?.focus()
          }
        },
        description: "Navigate right",
      },
      {
        key: "ArrowLeft",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (focusedIndex !== null && focusedIndex > 0) {
            const newIndex = focusedIndex - 1
            setFocusedIndex(newIndex)
            buttonRefs.current[newIndex]?.focus()
          }
        },
        description: "Navigate left",
      },
      {
        key: "ArrowDown",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          // Calculate grid columns based on screen size
          const getColumns = () => {
            if (typeof window === "undefined") return 6
            const width = window.innerWidth
            if (width >= 1280) return 14 // xl
            if (width >= 1024) return 12 // lg
            if (width >= 768) return 10 // md
            if (width >= 640) return 8 // sm
            return 6 // default
          }

          const cols = getColumns()
          if (focusedIndex === null) {
            setFocusedIndex(0)
            buttonRefs.current[0]?.focus()
          } else if (focusedIndex + cols < visibleCharacters.length) {
            const newIndex = focusedIndex + cols
            setFocusedIndex(newIndex)
            buttonRefs.current[newIndex]?.focus()
            // Scroll into view
            buttonRefs.current[newIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
          }
        },
        description: "Navigate down",
      },
      {
        key: "ArrowUp",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          const getColumns = () => {
            if (typeof window === "undefined") return 6
            const width = window.innerWidth
            if (width >= 1280) return 14
            if (width >= 1024) return 12
            if (width >= 768) return 10
            if (width >= 640) return 8
            return 6
          }

          const cols = getColumns()
          if (focusedIndex !== null && focusedIndex >= cols) {
            const newIndex = focusedIndex - cols
            setFocusedIndex(newIndex)
            buttonRefs.current[newIndex]?.focus()
            buttonRefs.current[newIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
          }
        },
        description: "Navigate up",
      },
      {
        key: "Enter",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (focusedIndex !== null && visibleCharacters[focusedIndex]) {
            onSelectCharacter(visibleCharacters[focusedIndex])
          }
        },
        description: "Select character",
      },
      {
        key: " ",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (focusedIndex !== null && visibleCharacters[focusedIndex]) {
            e.preventDefault()
            onSelectCharacter(visibleCharacters[focusedIndex])
          }
        },
        description: "Select character",
      },
      {
        key: "c",
        ctrlKey: true,
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (focusedIndex !== null && visibleCharacters[focusedIndex]) {
            handleCopy(visibleCharacters[focusedIndex])
          }
        },
        description: "Copy character",
      },
      {
        key: "Home",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (visibleCharacters.length > 0) {
            setFocusedIndex(0)
            buttonRefs.current[0]?.focus()
            buttonRefs.current[0]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
          }
        },
        description: "Go to first character",
      },
      {
        key: "End",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (visibleCharacters.length > 0) {
            const lastIndex = visibleCharacters.length - 1
            setFocusedIndex(lastIndex)
            buttonRefs.current[lastIndex]?.focus()
            buttonRefs.current[lastIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
          }
        },
        description: "Go to last character",
      },
    ],
    !selectionMode
  )

  // Reset focused index when characters change
  useEffect(() => {
    setFocusedIndex(null)
  }, [characters])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading characters...</div>
      </div>
    )
  }

  if (characters.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No characters found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Try a different search or select some filters
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {characters.length.toLocaleString()} characters {hasMore && `(showing ${visibleCount.toLocaleString()})`}
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2">
          {visibleCharacters.map((character, index) => {
            const isSelected = selectedCodePoints.has(character.codePoint)
            const isCopied = copiedCodePoint === character.codePoint
            return (
              <div
                key={`${character.codePoint}-${index}`}
                className={cn(
                  "relative aspect-square rounded-md group",
                  "bg-muted hover:bg-accent transition-colors",
                  selectionMode && isSelected && "!bg-primary/20"
                )}
              >
                {selectionMode && (
                  <div className="absolute top-1 left-1 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect?.(character.codePoint)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background/90"
                    />
                  </div>
                )}
                <button
                  ref={(el) => {
                    buttonRefs.current[index] = el
                  }}
                  onClick={() => onSelectCharacter(character)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => {
                    // Only clear focus if not moving to another button
                    setTimeout(() => {
                      if (!buttonRefs.current.some(ref => ref === document.activeElement)) {
                        setFocusedIndex(null)
                      }
                    }, 0)
                  }}
                  className={cn(
                    "w-full h-full flex items-center justify-center rounded-md",
                    "text-2xl text-foreground",
                    !selectionMode && "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  )}
                  title={`U+${character.codePoint.toString(16).toUpperCase().padStart(4, "0")}`}
                >
                  {character.char}
                </button>
                <button
                  onClick={(e) => handleCopy(character, e)}
                  className={cn(
                    "absolute top-1 right-1 z-10",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "p-1 rounded bg-background/90 hover:bg-background",
                    "shadow-sm border border-border/50",
                    isCopied && "opacity-100"
                  )}
                  title="Copy character"
                >
                  {isCopied ? (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
        {hasMore && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Scroll down to load more...
          </p>
        )}
      </div>
    </div>
  )
}
