# Verification — 24 September 2026

## Local model and page

- Ten model tests pass. Every reachable state conserves lane, crew, cargo and shuttering; every complete trace finishes. Invalid actions and absent-cattle actions are rejected without mutation.
- Baseline: 11 states / 6 event traces. Cattle-present: 30 states / 68 event traces. No reachable deadlock in either bounded world. Event order counts are not probabilities and are not quotiented by independent-event swaps.
- Fixed-time schedules are checked against the same transition rules, resource exclusion and prerequisites. At time-zero readiness, baseline and delivery-first pours finish at 22; cattle-first at 37. In delivery-first, all work including cattle finishes at 25.
- Independent conceptual review corrected a Petri return arc, outcome/process set labels, the typing of sequential shorthand, and the scope of the WBS/action nesting.
- Browser checks: cattle start blocks delivery but allows shutter preparation; cattle finish releases delivery; complete cattle-first journey; complete baseline journey at 390px; keyboard start/finish, reset and reload. Phone layout stays within the page and large diagrams have focusable horizontal scrolling. No browser errors observed.
- Desktop screenshots inspected for the baseline wiring, cattle-first wiring and Euler picture. Hero and source pictures have descriptive text alternatives. Static diagrams remain present without JavaScript.
- Local-link and source-image-hash checks pass; all six originals remain byte-identical.

## Context-comb addition

- The original “Project tasks in context” photograph is now prominent and remains byte-identical to its source. The generic SVG is a separate explanatory construction.
- Independent conceptual review checked the two-stage handover types, allocation of exclusive resources, uncertainty across both process lanes, and the boundary between an ordinary typed process schematic and Capucci’s optic construction. The text distinguishes a completed composite from transition-enabling and waiting semantics.
- Desktop screenshots inspected for the original/commentary pairing and the complete generic SVG. At a 390px viewport setting the page had no horizontal overflow; the large diagram scrolled independently by keyboard, and its formal explanation opened and wrapped within the page. The normal viewport was restored.
- The ten existing model tests and local-link/original-hash checks passed. The executable model is unchanged.

## Evidence boundary

These are model checks and agent-operated browser observations. There is no separate human-user test, engineering assurance or evidence of improved delivery outcomes.

Publication evidence is recorded in the repository history and the local Portfolio Wave experiment receipt after deployment verification.
