# RutaSalud synthetic persona test

## Test context

This is a **synthetic persona exercise**, not a session with a real patient, not an interview, and not validated user research. The persona and feedback below were supplied as test input for a walkthrough. Do not use this exercise to claim validated demand or real-world usability.

## Persona

**Mariana, 46, Mexico City**

- Maximum budget: $1,000 MXN
- Maximum distance: 5 km
- Preferred schedule: afternoons
- Doctor preference: female

## Screens walked through

1. **Patient preferences:** Mariana understands the form and appreciates being able to make her own decisions.
2. **Doctor comparison results:** She appreciates explicit match, mismatch, and unknown labels and understands the provider records are fictional.
3. **Changing preferences:** The screen/flow was included in the test scenario. Changes to preferences are not classified as a confirmed bug; this may be deliberate behavior and requires separate observation before any issue is asserted.

## Feedback and trust concerns

- She does not understand how distance can be determined when she has not entered her location.
- Long comparison results require excessive reading.
- She wants confirmation that the comparison used the preferences she intended.
- Before making real medical decisions, she needs verified prices, schedules, specialties, and qualifications.
- She understands that the provider records shown in this prototype are fictional.

## Most important usability problem

The distance values could be mistaken for real location-based calculations: the application asks for a maximum distance but does not ask for a starting location. That ambiguity can undermine trust in the comparison. The distance shown in this demo is only a fictional fixture value and must never be understood as calculated from Mariana's location.

## Change made

The distance field now states that demo distances are fictional and do not use the patient's location. Each displayed provider distance and its comparison explanation repeat that it is fictional and not calculated from the patient's location. No location collection, maps, or real-distance calculation was added; comparison behavior and preference entry remain unchanged.

## Retest

**Local browser retest:** The distance field displayed “En esta demo son valores ficticios; no usamos tu ubicación.” All four provider cards displayed “Distancia ficticia (no usa tu ubicación),” and the four distance comparison explanations included “no calculada desde tu ubicación.” With Mariana's supplied constraints, all four comparison cards remained visible.

**Automated retest:** `npm test` passed (1 test file, 7 tests); `npm run lint` passed; `npm run build` passed. The added unit test checks the location disclaimer for both matching and mismatching distance explanations.

This synthetic persona exercise and local retest do not establish verified provider information or real-world user outcomes.
