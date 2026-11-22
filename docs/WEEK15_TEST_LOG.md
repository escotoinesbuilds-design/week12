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

## Post-push Vercel verification

After pushing implementation commit `7237a11` to the existing `main` branch:

- The existing canonical `https://rutasalud-w12.vercel.app/launch` returned HTTP 200 and rendered the Week 15 launch page.
- `/launch/opengraph-image` returned HTTP 200 as `image/png`.
- All six campaign SVG files under `/campaign/week15/` returned HTTP 200 as `image/svg+xml`.
- The existing `/` comparison route and `/api/providers` returned HTTP 200.
- In the live browser, the primary launch-page action navigated to `/#preferences-title`; the existing comparison form loaded and its comparison button was enabled.

This confirms the existing Vercel deployment serves the implementation. It does not show that the campaign has been distributed to an audience.

## Distribution evidence boundary

Five anonymous audience-response summaries were subsequently supplied and documented in [docs/WEEK15_DISTRIBUTION_TEST.md](./WEEK15_DISTRIBUTION_TEST.md). All five describe the basic RutaSalud value proposition and report hypothetical click willingness subject to stated conditions. These are self-reported reactions, not verified website visits, clicks, conversions, completed tasks, or provider verification. The response collection date, channel, consent record, participant demographics, and whether respondents saw the launch page or finished campaign files were not provided.

No evidence of permitted public-channel placement, impressions, actual clicks, completed participant tasks, elapsed times, or engagement was supplied. The planned two placements and five-person consented, anonymized task test remain incomplete; Week 15 distribution success is not claimed.
