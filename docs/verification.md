# Verification — 24 September 2026

## Local model and page

- Ten model tests pass. Every reachable state conserves lane, crew, cargo and shuttering; every complete trace finishes. Invalid actions and absent-cattle actions are rejected without mutation.
- Baseline: 11 states / 6 event traces. Cattle-present: 30 states / 68 event traces. No reachable deadlock in either bounded world. Event order counts are not probabilities and are not quotiented by independent-event swaps.
- Fixed-time schedules are checked against the same transition rules, resource exclusion and prerequisites. At time-zero readiness, baseline and delivery-first pours finish at 22; cattle-first at 37. In delivery-first, all work including cattle finishes at 25.
- Independent conceptual review corrected a Petri return arc, outcome/process set labels, the typing of sequential shorthand, and the scope of the WBS/action nesting.
- Browser checks: cattle start blocks delivery but allows shutter preparation; cattle finish releases delivery; complete cattle-first journey; complete baseline journey at 390px; keyboard start/finish, reset and reload. Phone layout stays within the page and large diagrams have focusable horizontal scrolling. No browser errors observed.
- Desktop screenshots inspected for the baseline wiring, cattle-first wiring and Euler picture. Hero and source pictures have descriptive text alternatives. Static diagrams remain present without JavaScript.
- Local-link and source-image-hash checks pass; all six originals remain byte-identical.

## Evidence boundary

These are model checks and agent-operated browser observations. There is no separate human-user test, engineering assurance or evidence of improved delivery outcomes.

Publication evidence is recorded in the repository history and the local Portfolio Wave experiment receipt after deployment verification.
