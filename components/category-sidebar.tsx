"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { UNICODE_CATEGORIES } from "@/lib/unicode-data"

interface CategoryFilterProps {
  selectedCategories: string[]
  onToggleCategory: (categoryId: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  selectedTypes: string[]
  onToggleType: (type: string) => void
}

const TYPE_OPTIONS = [
  { id: "characters", label: "Characters" },
  { id: "symbols", label: "Symbols" },
  { id: "numbers", label: "Numbers" },
  { id: "emojis", label: "Emojis" },
]

export function CategoryFilter({ 
  selectedCategories, 
  onToggleCategory,
  onSelectAll,
  onClearAll,
  selectedTypes,
  onToggleType,
}: CategoryFilterProps) {
  const allSelected = selectedCategories.length === UNICODE_CATEGORIES.length
  const noneSelected = selectedCategories.length === 0

  return (
    <div className="w-1/5 min-w-48 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="font-medium text-sm text-foreground">Filters</h2>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-4">
          {/* Type Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</h3>
            <div className="space-y-1">
              {TYPE_OPTIONS.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => onToggleType(type.id)}
                    className="border-muted-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                  />
                  <span className="text-sm text-foreground">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</h3>
              <div className="flex gap-2">
                <button
                  onClick={onSelectAll}
                  disabled={allSelected}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  All
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                  onClick={onClearAll}
                  disabled={noneSelected}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  None
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {UNICODE_CATEGORIES.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => onToggleCategory(category.id)}
                    className="border-muted-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                  />
                  <span className="text-sm text-foreground">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
