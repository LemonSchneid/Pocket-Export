# Agent Instructions

## Workflow
- Always grab the next available ticket from the project board or task queue.
- Complete the ticket end-to-end before starting another.
- When finished, mark the ticket as complete with any required notes or links.

## Delivery Standards
- Follow repository conventions and document any deviations.
- Prefer small, focused changes with clear commit messages.
- Run relevant tests or checks when possible and report results.

---

# AGENTS.md

## Project Overview

This project is a local-first read-it-later web app (Pocket successor).

Core principle:

The browser is the database. IndexedDB is the single source of truth.

The app must work fully offline after import. There are no accounts, no backend, no sync in the MVP.

---

## Locked Technical Decisions (DO NOT CHANGE)

### Framework & Language
- Vite + React + TypeScript
- No Next.js
- No server components

### Storage
- IndexedDB via Dexie
- Dexie is mandatory (do not use idb-keyval or raw IndexedDB APIs)

### Parsing & Rendering
- Mozilla Readability for article extraction
- DOMPurify for sanitizing stored content_html
- Store:
- content_html (sanitized)
- content_text (plain text for search)

### Search
- FlexSearch
- Index plain text only (content_text)
- Do not index HTML

### Offline / PWA
- vite-plugin-pwa
- Service Worker must cache app shell
- App must load offline

### Export
- JSZip for ZIP generation
- Export Markdown files with YAML frontmatter

### Utilities
- uuid for IDs

---

## Hard Constraints (ABSOLUTE)
- ❌ No backend
- ❌ No accounts or auth
- ❌ No sync
- ❌ No payments
- ❌ No AI features
- ❌ No browser extension (bookmarklet only)
- ❌ No mobile native apps

If a task suggests adding any of the above, do not implement it.

---

## Import & Parsing Rules (CRITICAL)

### Pocket Import
- Input: ril_export.html
- Parse URLs + tags via DOMParser
- Import must be incremental (articles appear as they load)

### Fetching Articles
- Fetch client-side only
- CORS failures are expected
- Do NOT build a proxy server

### Parsing Failure Handling

If Readability fails or fetch is blocked:
- Store raw HTML
- Set parse_status = "partial"
- Article must still be viewable

Never hard-fail an import job.

---

## Offline Requirements (NON-NEGOTIABLE)

Manual test that must pass:
1. Import Pocket HTML
2. Open an article
3. Turn on airplane mode
4. Refresh the page
5. Library + article still work

If this fails, the implementation is wrong.

---

## Storage & Persistence Rules
- Show estimated IndexedDB storage usage in Settings
- Warn user at ~70% usage
- After first successful import:
- Call navigator.storage.persist()
- Do not silently fail when storage limits are approached

---

## Acceptance Tests (EVERY PR MUST PASS)

Each ticket implementation must manually verify:
1. No network dependency for reading imported articles
2. IndexedDB contains all primary data
3. Export produces readable Markdown files
4. Search works on imported article text
5. No crashes on partial/failed imports

---

## Code & PR Conventions
- Imports at top of files
- One ticket = one PR
- Keep PRs small and focused
- Each PR description must include:
- What was implemented
- How it was manually tested

---

## Product Philosophy (DO NOT VIOLATE)
- Trust > features
- Ownership > convenience
- Offline > cloud
- Export > lock-in

If you are unsure whether to add something, don’t.

---

## Final Reminder

This is an MVP, not a platform.

If users love it, sync and monetization come later.
For now, ship the smallest thing that proves ownership and offline trust.
