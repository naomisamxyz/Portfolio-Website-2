const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createSimulation, step, userColor } = require('../shared/simulation');
const field = () => ({ tick: 0, particles: [{x:450,y:300,vx:0,vy:0,color:[145,209,255]}] });
const input = (color, mode='attract', x=0.5) => ({x,y:0.5,active:true,mode,color});
test('dense field continues without participants', () => {
 const sim=createSimulation(); assert.equal(sim.particles.length,1800); assert.ok(sim.particles.every(p => p.color.every(c => c === 255))); step(sim,{}); assert.equal(sim.tick,1);
});
test('color absorbs gradually, mixes equally and ignores input order', () => {
 const a=field(), b=field(); const red=input([255,0,0]), blue=input([0,0,255]);
 step(a,{red,blue});step(b,{blue,red});assert.deepEqual(a,b);
 assert.ok(a.particles[0].color[1]>0 && a.particles[0].color[1]<209);
 for(let i=0;i<200;i++)step(a,{red,blue});
 assert.ok(Math.abs(a.particles[0].color[0]-127.5)<0.01);assert.ok(Math.abs(a.particles[0].color[2]-127.5)<0.01);
 const saved=a.particles[0].color.slice();step(a,{});assert.deepEqual(a.particles[0].color,saved);
});
test('inactive and distant users do not dye particles',()=>{
 const sim=field();step(sim,{off:{...input([255,0,0]),active:false},far:input([0,0,255],'attract',0)});
 assert.deepEqual(sim.particles[0].color,[145,209,255]);
});
test('all three forces are weaker and have correct direction',()=>{
 for(const mode of ['attract','repel','vortex']){
 const sim=field();step(sim,{a:input([255,0,0],mode,0.6)});const p=sim.particles[0];
 assert.ok(Math.hypot(p.vx,p.vy)<0.1);
 if(mode==='attract')assert.ok(p.vx>0);if(mode==='repel')assert.ok(p.vx<0);if(mode==='vortex')assert.ok(p.vy>0);
 }
});
test('classroom participants receive different colors',()=>{
 const colors=Array.from({length:100},(_,i)=>userColor(i).join(','));assert.equal(new Set(colors).size,100);
});

test('vortex holds circling particles near the pointer instead of ejecting them', () => {
 const sim=field();
 sim.particles[0].x=550;
 sim.particles[0].vy=-1;
 const vortex=input([255,0,0],'vortex');
 let maxRadius=0;
 for(let i=0;i<900;i++){
  step(sim,{vortex});
  const p=sim.particles[0];
  maxRadius=Math.max(maxRadius,Math.hypot(p.x-450,p.y-300));
 }
 assert.ok(maxRadius<120,`Orbit drifted to ${maxRadius}`);
});

test('vortex never grows a single orbit, including long holds and outward momentum', () => {
 for (const velocity of [[0,0],[2.5,2.5],[-2,1]]) {
  const sim=field(); const p=sim.particles[0];
  p.x=550; [p.vx,p.vy]=velocity;
  let previous=100;
  for(let i=0;i<10000;i++) {
   step(sim,{vortex:input([255,0,0],'vortex')});
   const radius=Math.hypot(p.x-450,p.y-300);
   assert.ok(radius<=previous+1e-9, `Radius grew from ${previous} to ${radius}`);
   previous=radius;
  }
 }
});

test('released particles slowly lose speed while keeping their orbit', () => {
 const sim=field(); const p=sim.particles[0]; p.x=550;
 for(let i=0;i<300;i++) step(sim,{vortex:input([255,0,0],'vortex')});
 const position=[p.x,p.y]; const color=p.color.slice();
 const radius=Math.hypot(p.x-450,p.y-300);
 const speed=Math.hypot(p.vx,p.vy);
 for(let i=0;i<1000;i++) {
  step(sim,{});
  assert.ok(Math.abs(Math.hypot(p.x-450,p.y-300)-radius)<1e-8);
 }
 assert.ok(Math.hypot(p.x-position[0],p.y-position[1])>1);
 assert.ok(Math.abs(Math.hypot(p.vx,p.vy)-speed*Math.pow(0.995,1000))<1e-8);
 assert.deepEqual(p.color,color);
});
