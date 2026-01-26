"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Copy, Download, Check, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ActionDropdown } from "@/components/action-dropdown"
import type { UnicodeCharacter } from "@/lib/unicode-data"
import {
  UNICODE_CATEGORIES,
  getCommonName,
} from "@/lib/unicode-data"
import { SIMILAR_CHARACTERS } from "@/lib/similar-characters"

interface CharacterModalProps {
  character: UnicodeCharacter | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectCharacter?: (character: UnicodeCharacter) => void
}

interface InfoRow {
  label: string
  value: string
  copyable: boolean
  link?: boolean
  displayValue?: string
}

export function CharacterModal({ character, open, onOpenChange, onSelectCharacter }: CharacterModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [wikipediaExists, setWikipediaExists] = useState<boolean | null>(null)
  const [similarCharacters, setSimilarCharacters] = useState<UnicodeCharacter[]>([])
  const currentCodePointRef = useRef<number | null>(null)
  const similarSearchedRef = useRef<number | null>(null)

  // Reset state when modal closes or character becomes null
  useEffect(() => {
    if (!character || !open) {
      currentCodePointRef.current = null
      similarSearchedRef.current = null
      setSimilarCharacters([])
    }
  }, [character, open])

  useEffect(() => {
    if (!character || !open) {
      return
    }

    // Only check if codePoint changed
    if (currentCodePointRef.current === character.codePoint) {
      return
    }

    currentCodePointRef.current = character.codePoint
    let cancelled = false

    const checkWikipediaArticle = async () => {
      const codePointHex = character.codePoint.toString(16).toUpperCase().padStart(4, "0")
      const articleTitle = `U+${codePointHex}`
      
      // Reset state at start of async operation
      if (!cancelled) {
        setWikipediaExists(null)
      }
      
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(articleTitle)}&origin=*`,
          { method: "GET" }
        )
        const data = await response.json()
        const pages = data.query?.pages || {}
        const pageId = Object.keys(pages)[0]
        // If pageId is -1, the page doesn't exist
        if (!cancelled) {
          setWikipediaExists(pageId !== "-1" && pageId !== undefined)
        }
      } catch {
        if (!cancelled) {
          setWikipediaExists(false)
        }
      }
    }

    checkWikipediaArticle()

    return () => {
      cancelled = true
    }
  }, [character, open])

  const createCharacterFromCodePoint = useCallback((codePoint: number): UnicodeCharacter => {
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
  }, [])

  const handleFindSimilar = useCallback(() => {
    if (!character) return

    // Look up pre-computed similar characters
    const similarCodePoints = SIMILAR_CHARACTERS[character.codePoint] || []

    // Convert codePoints to UnicodeCharacter objects
    const similarChars = similarCodePoints
      .map((codePoint) => {
        try {
          return createCharacterFromCodePoint(codePoint)
        } catch {
          return null
        }
      })
      .filter((char): char is UnicodeCharacter => char !== null)

    setSimilarCharacters(similarChars)
  }, [character, createCharacterFromCodePoint])

  // Automatically find similar characters when character changes
  useEffect(() => {
    if (!character || !open) {
      return
    }

    // Only search if we haven't searched for this character yet
    if (similarSearchedRef.current === character.codePoint) {
      return
    }

    similarSearchedRef.current = character.codePoint
    handleFindSimilar()
  }, [character, open, handleFindSimilar])

  if (!character) return null

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const downloadSvg = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <text x="50" y="70" fontSize="60" textAnchor="middle" fill="white">${character.char}</text>
</svg>`
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `unicode-${character.codePoint.toString(16).toUpperCase()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPng = (transparent: boolean) => {
    const canvas = document.createElement("canvas")
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    if (!transparent) {
      ctx.fillStyle = "#18181b"
      ctx.fillRect(0, 0, 200, 200)
      ctx.fillStyle = "#ffffff"
    } else {
      ctx.fillStyle = "#000000"
    }
    
    ctx.font = "120px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(character.char, 100, 100)
    
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    const suffix = transparent ? "-transparent" : ""
    a.download = `unicode-${character.codePoint.toString(16).toUpperCase()}${suffix}.png`
    a.click()
  }


  const codePointHex = character.codePoint.toString(16).toUpperCase().padStart(4, "0")
  const wikipediaUrl = `https://en.wikipedia.org/wiki/U+${codePointHex}`

  const infoRows: InfoRow[] = [
    { label: "Character", value: character.char, copyable: true },
    ...(character.commonName ? [{ label: "Common Name", value: character.commonName, copyable: false }] : []),
    { label: "Code Point", value: `U+${codePointHex}`, copyable: true },
    { label: "Decimal", value: character.codePoint.toString(), copyable: true },
    { label: "Category", value: character.category, copyable: false },
    { label: "Wikipedia", value: wikipediaUrl, displayValue: `U+${codePointHex}`, copyable: false, link: true },
  ]

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Character Details</DialogTitle>
          </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-center w-48 h-48 rounded-t-lg border-x border-t bg-muted">
              <span className="text-7xl text-foreground">{character.char}</span>
            </div>
            <div className="flex gap-2 justify-center px-4 py-3 w-48 rounded-b-lg border-x border-b bg-card shadow-sm">
              <Button variant="outline" size="sm" onClick={downloadSvg}>
                <Download className="w-4 h-4 mr-2" />
                SVG
              </Button>
              <ActionDropdown
                label="PNG"
                size="sm"
                actions={[
                  { label: "PNG", id: "png-solid" },
                  { label: "PNG (Transparent)", id: "png-transparent" },
                ]}
                onAction={(actionId) => {
                  if (actionId === "png-solid") {
                    downloadPng(false)
                  } else if (actionId === "png-transparent") {
                    downloadPng(true)
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {infoRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <div className="flex items-center gap-2">
                {row.link ? (
                  wikipediaExists === false ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-mono text-muted-foreground flex items-center gap-1 opacity-50 cursor-not-allowed">
                          <code>{row.displayValue || row.value}</code>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Wikipedia article does not exist</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <a
                      href={row.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-foreground hover:underline flex items-center gap-1"
                    >
                      <code>{row.displayValue || row.value}</code>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                ) : (
                  <>
                    <code className="text-sm font-mono text-foreground">{row.value}</code>
                    {row.copyable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(row.value, row.label)}
                      >
                        {copiedField === row.label ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {similarCharacters.length > 0 && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Similar Characters</h3>
            </div>
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {similarCharacters.map((similarChar) => (
                <button
                  key={similarChar.codePoint}
                  onClick={() => {
                    if (onSelectCharacter) {
                      onSelectCharacter(similarChar)
                    }
                  }}
                  className="aspect-square rounded-md bg-muted hover:bg-accent transition-colors flex items-center justify-center text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  title={`U+${similarChar.codePoint.toString(16).toUpperCase().padStart(4, "0")}`}
                >
                  {similarChar.char}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  )
}
