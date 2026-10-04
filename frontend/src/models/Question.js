export class BaseQuestion {
  constructor(data = {}) {
    this.id = data.id || '';
    this.courseId = data.courseId || '';
    this.subjectId = data.subjectId || '';
    this.topic = data.topic || '';
    this.type = data.type || 'MCQ';
    this.difficulty = data.difficulty || 'MEDIUM';
    this.questionText = data.questionText || '';
    this.marks = Number(data.marks || 1);
    this.negativeMarks = Number(data.negativeMarks || 0);
  }

  isObjective() {
    return this.type === 'MCQ';
  }

  isSubjective() {
    return !this.isObjective();
  }

  isAnswered(answer) {
    if (!answer) return false;
    return answer.isAttempted === true;
  }

  getBadgeColor() {
    switch (this.type) {
      case 'MCQ': return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'DESCRIPTIVE': return 'bg-neutral-200 text-neutral-900 border-neutral-400';
      case 'CODE': return 'bg-neutral-900 text-white border-neutral-800';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }

  formatMarks() {
    if (this.isObjective() && this.negativeMarks > 0) {
      return `+${this.marks} / -${this.negativeMarks} Marks`;
    }
    return `+${this.marks} Marks`;
  }
}

export class McqQuestion extends BaseQuestion {
  constructor(data = {}) {
    super(data);
    this.options = Array.isArray(data.options) ? data.options : [];
  }

  getOption(id) {
    return this.options.find(o => o.id === id);
  }

  getCorrectOption() {
    return this.options.find(o => o.correct === true);
  }

  isAnswered(answer) {
    return !!(answer && answer.selectedOptionId);
  }
}

export class DescriptiveQuestion extends BaseQuestion {
  constructor(data = {}) {
    super(data);
    this.modelAnswer = data.modelAnswer || '';
  }

  isAnswered(answer) {
    return !!(answer && answer.descriptiveText && answer.descriptiveText.trim().length > 0);
  }
}

export class CodeQuestion extends BaseQuestion {
  constructor(data = {}) {
    super(data);
    this.codeSnippet = data.codeSnippet || '';
    this.testCases = Array.isArray(data.testCases) ? data.testCases : [];
  }

  isAnswered(answer) {
    return !!(answer && answer.codeSnippet && answer.codeSnippet.trim().length > 0);
  }
}

export class QuestionFactory {
  static create(data = {}) {
    switch (data.type) {
      case 'MCQ': return new McqQuestion(data);
      case 'DESCRIPTIVE': return new DescriptiveQuestion(data);
      case 'CODE': return new CodeQuestion(data);
      default: return new BaseQuestion(data);
    }
  }

  static createList(items = []) {
    return items.map(item => QuestionFactory.create(item));
  }
}
