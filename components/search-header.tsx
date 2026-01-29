"use client"

import { Search, Pencil, CheckSquare, Square, Github, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onDrawClick: () => void
  selectionMode?: boolean
  onToggleSelectionMode?: () => void
  starCount?: number | null
  onClearDrawing?: () => void
  hasDrawingResults?: boolean
  searchInputRef?: React.Ref<HTMLInputElement>
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  onDrawClick,
  selectionMode = false,
  onToggleSelectionMode,
  starCount,
  onClearDrawing,
  hasDrawingResults = false,
  searchInputRef,
}: SearchHeaderProps) {
  return (
    <header className="border-b border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground shrink-0">Unicode Atlas</h1>
        
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search characters, code points..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onDrawClick}
            title="Draw to search"
            disabled={selectionMode}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          {onToggleSelectionMode && (
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="icon"
              onClick={onToggleSelectionMode}
              title={selectionMode ? "Exit selection mode" : "Select multiple characters"}
            >
              {selectionMode ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {hasDrawingResults && onClearDrawing && (
            <button
              onClick={onClearDrawing}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear drawing results
            </button>
          )}
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <a
              href="https://github.com/SpyC0der77/unicode-detector"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
              {typeof starCount === "number" && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{starCount.toLocaleString()}</span>
                </span>
              )}
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
