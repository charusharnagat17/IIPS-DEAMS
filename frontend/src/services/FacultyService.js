import { HttpService } from './HttpService';
import { QuestionFactory } from '../models/Question';
import { Exam } from '../models/Exam';
import { ExamAttempt } from '../models/ExamAttempt';

export class FacultyService extends HttpService {
  constructor() {
    super('/api/faculty');
  }

  async fetchCourses() {
    const res = await this.get('/courses');
    return res?.data || [];
  }

  async fetchSubjects(courseId = null) {
    const params = courseId && courseId !== 'ALL' ? { courseId } : {};
    const res = await this.get('/subjects', params);
    return res?.data || [];
  }

  async fetchQuestions(courseId, subjectId, type, difficulty) {
    const params = {};
    if (courseId && courseId !== 'ALL') params.courseId = courseId;
    if (subjectId && subjectId !== 'ALL') params.subjectId = subjectId;
    if (type && type !== 'ALL') params.type = type;
    if (difficulty && difficulty !== 'ALL') params.difficulty = difficulty;
    const res = await this.get('/questions', params);
    return QuestionFactory.createList(res?.data || []);
  }

  async createQuestion(questionData) {
    const res = await this.post('/questions', questionData);
    return QuestionFactory.create(res?.data);
  }

  async deleteQuestion(id) {
    return this.delete(`/questions/${id}`);
  }

  async generatePaper(blueprint) {
    const res = await this.post('/generate-paper', blueprint);
    return new Exam(res?.data);
  }

  async fetchSubmissions(examId) {
    const res = await this.get('/submissions', examId ? { examId } : {});
    return (res?.data || []).map(a => new ExamAttempt(a));
  }

  async evaluateSubmission(evaluationData) {
    const res = await this.post('/evaluate', evaluationData);
    return new ExamAttempt(res?.data);
  }

  async fetchAnalytics(examId) {
    const res = await this.get(`/analytics/${examId}`);
    return res?.data || {};
  }
}

export const facultyService = new FacultyService();
