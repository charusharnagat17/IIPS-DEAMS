export class User {
  constructor(data = {}) {
    this.id = data.id || '';
    this.username = data.username || '';
    this.email = data.email || '';
    this.role = data.role || 'ROLE_STUDENT';
    this.fullName = data.fullName || '';
    this.rollNoOrFacultyId = data.rollNoOrFacultyId || '';
    this.courseId = data.courseId || '';
    this.semester = data.semester || 1;
    this.active = data.active !== false;
    this.token = data.token || '';
  }

  isAdmin() {
    return this.role === 'ROLE_ADMIN';
  }

  isFaculty() {
    return this.role === 'ROLE_FACULTY';
  }

  isStudent() {
    return this.role === 'ROLE_STUDENT';
  }

  getDisplayName() {
    return this.fullName || this.username || 'Anonymous User';
  }

  getInitial() {
    const name = this.getDisplayName();
    return name.charAt(0).toUpperCase();
  }

  getRoleTitle() {
    if (this.isAdmin()) return 'Administrator';
    if (this.isFaculty()) return 'Faculty Examiner';
    return 'Student Candidate';
  }

  getIdentifier() {
    return this.rollNoOrFacultyId || this.username;
  }

  toJson() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      fullName: this.fullName,
      rollNoOrFacultyId: this.rollNoOrFacultyId,
      courseId: this.courseId,
      semester: this.semester,
      active: this.active,
      token: this.token
    };
  }
}
