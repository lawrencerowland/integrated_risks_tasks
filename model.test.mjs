import test from 'node:test';
import assert from 'node:assert/strict';
import { PROCESSES, ACTIONS, initialState, enabled, step, isComplete, assertState, analyzeReachable, enumerateTraces, simulateSchedule, plannedOverlap, exampleSchedules } from './model.js';

const replay = (cows, trace) => trace.reduce((state, action) => step(state, action), initialState({ cows }));

test('all reachable markings conserve the one lane, one crew, cargo and shuttering', () => {
  for (const cows of [false, true]) {
    const graph = analyzeReachable({ cows });
    assert.ok(graph.stateCount > 1);
    assert.equal(graph.deadlocks.length, 0);
    assert.equal(graph.terminalStates.length, 1);
    for (const state of graph.states) {
      // These independent checks do not rely on the model validator.
      const laneUsers = ['delivery', 'cattle'].filter(id => state.status[id] === 'running');
      const workerUsers = ['shutters', 'pour'].filter(id => state.status[id] === 'running');
      assert.ok(laneUsers.length <= 1);
      assert.equal(state.freeLane + laneUsers.length, 1);
      assert.equal(state.laneOwner, laneUsers[0] ?? null);
      assert.ok(workerUsers.length <= 1);
      assert.equal(state.freeWorkers + workerUsers.length, 1);
      assert.equal(state.workersOwner, workerUsers[0] ?? null);
      assert.ok(['loaded-wagon', 'in-transit', 'delivered', 'pouring', 'poured'].includes(state.cargo));
      assert.ok(['unprepared', 'preparing', 'ready', 'in-place'].includes(state.shuttering));
      if (state.status.pour !== 'waiting') {
        assert.equal(state.status.delivery, 'complete');
        assert.equal(state.status.shutters, 'complete');
        assert.equal(state.shuttering, 'in-place');
      }
      if (!cows) assert.equal(state.status.cattle, 'absent');
    }
    const final = graph.terminalStates[0];
    assert.equal(final.cargo, 'poured');
    assert.equal(final.shuttering, 'in-place');
    assert.equal(final.freeLane, 1);
    assert.equal(final.freeWorkers, 1);
    assert.deepEqual(enabled(final), []);
  }
});

test('full trace enumeration agrees with graph count and every trace completes', () => {
  for (const cows of [false, true]) {
    const result = enumerateTraces({ cows });
    assert.equal(result.truncated, false);
    assert.equal(result.traces.length, analyzeReachable({ cows }).completeTraceCount);
    assert.equal(new Set(result.traces.map(trace => trace.join(','))).size, result.traces.length);
    for (const trace of result.traces) {
      assert.equal(trace.length, cows ? 8 : 6);
      assert.equal(new Set(trace).size, trace.length);
      assert.ok(isComplete(replay(cows, trace)));
    }
  }
  const limited = enumerateTraces({ limit: 1 });
  assert.equal(limited.traces.length, 1);
  assert.equal(limited.truncated, true);
});

test('both first-lane orders complete and shutter work can run alongside either passage', () => {
  for (const first of ['delivery', 'cattle']) {
    const second = first === 'delivery' ? 'cattle' : 'delivery';
    let state = initialState({ cows: true });
    state = step(state, `${first}.start`);
    state = step(state, 'shutters.start');
    assert.equal(state.status[first], 'running');
    assert.equal(state.status.shutters, 'running');
    assert.equal(state.laneOwner, first);
    assert.equal(state.workersOwner, 'shutters');
    for (const action of ['shutters.finish', `${first}.finish`, `${second}.start`, `${second}.finish`, 'pour.start', 'pour.finish']) state = step(state, action);
    assert.ok(isComplete(state));
  }
});

test('invalid actions, resource conflicts and absent cattle are rejected without mutation', () => {
  const baseline = initialState({ cows: false });
  const before = JSON.stringify(baseline);
  for (const action of ['cattle.start', 'cattle.finish', 'delivery.finish', 'pour.start', 'pour.finish', 'unknown']) assert.throws(() => step(baseline, action));
  assert.equal(JSON.stringify(baseline), before);
  for (const first of ['delivery', 'cattle']) {
    const state = step(initialState({ cows: true }), `${first}.start`);
    assert.throws(() => step(state, `${first === 'delivery' ? 'cattle' : 'delivery'}.start`), /not enabled/);
    assert.throws(() => step(state, `${first}.start`), /not enabled/);
  }
  const bothRunning = { ...initialState(), freeLane: 0, laneOwner: 'delivery', cargo: 'in-transit', status: { delivery: 'running', cattle: 'running', shutters: 'waiting', pour: 'waiting' } };
  assert.throws(() => assertState(bothRunning), /two lane users/);
});

