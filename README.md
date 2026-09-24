# Integrated risks and tasks

**One lane, two plans.** A concrete delivery and a farmer's cattle movement need the same farm track. An exploratory essay connecting process-first models, resource-sensitive wiring and the relationship between tasks and risks.

[Open the website](https://lawrencerowland.github.io/integrated_risks_tasks/) · [Foray and specification](docs/foray.md) · [Source review](docs/source-review.md)

`FORAY-INTEGRATED-RISKS-TASKS` · `PW-PROCESS-165`

## Run and check

Serve this directory with any static web server, for example `python3 -m http.server 8787`, then open its local URL. The browser uses JavaScript modules. No install or build step is needed. Run `node --test model.test.mjs` for model checks.

The model has 11 reachable states and 6 complete event traces in the baseline, and 30 states / 68 complete traces when a cattle passage is present. Trace counts are not probabilities or a quotient by independence. The model tracks access and crew conservation, concrete and shuttering phases, with immutable rejected actions.

All durations are teaching assumptions. The application stores no user state; reload resets it. Original images are retained unchanged with a hash manifest. New formal diagrams and code are this experiment's construction; see the essay for source-to-method boundaries.

GitHub Pages publishes the root of `main`. See [verification record](docs/verification.md) for the tested/publication boundary.
