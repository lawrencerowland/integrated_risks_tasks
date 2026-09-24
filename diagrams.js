const ink='#264e4b', green='#316c56', red='#9c443b', grey='#67786e';
const text=(x,y,t,size=16,anchor='start',fill=ink)=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}">${t}</text>`;
const path=(d,color=ink,dash='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const box=(x,y,w,h,label,color=green)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#fffef9" stroke="${color}" stroke-width="2.5"/>${text(x+w/2,y+h/2+6,label,17,'middle',color)}`;
const svg=(w,h,title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}" font-family="system-ui,sans-serif">${body}</svg>`;
export function laneNet(state){
 let b=`<defs><marker id="a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto-start-reverse"><path d="M0 0 7 3.5 0 7Z" fill="${ink}"/></marker></defs>`;
 const line=d=>`<path d="${d}" fill="none" stroke="${ink}" stroke-width="2" marker-end="url(#a)"/>`;
 b+=text(460,28,'ONE access token · competing starts, separate occupancy states',18,'middle');
 b+=line('M417 140H300')+line('M503 140H620')+line('M210 165V220')+line('M710 165V220')+line('M210 280V326')+line('M710 280V326')+line('M210 375V410H460V183')+line('M710 375V430H480V178');
 b+=`<circle cx="460" cy="140" r="43" fill="#edf2e7" stroke="${green}" stroke-width="2"/>`+text(460,91,'Lane free',17,'middle');
 if(state.freeLane) b+=`<circle cx="460" cy="140" r="10" fill="${ink}"/>`;
 b+=box(120,115,180,50,'Start delivery')+box(620,115,180,50,'Start cattle',red)+box(120,325,180,50,'Finish delivery')+box(620,325,180,50,'Finish cattle',red);
 for(const [x,name,owner] of [[210,'Wagon on lane','delivery'],[710,'Cattle on lane','cattle']]){
 b+=`<circle cx="${x}" cy="250" r="30" fill="#fffef9" stroke="${owner==='cattle'?red:green}" stroke-width="2"/>`+text(x+45,255,name,15);
 if(state.laneOwner===owner)b+=`<circle cx="${x}" cy="250" r="8" fill="${ink}"/>`;
 }
 b+=text(460,451,state.cows?'Both journeys exist in this branch. Only one can acquire access.':'Cattle transitions are absent in this branch; the right-hand fragment is inactive.',15,'middle');
 return svg(920,478,'Shared-lane Petri net with one conserved access token',b);
}

// A typed chosen-execution diagram. Resource bundles keep all declared ports visible.
// Cattle output crosses other wires without a junction; no resource is copied.
export function wiring(cattle){
 const w=1040,h=cattle?555:455; let b='';
 b+=text(25,26,cattle?'Chosen execution: cattle first, then delivery':'Chosen execution: no cattle passage in this branch',20);
 b+=`<path d="M15 50V${h-65}M1015 50V${h-65}" stroke="#819184" stroke-width="9"/>`;
 b+=text(23,h-24,'Input / output boundaries; colour marks perspective, not a different process type.',14);
 if(!cattle){
  // two independent branches before pouring
  b+=path('M20 105H275M435 105H1010')+path('M20 165H275M435 165H545V240H650');
  b+=path('M20 300H275M435 300H650')+path('M20 355H275M435 355H650');
  b+=box(275,80,160,110,'Deliver');b+=box(275,273,160,107,'Prepare');
  b+=box(650,215,170,170,'Pour');
  b+=text(32,95,'Free lane',16)+text(32,155,'Loaded wagon',16)+text(32,287,'Crew',16)+text(32,343,'Shuttering',16);
  b+=text(855,95,'Free lane',16)+text(455,155,'Wagon + concrete',14)+text(455,286,'Crew',14)+text(455,343,'Ready shuttering',14);
  const outs=[[240,'Placed concrete'],[280,'Empty wagon'],[320,'Crew'],[365,'Shuttering in place']];
  for(const[y,label]of outs)b+=path(`M820 ${y}H1010`)+text(838,y-9,label,14);
 }else{
  b+=path('M20 90H210M355 90H475M635 90H1010');
  b+=path('M20 150H210',red)+path('M355 150H395V450H1010',red);
  b+=path('M20 235H475M635 235H705');
  b+=path('M20 330H210M355 330H705')+path('M20 385H210M355 385H705');
  b+=box(210,65,145,110,'Walk cattle',red)+box(475,65,160,195,'Deliver')+box(210,303,145,107,'Prepare')+box(705,210,145,200,'Pour');
  b+=text(32,80,'Free lane',15)+text(32,139,'Cattle + farmer',15)+text(32,224,'Loaded wagon',15)+text(32,319,'Crew',15)+text(32,374,'Shuttering',15);
  b+=text(865,80,'Free lane',15)+text(720,441,'Cattle clear of lane',15,'start',red);
  b+=text(442,319,'Crew',14)+text(442,374,'Ready shuttering',14);
  for(const[y,label]of [[235,'Placed concrete'],[285,'Empty wagon'],[340,'Crew'],[395,'Shuttering in place']])b+=path(`M850 ${y}H1010`)+text(864,y-10,label,13);
  b+=text(420,480,'Crossings without dots are not connections. The farmer and driver travel with their bundles.',13);
 }
 return svg(w,h,cattle?'Corrected cattle-first wiring with one serial lane wire':'Corrected baseline wiring with delivery and preparation before pour',b);
}

export function sets(){
 let b=`<rect x="15" y="10" width="990" height="555" rx="22" fill="#f1f0e6" stroke="${ink}" stroke-width="2"/>`;
 b+=text(40,46,'All modelled processes affecting the project',22);
 b+=`<rect x="45" y="80" width="690" height="455" rx="35" fill="#e3ecdf" stroke="#6e9173" stroke-width="2"/>`+text(70,117,'Intended by the project team',20);
 b+=`<rect x="75" y="155" width="545" height="350" rx="30" fill="#cce0ce" stroke="#518463" stroke-width="2"/>`+text(100,191,'Deliberate project actions',20);
 b+=`<rect x="105" y="235" width="320" height="240" rx="25" fill="#b3d0bb" stroke="${green}" stroke-width="2"/>`+text(130,271,'Processes implementing',19)+text(130,296,'the chosen WBS tasks',19);
 b+=`<rect x="128" y="328" width="838" height="95" rx="46" fill="#f9e6df" fill-opacity=".72" stroke="${red}" stroke-width="2" stroke-dasharray="7 5"/>`;
 b+=text(145,356,'A cross-cutting threat-bearing subset',15,'start',red);
 const dot=(x,y,label)=>`<circle cx="${x}" cy="${y}" r="5" fill="${red}"/>${text(x+12,y+5,label,14,'start',red)}`;
 b+=dot(151,391,'Pour concrete')+dot(457,391,'Agree access slot')+dot(754,380,'Cattle passage')+dot(838,403,'Heavy rain');
 b+=text(459,235,'Coordinate access',15)+text(459,263,'(outside this WBS)',14);
 b+=text(90,139,'e.g. desired supplier activities as well as the team’s own work',14);
 b+=text(764,143,'Farmer’s intention:',16)+text(764,168,'take cows to market',16)+text(764,213,'Not necessarily the',15)+text(764,237,'project’s intention.',15);
 b+=text(130,453,'e.g. deliver, prepare, pour',14);
 b+=text(759,481,'Rain has no intention.',15)+text(759,507,'Threat is relative to',15)+text(759,531,'objectives and context.',15);
 return svg(1020,580,'Nested process sets crossed by threat-bearing processes, with farmer activity outside project intention',b);
}
