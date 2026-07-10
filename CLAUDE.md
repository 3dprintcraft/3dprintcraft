# 3DPrintCraft — site repo

Greek marketing site for 3DPrintCraft. Spec: `docs/superpowers/specs/2026-07-08-3dprintcraft-website-design.md`.

## Vellum Forge
Design tokens, past-work patterns, and DesignOps rules live at
`C:\Users\Nomikos\Documents\GitHub\vellum-forge` (read CLAUDE.md there first).
Use /extract-patterns, /scaffold-site, /harden, /design-research.
Source projects are READ-ONLY; log design decisions to the vault's SESSION-LOG.md.

## Project Profile (per vault WEB-STANDARDS.md)
- **Brand / client:** 3DPrintCraft
- **Entity type:** LocalBusiness
- **Production domain:** https://3dprintcraft.gr
- **`sameAs` profiles:** https://instagram.com/3dprintcraft
- **`knowsAbout` niches:** 3D printing, NFC gadgets, custom keychains, coasters, phone stands, website creation
- **Primary keywords / entities:** 3D εκτύπωση Πάτρα, custom μπρελόκ NFC, NFC stand, σουβέρ 3D, κατασκευή ιστοσελίδων Πάτρα, 3D printing Greece
- **Stack:** static HTML5 + custom CSS + vanilla JS on Cloudflare Pages (Tailwind waived — proven custom system reused, see spec amendment)

## Rules
- All copy Greek; code/comments English. WCAG AA. No inline `<script>` (strict CSP in `_headers`).
- All motion gated behind `prefers-reduced-motion`; `?motion=force` overrides for testing (preview env has reduced-motion ON).
- E-shop later: dock keeps the disabled Shop pill; new shop pages must not require touching v1 pages.
