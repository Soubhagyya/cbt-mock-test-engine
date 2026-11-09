# Autonomous Offline CBT Mock Test Engine

A production-grade, self-contained Computer-Based Testing (CBT) mock examination simulator designed for high-stakes entrance exams (JEE, GATE, NEET, CAT). Built with pure HTML5, CSS3, and modern JavaScript (ES6+), running **100% offline with zero external dependencies, CDN assets, or server backends**.

---

## 🌟 Key Features

1. **Complete Offline Autonomy:**
   - Operates in complete flight mode / offline state without internet or external CDNs.
   - Self-contained SVG iconography and native system font stack.

2. **Dual-Format Question Loading Engine:**
   - **JSON Format:** Structured exams with section configurations, custom durations, and rich formatting.
   - **CSV Format:** Standard spreadsheet-compatible CSV parser adhering to RFC 4180 with automatic column detection.
   - Built-in drag-and-drop file upload with live schema validation.
   - One-click starter CSV template download.

3. **Authentic CBT Exam Interface:**
   - Multi-subject/section tabs (e.g., Physics, Chemistry, Mathematics).
   - Question palette with official status color indicators:
     - 🟢 **Answered**
     - 🔴 **Not Answered**
     - ⚪ **Not Visited**
     - 🟣 **Marked for Review**
     - 🟣🟢 **Answered & Marked for Review**
   - Candidate actions: *Save & Next*, *Mark for Review & Next*, *Clear Response*, *Previous*, and *Next*.

4. **Crash-Proof Persistence & Precision Timer:**
   - Precision timestamp-delta countdown timer immune to background tab throttling.
   - Auto-saves responses, visited questions, and review flags in `localStorage` after every click.
   - Mid-test browser refresh or system restart restores the exact exam state and remaining time.
   - Auto-submits paper when the countdown timer hits `00:00`.

5. **Configurable Positive & Negative Scoring Engine:**
   - Supports granular per-section and per-question marking schemes (e.g., `+4 / -1` or `+2 / -0.66`).
   - Detailed accuracy rate, attempt rate, and time-per-question metrics.

6. **Comprehensive Results & Analytics Dashboard:**
   - KPI cards for Total Score, Accuracy %, Attempt Rate, and Time Efficiency.
   - Subject & section performance matrix.
   - Filterable question-by-question solution review (All, Correct, Incorrect, Unattempted, Marked Review).
   - Detailed step-by-step solutions and explanations for each question.
   - Direct browser Print-to-PDF export (`@media print`) and JSON scorecard download.

---

## 📂 Project Architecture

```
cbt-mock-test-engine/
├── index.html                 # Unified single-page application markup
├── prompts.md                 # Complete iterative prompt history
├── README.md                  # System documentation & verification guide
├── test_verification.js       # Node.js automated test for parser & scoring
├── test_persistence.js        # Node.js automated test for session persistence
├── css/
│   ├── main.css               # Core design tokens, dark/light theme, print layout
│   └── cbt-engine.css         # Specialized CBT UI: palette, split-pane, dashboard
├── js/
│   ├── sample-data.js         # Bundled offline mock exams (JEE STEM & GATE CS)
│   ├── parser.js              # Flexible JSON & RFC 4180 CSV parser
│   ├── scoring.js             # Mathematical evaluation & analytics engine
│   ├── test-engine.js         # Exam lifecycle, question palette, precision timer
│   └── app.js                 # UI controller, routing, drag & drop, and modals
└── data/
    ├── sample_jee_test.json   # 15-question Physics, Chemistry & Math exam (+4/-1)
    ├── sample_gate_cs.csv     # 15-question GATE CS & IT exam (+2/-0.66)
    └── sample_template.csv    # Starter CSV template for custom exams
```

---

## 🚀 How to Run

### Option 1: Direct File Launch (No Web Server Needed)
Double-click `index.html` or open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari:
```
index.html
```
The application is pre-configured with embedded sample datasets to ensure 100% offline functionality without browser CORS restrictions.

### Option 2: Using Any Lightweight Local Server
```bash
# Using Python
cd cbt-mock-test-engine
python -m http.server 8000

# Using Node.js
npx serve .
```
Navigate to `http://localhost:8000`.

