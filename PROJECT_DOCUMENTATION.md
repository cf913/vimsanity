# VimSanity - Complete Project Documentation

## Overview

**VimSanity** is an interactive web application designed to teach Vim motions through gamified levels and exercises. The project transforms Vim's intimidating learning curve into an engaging, beginner-friendly experience that helps users master essential Vim commands through hands-on practice.

**Website:** [vimsanity.com](https://vimsanity.com)  
**Current Version:** 0.0.16  
**Target Audience:** Developers who want to learn Vim motions  

## Project Architecture

### Technology Stack

- **Frontend Framework:** React 19.1.0 with TypeScript
- **Build Tool:** Vite 6.3.4
- **Styling:** TailwindCSS 4.1.5
- **Animations:** Framer Motion 12.9.4
- **Icons:** Lucide React 0.511.0
- **Analytics:** Vercel Analytics, PostHog
- **Charts:** Recharts 2.15.3

### Project Structure

```
vimsanity/
├── public/                     # Static assets and favicons
├── src/
│   ├── components/             # React components
│   │   ├── common/            # Reusable UI components
│   │   ├── levels/            # Game level implementations
│   │   └── *.tsx              # Main app components
│   ├── hooks/                 # Custom React hooks
│   │   ├── motions/           # Vim motion system
│   │   └── *.ts              # Utility hooks
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── styles/                # CSS and styling
│   └── App.tsx               # Main application component
├── dist/                      # Build output
├── node_modules/              # Dependencies
└── Configuration files        # Vite, TypeScript, ESLint configs
```

## Core Features

### 1. Progressive Learning System
- **9 Levels:** Each focuses on specific Vim motion categories
- **Gradual Complexity:** From basic movement to advanced editing
- **Real-time Feedback:** Immediate visual feedback on actions
- **Progress Tracking:** LocalStorage persistence of user progress

### 2. Vim Motion Implementation

The application features a sophisticated Vim motion system with two implementations:

#### Legacy System (`useVimMotions.tsx`)
- Monolithic motion handling
- All motions defined in a single large object
- Used in earlier levels

#### Modular System (`useVimMotionsV2.tsx` + `/motions/`)
- **Separation of Concerns:** Motions organized by category
- **Type Safety:** Full TypeScript support with interfaces
- **Conditional Execution:** Context-aware motion availability
- **Easy Extension:** Plugin-like architecture for adding new motions

**Motion Categories:**
- **Movement Motions:** `h`, `j`, `k`, `l`, `w`, `b`, `e`, `0`, `$`
- **Editing Motions:** `x`, `o`, `O`, `d`, `c`, `y`
- **Mode Motions:** `i`, `a`, `I`, `A`, `Escape`

### 3. Level System

Each level teaches specific aspects of Vim:

1. **Level 1:** Basic Movement (`h`, `j`, `k`, `l`)
2. **Level 2:** Word Movement (`w`, `b`, `e`)
3. **Level 3:** Line Operations (`0`, `$`, `^`)
4. **Level 4:** Character Finding (`f`, `t`, `F`, `T`)
5. **Level 5:** Search Operations (`/`, `n`, `N`)
6. **Level 6:** Basic Insert Mode (`i`, `a`, `Escape`)
7. **Level 7:** Line Insert Operations (`I`, `A`, `o`, `O`)
8. **Level 8:** Text Editing Recap
9. **Level 9:** Undo/Redo Operations (`u`, `Ctrl+r`)

### 4. UI/UX Features

- **Responsive Design:** Mobile-first with mobile warnings
- **Smooth Animations:** Framer Motion for transitions
- **Dark Theme:** Consistent zinc color palette
- **Dual Sidebars:** Level navigation and documentation
- **Landing Page:** Onboarding experience
- **Session History:** Track performance over time

## Key Components

### App-Level Components

**App.tsx** (`src/App.tsx:1`)
- Main application orchestrator
- State management for UI and user preferences
- LocalStorage integration for persistence
- Conditional rendering based on user state

**GameArea.tsx** (`src/components/GameArea.tsx:1`)
- Central game coordinator
- Level switching logic
- Changelog management
- Version tracking

### Core UI Components

**Sidebar.tsx** (`src/components/Sidebar.tsx`)
- Level navigation
- Settings management
- User preferences

**DocumentationSidebar.tsx** (`src/components/DocumentationSidebar.tsx`)
- Context-sensitive help
- Vim motion documentation
- Level-specific guidance

**LandingPage.tsx** (`src/components/LandingPage.tsx`)
- Initial user experience
- Project introduction
- Call-to-action

### Level Components

Each level is implemented as a separate component in `src/components/levels/`:

- **PlaygroundLevel.tsx:** Free-form practice
- **GridMovementLevel.tsx:** Basic directional movement
- **WordMovementLevel.tsx:** Word-based navigation
- **LineOperations3.tsx:** Line-based operations
- **FindChars4.tsx:** Character finding exercises
- **SearchLevel5.tsx:** Search functionality
- **BasicInsertLevel6.tsx:** Insert mode basics
- **LineInsertLevel7.tsx:** Advanced insert operations
- **Level8/Recap8.tsx:** Comprehensive review
- **Level9/UndoRedoLevel9.tsx:** History management

### Common UI Components (`src/components/common/`)

- **TextArea.tsx:** Vim-emulating text editor
- **ModeIndicator.tsx:** Current Vim mode display
- **Scoreboard.tsx:** Performance metrics
- **SessionHistory.tsx:** Historical performance data
- **LevelTimer.tsx:** Level completion timing
- **KeysAllowed.tsx:** Available key indicators
- **KBD.tsx:** Keyboard key styling component

## Custom Hooks

### Motion System Hooks

**useVimMotionsV2.tsx** (`src/hooks/useVimMotionsV2.tsx`)
- Modern modular motion system
- Custom motion support
- Motion filtering for levels
- Type-safe implementation

**useVimMotions.tsx** (`src/hooks/useVimMotions.tsx`)
- Legacy motion system
- Comprehensive motion definitions
- Direct cursor manipulation

### Utility Hooks

**useKeyboardHandler.ts** (`src/hooks/useKeyboardHandler.ts`)
- Global keyboard event handling
- Key combination processing
- Event delegation

**useTimer.ts** (`src/hooks/useTimer.ts`)
- Level timing functionality
- Performance metrics collection

**useHistory.ts** (`src/hooks/useHistory.ts`)
- Undo/redo functionality
- State history management
- Commands for Level 9

## Motion System Architecture

### Type Definitions (`src/hooks/motions/types.ts`)

```typescript
interface VimMotion {
  key: string                    // Key binding
  description: string           // Human-readable description
  category: 'movement' | 'editing' | 'mode' | 'text-object'
  execute: (context: MotionContext, args?: any) => void
  condition?: (context: MotionContext) => boolean
}

interface MotionContext {
  cursorIndex: number
  mode: VimMode
  text: string
  // ... additional context
}
```

### Motion Categories

**Movement Motions** (`src/hooks/motions/movementMotions.ts`)
- Pure cursor navigation
- No text modification
- Mode-agnostic where appropriate

**Editing Motions** (`src/hooks/motions/editingMotions.ts`)
- Text manipulation commands
- Character deletion, insertion
- Line operations

**Mode Motions** (`src/hooks/motions/modeMotions.ts`)
- Mode switching commands
- Insert mode entry/exit
- Mode-specific behaviors

### Registry System (`src/hooks/motions/motionRegistry.ts`)

- **Motion Registration:** Centralized motion lookup
- **Safe Execution:** Validation and error handling
- **Conditional Filtering:** Context-aware motion availability
- **Category Management:** Motion organization and retrieval

## Build Configuration

### Vite Configuration (`vite.config.ts`)
- React plugin integration
- Development server setup
- Build optimization

### TypeScript Configuration
- **tsconfig.json:** Project references setup
- **tsconfig.app.json:** Application-specific settings
- **tsconfig.node.json:** Node.js environment settings

### Linting and Code Quality
- **ESLint 9.25.1:** Code quality enforcement
- **TypeScript 5.8.3:** Type checking
- **React-specific rules:** Component best practices

## Utilities and Helpers

### Text Processing (`src/utils/textUtils.ts`)
- **Line Operations:** Finding line boundaries, navigation
- **Word Boundaries:** Word-based movement calculations
- **Cursor Management:** Position validation and updates

### Constants (`src/utils/constants.ts`)
- **Vim Modes:** Mode type definitions and constants
- **Key Mappings:** Standard Vim key bindings

### Mobile Detection (`src/utils/isMobile.ts`)
- Device detection for responsive behavior
- Mobile-specific UI adaptations

## State Management

### Local Storage Integration
The application uses localStorage for persistence:

```typescript
const STORAGE_KEYS = {
  SHOW_LANDING_PAGE: 'vimsanity-show-landing-page',
  SIDEBAR_OPEN: 'vimsanity-sidebar-open',
  DOC_SIDEBAR_OPEN: 'vimsanity-doc-sidebar-open',
  CURRENT_LEVEL: 'vimsanity-current-level',
  IS_MUTED: 'vimsanity-is-muted',
  SHOW_MOBILE_WARNING: 'vimsanity-show-mobile-warning',
}
```

### React State Architecture
- **App-level State:** UI preferences, current level, user settings
- **Component State:** Level-specific data, temporary UI state
- **Hook State:** Motion context, keyboard handlers, timers

## Analytics and Monitoring

### PostHog Integration (`src/main.tsx:5`)
- User behavior tracking
- Performance analytics
- Feature usage metrics
- Development vs. production configuration

### Vercel Analytics
- Performance monitoring
- User engagement tracking
- Error reporting

## Testing

### Test Framework
- **Testing Files:** Located in `src/hooks/__tests__/`
- **Current Tests:**
  - `useHistory.test.ts`: History management testing
  - `useKeyboardHandler.test.ts`: Keyboard event testing

### Testing Strategy
- Unit tests for custom hooks
- Component testing for UI elements
- Integration testing for motion systems

## Development Workflow

### Available Scripts (`package.json:6-10`)
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Code linting
npm run preview  # Preview production build
```

### Development Environment
- **Hot Module Replacement:** Instant feedback during development
- **TypeScript Checking:** Real-time type validation
- **ESLint Integration:** Code quality enforcement

## Deployment and Production

### Build Process
- **Vite Build:** Optimized production bundle
- **Static Asset Optimization:** Image and font optimization
- **Code Splitting:** Lazy loading for performance

### SEO and Meta Tags (`index.html`)
- **Open Graph:** Social media sharing optimization
- **Twitter Cards:** Enhanced Twitter integration
- **Canonical URLs:** SEO best practices
- **Structured Meta Data:** Search engine optimization

## Performance Considerations

### Optimization Strategies
- **Component Memoization:** React.memo for expensive components
- **Lazy Loading:** Dynamic imports for level components
- **Asset Optimization:** Image compression and format optimization
- **Bundle Splitting:** Separate chunks for vendor code

### Mobile Performance
- **Mobile Warning System:** Device-appropriate experiences
- **Touch Optimization:** Touch-friendly UI elements
- **Responsive Design:** Efficient mobile layouts

## Future Enhancement Opportunities

### Planned Features (based on `MOTION_ARCHITECTURE.md`)
1. **Text Objects:** `iw` (inner word), `ap` (around paragraph)
2. **Operators:** `d` (delete), `c` (change), `y` (yank)
3. **Counts:** `3w` (move 3 words), `5j` (move 5 lines down)
4. **Macros:** Record and replay motion sequences
5. **Visual Mode:** Text selection ranges
6. **Advanced Search:** Pattern matching, regex support

### Technical Improvements
- **Plugin System:** Community-contributed motions
- **Advanced Testing:** End-to-end test coverage
- **Performance Monitoring:** Real-time performance metrics
- **Accessibility:** Screen reader support, keyboard navigation

## Contributing Guidelines

### Code Organization
- **Component Structure:** One component per file
- **Hook Naming:** `use` prefix for custom hooks
- **Type Safety:** Full TypeScript coverage
- **File Naming:** PascalCase for components, camelCase for utilities

### Development Best Practices
- **Motion System:** Use modular architecture for new motions
- **State Management:** Prefer hooks over complex state management
- **Styling:** TailwindCSS utility classes
- **Testing:** Unit tests for business logic

## License and Legal

**License:** MIT  
**Repository:** Open source project welcoming contributions  
**Issue Tracking:** GitHub issues for bug reports and feature requests

---

This documentation provides a comprehensive overview of the VimSanity project architecture, implementation details, and development guidelines. The modular motion system and progressive learning approach make it an effective tool for teaching Vim motions to developers of all skill levels.