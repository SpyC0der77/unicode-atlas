"use client"

import { useState, useEffect, useMemo } from "react"
import { Github, Star } from "lucide-react"
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
  type UnicodeCharacter,
} from "@/lib/unicode-data"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState<UnicodeCharacter | null>(null)
  const [characterModalOpen, setCharacterModalOpen] = useState(false)
  const [drawingModalOpen, setDrawingModalOpen] = useState(false)
  const [drawnCharacters, setDrawnCharacters] = useState<string[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<Set<number>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [starCount, setStarCount] = useState<number | null>(null)
  const searchParams = useSearchParams()

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
    
    return result
  }, [selectedCategories, searchQuery, drawnCharacters, selectedCharacters])

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

  const handleSelectAllVisible = () => {
    const visibleCodePoints = new Set(characters.map((c) => c.codePoint))
    setSelectedCharacters(visibleCodePoints)
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

  return (
    <main className="h-screen flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Unicode Atlas</h1>
        <div className="flex items-center gap-4">
          {drawnCharacters.length > 0 && (
            <button
              onClick={() => setDrawnCharacters([])}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear drawing results
            </button>
          )}
          <a
            href="https://github.com/SpyC0der77/unicode-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            aria-label="GitHub repository"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
            {starCount !== null && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{starCount.toLocaleString()}</span>
              </span>
            )}
          </a>
        </div>
      </div>
      
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onDrawClick={() => setDrawingModalOpen(true)}
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
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