---

## ✅ Acceptance Criteria & Verification Checklist

| Requirement | Spec Requirement | Verification Status | Verification Detail |
|---|---|---|---|
| **Timer & Auto-Submit** | Countdown timer with auto-submit | **PASSED** | Implemented in `test-engine.js`; triggers submission at `00:00`. |
| **Question Palette** | Real-time question statuses | **PASSED** | Palette updates live with 5 standard NTA status colors and summary counts. |
| **Mark for Review** | Dedicated toggle & navigation | **PASSED** | Supports both standalone review and answered+review modes. |
| **Subject Sections** | Multi-section tabs with +/- marking | **PASSED** | Dynamic section tabs (Physics, Chem, Math) with distinct marking rules. |
| **Result Page** | Score, accuracy, time per question | **PASSED** | Comprehensive dashboard with KPI cards, table breakdown, and solutions. |
| **Done When #1** | Refresh mid-test loses nothing | **PASSED** | Tested via `test_persistence.js`. State and timer resume seamlessly. |
| **Done When #2** | Score matches hand calculation | **PASSED** | Tested via `test_verification.js`. Hand-calculated score (37/60, 76.9% acc) matches 100%. |
| **Done When #3** | Second question file works without code change | **PASSED** | Successfully parses both `sample_jee_test.json` and `sample_gate_cs.csv`. |

---

## 🧮 Hand-Calculation Benchmark Verification

Tested on 15 questions from `data/sample_jee_test.json` (+4 positive, -1 negative):

| Question Range | User Responses | Status | Marks Calculation | Subtotal |
|---|---|---|---|---|
| Q1 - Q7 | Correct | 7 Correct | 7 × (+4) | **+28** |
| Q8 - Q9 | Incorrect | 2 Incorrect | 2 × (-1) | **-2** |
| Q10 | Unattempted | 1 Unattempted | 1 × 0 | **0** |
| Q11 - Q13 | Correct | 3 Correct | 3 × (+4) | **+12** |
| Q14 | Incorrect | 1 Incorrect | 1 × (-1) | **-1** |
| Q15 | Unattempted | 1 Unattempted | 1 × 0 | **0** |
| **Total** | **10 Correct, 3 Incorrect, 2 Unattempted** | | **(40 - 3)** | **37 / 60** |

- **Total Score:** 37 / 60
- **Attempted Count:** 13 / 15
- **Accuracy Rate:** $\frac{10}{13} \times 100 = 76.92\%$ (rounded to **76.9%**)
- **Unattempted Count:** 2

Verified via automated test script:
```bash
node test_verification.js
# Output:
# Result Total Score: 37 Expected: 37
# Result Max Score: 60 Expected: 60
# Result Attempted: 13 Expected: 13
# Result Correct: 10 Expected: 10
# Result Incorrect: 3 Expected: 3
# Result Unattempted: 2 Expected: 2
# Result Accuracy: 76.9 % Expected: 76.9%
# --- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---
```

---

## 📝 Custom Question File Schemas

### CSV Format
Save as `.csv` with comma-separated values:
```csv
section,question,optionA,optionB,optionC,optionD,correctOption,positiveMarks,negativeMarks,explanation
Physics,What is the SI unit of power?,Joule,Watt,Pascal,Volt,B,4,1,The SI unit of power is Watt (W = J/s).
```

### JSON Format
Save as `.json`:
```json
{
  "title": "Custom Entrance Mock",
  "totalDurationMinutes": 30,
  "defaultPositiveMarks": 4,
  "defaultNegativeMarks": 1,
  "questions": [
    {
      "id": 1,
      "section": "Physics",
      "question": "What is the speed of light in vacuum?",
      "options": ["3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^10 m/s", "3 × 10^5 m/s"],
      "correctOption": 0,
      "positiveMarks": 4,
      "negativeMarks": 1,
      "explanation": "The speed of light in vacuum is approximately 299,792,458 m/s (3 × 10^8 m/s)."
    }
  ]
}
```

---

*Authored by Soubhagya for Bharat Space Education Research Centre (BSERC) Internship — Week 2 Submission.*
