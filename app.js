import {initialState, enabled, step, isComplete, analyzeReachable, PROCESSES, ACTIONS, simulateSchedule} from './model.js';
import {laneNet,wiring,sets} from './diagrams.js';
const $=id=>document.getElementById(id);
let state=initialState(), history=[];
const cargoNames={'loaded-wagon':'Loaded wagon waiting','in-transit':'Wagon on lane',delivered:'Concrete at site',pouring:'Pour in progress',poured:'Concrete placed'};
const shutterNames={unprepared:'Not ready',preparing:'Being prepared',ready:'Ready to pour','in-place':'In place for pour / curing'};
function reason(id){
 const s=state.status[id];
 if(s==='absent')return 'No cattle journey in this branch.';
 if(s==='complete')return id==='pour'?'Pour finished; curing remains outside this model.':'Finished in this world.';
 if(s==='running')return id==='cattle'||id==='delivery'?'In progress: holds the lane until finished.':'In progress: holds the crew until finished.';
 if((id==='cattle'||id==='delivery')&&!state.freeLane)return `Waiting: ${state.laneOwner==='cattle'?'cattle':'the wagon'} currently hold the lane.`;
 if(id==='pour'){
  const missing=[];
  if(state.status.delivery!=='complete')missing.push('delivered concrete');
  if(state.status.shutters!=='complete')missing.push('ready shuttering');
  if(!state.freeWorkers)missing.push('a free crew');
  if(missing.length)return 'Needs '+missing.join(' and ')+'.';
 }
 return 'Ready to start under the declared rules.';
}
function render(message){
 const active=new Set(enabled(state).map(a=>a.id));
 const cards=[['Shared lane',state.freeLane?'Available':state.laneOwner==='cattle'?'Cattle occupy lane':'Wagon occupies lane'],['Concrete / wagon',cargoNames[state.cargo]],['One crew',state.freeWorkers?'Available':state.workersOwner==='shutters'?'Preparing shutters':'Pouring'],['Shuttering',shutterNames[state.shuttering]]];
 $('state').innerHTML=cards.map(([label,value])=>`<div class="state-card"><strong>${label}</strong><span>${value}</span></div>`).join('');
 for(const p of Object.values(PROCESSES)){
  const card=$('process-'+p.id); card.querySelector('p').textContent=reason(p.id);
  for(const phase of ['start','finish'])card.querySelector(`[data-action="${p.id}.${phase}"]`).disabled=!active.has(`${p.id}.${phase}`);
 }
 $('history').innerHTML=history.length?history.map(a=>`<li>${ACTIONS[a].label}</li>`).join(''):'<li>No processes have started.</li>';
 const graph=analyzeReachable(state);
 $('analysis').textContent=`From this position, ${graph.stateCount} resource states and ${graph.completeTraceCount} complete start/finish orderings are reachable. ${graph.deadlocks.length} reachable deadlocks under these rules. This count treats different orderings of independent events separately; it is not a count of fundamentally different plans.`;
 $('announcement').textContent=message||(isComplete(state)?'All modelled processes finished. Concrete has been placed; this is not a cured foundation.':'The lane is free. Choose a first user, or prepare the shuttering.');
 $('net-diagram').innerHTML=laneNet(state);
}
for(const p of Object.values(PROCESSES)){
 const el=document.createElement('article');el.className='action-card';el.id='process-'+p.id;
 el.innerHTML=`<span class="badge">${p.classification==='farmer'?'Farmer’s intended process':'Project’s intended process'}</span><h3>${p.label}</h3><p></p><button type="button" data-action="${p.id}.start">Start ${p.id==='shutters'?'preparation':p.id==='cattle'?'cattle walk':p.id==='pour'?'pour':'delivery'}</button><button type="button" data-action="${p.id}.finish">Finish ${p.id==='shutters'?'preparation':p.id==='cattle'?'cattle walk':p.id==='pour'?'pour':'delivery'}</button>`;
 $('actions').append(el);
}
$('actions').addEventListener('click',event=>{
 const btn=event.target.closest('button[data-action]');if(!btn||btn.disabled)return;
 const id=btn.dataset.action;
 try{state=step(state,id);history.push(id);render(isComplete(state)?'All modelled processes finished. Concrete placed, crew and lane returned. Curing is outside this model.':`${ACTIONS[id].label}. ${state.laneOwner==='cattle'?'Delivery must wait until cattle clear the lane.':''}`);
 // Keep keyboard progress on an enabled control in the same process when possible.
 const next=btn.closest('article').querySelector('button:not(:disabled)');if(next)next.focus();else $('reset').focus();
 }catch(error){$('announcement').textContent=error.message;}
});
function reset(){state=initialState({cows:$('scenario').value==='cattle'});history=[];render('World reset. '+(state.cows?'Both the delivery and the cattle need the lane.':'Only the delivery needs the lane in this branch.'));}
$('scenario').addEventListener('change',reset);$('reset').addEventListener('click',reset);
$('baseline-wiring').innerHTML=wiring(false);$('cattle-wiring').innerHTML=wiring(true);$('sets-diagram').innerHTML=sets();
const examples=[['No cattle movement',simulateSchedule({cows:false,cowArrival:0})],['Delivery first',simulateSchedule({cows:true,laneOrder:'delivery-first',cowArrival:0})],['Cattle first',simulateSchedule({cows:true,laneOrder:'cattle-first',cowArrival:0})]];
for(const [title,s]of examples){
 const card=document.createElement('article');card.className='schedule-card';
 card.innerHTML=`<h4>${title}</h4>`+s.intervals.map(i=>`<div class="bar-row"><span>${i.processId==='shutters'?'Prepare':i.processId}</span><div class="bar-track" role="img" aria-label="${i.label}: minute ${i.start} to ${i.end}"><div class="bar ${i.processId}" style="left:${i.start/40*100}%;width:${(i.end-i.start)/40*100}%"></div></div></div>`).join('')+`<p>Minutes from start (scale 0–40)</p><ol>${s.intervals.map(i=>`<li>${i.label}: ${i.start}–${i.end}</li>`).join('')}</ol><strong class="result">Pour complete: minute ${s.pourFinish}</strong><p>Delivery waits ${s.deliveryWait} min${s.cows?`; cattle wait ${s.cattleWait} min`:''}.<br>All modelled work ends: ${s.makespan} min.</p>`;
 $('schedules').append(card);
}
render();
