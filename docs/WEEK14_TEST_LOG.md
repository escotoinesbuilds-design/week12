# RutaSalud Week 14 — Mechanical Test Log

## Live baseline

- **Date:** 2026-11-13
- **Route tested:** <https://rutasalud-w12.vercel.app/pricing>
- **Build under test:** First Week 14 deployment (`791ce55`).
- **Data:** Synthetic calculator assumptions and temporary `Mechanical QA` scenario names only. No personal or patient data was entered. Test scenarios were deleted after use.

## Mechanical checks

| Area | Steps / input | Expected | Observed |
|---|---|---|---|
| Default calculations | Open the pricing route with its default Clinic Essentials assumptions: 4 consultations × $450, 6 staff hours × $110, $699 subscription. | Consultation contribution $1,800; administrative savings $660; benefit $2,460; net $1,761; benefit/subscription 3.52×; net ROI 251.93%. | All values matched. |
| Plan selection | Select Básico, then Clinic Advanced. | Básico shows $0 subscription and “No aplica” for division-based ratios; Advanced shows its proposed $1,299 price and unavailability warning. | Both states matched; no division by zero. |
| Invalid numeric values | Enter `-1` staff hours and `1.5` additional attended consultations. | Both inputs are marked invalid and results are withheld. | Both were marked invalid with field errors; results were withheld. |
| Step-constrained numeric value | Enter `0.1` staff hours. The input specifies a `0.25` step. | Reject as an invalid value; do not calculate from a value the input marks as a step mismatch. | **Bug reproduced:** browser `checkValidity()` was false and `validity.stepMismatch` true, but `aria-invalid` was `"false"`, there was no field error, and calculator results remained visible. |
| Scenario name validation | Submit a whitespace-only name; then save a valid name and try the same name with different capitalization. | Reject blank names and duplicate names; keep only one saved scenario. | Both invalid cases were rejected. |
| Save / refresh / load / compare / delete | Save two named scenarios, refresh, select both for comparison, load the second scenario, delete the first, then delete the remaining test scenario. | Both survive refresh, compare side-by-side, load the saved assumptions, and delete independently. | Persistence and comparison worked; loading restored 5 consultations; deleting one preserved the other. Both test scenarios were removed. |
| Mobile layout | Set viewport to 375 × 812. | Controls remain usable without horizontal page overflow. | Six numeric inputs remained present; plan cards rendered in two columns; document width was 375 px with no horizontal overflow. |

## Confirmed bug and fix target

**Reproduction:** On the live pricing page, focus “Horas del personal ahorradas” and enter `0.1`. The control declares `step="0.25"`, so the browser reports a step mismatch, but the application’s custom validator checks only finiteness and min/max. It therefore treats `0.1` as valid and continues calculating.

**Expected:** Values that do not conform to a numeric input’s declared increment must be rejected with a field-level validation message, and calculations must be withheld until corrected.

**Actual before fix:** The browser considered the input invalid, while the application considered it valid and displayed results. This is inconsistent validation and can produce an unintended projection.

At the time of this live baseline, the bug was not yet fixed. Regression and deployment status are recorded below. No persona test was conducted as part of this mechanical test.

## Fix and regression verification

- **Fix:** The shared calculator validator now checks that every numeric assumption conforms to its declared step, using a floating-point tolerance. Staff hours such as `0.1` are rejected for a `0.25`-hour increment; `0.25` is accepted. Invalid values cannot reach the calculation.
- **Regression test:** `src/lib/pricing.test.ts` verifies the `0.1` rejection, calculation refusal, and valid `0.25` calculation (`$27.50` administrative savings with the default `$110` hourly cost).
- **Pre-deployment checks:** `npm run lint` passed; `npm test` passed (34 tests); `npm run build` passed and included the static `/pricing` route.
- **Live status:** The first deployment exhibited the bug above. The second deployment and post-deployment browser retest are pending; no post-fix live result is claimed here.

No persona test was conducted; that remains a separate activity.
