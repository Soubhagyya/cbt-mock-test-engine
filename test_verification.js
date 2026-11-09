const fs = require('fs');
const vm = require('vm');

const path = require('path');

const parserCode = fs.readFileSync(path.join(__dirname, 'js', 'parser.js'), 'utf8');
const scoringCode = fs.readFileSync(path.join(__dirname, 'js', 'scoring.js'), 'utf8');

const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(parserCode + '\nthis.CBTParser = CBTParser;', sandbox);
vm.runInContext(scoringCode + '\nthis.CBTScoring = CBTScoring;', sandbox);

console.log('--- TEST 1: Parse JSON (sample_jee_test.json) ---');
const jeeJson = fs.readFileSync(path.join(__dirname, 'data', 'sample_jee_test.json'), 'utf8');
const jeeTest = sandbox.CBTParser.parse(jeeJson, 'sample_jee_test.json');
console.log('JEE Title:', jeeTest.title);
console.log('Total Questions:', jeeTest.questions.length);
console.log('Sections:', jeeTest.sections.map(s => s.name));
if (jeeTest.questions.length !== 15) throw new Error('Expected 15 questions in JEE JSON');

console.log('--- TEST 2: Parse CSV (sample_gate_cs.csv) ---');
const gateCsv = fs.readFileSync(path.join(__dirname, 'data', 'sample_gate_cs.csv'), 'utf8');
const gateTest = sandbox.CBTParser.parse(gateCsv, 'sample_gate_cs.csv');
console.log('GATE Title:', gateTest.title);
console.log('Total Questions:', gateTest.questions.length);
console.log('Sections:', gateTest.sections.map(s => s.name));
if (gateTest.questions.length !== 15) throw new Error('Expected 15 questions in GATE CSV');

console.log('--- TEST 3: Hand Calculation Verification on 15 Questions ---');
// Scenario for jeeTest (15 questions with +4/-1):
// Q1: correct (+4)
// Q2: correct (+4)
// Q3: correct (+4)
// Q4: correct (+4)
// Q5: correct (+4)
// Q6: correct (+4)
// Q7: correct (+4)
// Q8: incorrect (-1)
// Q9: incorrect (-1)
// Q10: unattempted (0)
// Q11: correct (+4)
// Q12: correct (+4)
// Q13: correct (+4)
// Q14: incorrect (-1)
// Q15: unattempted (0)

const responses = {
  1: 1, // correct (+4)
  2: 0, // correct (+4)
  3: 2, // correct (+4)
  4: 0, // correct (+4)
  5: 2, // correct (+4)
  6: 2, // correct (+4)
  7: 1, // correct (+4)
  8: 0, // incorrect (-1)
  9: 0, // incorrect (-1)
  // 10 unattempted
  11: 1, // correct (+4)
  12: 2, // correct (+4)
  13: 0, // correct (+4)
  14: 1  // incorrect (-1)
  // 15 unattempted
};

const reviews = {
  3: true,
  10: true
};

const timeSpent = {
  1: 30, 2: 45, 3: 50, 4: 60, 5: 40,
  6: 35, 7: 55, 8: 70, 9: 65, 10: 20,
  11: 45, 12: 50, 13: 30, 14: 80, 15: 15
};

const totalTime = Object.values(timeSpent).reduce((a, b) => a + b, 0); // 640s
const report = sandbox.CBTScoring.evaluate(jeeTest, responses, reviews, timeSpent, totalTime);

console.log('Result Total Score:', report.totalScore, 'Expected: 37');
console.log('Result Max Score:', report.maxPossibleScore, 'Expected: 60');
console.log('Result Attempted:', report.attemptedCount, 'Expected: 13');
console.log('Result Correct:', report.correctCount, 'Expected: 10');
console.log('Result Incorrect:', report.incorrectCount, 'Expected: 3');
console.log('Result Unattempted:', report.unattemptedCount, 'Expected: 2');
console.log('Result Accuracy:', report.accuracy, '% Expected: 76.9%');

if (report.totalScore !== 37) throw new Error('Score calculation mismatch!');
if (report.correctCount !== 10) throw new Error('Correct count mismatch!');
if (report.incorrectCount !== 3) throw new Error('Incorrect count mismatch!');
if (report.unattemptedCount !== 2) throw new Error('Unattempted mismatch!');
if (report.accuracy !== 76.9) throw new Error('Accuracy calculation mismatch!');

console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
