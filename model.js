/**
 * A finite token-transition model, not a probability model or a site programme.
 * All starts/finishes are instantaneous events. Timed examples below add stated,
 * illustrative durations and release times without changing the token rules.
 */
export const PROCESSES = Object.freeze({
  delivery: Object.freeze({ id: 'delivery', label: 'Deliver concrete', kind: 'process', classification: 'project', duration: 10, input: 'Loaded wagon + free lane', output: 'Concrete delivered + free lane' }),
  cattle: Object.freeze({ id: 'cattle', label: 'Move cattle through lane', kind: 'process', classification: 'farmer', duration: 15, input: 'Cattle waiting + free lane', output: 'Cattle across + free lane' }),
  shutters: Object.freeze({ id: 'shutters', label: 'Prepare shuttering', kind: 'process', classification: 'project', duration: 8, input: 'Unprepared shuttering + workers', output: 'Ready shuttering + workers' }),
  pour: Object.freeze({ id: 'pour', label: 'Pour concrete', kind: 'process', classification: 'project', duration: 12, input: 'Delivered concrete + ready shuttering + workers', output: 'Poured concrete + workers; shuttering stays in place' }),
});

const actionLabels = {
  'delivery.start': 'Wagon acquires lane',
  'delivery.finish': 'Wagon clears lane; concrete delivered',
  'cattle.start': 'Cattle acquire lane',
  'cattle.finish': 'Cattle clear lane',
  'shutters.start': 'Workers start preparing shuttering',
  'shutters.finish': 'Shuttering ready; workers released',
  'pour.start': 'Workers start pouring concrete',
  'pour.finish': 'Concrete poured; workers released',
};
export const ACTIONS = Object.freeze(Object.fromEntries(Object.entries(actionLabels).map(([id, label]) => {
  const [processId, phase] = id.split('.');
  return [id, Object.freeze({ id, label, processId, phase, kind: 'transition' })];
})));
export const ACTION_LABELS = Object.freeze(actionLabels);
export const MODEL_BOUNDS = Object.freeze([
  'One loaded wagon, one cattle passage, one worker crew, one shuttering set, and one pour.',
  'The lane has capacity one. A process holds it from start until finish.',
  'The crew is shared by shutter preparation and pouring; lane movements need no members of that crew.',
  'Delivery completion represents concrete being available to pour. A return wagon journey is not represented.',
  'Poured concrete is not a cured or accepted foundation. Curing, concrete freshness, unloading detail, breakdowns, travel variation, and other work are outside this model.',
  'Durations are illustrative minutes, not measured estimates. Priorities are assumed agreements, not proof of negotiation or adoption.',
  'Traces enumerate allowable event orderings. Their counts are not probabilities or likelihoods.',
]);

function freezeState(state) {
  Object.freeze(state.status);
  return Object.freeze(state);
}

export function initialState({ cows = true } = {}) {
  if (typeof cows !== 'boolean') throw new TypeError('cows must be a boolean');
  return freezeState({
    cows, freeLane: 1, laneOwner: null, freeWorkers: 1, workersOwner: null,
    cargo: 'loaded-wagon', shuttering: 'unprepared',
    status: { delivery: 'waiting', cattle: cows ? 'waiting' : 'absent', shutters: 'waiting', pour: 'waiting' },
  });
}

/** Reject corrupt states as well as impossible transitions. */
export function assertState(state) {
  const fail = message => { throw new Error(`Invalid state: ${message}`); };
  if (!state || typeof state.cows !== 'boolean' || !state.status) fail('missing state fields');
  const { status: s } = state;
  for (const id of ['delivery', 'shutters', 'pour']) {
    if (!['waiting', 'running', 'complete'].includes(s[id])) fail(`unknown ${id} status`);
  }
  if (!(state.cows ? ['waiting', 'running', 'complete'] : ['absent']).includes(s.cattle)) fail('cattle presence/status mismatch');
  const laneUsers = ['delivery', 'cattle'].filter(id => s[id] === 'running');
  if (laneUsers.length > 1) fail('two lane users');
  if (state.laneOwner !== (laneUsers[0] ?? null) || state.freeLane !== (laneUsers.length ? 0 : 1)) fail('lane token is not conserved');
  const workerUsers = ['shutters', 'pour'].filter(id => s[id] === 'running');
  if (workerUsers.length > 1) fail('two crew users');
  if (state.workersOwner !== (workerUsers[0] ?? null) || state.freeWorkers !== (workerUsers.length ? 0 : 1)) fail('worker token is not conserved');
  if (s.pour !== 'waiting' && (s.delivery !== 'complete' || s.shutters !== 'complete')) fail('pour prerequisites missing');
  const expectedCargo = s.delivery === 'waiting' ? 'loaded-wagon' : s.delivery === 'running' ? 'in-transit' : s.pour === 'waiting' ? 'delivered' : s.pour === 'running' ? 'pouring' : 'poured';
  if (state.cargo !== expectedCargo) fail('cargo token is not conserved');
  const expectedShuttering = s.shutters === 'waiting' ? 'unprepared' : s.shutters === 'running' ? 'preparing' : s.pour === 'waiting' ? 'ready' : 'in-place';
  if (state.shuttering !== expectedShuttering) fail('shuttering token is not conserved');
  return true;
}

