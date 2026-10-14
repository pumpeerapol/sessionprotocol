const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function app(saved) {
  let now = 1000000;
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {value:'',style:{},classList:{add(){},remove(){},toggle(){}},textContent:'',addEventListener(){},appendChild(){},setAttribute(){}});
    return elements.get(id);
  };
  const storage = new Map(saved ? [['sp_v6',JSON.stringify(saved)]] : []);
  const context = vm.createContext({Date:class extends Date {static now(){return now;}},console,alert(){},confirm:()=>true,setInterval:()=>1,clearInterval(){},window:{addEventListener(){}},document:{getElementById:element,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({setAttribute(){},appendChild(){}})},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}});
  const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`),'utf8');
  const code = html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/renderBlocks\(\);\s*initFreezeListeners\(\);\s*checkResume\(\);\s*$/,'');
  vm.runInContext(code,context);
  return {context,element,advance:ms=>{now+=ms;},storage};
}
function start(a) { a.context.selIdx=0;a.context.durVal='2';a.element('intent-input').value='Test recovery';a.context.startSession(); }
test('timer catches up after callbacks are suspended',()=>{const a=app();start(a);a.advance(90000);a.context.tickMain();assert.equal(a.context.mainRem,30);assert.equal(a.context.mainElapsed,90);});
test('pause excludes wall time and persists through reload',()=>{const a=app();start(a);a.advance(20000);a.context.togglePause();a.advance(60000);a.context.tickMain();assert.equal(a.context.mainRem,100);const b=app(JSON.parse(a.storage.get('sp_v6')));b.context.checkResume();b.context.resumeSession();assert.equal(b.context.mainPaused,true);assert.equal(b.context.mainRem,100);b.context.togglePause();b.advance(10000);b.context.tickMain();assert.equal(b.context.mainRem,90);});
test('running session recovers elapsed time after reload',()=>{const a=app();start(a);const b=app(JSON.parse(a.storage.get('sp_v6')));b.advance(50000);b.context.checkResume();b.context.resumeSession();assert.equal(b.context.mainRem,70);});
test('completed session is recoverable until explicitly closed',()=>{const a=app();start(a);a.advance(121000);a.context.tickMain();assert.equal(a.context.S.activeSession.completed,true);const b=app(JSON.parse(a.storage.get('sp_v6')));b.context.resumeSession();assert.equal(b.element('complete-view').style.display,'block');assert.equal(b.context.mainElapsed,120);});
test('rejects out-of-range duration',()=>{const a=app();a.context.selIdx=0;a.context.durVal='481';a.element('intent-input').value='Test';a.context.startSession();assert.equal(a.context.currentSession,null);});
test('corrupt settings fall back to usable defaults',()=>{const a=app({blocks:42,pledge:'x'});assert.equal(a.context.S.blocks.length,3);});
