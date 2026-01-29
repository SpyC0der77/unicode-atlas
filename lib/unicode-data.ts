export interface UnicodeCategory {
  id: string
  name: string
  range: [number, number]
}

export const UNICODE_CATEGORIES: UnicodeCategory[] = [
  { id: "basic-latin", name: "Basic Latin", range: [0x0020, 0x007f] },
  { id: "latin-1", name: "Latin-1 Supplement", range: [0x0080, 0x00ff] },
  { id: "latin-extended-a", name: "Latin Extended-A", range: [0x0100, 0x017f] },
  { id: "latin-extended-b", name: "Latin Extended-B", range: [0x0180, 0x024f] },
  { id: "greek", name: "Greek and Coptic", range: [0x0370, 0x03ff] },
  { id: "cyrillic", name: "Cyrillic", range: [0x0400, 0x04ff] },
  { id: "armenian", name: "Armenian", range: [0x0530, 0x058f] },
  { id: "hebrew", name: "Hebrew", range: [0x0590, 0x05ff] },
  { id: "arabic", name: "Arabic", range: [0x0600, 0x06ff] },
  { id: "thai", name: "Thai", range: [0x0e00, 0x0e7f] },
  { id: "cjk-symbols", name: "CJK Symbols", range: [0x3000, 0x303f] },
  { id: "hiragana", name: "Hiragana", range: [0x3040, 0x309f] },
  { id: "katakana", name: "Katakana", range: [0x30a0, 0x30ff] },
  { id: "punctuation", name: "General Punctuation", range: [0x2000, 0x206f] },
  { id: "currency", name: "Currency Symbols", range: [0x20a0, 0x20cf] },
  { id: "letterlike", name: "Letterlike Symbols", range: [0x2100, 0x214f] },
  { id: "number-forms", name: "Number Forms", range: [0x2150, 0x218f] },
  { id: "arrows", name: "Arrows", range: [0x2190, 0x21ff] },
  { id: "math-operators", name: "Mathematical Operators", range: [0x2200, 0x22ff] },
  { id: "misc-technical", name: "Miscellaneous Technical", range: [0x2300, 0x23ff] },
  { id: "box-drawing", name: "Box Drawing", range: [0x2500, 0x257f] },
  { id: "block-elements", name: "Block Elements", range: [0x2580, 0x259f] },
  { id: "geometric-shapes", name: "Geometric Shapes", range: [0x25a0, 0x25ff] },
  { id: "misc-symbols", name: "Miscellaneous Symbols", range: [0x2600, 0x26ff] },
  { id: "dingbats", name: "Dingbats", range: [0x2700, 0x27bf] },
  { id: "braille", name: "Braille Patterns", range: [0x2800, 0x28ff] },
  { id: "supplemental-arrows", name: "Supplemental Arrows-B", range: [0x2900, 0x297f] },
  { id: "misc-math-a", name: "Misc Mathematical Symbols-A", range: [0x27c0, 0x27ef] },
  { id: "misc-math-b", name: "Misc Mathematical Symbols-B", range: [0x2980, 0x29ff] },
  { id: "emoticons", name: "Emoticons", range: [0x1f600, 0x1f64f] },
  { id: "misc-symbols-pictographs", name: "Misc Symbols and Pictographs", range: [0x1f300, 0x1f5ff] },
  { id: "transport-map", name: "Transport and Map", range: [0x1f680, 0x1f6ff] },
  { id: "supplemental-symbols", name: "Supplemental Symbols", range: [0x1f900, 0x1f9ff] },
]

export interface UnicodeCharacter {
  char: string
  codePoint: number
  name: string
  commonName?: string
  category: string
  htmlEntity: string
  cssCode: string
}

