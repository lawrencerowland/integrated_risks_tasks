# Foray 165 — Integrated risks and tasks

`FORAY-INTEGRATED-RISKS-TASKS` · `PW-PROCESS-165` · 24 September 2026

[Open the essay](../index.html) · [Source review](source-review.md)

## Ends

Formalise, visualise and explore the proposition that project tasks and processes associated with risks can be modelled in one connected account of resource and state transformation. Recover conventional task, schedule and risk views from that account without erasing the interactions they need to retain.

The toy project is a foundation pour on a site reached by a shared farm track. A farmer may walk cows along that track to market. The serious destination is compositional reuse across many projects made from recurring smaller blocks; neither this farm nor its chosen diagram is the final use case.

The first result should let a reader see why the cow process disables a delivery, why that does not delete the task, and why several schedules can arise from the same allowable transitions. It should also let the reader see when the mathematics is adding useful constraints rather than repeating a resource table.

## Ways — sources doing specific work

1. Coecke, Fritz and Spekkens, [A mathematical theory of resources](https://arxiv.org/abs/1409.5531): process-first resource transformation; sequential and parallel composition. Use the published paper's pp. 63–67. “Free” in resource theory is not a cost estimate.
2. Capucci, [Open cybernetics systems I: feedback systems as optics](https://matteocapucci.wordpress.com/2021/05/26/open-cybernetics-systems-i-feedback-systems-as-optics/), Context: the environment comb is the strongest located source for the enclosing picture. Separate scope/resource bars are Lawrence’s adaptation. Related formal treatment: [Towards Foundations of Categorical Cybernetics](https://arxiv.org/abs/2105.06332), §§3–4. A comb-like picture alone is not an implemented optic.
3. Patterson, Spivak and Vagner, [Wiring diagrams as normal forms for computing in symmetric monoidal categories](https://arxiv.org/abs/2101.12046), §2.1: typed ports, composition and substitution. Declare semantics separately. Do not silently turn an arbitrary loop into valid feedback in acyclic syntax.
4. Libkind, Baas, Patterson and Fairbanks, [Operadic Modeling of Dynamical Systems: Mathematics and Computation](https://arxiv.org/abs/2105.12282), introduction: distinguish directed transfer from undirected sharing. Our lane-access token is a specific finite exclusion model, not that paper’s dynamical-system algebra.
5. Bakirtzis, Vasilakopoulou and Fleming, [Compositional Cyber-Physical Systems Modeling](https://arxiv.org/abs/2101.10484), §2: distinguish interface, component and interpretation; make the chosen environmental boundary visible.
6. Adjacent method: Baez and Master, [Open Petri Nets](https://arxiv.org/abs/1808.05415). This first essay uses resource-sensitive token transitions; reusable open-net composition is a future option, not a completed implementation.

The first five source families are grounded in the collected “best” material. The published essay gives source-to-concept-to-construction-to-limitation signposts. The local prompt retains private record identifiers and the LinkedIn draft trail.

## Means

Six original source pictures, preserved unchanged; new cow-scenario illustration and portfolio emblem; explanatory Euler and typed execution diagrams; a finite transition engine; three illustrative timed witnesses; executable model checks; source/correction records; a static, dependency-free web entrance.

Keep the two tree pictures prominent as intuition, not formal evidence. Pair the original before/after sketches with corrected diagrams rather than silently rewriting history. Put a humorous concrete scenario before technical details. The formal structures must be visible and readable from the normal page entrance.

## Specification of the first experiment

**World.** One loaded wagon and driver; one farm passage with cattle and farmer, if selected; one lane-access token; one crew; one shuttering set; one pour. The physical road persists. A token represents exclusive permission/availability to occupy it, not a consumed road.

**Processes.** Delivery and cattle passage use the same start/finish rule shape and compete for access. Shutter preparation and pouring compete for the crew. Pouring additionally requires delivered concrete and ready shuttering. Starts reserve their required resources; finishes release reusable resources and transform cargo or preparation state. The wagon's phase is represented through the cargo state, not a separately duplicable token. Shuttering remains in place after the pour. The driver/farmer are bundled into their journeys.

**State.** Lane owner and availability, crew owner and availability, cargo phase, shuttering phase, four process statuses, and presence/absence of the cattle journey. All updates are immutable. A rejected action cannot change state. Reload/reset returns to the initial world.

**Choice.** Cattle-present and cattle-absent worlds are scenario branches, not outcomes with probabilities. Within each world, enumerate permissible start/finish orders. Independent event orderings count separately, so trace count is neither a probability nor a count of fundamentally different plans.

**Timing.** Separate illustrative schedule witnesses use delivery 10, cattle passage 15, shutter preparation 8 and pour 12 minutes, with both journey demands ready at time zero. Delivery-first and cattle-first priorities are assumed agreements. Check both lane occupancy and crew occupancy, release times, precedence, and event traces. Pour completion and completion of all farmer/project processes are different metrics.

**Displays.** Original plan/context/before/after images; conserved-token Petri fragment driven by live state; typed baseline and cattle-first process diagrams; three timed witnesses; corrected nesting with a cross-cutting threat-bearing subset. The full transition rules accompany the deliberately partial lane diagram.

**Exclusions.** No inferred likelihood, weather-to-market causal claim, concrete spoilage model, safety calculation, curing model, return wagon journey, contract, real negotiation or optimality claim. Those exclusions are potential future work, not claims that they do not matter.

## Conceptual corrections

- Task versus risk is not high versus low probability, nor simply intended versus unintended. The farmer's intended process may threaten the project's objective. Intended project work can also generate adverse outcomes.
- Risk descriptions connect uncertainty, context, process/event/outcome and objectives. “Processes associated with threats” can form a subset; a risk description itself is not necessarily a physical process.
- Declare whose intention is meant. For this selected task set, and with deliberate project actions including commissioned work, processes implementing WBS tasks sit inside deliberate project actions, inside project-intended processes, inside relevant processes. This is not an ontology of all WBSs or all intentions.
- Resources, process occurrences, state conditions and documentary records are different kinds of thing. A wire carries a typed system/resource or information; the state gives its condition. A realised obstruction becomes a current condition, with possible remaining uncertainty about duration.
- Type compatibility is necessary within a chosen interface language but does not by itself prove feasibility, safe operation or probability. A task-only projection generally loses some state/resource/alternative-path detail.

## Acceptance and stop conditions

Show a complete cattle-first interaction, then restore/restart and complete the baseline. Confirm shared access cannot be duplicated, crew cannot be double-booked, missing prerequisites block pouring, invalid actions preserve state, and all reachable states conserve declared resources. Independently check timed witnesses. Verify desktop/phone and keyboard use, readable diagrams, source links and deployed bytes. Preserve all six original image hashes.

The first experiment is complete when it makes the proposition and its important corrections visible, works under its bounded rules, and is published with a source trail. Passing model checks is not human-use evidence or validation as an engineering planning tool.

## Open questions / autonomous continuation

1. Can a shared-access component be substituted into crane, test-rig and approval-panel examples with the same boundary checks? What information must survive composition?
2. Which conflicts are found more reliably than in a plain resource table? Compare maintenance cost and explanatory benefit; do not add category-theoretic machinery solely to decorate a schedule.
3. Which task/risk projections preserve declared invariants, and what do they forget? Produce counterexamples where a chosen schedule conceals an alternative or conflict.
4. How should uncertain arrival and duration be represented without inventing probabilities? Which evidence would justify a distribution or interval?
5. How should agreement, observation, authority and mitigation become processes themselves? What feedback semantics are then needed?
6. Where does a contracted or supplier action belong in the intent/action nesting? How do cross-stakeholder benefits and threats change the picture?

Agents may choose the strongest next bounded construction in pursuit of the End. An explanatory route back through the toy, actual diagrams and original papers is part of completion; greater formal ambition does not remove that obligation.


## Explanatory addition — the context comb

The original “Project tasks in context” photograph is now prominent with interpretive commentary. A corrected generic open schematic separates chosen project scope, continuing context, actual process mechanisms and uncertainty annotations. Two successive stages exchange through a typed handover; no resource is copied and no arbitrary feedback loop is assumed. This adds an explanatory route toward the End, without changing the first bounded model or claiming an optic implementation.
