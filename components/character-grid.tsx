"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { UnicodeCharacter } from "@/lib/unicode-data"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Check } from "lucide-react"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const scrollPositionRef = useRef<number>(0)
  const previousCharactersLengthRef = useRef<number>(characters.length)
  const visibleCountRef = useRef<number>(BATCH_SIZE)

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
    const currentVisibleCount = visibleCountRef.current
    
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

  const handleCopy = async (character: UnicodeCharacter, e: React.MouseEvent) => {
    e.stopPropagation()
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

  const visibleCharacters = characters.slice(0, visibleCount)
  const hasMore = visibleCount < characters.length

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
                  onClick={() => onSelectCharacter(character)}
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
