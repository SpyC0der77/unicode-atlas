# Unicode Detector

A modern web application for exploring, searching, and recognizing Unicode characters. Draw or upload images to find matching Unicode symbols, browse by category, and download characters in various formats.

## Features

- **Search Unicode Characters** - Search by character, code point, or common name
- **Category Filtering** - Browse characters by Unicode categories (Latin, Greek, Math Operators, Arrows, etc.)
- **Draw to Recognize** - Draw a character and find matching Unicode symbols
- **Image Upload** - Upload images with automatic background removal for character recognition
- **Character Details** - View detailed information including code points, common names, and categories
- **Export Options** - Download characters as SVG or PNG (with transparent or solid backgrounds)
- **Modern UI** - Built with Next.js, React, Tailwind CSS, and Shadcn/UI

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SpyC0der77/unicode-detector.git
cd unicode-detector
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Searching Characters

- Use the search bar to find characters by:
  - Character itself (e.g., "€")
  - Code point (e.g., "U+20AC" or "20AC")
  - Common name (e.g., "euro", "space", "arrow")

### Filtering by Category

- Use the sidebar to filter characters by Unicode categories
- Click "All" to select all categories
- Click "None" to clear all selections

### Drawing Characters

1. Click the pencil icon in the search bar
2. Draw a character on the canvas
3. Click "Search" to find matching Unicode characters
4. Results will display matching characters

### Uploading Images

1. Click the pencil icon in the search bar
2. Click "Upload" button
3. Select an image file
4. The app will automatically detect and remove plain color backgrounds
5. Click "Search" to find matching Unicode characters

### Character Details

Click any character to view:
- Character display
- Common name (if available)
- Code point (hexadecimal)
- Decimal value
- Category

### Downloading Characters

From the character details modal:
- **SVG** - Download as SVG format
- **PNG** - Download with dark background
- **PNG (Transparent)** - Download with transparent background

## Project Structure

```
unicode_detector/
├── app/
│   ├── api/
│   │   └── recognize/      # API route for character recognition
│   ├── page.tsx            # Main page component
│   └── layout.tsx          # Root layout
├── components/
│   ├── category-sidebar.tsx    # Category filter sidebar
│   ├── character-grid.tsx      # Character grid display
│   ├── character-modal.tsx     # Character details modal
│   ├── drawing-modal.tsx       # Drawing/upload modal
│   ├── search-header.tsx       # Search bar component
│   └── ui/                     # Shadcn UI components
├── lib/
│   ├── unicode-data.ts     # Unicode data and utilities
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - UI component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons

## API

The app uses the [ShapeCatcher](https://shapecatcher.com) API for character recognition from drawings and images.

## Building for Production

```bash
npm run build
npm start
```

## License

This project is open source and available under the MIT License.
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

