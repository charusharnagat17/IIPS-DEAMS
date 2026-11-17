export class ExamSession {
  constructor({ questions = [], durationMinutes = 60 }) {
    this.questions = questions;
    this.totalQuestions = questions.length;
    this.durationSeconds = durationMinutes * 60;
    this.currentIndex = 0;

    // Initialize answer registry
    this.answers = {};
    questions.forEach(q => {
      this.answers[q.id] = {
        questionId: q.id,
        questionType: q.type,
        selectedOptionId: null,
        descriptiveText: '',
        codeSnippet: q.codeSnippet || '',
        isAttempted: false,
        isMarkedForReview: false
      };
    });
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  getCurrentAnswer() {
    const q = this.getCurrentQuestion();
    return q ? this.answers[q.id] : null;
  }

  setCurrentIndex(index) {
    if (index >= 0 && index < this.totalQuestions) {
      this.currentIndex = index;
    }
  }

  next() {
    if (this.currentIndex < this.totalQuestions - 1) {
      this.currentIndex += 1;
      return true;
    }
    return false;
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      return true;
    }
    return false;
  }

  setOption(questionId, optionId) {
    if (this.answers[questionId]) {
      this.answers[questionId].selectedOptionId = optionId;
      this.answers[questionId].isAttempted = true;
    }
  }

  setDescriptive(questionId, text) {
    if (this.answers[questionId]) {
      this.answers[questionId].descriptiveText = text;
      this.answers[questionId].isAttempted = text.trim().length > 0;
    }
  }

  setCode(questionId, code) {
    if (this.answers[questionId]) {
      this.answers[questionId].codeSnippet = code;
      this.answers[questionId].isAttempted = code.trim().length > 0;
    }
  }

  toggleReview(questionId) {
    if (this.answers[questionId]) {
      this.answers[questionId].isMarkedForReview = !this.answers[questionId].isMarkedForReview;
    }
  }

  clearResponse(questionId) {
    if (this.answers[questionId]) {
      this.answers[questionId].selectedOptionId = null;
      this.answers[questionId].descriptiveText = '';
      this.answers[questionId].isAttempted = false;
    }
  }

  getStatistics() {
    const values = Object.values(this.answers);
    const answered = values.filter(a => a.isAttempted).length;
    const review = values.filter(a => a.isMarkedForReview).length;
    const unanswered = this.totalQuestions - answered;

    return {
      total: this.totalQuestions,
      answered,
      unanswered,
      review
    };
  }

  getAnswersArray() {
    return Object.values(this.answers);
  }
}
