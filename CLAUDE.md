# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QRTIST is a QR code generator web app that creates custom-branded QR codes with background images, configurable dot colors, opacity, and blend modes. Built with Angular 21, styled with Tailwind CSS v4, and uses the `qrcode` library for QR generation on an HTML canvas.

## Commands

- **Dev server:** `npm run dev` (serves on port 3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint with angular-eslint)

## Architecture

- **Single-component app:** All UI and QR generation logic lives in `src/app/app.ts` (standalone component with inline template). There are no child components or routes currently.
- **QR rendering:** Uses `qrcode` library's `QRCode.create()` to get raw module data, then renders manually on a `<canvas>` with custom dot styles, finder patterns, background images, and blend modes.
- **Styling:** Tailwind CSS v4 via PostCSS (`.postcssrc.json`), all styles are inline in component templates using utility classes. Brand color is `#ff3333`.

## Conventions

- Component prefix: `app` (kebab-case for elements, camelCase for directives)
- Strict TypeScript: `strict`, `strictTemplates`, `strictInjectionParameters` enabled
- Standalone components (no NgModules)
