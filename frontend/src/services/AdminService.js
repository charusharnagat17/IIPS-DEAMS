import { HttpService } from './HttpService';
import { User } from '../models/User';
import { Exam } from '../models/Exam';

export class AdminService extends HttpService {
  constructor() {
    super('/api/admin');
  }

  async fetchStats() {
    const res = await this.get('/stats');
    return res?.data || {};
  }

  async fetchStudents(courseId, semester) {
    const params = {};
    if (courseId && courseId !== 'ALL') params.courseId = courseId;
    if (semester) params.semester = semester;
    const res = await this.get('/students', params);
    return (res?.data || []).map(u => new User(u));
  }

  async createStudent(studentData) {
    const res = await this.post('/students', studentData);
    return new User(res?.data);
  }

  async updateStudent(id, studentData) {
    const res = await this.put(`/students/${id}`, studentData);
    return new User(res?.data);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  async fetchFaculty() {
    const res = await this.get('/faculty');
    return (res?.data || []).map(u => new User(u));
  }

  async createFaculty(facultyData) {
    const res = await this.post('/faculty', facultyData);
    return new User(res?.data);
  }

  async fetchCourses() {
    const res = await this.get('/courses');
    return res?.data || [];
  }

  async createCourse(courseData) {
    const res = await this.post('/courses', courseData);
    return res?.data;
  }

  async fetchSubjects(courseId) {
    const res = await this.get('/subjects', courseId ? { courseId } : {});
    return res?.data || [];
  }

  async createSubject(subjectData) {
    const res = await this.post('/subjects', subjectData);
    return res?.data;
  }

  async fetchSchedules() {
    const res = await this.get('/schedules');
    return (res?.data || []).map(ex => new Exam(ex));
  }

  async createSchedule(scheduleData) {
    const res = await this.post('/schedules', scheduleData);
    return new Exam(res?.data);
  }

  async allocateCenters(examId, allocations) {
    const res = await this.post(`/schedules/${examId}/allocate-centers`, allocations);
    return new Exam(res?.data);
  }

  async fetchAuditLogs(module) {
    const res = await this.get('/audit-logs', module && module !== 'ALL' ? { module } : {});
    return res?.data || [];
  }
}

export const adminService = new AdminService();