test('pour requires both delivered concrete and ready shuttering', () => {
  const deliveredOnly = replay(false, ['delivery.start', 'delivery.finish']);
  assert.throws(() => step(deliveredOnly, 'pour.start'), /not enabled/);
  const shuttersOnly = replay(false, ['shutters.start', 'shutters.finish']);
  assert.throws(() => step(shuttersOnly, 'pour.start'), /not enabled/);
  const ready = replay(false, ['delivery.start', 'shutters.start', 'delivery.finish', 'shutters.finish']);
  assert.ok(enabled(ready).some(a => a.id === 'pour.start'));
});

test('completed and initial states remain immutable; reset is a fresh independent state', () => {
  const initial = initialState();
  const snapshot = JSON.stringify(initial);
  const complete = simulateSchedule().finalState;
  assert.ok(Object.isFrozen(initial) && Object.isFrozen(initial.status));
  assert.throws(() => { initial.freeLane = 0; }, TypeError);
  assert.throws(() => { complete.status.pour = 'waiting'; }, TypeError);
  for (const action of Object.keys(ACTIONS)) assert.throws(() => step(complete, action), /not enabled/);
  assert.deepEqual(enabled(complete), []);
  assert.equal(JSON.stringify(initial), snapshot);
  const reset = initialState();
  assert.notEqual(initial, reset);
  assert.deepEqual(initial, reset);
});

test('completion includes cattle when present even if the pour has finished', () => {
  const poured = replay(true, ['delivery.start', 'delivery.finish', 'shutters.start', 'shutters.finish', 'pour.start', 'pour.finish']);
  assert.equal(poured.cargo, 'poured');
  assert.equal(isComplete(poured), false);
  assert.equal(isComplete(step(step(poured, 'cattle.start'), 'cattle.finish')), true);
});

test('all timed witnesses respect releases, resources, durations, and formal traces', () => {
  for (const cows of [false, true]) for (const laneOrder of ['delivery-first', 'cattle-first']) for (const cowArrival of [0, 1, 4, 10]) for (const deliveryReady of [0, 2, 12]) {
    const schedule = simulateSchedule({ cows, laneOrder, cowArrival, deliveryReady });
    assert.ok(isComplete(replay(cows, schedule.trace)));
    const byId = Object.fromEntries(schedule.intervals.map(i => [i.processId, i]));
    for (const interval of schedule.intervals) assert.equal(interval.end - interval.start, PROCESSES[interval.processId].duration);
    assert.ok(byId.delivery.start >= deliveryReady);
    if (cows) {
      assert.ok(byId.cattle.start >= cowArrival);
      assert.ok(byId.delivery.end <= byId.cattle.start || byId.cattle.end <= byId.delivery.start);
      assert.ok(laneOrder === 'delivery-first' ? byId.delivery.end <= byId.cattle.start : byId.cattle.end <= byId.delivery.start);
    }
    assert.ok(byId.pour.start >= byId.delivery.end);
    assert.ok(byId.pour.start >= byId.shutters.end);
    assert.equal(byId.shutters.start, 0);
    assert.equal(schedule.events.length, cows ? 8 : 6);
    for (let i = 1; i < schedule.events.length; i++) assert.ok(schedule.events[i].time >= schedule.events[i - 1].time);
  }
});

test('illustrative defaults expose conflict and quantify both assumed priorities', () => {
  const schedules = exampleSchedules();
  assert.equal(schedules.independentPlan.overlap, 9);
  assert.equal(schedules.independentPlan.executable, false);
  assert.equal(schedules.baseline.pourFinish, 22);
  assert.equal(schedules.deliveryFirst.pourFinish, 22);
  assert.equal(schedules.deliveryFirst.cattleWait, 9);
  assert.equal(schedules.cattleFirst.deliveryWait, 16);
  assert.equal(schedules.cattleFirst.pourFinish, 38);
  assert.equal(plannedOverlap({ cattleStart: 10 }).conflict, false);
  assert.equal(plannedOverlap({ deliveryStart: 16, cattleStart: 1 }).conflict, false);
  assert.throws(() => simulateSchedule({ cowArrival: -1 }), /non-negative/);
  assert.throws(() => simulateSchedule({ deliveryReady: NaN }), /non-negative/);
  assert.throws(() => simulateSchedule({ laneOrder: 'unagreed' }), /laneOrder/);
});

test('project/farmer classification does not create different formal process kinds', () => {
  assert.equal(PROCESSES.delivery.kind, 'process');
  assert.equal(PROCESSES.cattle.kind, PROCESSES.delivery.kind);
  assert.equal(PROCESSES.delivery.classification, 'project');
  assert.equal(PROCESSES.cattle.classification, 'farmer');
});