// Common names extracted from Wikipedia Unicode character list
// Source: https://en.wikipedia.org/wiki/List_of_Unicode_characters
const COMMON_NAMES: Record<number, string> = {
  // Control characters
  0x0000: "Null character",
  0x0001: "Start of Heading",
  0x0002: "Start of Text",
  0x0003: "End-of-text character",
  0x0004: "End-of-transmission character",
  0x0005: "Enquiry character",
  0x0006: "Acknowledge character",
  0x0007: "Bell character",
  0x0008: "Backspace",
  0x0009: "Horizontal tab",
  0x000A: "Line feed",
  0x000B: "Vertical tab",
  0x000C: "Form feed",
  0x000D: "Carriage return",
  0x000E: "Shift Out",
  0x000F: "Shift In",
  0x0010: "Data Link Escape",
  0x0011: "Device Control 1",
  0x0012: "Device Control 2",
  0x0013: "Device Control 3",
  0x0014: "Device Control 4",
  0x0015: "Negative-acknowledge character",
  0x0016: "Synchronous Idle",
  0x0017: "End of Transmission Block",
  0x0018: "Cancel character",
  0x0019: "End of Medium",
  0x001A: "Substitute character",
  0x001B: "Escape character",
  0x001C: "File Separator",
  0x001D: "Group Separator",
  0x001E: "Record Separator",
  0x001F: "Unit Separator",
  0x007F: "Delete",
  0x0080: "Padding Character",
  0x0081: "High Octet Preset",
  0x0082: "Break Permitted Here",
  0x0083: "No Break Here",
  0x0084: "Index",
  0x0085: "Next Line",
  0x0086: "Start of Selected Area",
  0x0087: "End of Selected Area",
  0x0088: "Character Tabulation Set",
  0x0089: "Character Tabulation with Justification",
  0x008A: "Line Tabulation Set",
  0x008B: "Partial Line Forward",
  0x008C: "Partial Line Backward",
  0x008D: "Reverse Line Feed",
  0x008E: "Single-Shift Two",
  0x008F: "Single-Shift Three",
  0x0090: "Device Control String",
  0x0091: "Private Use 1",
  0x0092: "Private Use 2",
  0x0093: "Set Transmit State",
  0x0094: "Cancel character",
  0x0095: "Message Waiting",
  0x0096: "Start of Protected Area",
  0x0097: "End of Protected Area",
  0x0098: "Start of String",
  0x0099: "Single Graphic Character Introducer",
  0x009A: "Single Character Intro Introducer",
  0x009B: "Control Sequence Introducer",
  0x009C: "String Terminator",
  0x009D: "Operating System Command",
  0x009E: "Private Message",
  0x009F: "Application Program Command",
  
  // Basic Latin
  0x0020: "Space",
  0x0021: "Exclamation mark",
  0x0022: "Quotation mark",
  0x0023: "Number sign, Hash, Octothorpe, Sharp",
  0x0024: "Dollar sign",
  0x0025: "Percent sign",
  0x0026: "Ampersand",
  0x0027: "Apostrophe",
  0x0028: "Left parenthesis",
  0x0029: "Right parenthesis",
  0x002A: "Asterisk",
  0x002B: "Plus sign",
  0x002C: "Comma",
  0x002D: "Hyphen-minus",
  0x002E: "Full stop",
  0x002F: "Slash (Solidus)",
  0x0030: "Digit Zero",
  0x0031: "Digit One",
  0x0032: "Digit Two",
  0x0033: "Digit Three",
  0x0034: "Digit Four",
  0x0035: "Digit Five",
  0x0036: "Digit Six",
  0x0037: "Digit Seven",
  0x0038: "Digit Eight",
  0x0039: "Digit Nine",
  0x003A: "Colon",
  0x003B: "Semicolon",
  0x003C: "Less-than sign",
  0x003D: "Equal sign",
  0x003E: "Greater-than sign",
  0x003F: "Question mark",
  0x0040: "At sign",
  0x0041: "Latin Capital letter A",
  0x0042: "Latin Capital letter B",
  0x0043: "Latin Capital letter C",
  0x0044: "Latin Capital letter D",
  0x0045: "Latin Capital letter E",
  0x0046: "Latin Capital letter F",
  0x0047: "Latin Capital letter G",
  0x0048: "Latin Capital letter H",
  0x0049: "Latin Capital letter I",
  0x004A: "Latin Capital letter J",
  0x004B: "Latin Capital letter K",
  0x004C: "Latin Capital letter L",
  0x004D: "Latin Capital letter M",
  0x004E: "Latin Capital letter N",
  0x004F: "Latin Capital letter O",
  0x0050: "Latin Capital letter P",
  0x0051: "Latin Capital letter Q",
  0x0052: "Latin Capital letter R",
  0x0053: "Latin Capital letter S",
  0x0054: "Latin Capital letter T",
  0x0055: "Latin Capital letter U",
  0x0056: "Latin Capital letter V",
  0x0057: "Latin Capital letter W",
  0x0058: "Latin Capital letter X",
  0x0059: "Latin Capital letter Y",
  0x005A: "Latin Capital letter Z",
  0x005B: "Left square bracket",
  0x005C: "Backslash",
  0x005D: "Right square bracket",
  0x005E: "Circumflex accent",
  0x005F: "Low line",
  0x0060: "Grave accent",
  0x0061: "Latin Small Letter A",
  0x0062: "Latin Small Letter B",
  0x0063: "Latin Small Letter C",
  0x0064: "Latin Small Letter D",
  0x0065: "Latin Small Letter E",
  0x0066: "Latin Small Letter F",
  0x0067: "Latin Small Letter G",
  0x0068: "Latin Small Letter H",
  0x0069: "Latin Small Letter I",
  0x006A: "Latin Small Letter J",
  0x006B: "Latin Small Letter K",
  0x006C: "Latin Small Letter L",
  0x006D: "Latin Small Letter M",
  0x006E: "Latin Small Letter N",
  0x006F: "Latin Small Letter O",
  0x0070: "Latin Small Letter P",
  0x0071: "Latin Small Letter Q",
  0x0072: "Latin Small Letter R",
  0x0073: "Latin Small Letter S",
  0x0074: "Latin Small Letter T",
  0x0075: "Latin Small Letter U",
  0x0076: "Latin Small Letter V",
  0x0077: "Latin Small Letter W",
  0x0078: "Latin Small Letter X",
  0x0079: "Latin Small Letter Y",
  0x007A: "Latin Small Letter Z",
  0x007B: "Left curly bracket",
  0x007C: "Vertical bar",
  0x007D: "Right curly bracket",
  0x007E: "Tilde",
  
  // Latin-1 Supplement
  0x00A0: "Non-breaking space",
  0x00A1: "Inverted Exclamation Mark",
  0x00A2: "Cent sign",
  0x00A3: "Pound sign",
  0x00A4: "Currency sign",
  0x00A5: "Yen sign",
  0x00A6: "Broken bar",
  0x00A7: "Section sign",
  0x00A8: "Diaeresis (Umlaut)",
  0x00A9: "Copyright symbol",
  0x00AA: "Feminine Ordinal Indicator",
  0x00AB: "Left-pointing double angle quotation mark",
  0x00AC: "Not sign",
  0x00AD: "Soft hyphen",
  0x00AE: "Registered trademark symbol",
  0x00AF: "Macron",
  0x00B0: "Degree sign",
  0x00B1: "Plus–minus sign",
  0x00B2: "Superscript two",
  0x00B3: "Superscript three",
  0x00B4: "Acute accent",
  0x00B5: "Micro sign",
  0x00B6: "Pilcrow sign",
  0x00B7: "Middle dot",
  0x00B8: "Cedilla",
  0x00B9: "Superscript one",
  0x00BA: "Masculine ordinal indicator",
  0x00BB: "Right-pointing double angle quotation mark",
  0x00BC: "Vulgar fraction one quarter",
  0x00BD: "Vulgar fraction one half",
  0x00BE: "Vulgar fraction three quarters",
  0x00BF: "Inverted Question Mark",
  0x00C0: "Latin Capital Letter A with grave",
  0x00C1: "Latin Capital letter A with acute",
  0x00C2: "Latin Capital letter A with circumflex",
  0x00C3: "Latin Capital letter A with tilde",
  0x00C4: "Latin Capital letter A with diaeresis",
  0x00C5: "Latin Capital letter A with ring above",
  0x00C6: "Latin Capital letter Æ",
  0x00C7: "Latin Capital letter C with cedilla",
  0x00C8: "Latin Capital letter E with grave",
  0x00C9: "Latin Capital letter E with acute",
  0x00CA: "Latin Capital letter E with circumflex",
  0x00CB: "Latin Capital letter E with diaeresis",
  0x00CC: "Latin Capital letter I with grave",
  0x00CD: "Latin Capital letter I with acute",
  0x00CE: "Latin Capital letter I with circumflex",
  0x00CF: "Latin Capital letter I with diaeresis",
  0x00D0: "Latin Capital letter Eth",
  0x00D1: "Latin Capital letter N with tilde",
  0x00D2: "Latin Capital letter O with grave",
  0x00D3: "Latin Capital letter O with acute",
  0x00D4: "Latin Capital letter O with circumflex",
  0x00D5: "Latin Capital letter O with tilde",
  0x00D6: "Latin Capital letter O with diaeresis",
  0x00D7: "Multiplication sign",
  0x00D8: "Latin Capital letter O with stroke",
  0x00D9: "Latin Capital letter U with grave",
  0x00DA: "Latin Capital letter U with acute",
  0x00DB: "Latin Capital Letter U with circumflex",
  0x00DC: "Latin Capital Letter U with diaeresis",
  0x00DD: "Latin Capital Letter Y with acute",
  0x00DE: "Latin Capital Letter Thorn",
  0x00DF: "Latin Small Letter sharp S",
  0x00E0: "Latin Small Letter A with grave",
  0x00E1: "Latin Small Letter A with acute",
  0x00E2: "Latin Small Letter A with circumflex",
  0x00E3: "Latin Small Letter A with tilde",
  0x00E4: "Latin Small Letter A with diaeresis",
  0x00E5: "Latin Small Letter A with ring above",
  0x00E6: "Latin Small Letter Æ",
  0x00E7: "Latin Small Letter C with cedilla",
  0x00E8: "Latin Small Letter E with grave",
  0x00E9: "Latin Small Letter E with acute",
  0x00EA: "Latin Small Letter E with circumflex",
  0x00EB: "Latin Small Letter E with diaeresis",
  0x00EC: "Latin Small Letter I with grave",
  0x00ED: "Latin Small Letter I with acute",
  0x00EE: "Latin Small Letter I with circumflex",
  0x00EF: "Latin Small Letter I with diaeresis",
  0x00F0: "Latin Small Letter Eth",
  0x00F1: "Latin Small Letter N with tilde",
  0x00F2: "Latin Small Letter O with grave",
  0x00F3: "Latin Small Letter O with acute",
  0x00F4: "Latin Small Letter O with circumflex",
  0x00F5: "Latin Small Letter O with tilde",
  0x00F6: "Latin Small Letter O with diaeresis",
  0x00F7: "Division sign",
  0x00F8: "Latin Small Letter O with stroke",
  0x00F9: "Latin Small Letter U with grave",
  0x00FA: "Latin Small Letter U with acute",
  0x00FB: "Latin Small Letter U with circumflex",
  0x00FC: "Latin Small Letter U with diaeresis",
  0x00FD: "Latin Small Letter Y with acute",
  0x00FE: "Latin Small Letter Thorn",
  0x00FF: "Latin Small Letter Y with diaeresis",
  
  // General Punctuation
  0x2013: "En dash",
  0x2014: "Em dash",
  0x2015: "Horizontal bar",
  0x2017: "Double low line",
  0x2018: "Left single quotation mark",
  0x2019: "Right single quotation mark",
  0x201A: "Single low-9 quotation mark",
  0x201B: "Single high-reversed-9 quotation mark",
  0x201C: "Left double quotation mark",
  0x201D: "Right double quotation mark",
  0x201E: "Double low-9 quotation mark",
  0x2020: "Dagger",
  0x2021: "Double dagger",
  0x2022: "Bullet",
  0x2026: "Horizontal ellipsis",
  0x2030: "Per mille sign",
  0x2032: "Prime",
  0x2033: "Double prime",
  0x2039: "Single left-pointing angle quotation mark",
  0x203A: "Single right-pointing angle quotation mark",
  0x203C: "Double exclamation mark",
  0x203E: "Overline",
  0x2044: "Fraction slash",
  0x204A: "Tironian et sign",
  
  // Currency Symbols
  0x20AC: "Euro sign",
  
  // Letterlike Symbols
  0x2122: "Trade mark sign",
  
  // Arrows
  0x2190: "Leftwards arrow",
  0x2191: "Upwards arrow",
  0x2192: "Rightwards arrow",
  0x2193: "Downwards arrow",
  0x2194: "Left right arrow",
  0x2195: "Up down arrow",
  0x21A9: "Leftwards arrow with hook",
  0x21AA: "Rightwards arrow with hook",
  
  // Mathematical Operators
  0x2200: "For all",
  0x2202: "Partial differential",
  0x2203: "There exists",
  0x2205: "Empty set",
  0x2206: "Increment",
  0x2207: "Nabla",
  0x2208: "Element of",
  0x2209: "Not an element of",
  0x220B: "Contains as member",
  0x220F: "N-ary product",
  0x2211: "N-ary summation",
  0x2212: "Minus sign",
  0x2215: "Division slash",
  0x2216: "Set minus",
  0x2217: "Asterisk operator",
  0x2218: "Ring operator",
  0x2219: "Bullet operator",
  0x221A: "Square root",
  0x221D: "Proportional to",
  0x221E: "Infinity",
  0x221F: "Right angle",
  0x2220: "Angle",
  0x2227: "Logical and",
  0x2228: "Logical or",
  0x2229: "Intersection",
  0x222A: "Union",
  0x222B: "Integral",
  0x2234: "Therefore",
  0x2235: "Because",
  0x223C: "Tilde operator",
  0x223D: "Reversed tilde",
  0x2245: "Approximately equal to",
  0x2248: "Almost equal to",
  0x2260: "Not equal to",
  0x2261: "Identical to",
  0x2264: "Less-than or equal to",
  0x2265: "Greater-than or equal to",
  0x2282: "Subset of",
  0x2283: "Superset of",
  0x2284: "Not a subset of",
  0x2286: "Subset of or equal to",
  0x2287: "Superset of or equal to",
  0x2295: "Circled plus",
  0x2297: "Circled times",
  0x2299: "Circled dot operator",
  0x22A5: "Up tack",
  0x22C5: "Dot operator",
  
  // Geometric Shapes
  0x25A0: "Black square",
  0x25A1: "White square",
  0x25B2: "Black up-pointing triangle",
  0x25B3: "White up-pointing triangle",
  0x25B6: "Black right-pointing triangle",
  0x25B7: "White right-pointing triangle",
  0x25BC: "Black down-pointing triangle",
  0x25BD: "White down-pointing triangle",
  0x25C0: "Black left-pointing triangle",
  0x25C1: "White left-pointing triangle",
  0x25CA: "Lozenge",
  0x25CF: "Black circle",
  0x25CB: "White circle",
  0x25D9: "Fisheye",
  
  // Miscellaneous Symbols
  0x2600: "Black sun with rays",
  0x2601: "Cloud",
  0x2602: "Umbrella",
  0x2603: "Snowman",
  0x260E: "Black telephone",
  0x2611: "Ballot box with check",
  0x2614: "Umbrella with rain drops",
  0x2615: "Hot beverage",
  0x2620: "Skull and crossbones",
  0x2622: "Radioactive sign",
  0x2623: "Biohazard sign",
  0x262E: "Peace symbol",
  0x262F: "Yin yang",
  0x2638: "Wheel of dharma",
  0x2639: "White frowning face",
  0x263A: "White smiling face",
  0x2640: "Female sign",
  0x2642: "Male sign",
  0x2660: "Black spade suit",
  0x2663: "Black club suit",
  0x2665: "Black heart suit",
  0x2666: "Black diamond suit",
  0x2669: "Quarter note",
  0x266A: "Eighth note",
  0x266B: "Beamed eighth notes",
  0x266C: "Beamed sixteenth notes",
  0x266D: "Music flat sign",
  0x266E: "Music natural sign",
  0x266F: "Music sharp sign",
  
  // Box Drawing
  0x2500: "Box drawings light horizontal",
  0x2502: "Box drawings light vertical",
  0x250C: "Box drawings light down and right",
  0x2510: "Box drawings light down and left",
  0x2514: "Box drawings light up and right",
  0x2518: "Box drawings light up and left",
  0x251C: "Box drawings light vertical and right",
  0x2524: "Box drawings light vertical and left",
  0x252C: "Box drawings light down and horizontal",
  0x2534: "Box drawings light up and horizontal",
  0x253C: "Box drawings light vertical and horizontal",
  0x2550: "Box drawings double horizontal",
  0x2551: "Box drawings double vertical",
  0x2554: "Box drawings double down and right",
  0x2557: "Box drawings double down and left",
  0x255A: "Box drawings double up and right",
  0x255D: "Box drawings double up and left",
  0x2560: "Box drawings vertical double and right single",
  0x2563: "Box drawings vertical double and left single",
  0x2566: "Box drawings down double and horizontal single",
  0x2569: "Box drawings up double and horizontal single",
  0x256C: "Box drawings double vertical and horizontal",
}

