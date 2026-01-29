"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { CategoryFilter } from "@/components/category-sidebar"
import { SearchHeader } from "@/components/search-header"
import { CharacterGrid } from "@/components/character-grid"
import { CharacterModal } from "@/components/character-modal"
import { DrawingModal } from "@/components/drawing-modal"
import { BulkExportToolbar } from "@/components/bulk-export-toolbar"
import {
  UNICODE_CATEGORIES,
  generateCharactersForCategory,
  searchCharacters,
  getCommonName,
  isCharacter,
  isNumber,
  isSymbol,
  isEmoji,
  type UnicodeCharacter,
} from "@/lib/unicode-data"
import { useSearchParams } from "next/navigation"
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts"

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["characters", "symbols", "numbers", "emojis"])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState<UnicodeCharacter | null>(null)
  const [characterModalOpen, setCharacterModalOpen] = useState(false)
  const [drawingModalOpen, setDrawingModalOpen] = useState(false)
  const [drawnCharacters, setDrawnCharacters] = useState<string[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<Set<number>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [starCount, setStarCount] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const createCharacterFromCodePoint = (codePoint: number): UnicodeCharacter => {
    const char = String.fromCodePoint(codePoint)
    const category = UNICODE_CATEGORIES.find(
      (c) => codePoint >= c.range[0] && codePoint <= c.range[1]
    )
    return {
      char,
      codePoint,
      name: `Unicode U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
      commonName: getCommonName(codePoint),
      category: category?.name || "Unknown",
      htmlEntity: `&#${codePoint};`,
      cssCode: `\\${codePoint.toString(16).toUpperCase()}`,
    }
  }

  const characters = useMemo(() => {
    let result: UnicodeCharacter[] = []
    
    // If we have drawn characters, show those
    if (drawnCharacters.length > 0) {
      result = drawnCharacters.map((char) => {
        const codePoint = char.codePointAt(0) || 0
        return createCharacterFromCodePoint(codePoint)
      })
    }
    // If there's a search query, search across selected categories (or all if none selected)
    else if (searchQuery.trim()) {
      result = searchCharacters(searchQuery, selectedCategories.length > 0 ? selectedCategories : null)
      
      // If we have selected characters and are searching, prepend selected ones not in results
      if (selectedCharacters.size > 0) {
        const resultCodePoints = new Set(result.map(c => c.codePoint))
        const selectedNotInResults: UnicodeCharacter[] = []
        
        for (const codePoint of selectedCharacters) {
          if (!resultCodePoints.has(codePoint)) {
            try {
              selectedNotInResults.push(createCharacterFromCodePoint(codePoint))
            } catch {
              // Skip invalid code points
            }
          }
        }
        
        result = [...selectedNotInResults, ...result]
      }
    }
    // Otherwise show characters from selected categories, or all categories if none selected
    else {
      const categoriesToShow = selectedCategories.length > 0 
        ? UNICODE_CATEGORIES.filter(c => selectedCategories.includes(c.id))
        : UNICODE_CATEGORIES
      
      for (const category of categoriesToShow) {
        result = result.concat(generateCharactersForCategory(category))
      }
    }
    
    // Apply type filter
    const emojisEnabled = selectedTypes.includes("emojis")
    const nonEmojiTypes = ["characters", "symbols", "numbers"]
    const selectedNonEmojiTypes = selectedTypes.filter(t => nonEmojiTypes.includes(t))
    
    // Separate emojis from other characters
    const emojiChars: UnicodeCharacter[] = []
    const nonEmojiChars: UnicodeCharacter[] = []
    
    for (const char of result) {
      if (isEmoji(char.codePoint)) {
        emojiChars.push(char)
      } else {
        nonEmojiChars.push(char)
      }
    }
    
    // Filter non-emoji characters by type
    let filteredResult: UnicodeCharacter[] = []
    if (selectedNonEmojiTypes.length === 0 || selectedNonEmojiTypes.length === 3) {
      // All non-emoji types selected or none selected - show all non-emoji chars
      filteredResult = nonEmojiChars
    } else {
      // Filter non-emoji characters by selected types
      filteredResult = nonEmojiChars.filter(char => {
        const codePoint = char.codePoint
        if (selectedTypes.includes("characters") && isCharacter(codePoint)) return true
        if (selectedTypes.includes("symbols") && isSymbol(codePoint)) return true
        if (selectedTypes.includes("numbers") && isNumber(codePoint)) return true
        return false
      })
    }
    
    // If emojis are enabled, add them back (emojis trump all other filters)
    if (emojisEnabled) {
      result = [...filteredResult, ...emojiChars]
    } else {
      result = filteredResult
    }
    
    return result
  }, [selectedCategories, selectedTypes, searchQuery, drawnCharacters, selectedCharacters])

  const handleSelectCharacter = (character: UnicodeCharacter) => {
    if (selectionMode) {
      setSelectedCharacters((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(character.codePoint)) {
          newSet.delete(character.codePoint)
        } else {
          newSet.add(character.codePoint)
        }
        return newSet
      })
    } else {
      setSelectedCharacter(character)
      setCharacterModalOpen(true)
    }
  }

  const handleToggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (prev) {
        // Clear selection when exiting selection mode
        setSelectedCharacters(new Set())
      }
      return !prev
    })
  }

  const handleClearSelection = () => {
    setSelectedCharacters(new Set())
  }

  const selectedCharactersList = useMemo(() => {
    return characters.filter((c) => selectedCharacters.has(c.codePoint))
  }, [characters, selectedCharacters])

  const handleDrawSearch = (chars: string[]) => {
    setDrawnCharacters(chars)
    setSearchQuery("")
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setDrawnCharacters([])
  }

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
    setDrawnCharacters([])
  }

  const handleSelectAll = () => {
    setSelectedCategories(UNICODE_CATEGORIES.map((c) => c.id))
    setDrawnCharacters([])
  }

  const handleClearAll = () => {
    setSelectedCategories([])
    setDrawnCharacters([])
  }

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
    setDrawnCharacters([])
  }

  useEffect(() => {
    const query = searchParams?.get("query")
    if (query) {
      setSearchQuery(query) 
    }
  }, [searchParams])

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch("https://api.github.com/repos/SpyC0der77/unicode-detector")
        if (response.ok) {
          const data = await response.json()
          setStarCount(data.stargazers_count)
        }
      } catch (error) {
        // Silently fail - star count is not critical
        console.error("Failed to fetch star count:", error)
      }
    }

    fetchStarCount()
  }, [])

  // Global keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: "k",
        ctrlKey: true,
        handler: () => {
          searchInputRef.current?.focus()
        },
        description: "Focus search",
      },
      {
        key: "/",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (!isInput) {
            searchInputRef.current?.focus()
            e.preventDefault()
          }
        },
        description: "Focus search",
      },
      {
        key: "s",
        ctrlKey: true,
        handler: () => {
          handleToggleSelectionMode()
        },
        description: "Toggle selection mode",
      },
      {
        key: "d",
        ctrlKey: true,
        handler: () => {
          if (!selectionMode) {
            setDrawingModalOpen(true)
          }
        },
        description: "Open drawing modal",
      },
      {
        key: "Escape",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"
          
          if (isInput && searchQuery) {
            // Clear search if Escape pressed in search input
            handleSearchChange("")
            searchInputRef.current?.blur()
          } else if (drawnCharacters.length > 0) {
            // Clear drawing results
            setDrawnCharacters([])
          } else if (selectionMode) {
            // Exit selection mode
            handleToggleSelectionMode()
          } else if (characterModalOpen) {
            // Close character modal (handled by Radix Dialog, but we can ensure it closes)
            setCharacterModalOpen(false)
          } else if (drawingModalOpen) {
            // Close drawing modal
            setDrawingModalOpen(false)
          }
        },
        description: "Close modals / Clear search / Exit selection mode",
      },
      {
        key: "a",
        ctrlKey: true,
        shiftKey: false,
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          
          if (selectionMode && !isInput) {
            // Select all visible characters in selection mode
            const allCodePoints = new Set(characters.map(c => c.codePoint))
            setSelectedCharacters(allCodePoints)
            e.preventDefault()
          }
          // If not in selection mode or in an input, let the default behavior happen (native Select All)
        },
        description: "Select all (in selection mode)",
      },
    ],
    !characterModalOpen && !drawingModalOpen
  )

  return (
    <main className="h-screen flex flex-col bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onDrawClick={() => setDrawingModalOpen(true)}
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        starCount={starCount}
        onClearDrawing={() => setDrawnCharacters([])}
        hasDrawingResults={drawnCharacters.length > 0}
        searchInputRef={searchInputRef}
      />
      
      {selectionMode && (
        <BulkExportToolbar
          selectedCharacters={selectedCharactersList}
          onClearSelection={handleClearSelection}
          totalCount={characters.length}
        />
      )}
      
      <div className="flex-1 flex overflow-hidden">
        <CategoryFilter
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <CharacterGrid
            characters={characters}
            onSelectCharacter={handleSelectCharacter}
            isLoading={false}
            selectionMode={selectionMode}
            selectedCodePoints={selectedCharacters}
            onToggleSelect={(codePoint) => {
              setSelectedCharacters((prev) => {
                const newSet = new Set(prev)
                if (newSet.has(codePoint)) {
                  newSet.delete(codePoint)
                } else {
                  newSet.add(codePoint)
                }
                return newSet
              })
            }}
          />
        </div>
      </div>
      
      <CharacterModal
        character={selectedCharacter}
        open={characterModalOpen}
        onOpenChange={setCharacterModalOpen}
        onSelectCharacter={(character) => {
          setSelectedCharacter(character)
          setCharacterModalOpen(true)
        }}
      />
      
      <DrawingModal
        open={drawingModalOpen}
        onOpenChange={setDrawingModalOpen}
        onSearch={handleDrawSearch}
      />
    </main>
  )
}
