export class ExamAttempt {
  constructor(data = {}) {
    this.id = data.id || '';
    this.examId = data.examId || '';
    this.examTitle = data.examTitle || '';
    this.subjectCode = data.subjectCode || '';
    this.subjectName = data.subjectName || '';
    this.studentId = data.studentId || '';
    this.studentName = data.studentName || '';
    this.rollNo = data.rollNo || '';
    this.courseId = data.courseId || '';
    this.semester = data.semester || 1;
    this.startTime = data.startTime || '';
    this.submissionTime = data.submissionTime || '';
    this.status = data.status || 'IN_PROGRESS';
    this.tabSwitchCount = Number(data.tabSwitchCount || 0);
    this.windowBlurCount = Number(data.windowBlurCount || 0);
    this.fullscreenExitCount = Number(data.fullscreenExitCount || 0);
    this.proctorLogs = Array.isArray(data.proctorLogs) ? data.proctorLogs : [];
    this.objectiveScore = Number(data.objectiveScore || 0);
    this.subjectiveScore = Number(data.subjectiveScore || 0);
    this.totalScore = Number(data.totalScore || 0);
    this.maxMarks = Number(data.maxMarks || 30);
    this.percentage = Number(data.percentage || 0);
    this.grade = data.grade || 'PENDING';
    this.passed = data.passed === true;
    this.facultyRemarks = data.facultyRemarks || '';
    this.answers = Array.isArray(data.answers) ? data.answers : [];
  }

  isEvaluated() {
    return this.status === 'EVALUATED';
  }

  isDisqualified() {
    return this.status === 'TERMINATED_CHEATING';
  }

  getTotalInfractions() {
    return this.tabSwitchCount + this.windowBlurCount + this.fullscreenExitCount;
  }

  getGradeBadgeStyle() {
    switch (this.grade) {
      case 'O':
      case 'A+':
        return 'bg-neutral-900 text-white border-neutral-800 font-bold';
      case 'A':
      case 'B+':
        return 'bg-neutral-800 text-white border-neutral-700 font-semibold';
      case 'B':
      case 'C':
        return 'bg-neutral-200 text-neutral-900 border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    }
  }

  getPassStatusBadge() {
    if (this.passed) {
      return { text: 'PASSED', color: 'bg-neutral-900 text-white font-bold' };
    }
    return { text: 'FAILED', color: 'bg-neutral-200 text-neutral-800 font-bold border border-neutral-300' };
  }
}
