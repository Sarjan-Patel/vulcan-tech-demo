# CLAUDE.md - Legal Reasoning Platform

## Project Overview

A Next.js-based legal reasoning platform that analyzes local rules and draft bills for conflicts with higher-level laws (Federal > State > Municipal). This is the frontend implementation phase.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom theme
- **Components**: shadcn/ui
- **Graph**: React Flow (@xyflow/react)
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Header, Footer, Sidebar
│   ├── landing/      # Landing page sections
│   ├── chat/         # Chat interface components
│   ├── citation/     # Citation display components
│   └── graph/        # Graph visualization components
├── lib/
│   ├── utils.ts      # Utility functions (cn, etc.)
│   ├── types.ts      # TypeScript interfaces
│   └── mock-data.ts  # Mock responses for frontend
└── hooks/            # Custom React hooks
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Design System

### Colors (Dark Theme)

- **Brand**: `#38BDF8` (Sky Blue)
- **Background Primary**: `#0A1322` (Deep Navy)
- **Background Elevated**: `#0F172A`
- **Background Card**: `#020617`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#CBD5E1`
- **Text Muted**: `#94A3B8`
- **Border**: `#FFFFFF1A`

### Jurisdiction Colors

- **Federal**: `#3B82F6` (Blue)
- **State**: `#10B981` (Green)
- **Municipal**: `#F59E0B` (Amber)

### Status Colors

- **Success**: `#6EE7B7`
- **Warning**: `#FCD34D`
- **Error**: `#FCA5A5`

## Coding Conventions

1. Use TypeScript strict mode
2. Follow existing component patterns
3. Use `cn()` utility for conditional classes
4. Prefer shadcn/ui components when available
5. Use Lucide icons consistently
6. Keep components focused and composable

## Routes

- `/` - Landing page
- `/chat` - Chat interface
- `/graph` - Graph visualization
