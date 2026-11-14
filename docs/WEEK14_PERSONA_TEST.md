# RutaSalud Week 14 — Synthetic Persona Test

## Test context

This is a **synthetic persona evaluation** of five screenshots of the live `/pricing` calculator. It is not a real clinic session, interview, observed willingness-to-pay study, or evidence that a customer accepts any specific price. No claim is made that Mariana personally used or retested the improved calculator.

## Persona profile

**Mariana, 44, small-clinic administrator in Mexico City**

- Coordinates a clinic with three doctors.
- Uses WhatsApp, phone calls, and a shared calendar.
- Has a limited budget and is skeptical of paying the proposed $699 MXN/month Clinic Essentials price without demonstrated benefits.

## Five-screen synthetic test summary

Five screenshots of the live pricing calculator were evaluated as one walkthrough. The supplied notes say Mariana understands the calculator, but does not trust its default financial projections because additional consultations and staff-time savings have not been demonstrated. No screenshot-specific observations were supplied, so none are inferred here.

## Main confusion and hesitation findings

- The calculator is understandable, but its estimated financial benefits are not supported by demonstrated outcomes.
- Additional attended consultations and staff hours saved are assumptions, not established clinic results.
- A proposed $699 MXN/month subscription is difficult to assess when the positive benefit assumptions are uncertain.

## Ranked usability problems

1. **Hypothesis/evidence distinction is insufficient:** users need an immediate comparison that does not count unproven benefits as established value. This was the worst usability problem.
2. **Positive default projections can be mistaken for meaningful expected value:** their consultation and staff-time inputs are hypothetical and have not been demonstrated.
3. **Cost exposure without benefits is not immediately visible:** a clinic needs to see the monthly net outcome if no additional consultations or administrative savings occur.

These are a concise synthesis of the supplied synthetic test finding and requested improvement, not additional participant statements.

## Specific improvement implemented

The estimated-results section now shows two results side by side:

- **Escenario estimado · tus supuestos:** the existing adjustable consultation and staff-time assumptions and the existing calculator formula.
- **Escenario conservador · sin beneficios demostrados:** zero additional consultations and zero staff hours saved, while retaining the selected subscription and any monthly clinic implementation/support cost already entered.

The conservative result includes this plain-language warning: it assumes zero additional consultations and zero administrative savings; it is not a prediction or verified result. With Clinic Essentials at $699 MXN/month and no other clinic costs, the conservative net monthly result is **−$699 MXN**.

## Before / after

- **Before:** The results centered on the user's adjustable positive assumptions, which could make unproven consultation growth or time savings look more credible than warranted.
- **After:** The adjustable estimate remains available, but a clearly labeled zero-benefit comparison makes the subscription and clinic-cost downside visible alongside it. The comparison is still hypothetical and does not establish likely savings or value.

## Developer verification — not a persona retest

After implementation, developer verification (not Mariana retesting) confirmed:

- Unit tests calculate Clinic Essentials at $699 MXN with zero consultations, zero staff hours, and no clinic costs as **−$699 MXN net/month**; an entered $125 monthly clinic cost produces **−$824 MXN net/month**.
- In the built app, the comparison displayed the existing adjustable estimate beside the conservative result. The conservative card stated the zero-benefit assumption and that it is not a prediction or verified result.
- Browser interaction confirmed changing the plan to Básico changed the conservative subscription to $0; with $125 clinic costs, the conservative net was −$125. Returning to Clinic Essentials and zero clinic costs restored −$699.
- A named hypothetical scenario still saved, persisted after refresh, loaded its consultation assumption, and deleted successfully.
- At 375 px mobile width, the comparison stacked vertically without horizontal overflow. The conservative card had its intended warning-tinted background and border.
- `npm run lint`, `npm test` (36 tests), and `npm run build` passed.

These are developer checks of the implementation, not a follow-up persona test or evidence of improved trust or willingness to pay. Post-deployment verification will be reported separately.

## Evidence boundary

This synthetic feedback is **not real clinic willingness-to-pay evidence**. It does not show that Mariana or any clinic will pay $699 MXN/month, that additional consultations will occur, that staff time will be saved, or that RutaSalud produces savings or revenue. The subscription hypotheses, projected clinic benefits, and platform costs remain unvalidated.
