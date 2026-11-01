# Week 12 application decisions

## Current decisions

- **Interface:** Spanish (`es-MX`), mobile-first, with the RutaSalud visual direction from the project mockup.
- **Comparison:** ordinary deterministic TypeScript; each provider remains visible and receives a match, mismatch, or unknown for budget, distance, schedule, and provider-gender preference.
- **Unknown data:** missing fields never count as a match. Records marked unverified produce unknown results for every constraint.
- **Demo records:** local, fictitious provider profiles are available without external services and labeled as simulated in the interface.
- **Preferences:** held only in page memory for comparison; they are not sent to an API or persisted.
- **Supabase:** optional read-only provider source using a public anon key and RLS. The migration permits public reads only and limits statuses to simulated or unverified. No credentials are committed.
- **Scope:** no diagnosis, booking, payments, messaging, maps, or real-time availability.
- **Testing:** Vitest unit tests cover comparisons and preference validation; production build and lint are required before handoff.
- **Validation accessibility:** After live testing found focus stayed on the submit button when validation failed, invalid submissions now move focus to the first invalid control. See [docs/TEST_LOG.md](./docs/TEST_LOG.md) for reproduction and retest evidence.

## Evidence boundary

No patient research or real provider verification is asserted. The fictional dataset and local tests demonstrate application behavior only; they are not evidence of demand, provider accuracy, or real-world success.

## Next action

After the validation-focus fix is deployed, continue reviewing keyboard and mobile accessibility. Test the complete search task with a real affected person only with informed consent. Record observed evidence separately from interpretation. Before using Supabase records beyond fixtures, verify their source and permissions and decide how each field's provenance and current accuracy will be established.
