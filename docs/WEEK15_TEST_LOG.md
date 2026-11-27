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

The project owner reports that all five participants agreed voluntarily; both promotional messages and both campaign graphics were shared with the intended audience alongside the live RutaSalud launch link; and all five provided feedback and reported completing the comparison task. Exact distribution dates for the messages, specific channels, moderator/account permission, delivery/open records, exact question wording, and formal consent records were not supplied. These are owner-reported outreach and consent confirmations, not independently verified delivery or website visits. Task completion remains participant-reported.

A privacy-safe screenshot provided by the project owner is dated November 22, 2026. It shows one outreach message with the launch-page link and disclosure that provider profiles are simulated. It documents only the one message shown and does not independently establish delivery, a link click or visit, or sharing of both separate campaign graphics. Do not infer exact delivery dates for other messages from the screenshot. The owner-reported sharing confirmation is recorded in [docs/WEEK15_DISTRIBUTION_TEST.md](./WEEK15_DISTRIBUTION_TEST.md). The screenshot is not included in this repository.

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

The project owner reports that both promotional messages and both campaign graphics were shared with the intended audience alongside the live launch link, and that all five participants agreed voluntarily. The five participants self-reported completing the task. The owner-provided privacy-safe screenshot is dated November 22, 2026 and supports the content shown in one message only; it does not establish delivery dates for other messages or independently verify delivery, site visits, or clicks. The specific assets, channels, URLs, exact dates, and moderator/account permission are not documented, so placement in permitted channels remains unestablished. Task behavior and time are self-reported; no impressions, conversions, confirmed appointments, or engagement are claimed.

## Week 16 mandatory checks and security review

**Test date:** 2026-11-27

**Environment:** Existing app production build, served locally at `http://127.0.0.1:3000`; synthetic local profiles only. Browser screenshots were saved under `docs/`.

### Build and automated tests

- `npm test`: passed, 4 test files and 36 tests.
- Initial Week 16 `npm run build` passed with Next.js 16.4.5 and generated `/`, `/api/providers`, `/launch`, and `/pricing`; `/about` did not yet exist at that point. The requested `/about` route was added and verified in the follow-up below.

### 1. Core comparison task

- Fresh production browser at 390 × 844; entered budget `$1,000 MXN`, distance `5 km`, afternoon schedule, and preference for a woman. Specialty remained at the form's default “Sin preferencia.”
- The comparison completed with four local synthetic profiles: one complete match and three alternatives. The alternatives showed 3, 2, and 4 criteria to review; mismatch and unknown states were distinct.
- All four cards were labeled “Perfil ficticio”; the page notice said “DATOS SIMULADOS.” The result copy directs patients to review alternatives and says no real appointment is booked. No real-time availability or verified-price claim was displayed.
- Screenshot evidence: [320 px mobile page](./week16-mobile-320.png) and [390 px result summary](./week16-comparison-summary-390.png).

### 2. Safe-failure creative check

- Manually applied the existing Week 15 content-accuracy and transparency criteria in the product charter to the exact test claim: “All RutaSalud doctors have verified prices and real-time appointment availability.”
- **Result: rejected; not published.** The claim has no supporting evidence, asserts verification for every doctor, and asserts live availability absent from the demo's simulated/unverified data. The existing written criteria reject unsupported verification/availability claims. This is a manual editorial review, not an automated claim-checking tool; no correction was needed.

### 3. Mobile accessibility checks

- Inspected the production comparison at 320 × 844 and 390 × 844. `document.documentElement.scrollWidth` and `document.body.scrollWidth` equaled viewport width at both sizes (320 and 390 px), so no horizontal overflow was observed.
- Visual inspection found the page heading, simulated-data notice, form fields, result summary, and status labels wrapped without clipping. The notice uses 12 px text; body controls use 16 px text. The comparison button was reachable after scrolling and measured 254 × 49 px at 320 px and 324 × 49 px at 390 px. The results summary was also reachable after scrolling.
- Screenshots are linked above. No physical phone, screen reader, or participant was used; this does not establish assistive-technology usability or real-user comprehension.

### Security review

- A tracked-file scan for common service-role/private-key markers found no matches. `.env.example` is the only tracked environment file and contains blank placeholders; `.gitignore` excludes local `.env*` files other than the example. No secret values were printed or recorded.
- The comparison keeps non-medical preferences in page state. `/api/providers` is a public read-only route for provider records; it does not handle patient information. Supabase RLS is enabled on `providers` with public `SELECT` only; no write policy/grant was found in the migration.
- `/pricing` saves hypothetical assumptions and a free-text scenario name to browser `localStorage`. The UI warns against personal, patient, and clinical information; the storage is not authenticated or user-isolated. No personal data was used in these checks. Treat accidental identifying information in a scenario name on a shared browser as the most important untested privacy risk.
- Existing preference validation uses bounded numeric values and allow-listed schedule, gender, and specialty values; the automated suite passed. Synthetic local records appeared with “Perfil ficticio” labels and the page-level “DATOS SIMULADOS” notice.

No consequential application failure was reproduced, so no application correction was made. The safe-failure check was a manual review of the existing written process, not an automated checker.

### Follow-up: defense deck and mobile header

- Added the requested five-section Spanish defense deck at `/about` and a “Sobre RutaSalud” link in the existing `/` navigation. The production build generated `/about`; clicking the existing navigation link opened the route with title “Nuestra defensa | RutaSalud” and exactly five sections.
- `npm test` passed (4 files, 36 tests), `npm run lint` passed, and `npm run build` passed with `/about` generated.
- `/about` was checked at 320 × 844, 390 × 844, and 1280 × 900. At all three widths, document width equaled viewport width; all five sections rendered, including the localStorage privacy risk and shadow clause. Screenshot: [320 px defense deck](./week16-about-320.png).
- The existing `/` header was measured after adding the navigation link at 320, 360, and 390 px. The logo and navigation had horizontal gaps of 25, 65, and 95 px; there was no horizontal intersection or overflow. Although their vertical bounds share a range, they occupy separate horizontal columns. No meaningful accessibility failure was reproduced, so header CSS was left unchanged.
- No physical-device or screen-reader assessment was performed. The repository-level security review still does not validate production security.
