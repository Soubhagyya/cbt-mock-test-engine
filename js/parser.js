/**
 * CBT Test Question Parser & Validator
 * Supports JSON and CSV formats with flexible schema recognition.
 */

const CBTParser = {
  /**
   * Parse a raw string (JSON or CSV)
   * @param {string} content - Raw file text
   * @param {string} filename - Optional filename to assist format detection
   * @returns {Object} Structured Exam Object
   */
  parse(content, filename = "") {
    if (!content || typeof content !== "string") {
      throw new Error("Empty or invalid file content provided.");
    }

    const trimmed = content.trim();

    // Try parsing as JSON first if it starts with '{' or filename ends with .json
    if (trimmed.startsWith("{") || filename.toLowerCase().endsWith(".json")) {
      try {
        return this.parseJSON(trimmed, filename);
      } catch (err) {
        if (!filename.toLowerCase().endsWith(".csv")) {
          throw err;
        }
      }
    }

    // Default or fallback to CSV
    return this.parseCSV(trimmed, filename);
  },

  /**
   * Parse structured JSON test definition
   */
  parseJSON(jsonString, filename = "") {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      throw new Error(`JSON Syntax Error: ${e.message}`);
    }

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("Invalid test file: Missing 'questions' array or question list is empty.");
    }

    const defaultPositive = Number(data.defaultPositiveMarks) || 4;
    const defaultNegative = Number(data.defaultNegativeMarks) || 1;
    const duration = Number(data.totalDurationMinutes) || Math.max(15, Math.ceil(data.questions.length * 2.5));

    // Normalize sections
    const sectionMap = new Map();
    if (Array.isArray(data.sections)) {
      data.sections.forEach(s => {
        const id = (s.id || s.name || "").toLowerCase().trim();
        if (id) {
          sectionMap.set(id, {
            id: id,
            name: s.name || s.id,
            positiveMarks: Number(s.positiveMarks) || defaultPositive,
            negativeMarks: Number(s.negativeMarks) !== undefined ? Number(s.negativeMarks) : defaultNegative
          });
        }
      });
    }

    // Normalize questions
    const questions = data.questions.map((q, idx) => {
      const qNum = idx + 1;
      const rawSec = (q.section || "General").trim();
      const secId = rawSec.toLowerCase().replace(/\s+/g, "-");

      if (!sectionMap.has(secId)) {
        sectionMap.set(secId, {
          id: secId,
          name: rawSec,
          positiveMarks: Number(q.positiveMarks) || defaultPositive,
          negativeMarks: Number(q.negativeMarks) !== undefined ? Number(q.negativeMarks) : defaultNegative
        });
      }

      const secConfig = sectionMap.get(secId);
      const posMarks = q.positiveMarks !== undefined ? Number(q.positiveMarks) : secConfig.positiveMarks;
      const negMarks = q.negativeMarks !== undefined ? Number(q.negativeMarks) : secConfig.negativeMarks;

      let correctOpt = 0;
      if (typeof q.correctOption === "number") {
        correctOpt = q.correctOption;
      } else if (typeof q.correctOption === "string") {
        const char = q.correctOption.trim().toUpperCase();
        if (["A", "B", "C", "D", "E"].includes(char)) {
          correctOpt = char.charCodeAt(0) - 65;
        } else {
          correctOpt = parseInt(char, 10) || 0;
        }
      }

      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(`Question #${qNum} is incomplete. Needs text and at least 2 options.`);
      }

      return {
        id: q.id !== undefined ? q.id : qNum,
        number: qNum,
        sectionId: secId,
        sectionName: secConfig.name,
        question: String(q.question).trim(),
        options: q.options.map(opt => String(opt).trim()),
        correctOption: correctOpt,
        positiveMarks: posMarks,
        negativeMarks: negMarks,
        explanation: q.explanation ? String(q.explanation).trim() : "No detailed explanation provided."
      };
    });

    return {
      testId: data.testId || `mock-${Date.now()}`,
      title: data.title || (filename ? filename.replace(/\.[^/.]+$/, "") : "Computer-Based Mock Test"),
      totalDurationMinutes: duration,
      sections: Array.from(sectionMap.values()),
      questions: questions,
      totalQuestions: questions.length
    };
  },

  /**
   * Parse CSV format
   * Supports standard format: section,question,optionA,optionB,optionC,optionD,correctOption,positiveMarks,negativeMarks,explanation
   */
  parseCSV(csvText, filename = "") {
    const lines = this.splitCSVLines(csvText);
    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one question row.");
    }

    const header = lines[0].map(h => h.trim().toLowerCase());
    
    // Find column indexes
    const colIdx = {
      section: header.findIndex(h => h.includes("sec")),
      question: header.findIndex(h => h.includes("quest")),
      optA: header.findIndex(h => h === "optiona" || h === "option a" || h === "a" || h === "opt1"),
      optB: header.findIndex(h => h === "optionb" || h === "option b" || h === "b" || h === "opt2"),
      optC: header.findIndex(h => h === "optionc" || h === "option c" || h === "c" || h === "opt3"),
      optD: header.findIndex(h => h === "optiond" || h === "option d" || h === "d" || h === "opt4"),
      correct: header.findIndex(h => h.includes("correct") || h.includes("answer") || h === "ans"),
      posMarks: header.findIndex(h => h.includes("pos") || h === "marks"),
      negMarks: header.findIndex(h => h.includes("neg")),
      explanation: header.findIndex(h => h.includes("expl") || h.includes("sol"))
    };

    if (colIdx.question === -1) {
      throw new Error("CSV header missing required 'question' column.");
    }
    if (colIdx.optA === -1 || colIdx.optB === -1) {
      throw new Error("CSV header missing required options ('optionA', 'optionB').");
    }

    const sectionMap = new Map();
    const questions = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (!row || row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

      const qText = row[colIdx.question] ? row[colIdx.question].trim() : "";
      if (!qText) continue;

      const secRaw = (colIdx.section !== -1 && row[colIdx.section]) ? row[colIdx.section].trim() : "General";
      const secId = secRaw.toLowerCase().replace(/\s+/g, "-");

      const options = [];
      if (colIdx.optA !== -1 && row[colIdx.optA]) options.push(row[colIdx.optA].trim());
      if (colIdx.optB !== -1 && row[colIdx.optB]) options.push(row[colIdx.optB].trim());
      if (colIdx.optC !== -1 && row[colIdx.optC]) options.push(row[colIdx.optC].trim());
      if (colIdx.optD !== -1 && row[colIdx.optD]) options.push(row[colIdx.optD].trim());

      const rawCorrect = (colIdx.correct !== -1 && row[colIdx.correct]) ? row[colIdx.correct].trim().toUpperCase() : "A";
      let correctIdx = 0;
      if (["A", "B", "C", "D"].includes(rawCorrect)) {
        correctIdx = rawCorrect.charCodeAt(0) - 65;
      } else {
        const num = parseInt(rawCorrect, 10);
        correctIdx = !isNaN(num) ? (num > 0 && num <= options.length ? num - 1 : num) : 0;
      }

      const posMarks = (colIdx.posMarks !== -1 && row[colIdx.posMarks] && !isNaN(parseFloat(row[colIdx.posMarks])))
        ? parseFloat(row[colIdx.posMarks])
        : 4;
      const negMarks = (colIdx.negMarks !== -1 && row[colIdx.negMarks] && !isNaN(parseFloat(row[colIdx.negMarks])))
        ? parseFloat(row[colIdx.negMarks])
        : 1;

      const explanation = (colIdx.explanation !== -1 && row[colIdx.explanation])
        ? row[colIdx.explanation].trim()
        : "Explanation not provided.";

      if (!sectionMap.has(secId)) {
        sectionMap.set(secId, {
          id: secId,
          name: secRaw,
          positiveMarks: posMarks,
          negativeMarks: negMarks
        });
      }

      const qNum = questions.length + 1;
      questions.push({
        id: qNum,
        number: qNum,
        sectionId: secId,
        sectionName: secRaw,
        question: qText,
        options: options,
        correctOption: correctIdx,
        positiveMarks: posMarks,
        negativeMarks: negMarks,
        explanation: explanation
      });
    }

    if (questions.length === 0) {
      throw new Error("No valid questions found in CSV file.");
    }

    const title = filename ? filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "CBT Mock Examination";
    const duration = Math.max(15, Math.ceil(questions.length * 2.5));

    return {
      testId: `csv-test-${Date.now()}`,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      totalDurationMinutes: duration,
      sections: Array.from(sectionMap.values()),
      questions: questions,
      totalQuestions: questions.length
    };
  },

  /**
   * RFC 4180 compliant CSV line tokenizer
   */
  splitCSVLines(text) {
    const lines = [];
    let currentRow = [];
    let currentField = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentField);
        currentField = "";
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentField);
        if (currentRow.some(col => col.trim().length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(col => col.trim().length > 0)) {
        lines.push(currentRow);
      }
    }

    return lines;
  }
};
