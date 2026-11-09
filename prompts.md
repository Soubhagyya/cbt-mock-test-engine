# Engineering Journey & Prompt History: CBT Mock Test Engine

This document records the sequence of prompts, architectural design decisions, and testing iterations followed to build the **Autonomous Offline CBT Mock Test Engine** for the BSERC Internship (Week 2).

---

## Prompt 1: Architecture Planning & Requirements Breakdown
> **Prompt:**  
> "I need to build an offline Computer-Based Testing (CBT) mock exam engine in pure HTML, CSS, and modern JavaScript. It must run 100% offline with zero dependencies or external servers, simulating exams like JEE and GATE.  
> Requirements:
> 1. Load questions from both JSON and CSV files.
> 2. Persistent countdown timer with auto-submit.
> 3. Standard question palette showing Not Visited, Not Answered, Answered, Marked for Review, and Answered & Marked for Review.
> 4. Multi-subject/section tabs with configurable positive and negative marks.
> 5. Comprehensive results dashboard with score, accuracy %, and time spent per question.
> 6. Crash-proof state persistence so a browser refresh loses nothing.  
> Let's outline the project structure and data schemas."

**Outcome:**  
Defined modular project architecture:
- `index.html`: Unified single-page application structure.
- `css/main.css`: Core design system, variables, typography, and print stylesheet.
- `css/cbt-engine.css`: Specialized CBT layouts, question palette, and dashboard.
- `js/sample-data.js`: Bundled offline mock exams (JEE STEM & GATE CS).
- `js/parser.js`: Robust RFC 4180 CSV parser and JSON schema validator.
- `js/test-engine.js`: Navigation, question palette state machine, precision timer.
- `js/scoring.js`: Mathematical evaluation engine for positive/negative scoring.
- `js/app.js`: Application controller, drag-and-drop, modals, and event routing.

---

## Prompt 2: Flexible Question Parser (JSON & CSV)
> **Prompt:**  
> "Build `js/parser.js` capable of parsing question files in both JSON and CSV formats. For CSV, handle RFC 4180 rules (quoted commas, multiline entries, variations in column names like 'section', 'question', 'optionA', 'correctOption', 'positiveMarks', 'negativeMarks', 'explanation'). Include validation so malformed files give clear error messages."

**Outcome:**  
Implemented `CBTParser.parse()`, `parseJSON()`, and `parseCSV()` with column auto-discovery, section mapping, and answer index normalization ('A'-'D' to 0-3).

---

## Prompt 3: Scoring & Analytics Engine with Hand-Calculation Verification
> **Prompt:**  
> "Implement `js/scoring.js` to calculate total score, maximum score, percentage, accuracy rate, attempted/unattempted counts, and section-by-section breakdown. Ensure positive marks are added and negative marks are deducted accurately according to the section rules. Also compute time spent per question and format times into `MM:SS`."

**Outcome:**  
Engineered `CBTScoring.evaluate()` with exact mathematical precision. Validated against a 15-question test with hand calculations:
- 10 Correct (+40)
- 3 Incorrect (-3)
- 2 Unattempted (0)
- Total Score: **37 / 60**
- Accuracy: **76.9%** (verified via automated unit test).

---

## Prompt 4: Precision Timer & Session Persistence
> **Prompt:**  
> "Create `js/test-engine.js` managing question statuses (`not_visited`, `not_answered`, `answered`, `marked_review`, `answered_marked_review`). Implement a persistent countdown timer using timestamp deltas (`targetEndTime - Date.now()`) so mid-test page refreshes do not reset or drift the timer. Persist state to `localStorage` on every interaction."

**Outcome:**  
Engineered `CBTEngine` with:
- Timestamp delta countdown timer with zero drift across tab switches or reloads.
- Auto-submit trigger when time reaches 0.
- State preservation of responses, review flags, visited states, and active question.
- Question-level time tracking.

---

## Prompt 5: Authentic CBT Interface & Question Palette
> **Prompt:**  
> "Design the UI for the exam screen:
> 1. Top bar with exam title, subject tabs, and timer box.
> 2. Left pane with question number, subject badge, marking scheme (+4/-1), question statement, and interactive option cards.
> 3. Bottom action bar with 'Previous', 'Next', 'Mark for Review', 'Clear Response', 'Save & Next', and 'Submit Test'.
> 4. Right sidebar with question palette (1 to N grid with status colors) and summary counts.
> 5. Responsive mobile drawer for palette on smaller screens."

**Outcome:**  
Created clean, accessible UI adhering to modern design standards with clear contrast, explicit interactive states, and mobile responsiveness.

---

## Prompt 6: Results Dashboard & Printable Scorecard
> **Prompt:**  
> "Create the results screen with:
> 1. 4 KPI cards: Total Score, Overall Accuracy %, Attempt Rate, and Time Efficiency.
> 2. Section-wise breakdown table with correct, incorrect, marks, and section accuracy.
> 3. Filterable question-by-question review (All, Correct, Incorrect, Unattempted, Marked for Review) showing correct answer, user choice, time spent, and detailed explanations.
> 4. Print-to-PDF export stylesheet that formats an A4 report."

**Outcome:**  
Implemented results dashboard with `@media print` styling, JSON export, and full solution walkthroughs.

---

## Prompt 7: Verification & Acceptance Testing
> **Prompt:**  
> "Write automated Node.js test scripts to verify:
> 1. JSON file parsing (`sample_jee_test.json`).
> 2. CSV file parsing (`sample_gate_cs.csv`).
> 3. Hand-calculated score verification on 15 questions.
> 4. Simulated browser refresh and session restoration."

**Outcome:**  
Built and ran `test_verification.js` and `test_persistence.js`. All automated tests passed with 100% compliance.
