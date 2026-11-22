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

The five anonymous responses are documented in [docs/WEEK15_DISTRIBUTION_TEST.md](./WEEK15_DISTRIBUTION_TEST.md). They report self-described understanding, graphic preferences, and hypothetical click intent. The separate task reports below are also self-reported; neither set verifies site visits, clicks, conversions, or provider information.

## Five-person comparison-task feedback (self-reported)

The five anonymous participants reported:

| Participant | Completion | Approximate time | Confusion or feedback | Recognized simulated data | Stated next action |
|---|---|---|---|---|---|
| Person 1 | Yes | 2 minutes | Too much information at first; preferred name, specialty, and cost first. | Yes | Verify real doctor information and prices. |
| Person 2 | Yes | 1–2 minutes | None reported; recognized the demonstration label. | Yes | Examine profile and availability before booking. |
| Person 3 | Yes | 3 minutes | Too much results text; suggested better mobile organization. | Yes | Verify hospital affiliation and references. |
| Person 4 | Yes | 2 minutes | Unclear what happens after choosing a doctor and how an appointment is booked. | Yes | Check actual availability and confirm price. |
| Person 5 | Yes | 1.5 minutes | None reported. | Yes | Check credentials, experience, and availability. |

All completion and time values above are participant-reported, not independently observed task outcomes or measured durations. The aggregate response is 5/5 reported completion, approximate times from 1 to 3 minutes, 5/5 reported recognizing simulation, two reports of information overload, one report of booking confusion, and two reports of no significant confusion. Person 3's original Spanish-language understanding response remains verbatim in the linked distribution record; no Spanish wording for this task feedback was provided or inferred.

The responses indicate that people reported recognizing the simulation disclosure, while information density and booking guidance remain issues. The next actions are intended follow-ups only; they do not establish that a participant verified a doctor, price, hospital affiliation, credentials, or appointment availability.

## Remaining distribution evidence

The available evidence does not establish placement of two distinct finished pieces in permitted channels or provide consent records. Although all five participants self-reported task completion, the available information does not establish that five consented participants opened the site, and it does not independently verify task behavior or time. Confusion, simulation awareness, and next actions are documented as self-reports; there is no verified website analytics. No impressions, actual clicks, conversions, confirmed appointments, or engagement are claimed; Week 15 distribution success remains unproven.
