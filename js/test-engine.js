/**
 * CBT Mock Test Engine Core
 * Handles test session lifecycle, navigation, question palette states,
 * precision persistent countdown timer, and automatic state preservation.
 */

class CBTEngine {
  constructor(options = {}) {
    this.storageKeyPrefix = "cbt_mock_";
    this.testData = null;
    this.currentQuestionIndex = 0;
    this.currentSectionId = null;
    
    // Response tracking maps (keyed by question.id)
    this.responses = {};       // qId -> selectedOptionIdx (0..N-1)
    this.reviewFlags = {};     // qId -> boolean
    this.visitedFlags = {};    // qId -> boolean
    this.timeSpentMap = {};    // qId -> seconds
    
    // Timer state
    this.timerInterval = null;
    this.targetEndTime = null;
    this.totalDurationSeconds = 0;
    this.timeLeftSeconds = 0;
    this.isExamActive = false;
    this.isSubmitted = false;
    this.examStartTime = null;

    // Time tracking for current question
    this.currentQuestionViewStartTime = null;

    // UI Callback hooks
    this.onTimerTick = options.onTimerTick || (() => {});
    this.onQuestionRender = options.onQuestionRender || (() => {});
    this.onPaletteUpdate = options.onPaletteUpdate || (() => {});
    this.onSectionChange = options.onSectionChange || (() => {});
    this.onAutoSubmit = options.onAutoSubmit || (() => {});
    this.onTestComplete = options.onTestComplete || (() => {});
  }

  /**
   * Start a new test or load from provided definition
   */
  startTest(testDefinition, resumeExisting = false) {
    if (!testDefinition || !testDefinition.questions || testDefinition.questions.length === 0) {
      throw new Error("Cannot start test: Invalid or empty test definition.");
    }

    this.testData = testDefinition;
    this.totalDurationSeconds = (testDefinition.totalDurationMinutes || 45) * 60;

    if (resumeExisting && this.hasSavedSession(testDefinition.testId)) {
      this.restoreSession(testDefinition.testId);
    } else {
      this.initNewSession();
    }

    this.isExamActive = true;
    this.isSubmitted = false;

    // Start precision timer
    this.startTimer();

    // Mark first question as visited
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      this.visitedFlags[currentQ.id] = true;
      this.currentSectionId = currentQ.sectionId;
    }
    this.currentQuestionViewStartTime = Date.now();

