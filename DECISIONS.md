# RutaSalud application decisions

## Week 13 implementation decisions

- **Workflow boundary:** The handoff is a browser-local demonstration only. Prepared, sent, clinic-response, and confirmed examples are always labeled simulated; no notification, request, contact, or booking is transmitted or stored.
- **Price evidence:** A clinic-confirmed price requires a non-empty source and valid confirmation date. Simulated provider values can never be promoted to confirmed. Unverified values without evidence remain unconfirmed; evidence older than 30 days is marked outdated. The 30-day threshold is a conservative prototype rule, not a validated clinic policy.
- **Provider facts:** Specialty and other facts are optional; missing values stay visible as unavailable. Demo fixtures are fictional and carry explicit simulated network status. No clinic identity or provider fact is claimed as real or verified.
- **Outside-network providers:** Clearly marked as outside the simulated network; patients must arrange any appointment directly. RutaSalud does not track their contact.
- **Follow-up:** Demo records have no assigned update owner or date; the UI says so and shows a pending next action rather than implying an operator has verified or contacted a clinic.
- **Feedback:** Clarity responses are counted only in page memory, have no identity or health fields, are not transmitted, and are lost on reload.
- **Data/security:** No new API, database table, credentials, authentication, patient-data storage, or integration was added. Existing comparison validation and read-only Supabase behavior remain in place.
- **Testing:** Week 13 mechanics are covered by Vitest; local browser smoke testing checks comparison preservation, simulated status transitions, outside-network wording, ephemeral feedback, and mobile overflow. These checks do not replace the required five real-user sessions.

## Week 13 next action

The existing GitHub-triggered Vercel deployment now serves the pushed Week 13 demo. Next, obtain team approval of the simulated Blueprint draft and assign a real operational owner before any live clinic data is considered. Recruit consenting general-practice clinics and conduct five consented real-user sessions (at least three strangers), recording task completion, time, confusion, and errors without patient medical information. Do not claim a pilot, clinic verification, real request, or confirmed appointment until supporting evidence exists.

## Week 12 decisions (historical, retained)

- **Interface:** Spanish (`es-MX`), mobile-first, with the RutaSalud visual direction from the project mockup.
- **Comparison:** ordinary deterministic TypeScript; each provider remains visible and receives a match, mismatch, or unknown for budget, distance, schedule, and provider-gender preference.
- **Unknown data:** missing fields never count as a match. Records marked unverified produce unknown results for every constraint.
- **Demo records:** local, fictitious provider profiles are available without external services and labeled as simulated in the interface.
- **Preferences:** held only in page memory for comparison; they are not sent to an API or persisted.
- **Supabase:** optional read-only provider source using a public anon key and RLS. The migration permits public reads only and limits statuses to simulated or unverified. No credentials are committed.
- **Scope:** no diagnosis, booking, payments, messaging, maps, or real-time availability.
- **Testing:** Vitest unit tests cover comparisons and preference validation; production build and lint are required before handoff.
- **Validation accessibility:** After live testing found focus stayed on the submit button when validation failed, invalid submissions now move focus to the first invalid control. See [docs/TEST_LOG.md](./docs/TEST_LOG.md) for reproduction and retest evidence.
- **Distance transparency:** Synthetic persona walkthrough feedback showed that demo distances could be mistaken for location-based calculations. The form, provider cards, and comparison explanations now state that distance values are fictional and are not calculated from the patient's location. See [docs/PERSONA_TEST.md](./docs/PERSONA_TEST.md); this synthetic exercise is not validated user research.

## Week 12 evidence boundary (historical)

No patient research or real provider verification is asserted. The fictional dataset and local tests demonstrate application behavior only; they are not evidence of demand, provider accuracy, or real-world success.

## Week 12 next action (historical)

After the distance clarification is redeployed, continue reviewing keyboard and mobile accessibility. Test the complete search task with a real affected person only with informed consent. Record observed evidence separately from interpretation. Before using Supabase records beyond fixtures, verify their source and permissions and decide how each field's provenance and current accuracy will be established.
