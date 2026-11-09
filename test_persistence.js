const fs = require('fs');
const vm = require('vm');
const path = require('path');

const parserCode = fs.readFileSync(path.join(__dirname, 'js', 'parser.js'), 'utf8');
const scoringCode = fs.readFileSync(path.join(__dirname, 'js', 'scoring.js'), 'utf8');
const engineCode = fs.readFileSync(path.join(__dirname, 'js', 'test-engine.js'), 'utf8');

// Mock browser localStorage and environment
const mockStorage = {};
const mockLocalStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const sandbox = {
  console,
  localStorage: mockLocalStorage,
  Date,
  setInterval: () => 123,
  clearInterval: () => {}
};

vm.createContext(sandbox);
vm.runInContext(parserCode + '\nthis.CBTParser = CBTParser;', sandbox);
vm.runInContext(scoringCode + '\nthis.CBTScoring = CBTScoring;', sandbox);
vm.runInContext(engineCode + '\nthis.CBTEngine = CBTEngine;', sandbox);

console.log('--- TEST 4: Engine Lifecycle & Persistence ---');
const jeeJson = fs.readFileSync(path.join(__dirname, 'data', 'sample_jee_test.json'), 'utf8');
const testDef = sandbox.CBTParser.parse(jeeJson, 'test.json');

// Instantiate engine
let engine = new sandbox.CBTEngine({});
engine.startTest(testDef, false);

// Perform some actions
engine.selectOption(1); // Q1 answered
engine.saveAndNext(1);  // Advances to Q2
engine.toggleMarkForReview(); // Q2 marked for review
engine.goToQuestion(6); // Jump to Chemistry Q7
engine.selectOption(1);

console.log('State before simulated refresh:');
console.log('Current Q Index:', engine.currentQuestionIndex);
console.log('Responses:', engine.responses);
console.log('Reviews:', engine.reviewFlags);
console.log('Visited:', Object.keys(engine.visitedFlags));

// Simulate page refresh: Create fresh engine instance and restore session
console.log('\n--- Simulating browser refresh ---');
let restoredEngine = new sandbox.CBTEngine({});
const hasSaved = restoredEngine.hasSavedSession();
console.log('Has saved session in localStorage:', hasSaved);
if (!hasSaved) throw new Error('Expected saved session to exist');

restoredEngine.startTest(testDef, true);
console.log('Restored Q Index:', restoredEngine.currentQuestionIndex);
console.log('Restored Responses:', restoredEngine.responses);
console.log('Restored Reviews:', restoredEngine.reviewFlags);
console.log('Restored Visited:', Object.keys(restoredEngine.visitedFlags));

if (restoredEngine.currentQuestionIndex !== 6) throw new Error('Question index was not restored!');
if (restoredEngine.responses[1] !== 1) throw new Error('Q1 response was not restored!');
if (restoredEngine.responses[7] !== 1) throw new Error('Q7 response was not restored!');
if (!restoredEngine.reviewFlags[2]) throw new Error('Q2 review flag was not restored!');

console.log('--- PERSISTENCE VERIFICATION PASSED 100%! ---');
