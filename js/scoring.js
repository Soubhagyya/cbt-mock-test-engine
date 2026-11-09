/**
 * CBT Mock Test Scoring & Analytics Engine
 * Accurately computes positive & negative marks, section aggregates, and time analytics.
 */

const CBTScoring = {
  /**
   * Evaluate a completed or submitted test session
   * @param {Object} test - Test definition object
   * @param {Object} responses - Map of questionId -> selectedOptionIndex (null if unattempted)
   * @param {Object} reviewFlags - Map of questionId -> boolean
   * @param {Object} timeSpentMap - Map of questionId -> seconds spent
   * @param {number} totalTimeTakenSeconds - Total time elapsed during the test
   * @returns {Object} Comprehensive Result Report
   */
  evaluate(test, responses = {}, reviewFlags = {}, timeSpentMap = {}, totalTimeTakenSeconds = 0) {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let markedForReviewCount = 0;

    // Track section metrics
    const sectionStats = {};
    test.sections.forEach(sec => {
      sectionStats[sec.id] = {
        id: sec.id,
        name: sec.name,
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        score: 0,
        maxScore: 0,
        timeSpentSeconds: 0
      };
    });

    // Evaluate each question
    const questionEvaluations = test.questions.map(q => {
      const selectedOption = responses[q.id];
      const isAttempted = selectedOption !== undefined && selectedOption !== null && selectedOption !== -1;
      const isMarkedForReview = !!reviewFlags[q.id];
      const timeSpent = timeSpentMap[q.id] || 0;
      
      const posMarks = q.positiveMarks;
      const negMarks = q.negativeMarks;
      maxPossibleScore += posMarks;

      const secStat = sectionStats[q.sectionId] || {
        id: q.sectionId,
        name: q.sectionName,
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        score: 0,
        maxScore: 0,
        timeSpentSeconds: 0
      };
      
      secStat.totalQuestions += 1;
      secStat.maxScore += posMarks;
      secStat.timeSpentSeconds += timeSpent;

      if (isMarkedForReview) {
        markedForReviewCount += 1;
      }

      let status = "unattempted"; // "correct" | "incorrect" | "unattempted"
      let marksAwarded = 0;

      if (!isAttempted) {
        unattemptedCount += 1;
        secStat.unattempted += 1;
        marksAwarded = 0;
        status = "unattempted";
      } else {
        secStat.attempted += 1;
        if (selectedOption === q.correctOption) {
          status = "correct";
          marksAwarded = posMarks;
          correctCount += 1;
          secStat.correct += 1;
        } else {
          status = "incorrect";
          marksAwarded = -negMarks;
          incorrectCount += 1;
          secStat.incorrect += 1;
        }
      }

      totalScore += marksAwarded;
      secStat.score += marksAwarded;

      return {
        id: q.id,
        number: q.number,
        sectionId: q.sectionId,
        sectionName: q.sectionName,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        userOption: isAttempted ? selectedOption : null,
        isAttempted: isAttempted,
        isMarkedForReview: isMarkedForReview,
        status: status,
        marksAwarded: marksAwarded,
        positiveMarks: posMarks,
        negativeMarks: negMarks,
        timeSpentSeconds: timeSpent,
        explanation: q.explanation
      };
    });

    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    // Time calculations
    const avgTimePerQuestion = test.questions.length > 0 
      ? Math.round(totalTimeTakenSeconds / test.questions.length) 
      : 0;

    let timeSpentCorrect = 0;
    let timeSpentIncorrect = 0;
    let timeSpentUnattempted = 0;

    questionEvaluations.forEach(q => {
      if (q.status === "correct") timeSpentCorrect += q.timeSpentSeconds;
      else if (q.status === "incorrect") timeSpentIncorrect += q.timeSpentSeconds;
      else timeSpentUnattempted += q.timeSpentSeconds;
    });

    // Format section summary
    const sectionList = Object.values(sectionStats).map(sec => {
      const secAttempted = sec.correct + sec.incorrect;
      const secAccuracy = secAttempted > 0 ? (sec.correct / secAttempted) * 100 : 0;
      return {
        ...sec,
        accuracy: Math.round(secAccuracy * 10) / 10,
        score: Math.round(sec.score * 100) / 100
      };
    });

    return {
      testId: test.testId,
      testTitle: test.title,
      totalQuestions: test.questions.length,
      maxPossibleScore: Math.round(maxPossibleScore * 100) / 100,
      totalScore: Math.round(totalScore * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      attemptedCount: attemptedCount,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      unattemptedCount: unattemptedCount,
      markedForReviewCount: markedForReviewCount,
      totalTimeTakenSeconds: totalTimeTakenSeconds,
      avgTimePerQuestionSeconds: avgTimePerQuestion,
      timeSpentCorrect: timeSpentCorrect,
      timeSpentIncorrect: timeSpentIncorrect,
      timeSpentUnattempted: timeSpentUnattempted,
      sectionSummaries: sectionList,
      questionEvaluations: questionEvaluations,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Helper to format seconds into mm:ss or hh:mm:ss
   */
  formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const remainingSeconds = s % 60;

    const pad = n => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  }
};