    this.persistState();
    this.notifyUI();
  }

  /**
   * Initialize a brand new session
   */
  initNewSession() {
    this.responses = {};
    this.reviewFlags = {};
    this.visitedFlags = {};
    this.timeSpentMap = {};
    this.currentQuestionIndex = 0;
    this.examStartTime = Date.now();
    this.targetEndTime = this.examStartTime + (this.totalDurationSeconds * 1000);
    this.timeLeftSeconds = this.totalDurationSeconds;

    // Initialize time spent to 0 for all questions
    this.testData.questions.forEach(q => {
      this.timeSpentMap[q.id] = 0;
    });

    if (this.testData.sections && this.testData.sections.length > 0) {
      this.currentSectionId = this.testData.sections[0].id;
    }
  }

  /**
   * Start or resume the persistent countdown timer
   */
  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const updateTimer = () => {
      if (!this.isExamActive || this.isSubmitted) {
        clearInterval(this.timerInterval);
        return;
      }

      const now = Date.now();
      const remainingMs = this.targetEndTime - now;
      this.timeLeftSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      this.onTimerTick(this.timeLeftSeconds, this.totalDurationSeconds);

      // Auto-submit on expiry
      if (this.timeLeftSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.autoSubmitExam();
      }
    };

    // Immediate first tick
    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  /**
   * Record time spent on current question before switching
   */
  recordCurrentQuestionTime() {
    if (this.currentQuestionViewStartTime && this.isExamActive && !this.isSubmitted) {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - this.currentQuestionViewStartTime) / 1000));
      const currentQ = this.getCurrentQuestion();
      if (currentQ) {
        this.timeSpentMap[currentQ.id] = (this.timeSpentMap[currentQ.id] || 0) + elapsedSeconds;
      }
      this.currentQuestionViewStartTime = now;
    }
  }

  /**
   * Get currently active question object
   */
  getCurrentQuestion() {
    if (!this.testData || !this.testData.questions) return null;
    return this.testData.questions[this.currentQuestionIndex] || null;
  }

  /**
   * Get question status code:
   * - "answered": chosen option
   * - "answered_marked_review": chosen option + marked review
   * - "marked_review": marked review without option
   * - "not_answered": visited but unselected
   * - "not_visited": never opened
   */
  getQuestionStatus(questionId) {
    const isVisited = !!this.visitedFlags[questionId];
    const hasAnswer = this.responses[questionId] !== undefined && this.responses[questionId] !== null && this.responses[questionId] !== -1;
    const isReview = !!this.reviewFlags[questionId];

    if (!isVisited) {
      return "not_visited";
    }
    if (hasAnswer && isReview) {
      return "answered_marked_review";
    }
    if (hasAnswer) {
      return "answered";
    }
    if (isReview) {
      return "marked_review";
    }
    return "not_answered";
  }

  /**
   * Jump to a specific question index
   */
  goToQuestion(index) {
    if (index < 0 || index >= this.testData.questions.length) return;

    this.recordCurrentQuestionTime();
    this.currentQuestionIndex = index;
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      this.visitedFlags[currentQ.id] = true;
      this.currentSectionId = currentQ.sectionId;
    }
    this.currentQuestionViewStartTime = Date.now();

    this.persistState();
    this.notifyUI();
  }

  /**
   * Switch to a section (jumps to the first question in that section)
   */
  goToSection(sectionId) {
    const qIndex = this.testData.questions.findIndex(q => q.sectionId === sectionId);
    if (qIndex !== -1) {
      this.goToQuestion(qIndex);
    }
  }

  /**
   * Save answer and advance to next question
   */
  saveAndNext(selectedOptionIndex = null) {
    const currentQ = this.getCurrentQuestion();
    if (currentQ && selectedOptionIndex !== null && selectedOptionIndex !== undefined) {
      this.responses[currentQ.id] = selectedOptionIndex;
    }

    if (this.currentQuestionIndex < this.testData.questions.length - 1) {
      this.goToQuestion(this.currentQuestionIndex + 1);
    } else {
      this.recordCurrentQuestionTime();
      this.persistState();
      this.notifyUI();
    }
  }

  /**
   * Mark for review and move to next question
   */
  markForReviewAndNext(selectedOptionIndex = null) {
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      this.reviewFlags[currentQ.id] = true;
      if (selectedOptionIndex !== null && selectedOptionIndex !== undefined) {
        this.responses[currentQ.id] = selectedOptionIndex;
      }
    }

    if (this.currentQuestionIndex < this.testData.questions.length - 1) {
      this.goToQuestion(this.currentQuestionIndex + 1);
    } else {
      this.recordCurrentQuestionTime();
      this.persistState();
      this.notifyUI();
    }
  }

  /**
   * Toggle Mark for Review for current question
   */
  toggleMarkForReview() {
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      this.reviewFlags[currentQ.id] = !this.reviewFlags[currentQ.id];
      this.persistState();
      this.notifyUI();
    }
  }

  /**
   * Clear response on current question
   */
  clearResponse() {
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      delete this.responses[currentQ.id];
      this.persistState();
      this.notifyUI();
    }
  }

  /**
   * Select an option for current question
   */
  selectOption(optionIndex) {
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      this.responses[currentQ.id] = optionIndex;
      this.persistState();
      this.notifyUI();
    }
  }

  /**
   * Navigate to previous question
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.goToQuestion(this.currentQuestionIndex - 1);
    }
  }

  /**
   * Navigate to next question without forcing save
   */
  nextQuestion() {
    if (this.currentQuestionIndex < this.testData.questions.length - 1) {
      this.goToQuestion(this.currentQuestionIndex + 1);
    }
  }

  /**
   * Get live status counts for the exam palette summary
   */
  getStatusCounts() {
    if (!this.testData || !this.testData.questions) {
      return { answered: 0, not_answered: 0, marked_review: 0, answered_marked_review: 0, not_visited: 0 };
    }

    const counts = {
      answered: 0,
      not_answered: 0,
      marked_review: 0,
      answered_marked_review: 0,
      not_visited: 0
    };

    this.testData.questions.forEach(q => {
      const status = this.getQuestionStatus(q.id);
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }

  /**
   * Auto-submit triggered by timer expiry
   */
  autoSubmitExam() {
    this.recordCurrentQuestionTime();
    this.isExamActive = false;
    this.isSubmitted = true;
    this.clearSavedSession();
    this.onAutoSubmit();
    this.submitExam(true);
  }

  /**
   * Submit the exam and evaluate results
   */
  submitExam(isAuto = false) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.recordCurrentQuestionTime();
    this.isExamActive = false;
    this.isSubmitted = true;

    const totalTimeTakenSeconds = Math.max(0, this.totalDurationSeconds - this.timeLeftSeconds);

    const resultReport = CBTScoring.evaluate(
      this.testData,
      this.responses,
      this.reviewFlags,
      this.timeSpentMap,
      totalTimeTakenSeconds
    );

    this.clearSavedSession();
    this.onTestComplete(resultReport, isAuto);
    return resultReport;
  }

  /**
   * Persist active exam state to localStorage
   */
  persistState() {
    if (!this.testData || !this.isExamActive) return;

    try {
      const state = {
        testId: this.testData.testId,
        testData: this.testData,
        currentQuestionIndex: this.currentQuestionIndex,
        currentSectionId: this.currentSectionId,
        responses: this.responses,
        reviewFlags: this.reviewFlags,
        visitedFlags: this.visitedFlags,
        timeSpentMap: this.timeSpentMap,
        examStartTime: this.examStartTime,
        targetEndTime: this.targetEndTime,
        totalDurationSeconds: this.totalDurationSeconds,
        timestamp: Date.now()
      };

      localStorage.setItem(`${this.storageKeyPrefix}active_state`, JSON.stringify(state));
      localStorage.setItem(`${this.storageKeyPrefix}active_test_id`, this.testData.testId);
    } catch (e) {
      console.warn("Could not save CBT state to localStorage:", e);
    }
  }

  /**
   * Check if an active session exists in storage
   */
  hasSavedSession(testId = null) {
    try {
      const raw = localStorage.getItem(`${this.storageKeyPrefix}active_state`);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.testData) return false;
      if (testId && parsed.testId !== testId) return false;
      // Check if targetEndTime has passed
      if (parsed.targetEndTime && parsed.targetEndTime < Date.now()) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get saved session metadata
   */
  getSavedSessionInfo() {
    try {
      const raw = localStorage.getItem(`${this.storageKeyPrefix}active_state`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.testData) return null;
      const remainingSeconds = Math.max(0, Math.ceil((parsed.targetEndTime - Date.now()) / 1000));
      return {
        testId: parsed.testId,
        testTitle: parsed.testData.title,
        remainingSeconds: remainingSeconds,
        totalQuestions: parsed.testData.questions.length,
        answeredCount: Object.keys(parsed.responses || {}).length,
        timestamp: parsed.timestamp
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Restore state from localStorage
   */
  restoreSession(testId = null) {
    try {
      const raw = localStorage.getItem(`${this.storageKeyPrefix}active_state`);
      if (!raw) return false;
      const state = JSON.parse(raw);

      this.testData = state.testData;
      this.currentQuestionIndex = state.currentQuestionIndex || 0;
      this.currentSectionId = state.currentSectionId || null;
      this.responses = state.responses || {};
      this.reviewFlags = state.reviewFlags || {};
      this.visitedFlags = state.visitedFlags || {};
      this.timeSpentMap = state.timeSpentMap || {};
      this.examStartTime = state.examStartTime;
      this.targetEndTime = state.targetEndTime;
      this.totalDurationSeconds = state.totalDurationSeconds;

      const remainingMs = this.targetEndTime - Date.now();
      this.timeLeftSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      return true;
    } catch (e) {
      console.error("Failed to restore CBT session:", e);
      return false;
    }
  }

  /**
   * Clear saved exam session
   */
  clearSavedSession() {
    try {
      localStorage.removeItem(`${this.storageKeyPrefix}active_state`);
      localStorage.removeItem(`${this.storageKeyPrefix}active_test_id`);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Notify all UI listeners of state update
   */
  notifyUI() {
    const currentQ = this.getCurrentQuestion();
    if (currentQ) {
      this.onQuestionRender(currentQ, {
        index: this.currentQuestionIndex,
        total: this.testData.questions.length,
        status: this.getQuestionStatus(currentQ.id),
        selectedOption: this.responses[currentQ.id],
        isMarkedForReview: !!this.reviewFlags[currentQ.id]
      });
    }

    this.onPaletteUpdate(this.getStatusCounts());
    this.onSectionChange(this.currentSectionId);
  }
}
