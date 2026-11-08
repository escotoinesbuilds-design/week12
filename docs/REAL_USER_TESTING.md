# Week 13 real-user testing

## Status and evidence boundary

This document separates a user-reported testing summary from evidence available in the project documentation. Missing details are intentionally left blank; no interview, feedback, date, measurement, usability finding, or successful appointment is inferred.

## 1. User-reported testing activity

The project owner reports that:

- Five real people tested RutaSalud.
- At least three of the five were strangers to the project team.

These are user-reported activity statements. Individual participant/session details and supporting records have not yet been supplied here. No date or testing period was provided. Consent status, participant/session identifiers, task protocol, and whether any task involved an actual clinic are not reported.

## 2. Documented observations and evidence

- The project owner supplied the testing count and stranger count above; this document records that report without treating it as independently verified session evidence.
- The repository does not yet contain individual real-user session notes, anonymized session records, timing or task-completion measurements, observed usability problems, or participant feedback for these five sessions.
- [docs/PERSONA_TEST.md](./PERSONA_TEST.md) describes a **synthetic persona exercise**, not a session with a real patient. Its scenario and feedback must not be attributed to the five reported real participants.
- Automated tests and local/live browser smoke checks recorded in [docs/TEST_LOG.md](./TEST_LOG.md) are product/mechanical checks, not real-user observations.
- No evidence of a clinic response, real request delivery, or successful appointment was supplied. No successful appointment is claimed.

## 3. Missing evidence

The following details are needed to make the real-user testing record auditable without collecting unnecessary personal or medical information:

- Dates or testing period for each session.
- Anonymous session IDs and a record of which participants were strangers to the team (without recording names or identifying details).
- Whether informed consent was obtained and how it was documented; do not add participant identity or medical information to this report.
- The task or scenario given to participants and whether the same task was used for all five.
- For each session: task completion, elapsed time, confusion, errors, observed usability problems, and feedback in the participant's own words only where accurately recorded and permitted.
- Any moderator assistance and relevant test conditions, such as device or viewport, if recorded.
- Whether any step involved an actual clinic, and evidence for any actual request or appointment claim. Without clinic evidence, describe only the user's attempted task, not a successful operation.

Do not reconstruct missing notes from memory as verbatim quotes or measurements. If details cannot be verified, mark them unavailable.

## 4. Outstanding improvements

1. Add one anonymized session record for each of the five reported sessions, using only details actually documented and marking unavailable fields explicitly.
2. Record user-reported activity separately from direct observations, participant quotations, and researcher interpretation.
3. Summarize repeated usability problems only after reviewing the individual records; include evidence and keep the count/denominator clear.
4. Prioritize and fix evidenced usability or false-certainty problems, then retest the affected tasks. Do not claim a fix worked for users without retest evidence.
5. Keep real-user testing separate from synthetic persona exercises and mechanical/browser checks in future reports.
6. Do not claim clinic contact, appointment confirmation, or a successful appointment without evidence from the clinic.

## Session record template

Copy this template once per session. Use an anonymous ID; do not record names, contact details, diagnoses, or other unnecessary sensitive information.

| Field | Record |
|---|---|
| Anonymous session ID | Not supplied |
| Date | Not supplied |
| Stranger to project team? | Not supplied |
| Consent recorded? | Not supplied |
| Task/scenario | Not supplied |
| Task completed? | Not supplied |
| Time | Not supplied |
| Confusion observed | Not supplied |
| Errors observed | Not supplied |
| Usability problems | Not supplied |
| Feedback / quote permission | Not supplied |
| Moderator assistance / conditions | Not supplied |
| Clinic or appointment evidence, if applicable | Not supplied |

