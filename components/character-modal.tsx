"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Copy, Download, Check, ExternalLink, RefreshCw, Type } from "lucide-react"
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  const [similarCharactersLoading, setSimilarCharactersLoading] = useState(false)
  const [focusedSimilarIndex, setFocusedSimilarIndex] = useState<number | null>(null)
  const [selectedFont, setSelectedFont] = useState<string>("sans-serif")
  const [fontExportModalOpen, setFontExportModalOpen] = useState(false)
  const [fontToExport, setFontToExport] = useState<{ id: string; name: string; family: string } | null>(null)
  const currentCodePointRef = useRef<number | null>(null)
  const similarSearchedRef = useRef<number | null>(null)
  const similarButtonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const fonts = [
    { id: "sans-serif", name: "Sans Serif", family: "sans-serif" },
    { id: "serif", name: "Serif", family: "serif" },
    { id: "monospace", name: "Monospace", family: "monospace" },
    { id: "cursive", name: "Cursive", family: "cursive" },
    { id: "fantasy", name: "Fantasy", family: "fantasy" },
    { id: "system", name: "System", family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    { id: "georgia", name: "Georgia", family: "Georgia, serif" },
    { id: "times", name: "Times New Roman", family: "'Times New Roman', Times, serif" },
    { id: "courier", name: "Courier New", family: "'Courier New', Courier, monospace" },
    { id: "arial", name: "Arial", family: "Arial, sans-serif" },
    { id: "verdana", name: "Verdana", family: "Verdana, sans-serif" },
    { id: "helvetica", name: "Helvetica", family: "Helvetica, Arial, sans-serif" },
  ]

  // Reset state when modal closes or character becomes null
  useEffect(() => {
    if (!character || !open) {
      currentCodePointRef.current = null
      similarSearchedRef.current = null
      setSimilarCharacters([])
      setSimilarCharactersLoading(false)
      setFocusedSimilarIndex(null)
      setSelectedFont("sans-serif")
      setFontExportModalOpen(false)
      setFontToExport(null)
    }
  }, [character, open])

  // Keyboard shortcuts for modal
  useKeyboardShortcuts(
    [
      {
        key: "c",
        ctrlKey: true,
        handler: () => {
          if (character) {
            copyToClipboard(character.char, "Character")
          }
        },
        description: "Copy character",
      },
      {
        key: "Escape",
        handler: () => {
          onOpenChange(false)
        },
        description: "Close modal",
      },
      {
        key: "ArrowRight",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (similarCharacters.length > 0) {
            if (focusedSimilarIndex === null) {
              setFocusedSimilarIndex(0)
              similarButtonRefs.current[0]?.focus()
            } else if (focusedSimilarIndex < similarCharacters.length - 1) {
              const newIndex = focusedSimilarIndex + 1
              setFocusedSimilarIndex(newIndex)
              similarButtonRefs.current[newIndex]?.focus()
            }
          }
        },
        description: "Navigate similar characters right",
      },
      {
        key: "ArrowLeft",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (similarCharacters.length > 0 && focusedSimilarIndex !== null && focusedSimilarIndex > 0) {
            const newIndex = focusedSimilarIndex - 1
            setFocusedSimilarIndex(newIndex)
            similarButtonRefs.current[newIndex]?.focus()
          }
        },
        description: "Navigate similar characters left",
      },
      {
        key: "Enter",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (focusedSimilarIndex !== null && similarCharacters[focusedSimilarIndex] && onSelectCharacter) {
            onSelectCharacter(similarCharacters[focusedSimilarIndex])
          }
        },
        description: "Select focused similar character",
      },
      {
        key: " ",
        handler: (e) => {
          const target = e.target as HTMLElement
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
          if (isInput) return

          if (focusedSimilarIndex !== null && similarCharacters[focusedSimilarIndex] && onSelectCharacter) {
            e.preventDefault()
            onSelectCharacter(similarCharacters[focusedSimilarIndex])
          }
        },
        description: "Select focused similar character",
      },
    ],
    open && character !== null
  )

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

  const generateCharacterImage = useCallback((char: string): string => {
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""
    
    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 400, 400)
    
    // Black text
    ctx.fillStyle = "#000000"
    ctx.font = "240px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(char, 200, 200)
    
    // Convert to base64 data URL
    return canvas.toDataURL("image/png")
  }, [])

  const computeSimilarViaAPI = useCallback(async (forceRecompute: boolean = false) => {
    if (!character) return

    const currentCodePoint = character.codePoint

    // If not forcing recompute, check pre-computed similar characters first
    if (!forceRecompute) {
      const precomputedCodePoints = SIMILAR_CHARACTERS[currentCodePoint]
      
      if (precomputedCodePoints !== undefined) {
        // Use precomputed data
        const similarChars = precomputedCodePoints
          .map((codePoint) => {
            try {
              return createCharacterFromCodePoint(codePoint)
            } catch {
              return null
            }
          })
          .filter((char): char is UnicodeCharacter => char !== null)
        
        // Only update if still the same character
        if (currentCodePointRef.current === currentCodePoint) {
          setSimilarCharacters(similarChars)
        }
        return
      }
    }

    // Call API to compute similar characters
    if (currentCodePointRef.current === currentCodePoint) {
      setSimilarCharactersLoading(true)
    }
    
    try {
      const imageData = generateCharacterImage(character.char)
      
      const response = await fetch("/api/recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      const unicodeChars: string[] = data.characters || []

      // Convert character strings to codePoints, skip the first (it's the character itself)
      const similarCodePoints = unicodeChars
        .slice(1)
        .map((char) => char.codePointAt(0))
        .filter((cp): cp is number => cp !== undefined && cp !== currentCodePoint) // Filter out undefined and self

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

      // Only update if still the same character
      if (currentCodePointRef.current === currentCodePoint) {
        setSimilarCharacters(similarChars)
      }
    } catch (error) {
      console.error("Error finding similar characters:", error)
      // Only update if still the same character
      if (currentCodePointRef.current === currentCodePoint) {
        setSimilarCharacters([])
      }
    } finally {
      // Only update loading state if still the same character
      if (currentCodePointRef.current === currentCodePoint) {
        setSimilarCharactersLoading(false)
      }
    }
  }, [character, createCharacterFromCodePoint, generateCharacterImage])

  const handleFindSimilar = useCallback(async () => {
    await computeSimilarViaAPI(false)
  }, [computeSimilarViaAPI])

  const handleRecomputeSimilar = useCallback(async () => {
    if (!character) return
    // Reset the searched ref so it will recompute
    similarSearchedRef.current = null
    // Force recompute via API
    await computeSimilarViaAPI(true)
  }, [character, computeSimilarViaAPI])

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

  const downloadPng = (transparent: boolean, fontFamily?: string) => {
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
    
    ctx.font = `120px ${fontFamily || "sans-serif"}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(character.char, 100, 100)
    
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    const suffix = transparent ? "-transparent" : ""
    const fontSuffix = fontFamily ? `-${fontFamily.split(",")[0].trim().replace(/'/g, "").replace(/\s+/g, "-").toLowerCase()}` : ""
    a.download = `unicode-${character.codePoint.toString(16).toUpperCase()}${fontSuffix}${suffix}.png`
    a.click()
  }

  const downloadSvgWithFont = (fontFamily: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <text x="50" y="70" fontSize="60" textAnchor="middle" fill="white" fontFamily="${fontFamily.replace(/'/g, "&apos;")}">${character.char}</text>
</svg>`
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const fontSuffix = fontFamily.split(",")[0].trim().replace(/'/g, "").replace(/\s+/g, "-").toLowerCase()
    a.download = `unicode-${character.codePoint.toString(16).toUpperCase()}-${fontSuffix}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFontClick = (font: { id: string; name: string; family: string }) => {
    setFontToExport(font)
    setFontExportModalOpen(true)
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
              <span 
                className="text-7xl text-foreground"
                style={{ fontFamily: fonts.find(f => f.id === selectedFont)?.family || "sans-serif" }}
              >
                {character.char}
              </span>
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

        <Accordion type="multiple" defaultValue={["info"]} className="w-full">
          <AccordionItem value="info">
            <AccordionTrigger className="text-sm font-semibold">Information</AccordionTrigger>
            <AccordionContent>
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
                            <TooltipContent side="left">
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="font-preview">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                Font Preview
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={(e) => {
                      if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        setSelectedFont(font.id)
                      } else {
                        handleFontClick(font)
                      }
                    }}
                    className={`p-3 rounded-md border transition-colors text-left ${
                      selectedFont === font.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/50 hover:bg-muted"
                    }`}
                    title="Click to export • Shift/Ctrl+Click to preview"
                  >
                    <div className="text-xs text-muted-foreground mb-1 truncate" title={font.name}>
                      {font.name}
                    </div>
                    <div
                      className="text-2xl text-foreground"
                      style={{ fontFamily: font.family }}
                    >
                      {character.char}
                    </div>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {(similarCharacters.length > 0 || similarCharactersLoading) && (
            <AccordionItem value="similar-characters">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  Similar Characters
                  {similarCharactersLoading && (
                    <span className="text-xs text-muted-foreground font-normal">Loading...</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleRecomputeSimilar}
                          disabled={similarCharactersLoading || !character}
                        >
                          <RefreshCw className={`w-3 h-3 ${similarCharactersLoading ? "animate-spin" : ""}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Recompute similar characters</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {similarCharactersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-muted-foreground">Searching for similar characters...</div>
                    </div>
                  ) : similarCharacters.length > 0 ? (
                    <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {similarCharacters.map((similarChar, index) => (
                        <button
                          key={similarChar.codePoint}
                          ref={(el) => {
                            similarButtonRefs.current[index] = el
                          }}
                          onClick={() => {
                            if (onSelectCharacter) {
                              onSelectCharacter(similarChar)
                            }
                          }}
                          onFocus={() => setFocusedSimilarIndex(index)}
                          onBlur={() => {
                            setTimeout(() => {
                              if (!similarButtonRefs.current.some(ref => ref === document.activeElement)) {
                                setFocusedSimilarIndex(null)
                              }
                            }, 0)
                          }}
                          className="aspect-square rounded-md bg-muted hover:bg-accent transition-colors flex items-center justify-center text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                          title={`U+${similarChar.codePoint.toString(16).toUpperCase().padStart(4, "0")}`}
                        >
                          {similarChar.char}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </DialogContent>
    </Dialog>

    {/* Font Export Modal */}
    <Dialog open={fontExportModalOpen} onOpenChange={setFontExportModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Export Character in {fontToExport?.name}</DialogTitle>
        </DialogHeader>
        
        {fontToExport && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center justify-center w-48 h-48 rounded-lg border bg-muted">
                <span 
                  className="text-7xl text-foreground"
                  style={{ fontFamily: fontToExport.family }}
                >
                  {character.char}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {fontToExport.name}
              </div>
            </div>

            <div className="flex gap-2 justify-center w-full">
              <Button variant="outline" size="sm" onClick={() => {
                downloadSvgWithFont(fontToExport.family)
                setFontExportModalOpen(false)
              }}>
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
                    downloadPng(false, fontToExport.family)
                  } else if (actionId === "png-transparent") {
                    downloadPng(true, fontToExport.family)
                  }
                  setFontExportModalOpen(false)
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  )
}
