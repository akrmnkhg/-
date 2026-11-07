# Implementation Plan - Official Store Emblem Integration

## Goal
Integrate the official store emblem image (`/public/assets/aistudio/IMG_1918_6b43c639.PNG`) prominently, neatly, and in an organized manner on the home page (`HomeHeroBanner` and `Header`), ensuring it matches the store's exact branding ("الجمل للخضار والفواكه والتمور", "صنعاء - حدة داخل التوفير هايبر", and phone number `776 662 030`).

## Proposed Changes

### 1. Home Hero Banner (`src/components/HomeHeroBanner.tsx`)
- Refine the hero card layout to showcase `/assets/aistudio/IMG_1918_6b43c639.PNG` with a clean glowing frame, golden accents, and high visual hierarchy.
- Ensure the single active branch ("حدة داخل التوفير هايبر") and direct call/WhatsApp buttons are perfectly aligned.

### 2. Header (`src/components/Header.tsx`)
- Ensure the header logo uses the official emblem cleanly at a compact size.

## Verification Plan
- Run `compile_applet` and `lint_applet` (`tsc --noEmit`).
- Verify visual presentation across views.
