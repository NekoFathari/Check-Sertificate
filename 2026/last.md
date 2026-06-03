# Project Export — Certificate Management System

## Tech Stack
- **Framework**: Next.js 16.2.6 (App Router, Turbopack)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`)
- **UI Components**: shadcn/ui (base-nova style with `@base-ui/react`)
- **Animation**: Framer Motion 12.40.0
- **Icons**: Lucide React 1.17.0
- **Toast**: Sonner 2.0.7
- **Theme**: Custom ThemeProvider with light/dark/system (localStorage persistence)

## Project Directory
`d:\Github\Check-Sertificate\2026\`

## Routes
| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Home/landing page — certificate verification search | ✅ Static |
| `/login` | Admin login | ✅ Static |
| `/dashboard` | Dashboard with stats, sync & reports panel | ✅ Static |
| `/dashboard/sertifikat` | Upload data, data table, certificate preview | ✅ Static |
| `/dashboard/profile` | User profile management | ✅ Static |
| `/settings` | App settings (theme, notifications, security, Google Sheets) | ✅ Static |
| `/pengaturan` | Redirect to /settings (legacy) | ✅ Static |
| `/profil` | Redirect to /dashboard/profile (legacy) | ✅ Static |
| `/sertifikat` | Redirect to /dashboard/sertifikat (legacy) | ✅ Static |
| `/profile` | Redirect to /dashboard/profile (legacy) | ✅ Static |
| `/api/reports` | Reports API | ✅ Dynamic |
| `/api/sertifikat` | Certificates list API | ✅ Dynamic |
| `/api/sertifikat/[id]` | Single certificate CRUD | ✅ Dynamic |

## Build & Run
```bash
# Development (heavy - avoid)
cd d:\Github\Check-Sertificate\2026 && npm run dev

# Production build + start (recommended)
cd d:\Github\Check-Sertificate\2026 && npm run build
cd d:\Github\Check-Sertificate\2026 && .\node_modules\.bin\next.cmd start -p 3001
```

## App Flow
1. Landing page `/` — Public certificate search/verification with report button
2. Login `/login` — Admin authentication (credentials: admin@gmail.com / admin)
3. Dashboard `/dashboard` — Stats cards + Google Sheets sync button + reports panel
4. Sertifikat `/dashboard/sertifikat` — Upload CSV/XLSX, data table with edit/delete, certificate preview (Template + Custom Overlay), sample switching, event filter via query param
5. Events `/events` — Event template management table (50 events), assign template/overlay per event, quick link to manage
5. Profile `/profile` — View/edit profile info
6. Settings `/settings` — Theme (light/dark/system), notifications, password change, Google Sheets multi-sheet config

## Directory Structure
```
2026/
├── app/
│   ├── globals.css              # Theme variables, certificate sizing
│   ├── layout.tsx               # Root layout (Toaster, ThemeProvider, AuthProvider)
│   ├── page.tsx                 # Landing page
│   ├── (auth)/login/            # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Dashboard layout (sidebar + header)
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Dashboard home (stats, sync, reports)
│   │   │   ├── sertifikat/page.tsx  # Certificate management
│   │   │   └── profile/page.tsx     # Profile page
│   │   ├── settings/page.tsx    # Settings page
│   │   ├── pengaturan/page.tsx  # Redirect to /settings
│   │   ├── profil/page.tsx      # Redirect to /dashboard/profile
│   │   ├── events/page.tsx      # Event template management
│   │   ├── sertifikat/page.tsx  # Redirect to /dashboard/sertifikat
│   │   └── profile/page.tsx     # Redirect to /dashboard/profile
│   └── api/                     # API routes
├── components/
│   ├── auth/LoginForm.tsx
│   ├── certificate/
│   │   ├── CertificatePreview.tsx      # Preview orchestrator
│   │   ├── CertificateTemplateDefault.tsx  # Default template
│   │   ├── CertificateTemplateCustom.tsx   # Custom template
│   │   ├── CertificateLayoutSelector.tsx   # Classic layout controls
│   │   ├── CertificateDesigner.tsx      # Visual drag-and-drop layout editor
│   │   ├── CertificateOverlay.tsx       # Image + text overlay renderer
│   │   └── OverlayEditor.tsx           # Visual drag editor for custom image overlays
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatsCards.tsx
│   │   ├── DataTable.tsx
│   │   ├── UploadArea.tsx
│   │   ├── SyncButton.tsx
│   │   ├── ReportsPanel.tsx
│   │   └── NotificationDropdown.tsx
│   ├── modals/
│   │   ├── EditSertifikatModal.tsx
│   │   ├── DeleteConfirmDialog.tsx
│   │   ├── PreviewModal.tsx
│   │   ├── ReportModal.tsx
│   │   └── ReportDetailModal.tsx
│   ├── profile/ProfileForm.tsx
│   ├── settings/
│   │   ├── ThemeSettings.tsx
│   │   ├── LanguageSettings.tsx
│   │   ├── NotificationSettings.tsx
│   │   ├── SecuritySettingsForm.tsx
│   │   └── GoogleSheetsSettingsForm.tsx
│   └── ui/ (shadcn base components)
├── context/AuthContext.tsx
├── hooks/useAuth.ts
└── lib/
    ├── types.ts       # All TypeScript interfaces
    ├── mock-data.ts   # Mock data for development
    └── utils.ts       # Utility functions