export function getCharacterName(codePoint: number): string {
  try {
    // Basic name generation based on code point
    const category = UNICODE_CATEGORIES.find(
      (c) => codePoint >= c.range[0] && codePoint <= c.range[1]
    )
    if (category) {
      return `${category.name} Character U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`
    }
    return `Unicode Character U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`
  } catch {
    return "Unknown Character"
  }
}

export function getCommonName(codePoint: number): string | undefined {
  return COMMON_NAMES[codePoint]
}

export function isEmoji(codePoint: number): boolean {
  // Check if codePoint falls within emoji ranges
  return (
    // Emoticons
    (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
    // Misc Symbols and Pictographs
    (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) ||
    // Transport and Map
    (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) ||
    // Supplemental Symbols and Pictographs
    (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||
    // Some emojis in Miscellaneous Symbols
    (codePoint >= 0x2600 && codePoint <= 0x26FF && (
      codePoint === 0x2600 || // Black sun with rays
      codePoint === 0x2601 || // Cloud
      codePoint === 0x2602 || // Umbrella
      codePoint === 0x2603 || // Snowman
      codePoint === 0x260E || // Black telephone
      codePoint === 0x2611 || // Ballot box with check
      codePoint === 0x2614 || // Umbrella with rain drops
      codePoint === 0x2615 || // Hot beverage
      codePoint === 0x2620 || // Skull and crossbones
      codePoint === 0x2622 || // Radioactive sign
      codePoint === 0x2623 || // Biohazard sign
      codePoint === 0x262E || // Peace symbol
      codePoint === 0x262F || // Yin yang
      codePoint === 0x2638 || // Wheel of dharma
      codePoint === 0x2639 || // White frowning face
      codePoint === 0x263A || // White smiling face
      codePoint === 0x2640 || // Female sign
      codePoint === 0x2642 || // Male sign
      codePoint === 0x2660 || // Black spade suit
      codePoint === 0x2663 || // Black club suit
      codePoint === 0x2665 || // Black heart suit
      codePoint === 0x2666 || // Black diamond suit
      codePoint === 0x2669 || // Quarter note
      codePoint === 0x266A || // Eighth note
      codePoint === 0x266B || // Beamed eighth notes
      codePoint === 0x266C || // Beamed sixteenth notes
      codePoint === 0x266D || // Music flat sign
      codePoint === 0x266E || // Music natural sign
      codePoint === 0x266F    // Music sharp sign
    )) ||
    // Some emojis in Dingbats
    (codePoint >= 0x2700 && codePoint <= 0x27BF)
  )
}

export function isCharacter(codePoint: number): boolean {
  try {
    const char = String.fromCodePoint(codePoint)
    // Check if it's a letter using Unicode property or regex
    // This covers Latin, Greek, Cyrillic, Hebrew, Arabic, CJK, etc.
    return /\p{L}/u.test(char)
  } catch {
    return false
  }
}

export function isNumber(codePoint: number): boolean {
  try {
    const char = String.fromCodePoint(codePoint)
    // Check if it's a number using Unicode property
    return /\p{N}/u.test(char)
  } catch {
    return false
  }
}

export function isSymbol(codePoint: number): boolean {
  // Symbols are everything that's not a character or number
  return !isCharacter(codePoint) && !isNumber(codePoint)
}

export function generateCharactersForCategory(category: UnicodeCategory): UnicodeCharacter[] {
  const characters: UnicodeCharacter[] = []
  for (let codePoint = category.range[0]; codePoint <= category.range[1]; codePoint++) {
    try {
      const char = String.fromCodePoint(codePoint)
      // Skip control characters and unassigned code points
      if (char.trim() === "" && codePoint < 0x20) continue
      
      characters.push({
        char,
        codePoint,
        name: getCharacterName(codePoint),
        commonName: getCommonName(codePoint),
        category: category.name,
        htmlEntity: `&#${codePoint};`,
        cssCode: `\\${codePoint.toString(16).toUpperCase()}`,
      })
    } catch {
      // Skip invalid code points
    }
  }
  return characters
}

export function searchCharacters(query: string, categoryIds: string[] | null): UnicodeCharacter[] {
  const lowerQuery = query.toLowerCase()
  const results: UnicodeCharacter[] = []
  
  const categoriesToSearch = categoryIds && categoryIds.length > 0
    ? UNICODE_CATEGORIES.filter(c => categoryIds.includes(c.id))
    : UNICODE_CATEGORIES
  
  for (const category of categoriesToSearch) {
    const chars = generateCharactersForCategory(category)
    for (const char of chars) {
      if (
        char.char.includes(query) ||
        char.name.toLowerCase().includes(lowerQuery) ||
        (char.commonName && char.commonName.toLowerCase().includes(lowerQuery)) ||
        char.htmlEntity.toLowerCase().includes(lowerQuery) ||
        char.codePoint.toString(16).toLowerCase().includes(lowerQuery.replace("u+", "").replace("0x", ""))
      ) {
        results.push(char)
      }
    }
    // Limit results for performance
    if (results.length >= 500) break
  }
  
  return results.slice(0, 500)
}
