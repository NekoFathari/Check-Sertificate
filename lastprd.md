## Plan: Dark Theme, Certificate Canvas, Sheets Multi-Page

TL;DR — Fix dark mode across dashboard components (sidebar, stats, cert preview), switch certificate canvas to proper A4/F4 paper ratio with mobile responsiveness, upgrade Google Sheets settings to multi-sheet support, and plan a visual template builder (Phase 2).

---

### Phase 1: Dark Theme Fix (Frontend)

**Step 1.1 — Add dark variants to globals.css**
Add `.dark` overrides for `--color-vibrant-success`, trend badge backgrounds, sidebar colors, and certificate background so dark mode renders correctly.
- File: `app/globals.css` — add dark variant CSS custom properties

**Step 1.2 — Fix Dashboard Sidebar colors**
Replace all hardcoded `bg-gray-900`, `text-white`, `border-gray-800`, `hover:bg-gray-800` with CSS variable-driven classes that adapt to dark/light mode.
- Files: `components/dashboard/Sidebar.tsx`

**Step 1.3 — Fix StatsCards text & badges**
Replace `text-slate-500`, `text-slate-900`, `text-slate-400` with `text-foreground`/`text-muted-foreground`. Add dark variants for trend badges (`dark:bg-emerald-900 dark:text-emerald-300`).
- File: `components/dashboard/StatsCards.tsx`

**Step 1.4 — Fix Certificate Templates for dark mode**
Replace `bg-white` with `bg-card`, `text-slate-900` with `text-foreground`, `text-slate-500` with `text-muted-foreground` across both template variants.
- Files: `components/certificate/CertificateTemplateDefault.tsx`, `components/certificate/CertificateTemplateCustom.tsx`

**Step 1.5 — Fix Certificate Preview background**
Change `bg-slate-50` to `bg-muted` which adapts to theme.
- File: `components/certificate/CertificatePreview.tsx`

---

### Phase 2: Certificate Canvas (A4/F4 + Responsive)

**Step 2.1 — Switch to A4 paper ratio**
Change aspect ratio from `1.4/1` (landscape, non-standard) to `0.707/1` (A4 portrait, 210mm × 297mm). Add a paper size selector (A4/F4) in the layout controls.
- Files: `components/certificate/CertificateTemplateDefault.tsx`, `components/certificate/CertificateTemplateCustom.tsx`
- Types: add `paperSize: 'a4' | 'f4'` to `CertificateLayout`

**Step 2.2 — Make preview mobile-responsive**
Replace `min-h-[500px]` with `min-h-[300px] sm:min-h-[400px] md:min-h-[500px]`. Use `overflow-auto` so certificate scales within viewport. Add a zoom control for mobile.
- File: `components/certificate/CertificatePreview.tsx`

**Step 2.3 — Export certificate as downloadable image**
Add a "Download as PNG" button that captures the certificate canvas using `html-to-image` library or canvas API.
- File: `components/certificate/CertificatePreview.tsx`

---

### Phase 3: Google Sheets Multi-Page (Backend + Frontend)

**Step 3.1 — Update types for multi-sheet**
Change `GoogleSheetsSettings` from `sheetName: string` to `sheets: Array<{ name: string; range: string }>` enabling multiple sheet tabs with independent data ranges.
- File: `lib/types.ts`
- Update mock data in `lib/mock-data.ts`

**Step 3.2 — Refactor GoogleSheetsSettingsForm**
Convert single `<Input>` to a dynamic list with "+ Tambah Sheet" button and per-row delete. Each entry has name + range fields. Validation: minimum 1 sheet.
- File: `components/settings/GoogleSheetsSettingsForm.tsx`

**Step 3.3 — Update sync logic placeholder**
Update SyncButton to reference the new multi-sheet structure (actual sync logic stays mock for now).
- File: `components/dashboard/SyncButton.tsx`

---

### Phase 4: Visual Template Builder (Plan Only — Next Step)

**Concept**: Drag-and-drop certificate builder like Canva/PPT.
- Canvas: A4/F4 ratio with grid snap
- Elements: Text blocks (drag to position), image blocks, QR code, seal, border styles
- Properties panel: font size, color, alignment per element
- Save template to localStorage or backend
- Preview on mobile/tablet via responsive preview mode
- Export as PDF

This phase produces a detailed PRD, not implementation.

---

### Relevant files

| File | Phase | What |
|------|-------|------|
| `app/globals.css` | 1 | Dark variants for colors |
| `components/dashboard/Sidebar.tsx` | 1 | Hardcoded gray → CSS vars |
| `components/dashboard/StatsCards.tsx` | 1 | Text & badge dark variants |
| `components/certificate/CertificateTemplateDefault.tsx` | 1, 2 | Colors + paper ratio |
| `components/certificate/CertificateTemplateCustom.tsx` | 1, 2 | Colors + paper ratio |
| `components/certificate/CertificatePreview.tsx` | 1, 2 | Background + responsive |
| `lib/types.ts` | 2, 3 | paperSize + multi-sheet |
| `lib/mock-data.ts` | 3 | Multi-sheet mock |
| `components/settings/GoogleSheetsSettingsForm.tsx` | 3 | Multi-sheet form |
| `components/dashboard/SyncButton.tsx` | 3 | Multi-sheet reference |

### Verification

1. Toggle dark mode → sidebar, stats, cert preview all render with correct contrast
2. Shrink browser to mobile (375px) → cert preview scales down, no overflow
3. Open Settings → Google Sheets → add 3 sheets with different ranges, verify save
4. `npm run build` passes with no errors
5. Certificate preview shows A4 ratio (taller than wide)

### Decisions

- Paper size uses `aspect-ratio` CSS (no fixed px) so it scales anywhere
- Multi-sheet uses array with per-sheet range for maximum flexibility
- Custom template builder is Phase 2 plan only — produces PRD document
- Theme uses `.dark` class approach already in place, only missing color overrides

### Further Considerations

1. F4 paper (210mm × 330mm, ratio ~0.636) — slightly taller than A4. Add as toggle option.
2. For template builder later: consider `react-rnd` for drag/resize, `fabric.js` for canvas rendering.
3. Dark mode accent colors: keep vibrant-primary the same but soften success/warning for dark backgrounds.

