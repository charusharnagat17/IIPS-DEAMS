export class Exam {
  constructor(data = {}) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.courseId = data.courseId || '';
    this.subjectId = data.subjectId || '';
    this.subjectName = data.subjectName || '';
    this.semester = data.semester || 1;
    this.startTime = data.startTime ? new Date(data.startTime) : new Date();
    this.endTime = data.endTime ? new Date(data.endTime) : new Date(Date.now() + 86400000);
    this.durationMinutes = data.durationMinutes || 60;
    this.totalMarks = Number(data.totalMarks || 50);
    this.passingMarks = Number(data.passingMarks || 20);
    this.negativeMarkingEnabled = data.negativeMarkingEnabled !== false;
    this.defaultNegativeFactor = Number(data.defaultNegativeFactor || 0.25);
    this.status = data.status || 'SCHEDULED';
    this.instructions = data.instructions || '';
    this.centerAllocations = data.centerAllocations || [];
    this.questionIds = data.questionIds || [];
  }

  isLive() {
    return this.status === 'ONGOING';
  }

  isScheduled() {
    return this.status === 'SCHEDULED';
  }

  hasNegativeMarking() {
    return this.negativeMarkingEnabled;
  }

  formatDuration() {
    return `${this.durationMinutes} Minutes`;
  }

  getStatusBadge() {
    if (this.isLive()) {
      return { text: 'Exam Is Live', color: 'bg-neutral-900 text-white font-bold animate-pulse' };
    }
    return { text: this.status, color: 'bg-neutral-100 text-neutral-800 border border-neutral-300' };
  }
}
