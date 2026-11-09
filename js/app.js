/**
 * CBT Mock Test Engine - Application Controller
 * Handles UI interactions, screen routing, file uploads, drag & drop, and modals.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  let engine = null;
  let currentTestDef = null;
  let activeFilter = "all"; // for results review

  // DOM Elements - Screens
  const screenHome = document.getElementById("screen-home");
  const screenExam = document.getElementById("screen-exam");
  const screenResult = document.getElementById("screen-result");

  // DOM Elements - Home Screen
  const btnStartJee = document.getElementById("btn-start-jee");
  const btnStartGate = document.getElementById("btn-start-gate");
  const fileInput = document.getElementById("file-input");
  const dropZone = document.getElementById("drop-zone");
  const resumeBanner = document.getElementById("resume-banner");
  const resumeInfo = document.getElementById("resume-info");
  const btnResumeTest = document.getElementById("btn-resume-test");
  const btnDiscardResume = document.getElementById("btn-discard-resume");
  const btnDownloadTemplate = document.getElementById("btn-download-template");

  // DOM Elements - Exam Screen
  const examTitleElem = document.getElementById("exam-title");
  const examTimerElem = document.getElementById("exam-timer");
  const examTimerBox = document.getElementById("timer-box");
  const sectionTabsContainer = document.getElementById("section-tabs");
  const questionNumberElem = document.getElementById("question-number");
  const questionMetaBadge = document.getElementById("question-meta-badge");
  const questionTextElem = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const questionPaletteGrid = document.getElementById("palette-grid");
  const sectionPaletteName = document.getElementById("section-palette-name");

  // Palette counts
  const countAnswered = document.getElementById("count-answered");
  const countNotAnswered = document.getElementById("count-not-answered");
  const countNotVisited = document.getElementById("count-not-visited");
  const countMarkedReview = document.getElementById("count-marked-review");
  const countAnsweredMarked = document.getElementById("count-answered-marked");

  // Exam Action Buttons
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnClearResponse = document.getElementById("btn-clear");
  const btnMarkReview = document.getElementById("btn-mark-review");
  const btnSaveNext = document.getElementById("btn-save-next");
  const btnSubmitExam = document.getElementById("btn-submit-exam");
  const btnTogglePalette = document.getElementById("btn-toggle-palette");
  const paletteSidebar = document.getElementById("palette-sidebar");

  // Modals
  const submitModal = document.getElementById("submit-modal");
  const modalBtnCancel = document.getElementById("modal-btn-cancel");
  const modalBtnConfirm = document.getElementById("modal-btn-confirm");
  const modalAnswered = document.getElementById("modal-answered");
  const modalNotAnswered = document.getElementById("modal-not-answered");
  const modalReview = document.getElementById("modal-review");
  const modalNotVisited = document.getElementById("modal-not-visited");
  const toastNotification = document.getElementById("toast-notification");

  // DOM Elements - Results Screen
  const resultTestTitle = document.getElementById("result-test-title");
  const resultScoreValue = document.getElementById("result-score-value");
  const resultMaxScore = document.getElementById("result-max-score");
  const resultPercentage = document.getElementById("result-percentage");
  const resultAccuracy = document.getElementById("result-accuracy");
  const resultTimeSpent = document.getElementById("result-time-spent");
  const resultAvgTime = document.getElementById("result-avg-time");
  const resultAttemptedBadge = document.getElementById("result-attempted-badge");
  const resultCorrectBadge = document.getElementById("result-correct-badge");
  const resultIncorrectBadge = document.getElementById("result-incorrect-badge");
  const sectionSummaryTableBody = document.getElementById("section-summary-tbody");
  const reviewQuestionsList = document.getElementById("review-questions-list");
  const filterButtons = document.querySelectorAll(".review-filter-btn");
  const btnPrintResult = document.getElementById("btn-print-result");
  const btnDownloadReportJson = document.getElementById("btn-download-report-json");
  const btnRetakeExam = document.getElementById("btn-retake-exam");
  const btnHomeFromResults = document.getElementById("btn-home-from-results");

  // Dark Mode & Fullscreen
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const btnFullscreen = document.getElementById("btn-fullscreen");

  let latestResultReport = null;

  /* --------------------------------------------------------------------------
     Initialization & Session Check
  -------------------------------------------------------------------------- */
  function init() {
    initEngine();
    checkSavedSession();
    bindEvents();
    initTheme();
  }

  function initEngine() {
    engine = new CBTEngine({
      onTimerTick: (remainingSeconds, totalSeconds) => {
        examTimerElem.textContent = CBTScoring.formatTime(remainingSeconds);
        // Highlight in red if under 5 minutes (300s)
        if (remainingSeconds <= 300) {
          examTimerBox.classList.add("timer-urgent");
        } else {
          examTimerBox.classList.remove("timer-urgent");
        }
      },
      onQuestionRender: (question, meta) => {
        renderActiveQuestion(question, meta);
      },
      onPaletteUpdate: (counts) => {
        updatePaletteCounts(counts);
        renderPaletteGrid();
      },
      onSectionChange: (sectionId) => {
        highlightActiveSectionTab(sectionId);
      },
      onAutoSubmit: () => {
        showToast("Time has expired! Submitting test automatically...", "warning");
      },
      onTestComplete: (report, isAuto) => {
        latestResultReport = report;
        renderResults(report);
        switchScreen("result");
      }
    });
  }

  function checkSavedSession() {
    const sessionInfo = engine.getSavedSessionInfo();
    if (sessionInfo && sessionInfo.remainingSeconds > 0) {
      resumeInfo.textContent = `Found unfinished session for "${sessionInfo.testTitle}" (${sessionInfo.answeredCount}/${sessionInfo.totalQuestions} answered, ${CBTScoring.formatTime(sessionInfo.remainingSeconds)} left).`;
      resumeBanner.classList.remove("hidden");
    } else {
      resumeBanner.classList.add("hidden");
    }
  }

  /* --------------------------------------------------------------------------
     Screen Navigation
  -------------------------------------------------------------------------- */
  function switchScreen(screenName) {
    screenHome.classList.add("hidden");
    screenExam.classList.add("hidden");
    screenResult.classList.add("hidden");

    if (screenName === "home") {
      screenHome.classList.remove("hidden");
      checkSavedSession();
      window.scrollTo(0, 0);
    } else if (screenName === "exam") {
      screenExam.classList.remove("hidden");
      window.scrollTo(0, 0);
    } else if (screenName === "result") {
      screenResult.classList.remove("hidden");
      window.scrollTo(0, 0);
    }
  }

  /* --------------------------------------------------------------------------
     Test Launch Handlers
  -------------------------------------------------------------------------- */
  function launchTest(testDef, resume = false) {
    currentTestDef = testDef;
    examTitleElem.textContent = testDef.title;

    renderSectionTabs(testDef.sections);

    try {
      engine.startTest(testDef, resume);
      switchScreen("exam");
      showToast(`Started: ${testDef.title}`, "success");
    } catch (err) {
      showToast(`Error starting test: ${err.message}`, "error");
    }
  }

  /* --------------------------------------------------------------------------
     Exam Interface Rendering
  -------------------------------------------------------------------------- */
  function renderSectionTabs(sections) {
    sectionTabsContainer.innerHTML = "";
    sections.forEach(sec => {
      const tab = document.createElement("button");
      tab.className = "section-tab";
      tab.dataset.sectionId = sec.id;
      tab.innerHTML = `<span>${escapeHtml(sec.name)}</span>`;
      tab.addEventListener("click", () => {
        engine.goToSection(sec.id);
      });
      sectionTabsContainer.appendChild(tab);
    });
  }

  function highlightActiveSectionTab(sectionId) {
    const tabs = sectionTabsContainer.querySelectorAll(".section-tab");
    tabs.forEach(tab => {
      if (tab.dataset.sectionId === sectionId) {
        tab.classList.add("active");
        if (sectionPaletteName) {
          sectionPaletteName.textContent = tab.textContent;
        }
      } else {
        tab.classList.remove("active");
      }
    });
  }

  function renderActiveQuestion(q, meta) {
    questionNumberElem.textContent = `Question ${meta.index + 1} of ${meta.total}`;
    questionMetaBadge.innerHTML = `
      <span class="badge-tag section-badge">${escapeHtml(q.sectionName)}</span>
      <span class="badge-tag marks-badge positive">+${q.positiveMarks}</span>
      <span class="badge-tag marks-badge negative">-${q.negativeMarks}</span>
    `;

    questionTextElem.innerHTML = escapeHtml(q.question);

    optionsContainer.innerHTML = "";
    const optionLetters = ["A", "B", "C", "D", "E", "F"];

    q.options.forEach((optText, idx) => {
      const optDiv = document.createElement("label");
      optDiv.className = `option-item ${meta.selectedOption === idx ? "selected" : ""}`;
      optDiv.htmlFor = `opt-${idx}`;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `question-option`;
      radio.id = `opt-${idx}`;
      radio.value = idx;
      radio.checked = meta.selectedOption === idx;

      radio.addEventListener("change", () => {
        engine.selectOption(idx);
      });

      const indicator = document.createElement("span");
      indicator.className = "option-indicator";
      indicator.textContent = optionLetters[idx] || String(idx + 1);

      const content = document.createElement("span");
      content.className = "option-text";
      content.innerHTML = escapeHtml(optText);

      optDiv.appendChild(radio);
      optDiv.appendChild(indicator);
      optDiv.appendChild(content);

      optionsContainer.appendChild(optDiv);
    });

    // Update Mark for Review button state
    if (meta.isMarkedForReview) {
      btnMarkReview.classList.add("active");
      btnMarkReview.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Unmark Review
      `;
    } else {
      btnMarkReview.classList.remove("active");
      btnMarkReview.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Mark for Review
      `;
    }

    // Previous / Next button disabled states
    btnPrev.disabled = meta.index === 0;
    if (meta.index === meta.total - 1) {
      btnSaveNext.innerHTML = `Save & Continue`;
    } else {
      btnSaveNext.innerHTML = `Save & Next`;
    }
  }

  function renderPaletteGrid() {
    if (!engine || !engine.testData) return;

    questionPaletteGrid.innerHTML = "";
    const questions = engine.testData.questions;

    questions.forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.className = `palette-btn status-${engine.getQuestionStatus(q.id)}`;
      if (idx === engine.currentQuestionIndex) {
        btn.classList.add("current");
      }
      btn.textContent = idx + 1;
      btn.title = `Question ${idx + 1} (${q.sectionName})`;

      btn.addEventListener("click", () => {
        engine.goToQuestion(idx);
        if (window.innerWidth <= 900) {
          paletteSidebar.classList.remove("open");
        }
      });

      questionPaletteGrid.appendChild(btn);
    });
  }

  function updatePaletteCounts(counts) {
    if (countAnswered) countAnswered.textContent = counts.answered;
    if (countNotAnswered) countNotAnswered.textContent = counts.not_answered;
    if (countNotVisited) countNotVisited.textContent = counts.not_visited;
    if (countMarkedReview) countMarkedReview.textContent = counts.marked_review;
    if (countAnsweredMarked) countAnsweredMarked.textContent = counts.answered_marked_review;
  }

  /* --------------------------------------------------------------------------
     Results Dashboard Rendering
  -------------------------------------------------------------------------- */
  function renderResults(report) {
    resultTestTitle.textContent = report.testTitle;
    resultScoreValue.textContent = report.totalScore;
    resultMaxScore.textContent = `/ ${report.maxPossibleScore}`;
    resultPercentage.textContent = `${report.percentage}%`;
    resultAccuracy.textContent = `${report.accuracy}%`;
    resultTimeSpent.textContent = CBTScoring.formatTime(report.totalTimeTakenSeconds);
    resultAvgTime.textContent = `${report.avgTimePerQuestionSeconds}s`;

    resultAttemptedBadge.textContent = `${report.attemptedCount} / ${report.totalQuestions} Attempted`;
    resultCorrectBadge.textContent = `${report.correctCount} Correct`;
    resultIncorrectBadge.textContent = `${report.incorrectCount} Incorrect`;

    // Render Section Breakdown Table
    sectionSummaryTableBody.innerHTML = "";
    report.sectionSummaries.forEach(sec => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHtml(sec.name)}</strong></td>
        <td>${sec.totalQuestions}</td>
        <td>${sec.attempted}</td>
        <td class="text-success font-semibold">${sec.correct}</td>
        <td class="text-danger font-semibold">${sec.incorrect}</td>
        <td><strong>${sec.score}</strong> / ${sec.maxScore}</td>
        <td>${sec.accuracy}%</td>
        <td>${CBTScoring.formatTime(sec.timeSpentSeconds)}</td>
      `;
      sectionSummaryTableBody.appendChild(tr);
    });

    renderReviewList(report.questionEvaluations);
  }

  function renderReviewList(evaluations) {
    reviewQuestionsList.innerHTML = "";
    const filtered = evaluations.filter(item => {
      if (activeFilter === "all") return true;
      if (activeFilter === "correct") return item.status === "correct";
      if (activeFilter === "incorrect") return item.status === "incorrect";
      if (activeFilter === "unattempted") return item.status === "unattempted";
      if (activeFilter === "review") return item.isMarkedForReview;
      return true;
    });

    if (filtered.length === 0) {
      reviewQuestionsList.innerHTML = `<div class="empty-state">No questions match the "${activeFilter}" filter.</div>`;
      return;
    }

    const optionLetters = ["A", "B", "C", "D", "E", "F"];

    filtered.forEach(item => {
      const card = document.createElement("div");
      card.className = `review-card status-${item.status}`;

      let statusBadge = "";
      if (item.status === "correct") {
        statusBadge = `<span class="badge-status-pill badge-correct">Correct (+${item.marksAwarded})</span>`;
      } else if (item.status === "incorrect") {
        statusBadge = `<span class="badge-status-pill badge-incorrect">Incorrect (${item.marksAwarded})</span>`;
      } else {
        statusBadge = `<span class="badge-status-pill badge-unattempted">Unattempted (0)</span>`;
      }

      if (item.isMarkedForReview) {
        statusBadge += ` <span class="badge-status-pill badge-review">Marked Review</span>`;
      }

      let optionsHtml = '<div class="review-options-grid">';
      item.options.forEach((opt, idx) => {
        let optClass = "review-opt";
        let markIndicator = "";

        if (idx === item.correctOption) {
          optClass += " correct-opt";
          markIndicator = `<span class="opt-tag tag-correct">Correct Answer</span>`;
        }
        if (item.userOption === idx) {
          if (idx === item.correctOption) {
            optClass += " user-correct";
            markIndicator = `<span class="opt-tag tag-correct">Your Choice (Correct)</span>`;
          } else {
            optClass += " user-wrong";
            markIndicator = `<span class="opt-tag tag-wrong">Your Choice (Wrong)</span>`;
          }
        }

        optionsHtml += `
          <div class="${optClass}">
            <span class="opt-letter">${optionLetters[idx]}</span>
            <span class="opt-content">${escapeHtml(opt)}</span>
            ${markIndicator}
          </div>
        `;
      });
      optionsHtml += '</div>';

      card.innerHTML = `
        <div class="review-card-header">
          <div>
            <span class="review-q-num">Q${item.number}</span>
            <span class="review-q-sec">${escapeHtml(item.sectionName)}</span>
          </div>
          <div class="review-q-meta">
            ${statusBadge}
            <span class="review-time">⏱ ${item.timeSpentSeconds}s</span>
          </div>
        </div>
        <div class="review-q-text">${escapeHtml(item.question)}</div>
        ${optionsHtml}
        <div class="review-explanation">
          <div class="explanation-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Step-by-Step Solution & Explanation:
          </div>
          <p>${escapeHtml(item.explanation)}</p>
        </div>
      `;

      reviewQuestionsList.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     File Upload & Drag and Drop Handling
  -------------------------------------------------------------------------- */
  function handleFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = CBTParser.parse(content, file.name);
        showToast(`Loaded ${parsed.totalQuestions} questions successfully!`, "success");
        launchTest(parsed);
      } catch (err) {
        showToast(`Failed to parse file: ${err.message}`, "error");
        console.error(err);
      }
    };
    reader.onerror = () => {
      showToast("Error reading file from disk.", "error");
    };
    reader.readAsText(file);
  }

  /* --------------------------------------------------------------------------
     Event Bindings
  -------------------------------------------------------------------------- */
  function bindEvents() {
    // Built-in presets
    btnStartJee.addEventListener("click", () => {
      launchTest(BUILTIN_TEST_SETS.jee);
    });

    btnStartGate.addEventListener("click", () => {
      try {
        const parsed = CBTParser.parseCSV(BUILTIN_TEST_SETS.gate.csvRaw, "GATE CS Mock Exam");
        parsed.title = BUILTIN_TEST_SETS.gate.title;
        parsed.totalDurationMinutes = BUILTIN_TEST_SETS.gate.totalDurationMinutes;
        launchTest(parsed);
      } catch (err) {
        showToast("Error loading GATE CS mock: " + err.message, "error");
      }
    });

    // Custom File Selection
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });

    // Drag & Drop
    ["dragenter", "dragover"].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("drag-active");
      });
    });

    ["dragleave", "drop"].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("drag-active");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    // Resume Session Buttons
    btnResumeTest.addEventListener("click", () => {
      const stateRaw = localStorage.getItem("cbt_mock_active_state");
      if (stateRaw) {
        try {
          const state = JSON.parse(stateRaw);
          launchTest(state.testData, true);
        } catch (e) {
          showToast("Failed to restore session.", "error");
        }
      }
    });

    btnDiscardResume.addEventListener("click", () => {
      engine.clearSavedSession();
      resumeBanner.classList.add("hidden");
      showToast("Previous exam session discarded.", "info");
    });

    // Template Download
    btnDownloadTemplate.addEventListener("click", () => {
      const csvTemplate = `section,question,optionA,optionB,optionC,optionD,correctOption,positiveMarks,negativeMarks,explanation
Physics,What is the unit of force in SI units?,Newton,Joule,Pascal,Watt,A,4,1,The SI unit of force is the Newton (N = kg m / s^2).
Chemistry,What is the chemical symbol for Gold?,Ag,Au,Pb,Fe,B,4,1,The symbol Au comes from the Latin word aurum meaning shining dawn.`;
      
      const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cbt_question_template.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    // Exam Action Buttons
    btnPrev.addEventListener("click", () => {
      engine.previousQuestion();
    });

    btnNext.addEventListener("click", () => {
      engine.nextQuestion();
    });

    btnClearResponse.addEventListener("click", () => {
      engine.clearResponse();
    });

    btnMarkReview.addEventListener("click", () => {
      engine.toggleMarkForReview();
    });

    btnSaveNext.addEventListener("click", () => {
      // Find currently checked radio if any
      const selected = document.querySelector('input[name="question-option"]:checked');
      const val = selected ? parseInt(selected.value, 10) : null;
      engine.saveAndNext(val);
    });

    btnTogglePalette.addEventListener("click", () => {
      paletteSidebar.classList.toggle("open");
    });

    // Modal submission handling
    btnSubmitExam.addEventListener("click", () => {
      const counts = engine.getStatusCounts();
      modalAnswered.textContent = counts.answered + counts.answered_marked_review;
      modalNotAnswered.textContent = counts.not_answered;
      modalReview.textContent = counts.marked_review + counts.answered_marked_review;
      modalNotVisited.textContent = counts.not_visited;
      submitModal.classList.remove("hidden");
    });

    modalBtnCancel.addEventListener("click", () => {
      submitModal.classList.add("hidden");
    });

    modalBtnConfirm.addEventListener("click", () => {
      submitModal.classList.add("hidden");
      engine.submitExam(false);
    });

    // Filter Buttons on Results Page
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        if (latestResultReport) {
          renderReviewList(latestResultReport.questionEvaluations);
        }
      });
    });

    // Print & PDF Export
    btnPrintResult.addEventListener("click", () => {
      window.print();
    });

    // JSON Report Export
    btnDownloadReportJson.addEventListener("click", () => {
      if (!latestResultReport) return;
      const jsonStr = JSON.stringify(latestResultReport, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${latestResultReport.testTitle.replace(/\s+/g, '_')}_Report.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Retake Test
    btnRetakeExam.addEventListener("click", () => {
      if (currentTestDef) {
        launchTest(currentTestDef, false);
      }
    });

    btnHomeFromResults.addEventListener("click", () => {
      switchScreen("home");
    });

    // Theme Toggle
    btnThemeToggle.addEventListener("click", toggleTheme);

    // Fullscreen Toggle
    btnFullscreen.addEventListener("click", toggleFullscreen);
  }

  /* --------------------------------------------------------------------------
     Theme & Display Utilities
  -------------------------------------------------------------------------- */
  function initTheme() {
    const savedTheme = localStorage.getItem("cbt_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("cbt_theme", newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    if (theme === "dark") {
      btnThemeToggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    } else {
      btnThemeToggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        showToast("Fullscreen request denied: " + err.message, "info");
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function showToast(message, type = "info") {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.className = `toast-notice show type-${type}`;

    clearTimeout(toastNotification._timer);
    toastNotification._timer = setTimeout(() => {
      toastNotification.className = "toast-notice hidden";
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start the app
  init();
});