```

## Dark Theme Implementation
**Approach**: CSS variables with `.dark` class. All components now use theme variables:
- `bg-background`, `bg-muted`, `bg-card`, `bg-sidebar`
- `text-foreground`, `text-muted-foreground`, `text-card-foreground`
- `border-border`, `border-sidebar-border`
- `bg-sidebar`, `text-sidebar-foreground`, `hover:bg-sidebar-accent`

**Status**: ✅ All hardcoded `text-slate-*`, `bg-slate-*`, `bg-white`, `border-slate-*` replaced with CSS variables across 20+ files. Dark variants added for all public page gradients (`bg-gradient-hero`, `from-blue-50 to-white`).

## Certificate System
### Templates
- **Default**: Classic IGI JATIM design with corner decorations, shield logo, seal
- **Custom**: Modern vibrant design with gradient accents, badge header, colored seal

### Visual Designer (Drag & Drop)
- **CertificateDesigner** — Drag-and-drop layout editor replacing dropdown selectors
- 3×3 snap zone grid (top-left to bottom-right)
- HTML5 Drag and Drop API for element repositioning
- Visual validation: invalid zones show different cursor on drag
- Property panel for color, font, paper size, border/seal toggles
- Toggle between "Edit Visual" (designer) and "Atur Layout" (classic dropdowns) modes

### Overlay Editor (Custom Image Certificates)
- **OverlayEditor** — Drag text fields on top of an uploaded certificate image background
- Upload custom certificate background image (PNG/JPG)
- Drag fields to any pixel position; stored as percentages for responsiveness
- **maxWidth** slider (100-1200px) per field for consistent text wrapping
- Properties: font size (8-80px), color (8 presets), alignment (L/C/R), font family, maxWidth
- **Event name** input: assign config to specific event/acara
- **Save** button with dirty-state indicator; persists to localStorage per event
- **CertificateOverlay** renders final certificate with text at configured positions (with scale support)
- 2 preview modes: Template | Custom (replaces unused "File" tab)
- Download/Print certificates from public landing page

### Layout Controls
- Title position (9 options), Name position (3 options)
- Number/Date/Signature position (bottom positions)
- Font family (serif/sans-serif)
- Primary color picker (6 colors)
- Border & Seal toggles
- **Paper size**: A4 landscape (1.414:1) and F4 landscape (1.571:1)

### Preview Modes
- **Template mode**: Default (Bawaan IGI) or Custom Vibrant HTML templates with visual designer
- **Custom mode**: Upload certificate background image, drag-and-drop text fields, edit properties
- **Sample switching**: Dropdown selector in preview to switch between different certificates in the same event
- **Download/Print**: Public landing page — view + print/save PDF with landscape A4/F4 page sizing

## Google Sheets Integration
### Multi-Sheet Support
```typescript
interface GoogleSheetConfig {
  name: string;        // Sheet tab name
  dataRange: string;   // e.g. "A1:F1000"
  enabled: boolean;    // Toggle on/off
}

interface GoogleSheetsSettings {
  spreadsheetId: string;
  sheets: GoogleSheetConfig[];
  syncIntervalMinutes: number;
}
```
- UI supports add/remove/enable/disable multiple sheet tabs
- Each sheet has own name and data range

## Audit & Login
- **Default credentials**: admin@gmail.com / admin (hardcoded in mock data)
- Auth context provides `isAuthenticated`, `isLoading`, `user`, `login()`, `logout()`

## Known Issues / Remaining Work
1. **File Preview** — Actual PDF/image rendering for uploaded certificates
2. **Backend Integration** — Replace mock data with real API/database
3. **Google Sheets Live Sync** — Actual Google Sheets API integration (currently simulated)
4. **Notifications** — Real-time notification system (currently static mock)
5. **Report Image Storage** — Image evidence stored as base64 in memory; replace with file upload service for production

## TypeScript Interfaces (`lib/types.ts`)
- `Sertifikat` — Certificate data
- `User`, `AuthToken`, `AuthResponse`
- `ProfileData`, `AppSettings`, `SecuritySettings`
- `GoogleSheetsSettings`, `GoogleSheetConfig`
- `CertificateLayout` — Full layout configuration
- `CertificateTemplate`, `CertificatePreviewData`
- `ReportItem` — Report system (with `imageData` for evidence)
- `PaginationState`, `FileUploadResponse`
- `OverlayTextField`, `CertificateOverlayConfig` — Custom image overlay certificate system

## Component Colors Guide
When creating new components, use these Tailwind classes instead of hardcoded colors:
| Purpose | Light/Dark Class |
|---------|-----------------|
| Page background | `bg-background` |
| Card background | `bg-card` / `bg-card text-card-foreground` |
| Muted section | `bg-muted text-muted-foreground` |
| Borders | `border-border` |
| Primary text | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Sidebar | `bg-sidebar text-sidebar-foreground` |
| Sidebar hover | `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` |