function canRun(state, id) {
  const s = state.status;
  switch (id) {
    case 'delivery.start': return s.delivery === 'waiting' && state.cargo === 'loaded-wagon' && state.freeLane === 1;
    case 'delivery.finish': return s.delivery === 'running' && state.laneOwner === 'delivery';
    case 'cattle.start': return state.cows && s.cattle === 'waiting' && state.freeLane === 1;
    case 'cattle.finish': return state.cows && s.cattle === 'running' && state.laneOwner === 'cattle';
    case 'shutters.start': return s.shutters === 'waiting' && state.freeWorkers === 1;
    case 'shutters.finish': return s.shutters === 'running' && state.workersOwner === 'shutters';
    case 'pour.start': return s.pour === 'waiting' && state.cargo === 'delivered' && state.shuttering === 'ready' && state.freeWorkers === 1;
    case 'pour.finish': return s.pour === 'running' && state.workersOwner === 'pour';
    default: return false;
  }
}

/** Enabled transition descriptors; pass a descriptor or its id to step(). */
export function enabled(state) {
  assertState(state);
  return Object.values(ACTIONS).filter(action => canRun(state, action.id));
}

/** Pure: neither successful nor rejected actions mutate the supplied state. */
export function step(state, action) {
  assertState(state);
  const id = typeof action === 'string' ? action : action?.id;
  if (!ACTIONS[id]) throw new Error(`Unknown action: ${String(id)}`);
  if (!canRun(state, id)) throw new Error(`Action is not enabled: ${id}`);
  const next = { ...state, status: { ...state.status } };
  const { processId, phase } = ACTIONS[id];
  next.status[processId] = phase === 'start' ? 'running' : 'complete';
  if (processId === 'delivery' || processId === 'cattle') {
    next.freeLane = phase === 'start' ? 0 : 1;
    next.laneOwner = phase === 'start' ? processId : null;
  }
  if (processId === 'shutters' || processId === 'pour') {
    next.freeWorkers = phase === 'start' ? 0 : 1;
    next.workersOwner = phase === 'start' ? processId : null;
  }
  if (processId === 'delivery') next.cargo = phase === 'start' ? 'in-transit' : 'delivered';
  if (processId === 'shutters') next.shuttering = phase === 'start' ? 'preparing' : 'ready';
  if (processId === 'pour') {
    next.cargo = phase === 'start' ? 'pouring' : 'poured';
    next.shuttering = 'in-place';
  }
  assertState(next);
  return freezeState(next);
}

export function isComplete(state) {
  assertState(state);
  return ['delivery', 'shutters', 'pour'].every(id => state.status[id] === 'complete') && (!state.cows || state.status.cattle === 'complete');
}

export function stateKey(state) {
  assertState(state);
  return `${state.cows ? 1 : 0}|${['delivery', 'cattle', 'shutters', 'pour'].map(id => state.status[id]).join('|')}`;
}

/** Full reachable graph; no sampled paths and no inferred likelihoods. */
export function analyzeReachable(options = {}) {
  const start = options.status ? options : initialState(options);
  assertState(start);
  const states = [start], byKey = new Map([[stateKey(start), 0]]), edges = [];
  for (let index = 0; index < states.length; index++) {
    for (const action of enabled(states[index])) {
      const next = step(states[index], action), key = stateKey(next);
      if (!byKey.has(key)) { byKey.set(key, states.length); states.push(next); }
      edges.push({ from: index, to: byKey.get(key), action: action.id });
    }
  }
  const terminalStates = states.filter(isComplete);
  const deadlocks = states.filter(state => !isComplete(state) && enabled(state).length === 0);
  const memo = new Map();
  const count = state => {
    const key = stateKey(state);
    if (memo.has(key)) return memo.get(key);
    const value = isComplete(state) ? 1 : enabled(state).reduce((sum, action) => sum + count(step(state, action)), 0);
    memo.set(key, value);
    return value;
  };
  return { states, edges, terminalStates, deadlocks, stateCount: states.length, transitionCount: edges.length, completeTraceCount: count(start) };
}

/** The bounded model has finitely many traces; event order is not elapsed time. */
export function enumerateTraces({ cows = true, limit = Infinity } = {}) {
  if (!(limit === Infinity || Number.isInteger(limit) && limit > 0)) throw new TypeError('limit must be a positive integer or Infinity');
  const traces = [];
  let truncated = false;
  function visit(state, trace) {
    if (isComplete(state)) {
      if (traces.length < limit) traces.push(trace);
      else truncated = true;
      return;
    }
    for (const action of enabled(state)) {
      if (truncated) break;
      visit(step(state, action), [...trace, action.id]);
    }
  }
  visit(initialState({ cows }), []);
  return { traces, truncated };
}

function nonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) throw new TypeError(`${label} must be a finite non-negative number`);
  return value;
}

/**
 * Overlay of two independent plans. A positive overlap is a violated lane
 * constraint, not a reachable state and not an accident probability.
 * Half-open intervals [start,end) allow handover at the same instant.
 */
export function plannedOverlap({ deliveryStart = 0, cattleStart = 1 } = {}) {
  nonNegative(deliveryStart, 'deliveryStart'); nonNegative(cattleStart, 'cattleStart');
  const intervals = [
    { processId: 'delivery', start: deliveryStart, end: deliveryStart + PROCESSES.delivery.duration },
    { processId: 'cattle', start: cattleStart, end: cattleStart + PROCESSES.cattle.duration },
  ];
  const start = Math.max(...intervals.map(i => i.start)), end = Math.min(...intervals.map(i => i.end));
  return { intervals, overlap: Math.max(0, end - start), conflict: end > start, conflictInterval: end > start ? { start, end } : null, executable: end <= start };
}

/**
 * One deterministic timed witness. Fixed durations, earliest starts for crew
 * work, and the explicitly selected first lane user. Cattle-first reserves the
 * first passage for cattle even when that leaves the lane idle before arrival.
 * This priority is an assumed agreement, not an automatically negotiated one.
 */
export function simulateSchedule({ cows = true, laneOrder = 'delivery-first', cowArrival = 1, deliveryReady = 0 } = {}) {
  nonNegative(cowArrival, 'cowArrival'); nonNegative(deliveryReady, 'deliveryReady');
  if (!['delivery-first', 'cattle-first'].includes(laneOrder)) throw new TypeError('laneOrder must be delivery-first or cattle-first');
  let state = initialState({ cows }), time = 0;
  const events = [], intervals = [], active = new Map();
  const laneQueue = cows ? (laneOrder === 'cattle-first' ? ['cattle', 'delivery'] : ['delivery', 'cattle']) : ['delivery'];
  const release = { delivery: deliveryReady, cattle: cowArrival, shutters: 0, pour: 0 };
  const run = action => {
    state = step(state, action);
    events.push({ time, action: action.id, processId: action.processId, phase: action.phase, label: action.label, state });
    if (action.phase === 'start') {
      const interval = { processId: action.processId, label: PROCESSES[action.processId].label, classification: PROCESSES[action.processId].classification, start: time, end: time + PROCESSES[action.processId].duration };
      intervals.push(interval); active.set(action.processId, interval);
    } else active.delete(action.processId);
  };
  while (!isComplete(state)) {
    // Releases happen before acquisitions at the same instant.
    for (const interval of [...active.values()].filter(i => i.end === time).sort((a, b) => a.processId.localeCompare(b.processId))) run(ACTIONS[`${interval.processId}.finish`]);
    for (const action of enabled(state).filter(a => a.phase === 'start')) {
      const id = action.processId;
      if (time < release[id]) continue;
      if (['delivery', 'cattle'].includes(id) && laneQueue.find(p => state.status[p] !== 'complete') !== id) continue;
      // Previous actions may consume a resource; recheck immediately.
      if (canRun(state, action.id)) run(action);
    }
    if (isComplete(state)) break;
    const nextTimes = [...active.values()].map(i => i.end);
    const nextLane = laneQueue.find(id => state.status[id] !== 'complete');
    if (nextLane && state.status[nextLane] === 'waiting' && release[nextLane] > time) nextTimes.push(release[nextLane]);
    const future = nextTimes.filter(t => t > time);
    if (!future.length) throw new Error('Schedule policy made no progress');
    time = Math.min(...future);
  }
  const find = id => intervals.find(interval => interval.processId === id);
  return {
    cows, laneOrder, cowArrival, deliveryReady, intervals, events,
    trace: events.map(event => event.action), finalState: state,
    makespan: Math.max(...intervals.map(i => i.end)),
    pourStart: find('pour').start, pourFinish: find('pour').end,
    deliveryWait: find('delivery').start - deliveryReady,
    cattleWait: cows ? find('cattle').start - cowArrival : 0,
    assumption: cows ? `${laneOrder === 'cattle-first' ? 'Cattle' : 'Delivery'} have the first lane slot by assumed agreement.` : 'No cattle passage is included.',
  };
}

export function exampleSchedules({ cowArrival = 1, deliveryReady = 0 } = {}) {
  return {
    baseline: simulateSchedule({ cows: false, deliveryReady }),
    deliveryFirst: simulateSchedule({ cows: true, laneOrder: 'delivery-first', cowArrival, deliveryReady }),
    cattleFirst: simulateSchedule({ cows: true, laneOrder: 'cattle-first', cowArrival, deliveryReady }),
    independentPlan: plannedOverlap({ deliveryStart: deliveryReady, cattleStart: cowArrival }),
  };
}
