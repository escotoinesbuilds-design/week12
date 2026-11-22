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

This confirms the existing Vercel deployment serves the implementation. It does not show that participants opened the page or completed a task.

## Post-launch reported outreach and evidence boundary

The project owner confirms promotional outreach messages were sent to participants with the RutaSalud launch-page link and three feedback questions. The exact send date, specific channel, message count, channel permission, delivery/open records, exact wording of the questions, and consent records were not supplied. This is reported outreach, not independent evidence that recipients received or opened messages or visited the site.

A screenshot of one outreach message was reviewed separately. It showed the promotional message, launch-page link, and disclosure that provider profiles are simulated. It documents the visible content of that one message only; it does not establish delivery, a link click, a visit, or delivery of two separate campaign graphics. The screenshot is not included in this repository.

The five anonymous responses are documented in [docs/WEEK15_DISTRIBUTION_TEST.md](./WEEK15_DISTRIBUTION_TEST.md). They report self-described understanding, graphic preferences, and hypothetical click intent. They are not verified website visits, clicks, conversions, completed tasks, or provider verification.

The available evidence does not establish placement of two distinct finished pieces in permitted channels or that five consented participants opened the website and completed the planned match/evidence/next-step task. Consent, independently established exposure, task success, elapsed time, confusion, and task-based understanding remain unreported. No impressions, actual clicks, conversions, or engagement are claimed; Week 15 distribution success remains unproven.
