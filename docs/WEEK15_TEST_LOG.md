# Week 15 launch and security test log

**Test date:** 2026-11-22
**Environment:** Existing RutaSalud repository and local production build; synthetic profile and campaign examples only.

## Security advisory and patch

The project used `next@16.4.3`. npm audit reported seven Next.js advisories affecting 16.x through 16.4.4:

- GHSA-mfr8-8qww-v76h — cross-root-parameter information disclosure when combining `use cache` and `unstable_cache`.
- GHSA-vc7v-qv4w-wrv8 — cross-root-parameter cache leakage through nested `use cache` calls.
- GHSA-7qx7-33qx-rqx2 — SVG rejection bypass in image optimization.
- GHSA-f3mh-rxg3-f5g2 — cookie exposure through an internal response header on Edge routes.
- GHSA-pc58-hwjq-p385 — cross-client response injection/disclosure in a specific self-hosted proxy setup.
- GHSA-rhh4-g77r-r9qj — cross-user cache disclosure/poisoning with binary `use cache` arguments.
- GHSA-vvgp-ww4w-46vf — shared fallback-shell cache poisoning under specific Cache Components and self-hosted conditions.

The official [November 2026 Next.js security release](https://nextjs.org/blog/november-2026-security-release) identifies `16.4.5` as the patched 16.x version. Updated `next` and the matching `eslint-config-next` from `16.4.3` to `16.4.5`; React and unrelated dependencies were not changed. The patched production build completes successfully without bypassing the security check. npm audit no longer reports a Next.js advisory. Seven moderate audit findings remain in the unrelated TypeScript ESLint/Minimatch dependency tree; those were not part of this targeted fix.

## Automated checks

- `npm test`: passed, 4 test files and 36 tests.
- `npm run lint`: passed.
- `npm run build`: passed with Next.js 16.4.5; `/launch` and `/launch/opengraph-image` were statically generated.

## Launch page, assets, and accessibility checks

- Local production `/launch` returned HTTP 200.
- Every internal route and campaign asset link returned HTTP 200; the primary “Comparar perfiles de demostración” action navigated to `/#preferences-title`, where the existing comparison form was present.
- The generated Open Graph route returned a PNG image. The page uses a single `h1`, named navigation and landmark regions, a keyboard skip link, and descriptive alternative text on all three campaign previews.
- At viewport widths of 320 px, 390 px, and 1280 px, document width equaled viewport width; no horizontal overflow was observed.
- Campaign files are static SVGs and can be downloaded from the launch page. All sample profiles, prices, distances, and schedules are clearly labeled fictitious or simulated. The graphics do not claim provider quality, verified availability, or a real/confirmed appointment.
- No contact form, waitlist, medical-information field, tracking, or external service was added.

## Distribution evidence boundary

No campaign asset has been placed in a public channel or sent to an audience as part of this implementation. No audience exposure, reactions, participant sessions, or engagement are claimed. Completion still requires permitted placements of two pieces and the planned five-person, consented, anonymized usability test, with actual task completion, elapsed time, confusion, and evidence/next-step understanding recorded separately.
