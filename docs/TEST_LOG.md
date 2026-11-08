# Week 12 mechanical test, fix, and redeploy log

## Live baseline

**Application:** `https://rutasalud-w12.vercel.app/`
**Baseline tested:** deployed version at commit `7ffa91b`
**Test date:** 2026-11-01
**Environment:** browser-based desktop interaction and 390 × 844 mobile viewport; no patient data entered

| Check | Actual observation |
|---|---|
| Empty-form validation | Submitting with blank required budget, distance, and schedule displayed three field-specific validation messages; the default “Sin preferencia” value was accepted. |
| Validation focus | After that invalid submission, `document.activeElement` remained the “Comparar opciones” button. None of the three invalid controls received focus. |
| Valid comparison | With budget `$1,000 MXN`, distance `5 km`, afternoon schedule, and woman preference, all 4 provider cards rendered. All 16 provider/constraint status labels appeared, including 4 unknowns and 5 mismatches; all 4 cards had a “Perfil ficticio” label. |
| Missing information | The missing distance on a fictional profile was shown as unknown with an explanation, not treated as a match. |
| Mobile layout | At 390 px viewport width, document width was 390 px; no horizontal overflow was observed. |

## Confirmed defect

**Defect:** When validation failed, the application displayed errors but left focus on the submit button. A keyboard or screen-reader user was not moved to the first invalid field, so the newly displayed field-specific message was not encountered as the immediate next interaction. This behavior was reproduced on the live application by submitting the blank form and checking the active element and invalid controls.

## Fix

On invalid submission, focus the first field marked `aria-invalid="true"` after React renders the validation errors. Clear the pending focus request when the user edits a field, submits valid values, or resets the form. This changes validation feedback only; it adds no product feature and does not change validation or comparison rules.

## Retest

Retest after the fix on the local application:

- Submit blank form; confirm focus moves to “Presupuesto máximo” and its associated validation message is available to assistive technology.
- Correct the required values; confirm comparison still renders all four fictional profiles and all 16 constraint statuses, including unknowns and mismatches.
- Recheck 390 px mobile width for horizontal overflow.
- Run `npm test`, `npm run lint`, and `npm run build`.

**Local retest result:** Passed. Blank submission focused `budgetMxn` (“Presupuesto máximo”); its `aria-describedby` referenced the field error and hint. Valid submission showed 4 profiles, 16 statuses, 4 unknowns, 5 mismatches, and 4 fictional-data labels. At 390 px, document width remained 390 px with no horizontal overflow.

**Automated retest:** `npm test` passed (1 test file, 6 tests); `npm run lint` passed; `npm run build` passed.

## Post-push deployment retest

**Deployment source commit:** `0b98dc2` on `main`
**Live URL:** `https://rutasalud-w12.vercel.app/`
**Test date:** 2026-11-01

After pushing, the live URL was reloaded and retested. Blank submission focused `budgetMxn` with all 3 expected validation errors present. A valid comparison showed 4 profile cards, all 16 statuses, 4 unknown statuses, 5 mismatches, and 4 simulated-data labels. The missing-distance explanation appeared in the results. At 390 px, the deployed page width was 390 px with no horizontal overflow. These observations confirm the fix is present on the live application.

## Week 13 local implementation retest

**Test date:** 2026-11-08
**Environment:** local Next.js development server; no real patient or clinic data entered

### Automated results

- `npm test`: passed (2 test files, 15 tests), including provider price-evidence freshness, missing/unverified data, outside-network classification, and valid/invalid simulated appointment transitions.
- `npm run lint`: passed.
- `npm run build`: passed with Next.js 16.4.3; `/` prerendered and `/api/providers` remained available.

### Browser smoke results

- Existing preference form still produced 4 comparison cards after a valid submit.
- A simulated walkthrough advanced through prepared, sent, clinic-response-pending, and confirmed examples. The UI stated that no request was sent and no real appointment exists.
- The outside-network fixture displayed the direct-arrangement boundary and said contact is not tracked.
- Clarity feedback incremented only the in-memory local count and stated it is not sent or saved.
- At a 390 px viewport, document width remained 390 px; no horizontal overflow was observed.

These are local mechanical/browser checks only. They are not clinic verification, real appointment evidence, or the required five real-user sessions.

## Week 13 comparison-clarity retest

**Run date:** 2026-11-08 (local)
**Environment:** Local Next.js app in browser; final after screenshots captured from a fresh production build; synthetic provider records and preference inputs only

### Changes exercised

- With budget `$1,000 MXN`, distance `5 km`, afternoon schedule, and woman preference, the UI reported 1 complete match and kept 3 alternatives visible.
- With budget `$700 MXN`, distance `1 km`, night schedule, and man preference, the UI reported no complete match and kept all 4 alternatives visible.
- Alternative cards listed each nonmatching or unknown preference with its existing explanation. Complete matches and alternatives had distinct visual labels and card treatments.
- The zero-match message explained why alternatives remain visible and provided patient-controlled options to review alternatives or change preferences.
- At a 390 px mobile viewport, the zero-match summary and all 4 alternative cards remained usable with no horizontal overflow.
- Final screenshots were recaptured from the fresh production build so no development-server indicator appears in the evidence.

### Automated results

- `npm test`: passed (2 test files, 18 tests), including complete-match, partial/unknown, and zero-complete-match summaries.
- `npm run lint`: passed.
- `npm run build`: passed.

### Before/after evidence

- [Before comparison card](./comparison-before.png): current interface before the clarity fix; an alternative's mismatches and unknown were listed without an explicit alternative label.
- [After zero-match summary](./comparison-after.png): prominent no-complete-match explanation and patient-controlled next steps.
- [After complete-match summary](./comparison-after-complete.png): complete and alternative counts for a scenario with a full match.
- [After alternative card](./comparison-after-alternative.png): distinct alternative badge and the exact four preferences not met in the zero-match scenario.

These are screenshots of local synthetic demonstrations. They show the code change, not a participant retest or a measured improvement in user performance. The six feedback reports are documented separately in [docs/REAL_USER_TESTING.md](./REAL_USER_TESTING.md); no dates, tasks, observed behavior, or post-fix user results were supplied.

### Post-push live comparison verification

**Test date:** 2026-11-08
**Source commit:** `47a3e52` on `main`
**URL:** `https://rutasalud-w12.vercel.app/`

The initial canonical-page reload returned cached prior HTML. A cache-busting query on the same branded URL loaded the updated deployment. The live comparison then showed 1 complete match and 3 alternatives for the full-match scenario, and 0 complete matches with 4 alternatives plus the no-complete-match message for the stricter scenario. The page returned HTTP 200. This verifies the deployed interface behavior only; it is not evidence of participant retesting or improved user outcomes.

### Post-push Vercel smoke check

**Live URL:** `https://rutasalud-w12.vercel.app/`
**Source pushed to `main`:** `6a80dfb`

After the push, the existing live URL served the Week 13 footer and handoff interface. A valid comparison rendered 4 cards, including simulated fee labels and the outside-network direct-arrangement guidance. At 390 px, the live document width was 390 px. This confirms the existing GitHub-triggered deployment serves the new demo UI; it does not confirm real provider data, clinic contact, booking, or user outcomes.
