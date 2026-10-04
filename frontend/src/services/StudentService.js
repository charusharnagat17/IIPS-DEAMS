import { HttpService } from './HttpService';
import { Exam } from '../models/Exam';
import { ExamAttempt } from '../models/ExamAttempt';
import { QuestionFactory } from '../models/Question';

export class StudentService extends HttpService {
  constructor() {
    super('/api/student');
  }

  async fetchAvailableExams() {
    const res = await this.get('/exams');
    return (res?.data || []).map(e => new Exam(e));
  }

  async startExam(examId) {
    const res = await this.post(`/exam/${examId}/start`, {});
    if (res?.data) {
      return {
        attemptId: res.data.attemptId,
        exam: new Exam(res.data.exam),
        questions: QuestionFactory.createList(res.data.questions),
        durationMinutes: res.data.durationMinutes,
        tabSwitchCount: res.data.tabSwitchCount || 0,
        windowBlurCount: res.data.windowBlurCount || 0
      };
    }
    throw new Error(res?.message || 'Failed to start exam');
  }

  async autoSaveAnswers(attemptId, answersList) {
    return this.post(`/exam/${attemptId}/save`, answersList);
  }

  async reportProctorAlert(attemptId, alertPayload) {
    const res = await this.post(`/exam/${attemptId}/alert`, alertPayload);
    return res?.data || {};
  }

  async submitExam(attemptId, submissionPayload) {
    const res = await this.post(`/exam/${attemptId}/submit`, submissionPayload);
    return new ExamAttempt(res?.data);
  }

  async fetchAttemptResult(attemptId) {
    const res = await this.get(`/attempt/${attemptId}`);
    return new ExamAttempt(res?.data);
  }

  async fetchMarksheet(attemptId) {
    return this.fetchAttemptResult(attemptId);
  }

  async fetchResults() {
    const res = await this.get('/results');
    return (res?.data || []).map(r => new ExamAttempt(r));
  }
}

export const studentService = new StudentService();
