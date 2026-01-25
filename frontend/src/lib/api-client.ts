const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL;
    
    // Load token from localStorage if in browser
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.post<any>('/auth/login', { email, password });
    this.setToken(response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  async register(data: any) {
    const response = await this.post<any>('/auth/register', data);
    this.setToken(response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  async logout() {
    await this.post('/auth/logout');
    this.clearToken();
  }

  async getCurrentUser() {
    return this.get<any>('/users/me');
  }

  // Courses
  async getCourses(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.get<any>(`/courses${query ? `?${query}` : ''}`);
  }

  async getCourse(id: string) {
    return this.get<any>(`/courses/${id}`);
  }

  async createCourse(data: any) {
    return this.post<any>('/courses', data);
  }

  async updateCourse(id: string, data: any) {
    return this.put<any>(`/courses/${id}`, data);
  }

  async publishCourse(id: string) {
    return this.post<any>(`/courses/${id}/publish`);
  }

  // Enrollments
  async enrollInCourse(courseId: string) {
    return this.post<any>('/enrollments', { courseId });
  }

  async getMyEnrollments() {
    return this.get<any>('/enrollments/my-courses');
  }

  // AI Agents
  async generateCurriculum(data: any) {
    return this.post<any>('/ai-agents/generate-curriculum', data);
  }

  async generateQuiz(data: any) {
    return this.post<any>('/ai-agents/generate-quiz', data);
  }

  async applyCurriculum(data: { courseId: string; curriculum: any }) {
    return this.post<any>('/ai-agents/apply-curriculum', data);
  }

  async applyQuiz(data: { lessonId: string; quiz: any }) {
    return this.post<any>('/ai-agents/apply-quiz', data);
  }

  async getRecommendations(enrollmentId: string) {
    return this.get<any>(`/ai-agents/recommendations?enrollmentId=${enrollmentId}`);
  }

  // Quizzes
  async createQuiz(lessonId: string, quizData: any) {
    return this.post<any>(`/lessons/${lessonId}/quizzes`, quizData);
  }

  async getQuizzesByLesson(lessonId: string) {
    return this.get<any>(`/lessons/${lessonId}/quizzes`);
  }

  async getQuiz(quizId: string) {
    return this.get<any>(`/quizzes/${quizId}`);
  }

  async updateQuiz(quizId: string, quizData: any) {
    return this.put<any>(`/quizzes/${quizId}`, quizData);
  }

  async deleteQuiz(quizId: string) {
    return this.delete<any>(`/quizzes/${quizId}`);
  }

  async submitQuiz(quizId: string, answers: Record<string, string>) {
    return this.post<any>(`/quizzes/${quizId}/submit`, { answers });
  }

  async getQuizAttempts(quizId: string) {
    return this.get<any>(`/quizzes/${quizId}/attempts`);
  }

  async getMyQuizAttempts() {
    return this.get<any>('/users/me/quiz-attempts');
  }

  // Modules
  async getModulesByCourse(courseId: string) {
    return this.get<any>(`/courses/${courseId}/modules`);
  }

  async getModule(moduleId: string) {
    return this.get<any>(`/modules/${moduleId}`);
  }

  async createModule(courseId: string, moduleData: any) {
    return this.post<any>(`/courses/${courseId}/modules`, moduleData);
  }

  async updateModule(moduleId: string, moduleData: any) {
    return this.put<any>(`/modules/${moduleId}`, moduleData);
  }

  async deleteModule(moduleId: string) {
    return this.delete<any>(`/modules/${moduleId}`);
  }

  // Lessons
  async getLessonsByModule(moduleId: string) {
    return this.get<any>(`/modules/${moduleId}/lessons`);
  }

  async getLesson(lessonId: string) {
    return this.get<any>(`/lessons/${lessonId}`);
  }

  async createLesson(moduleId: string, lessonData: any) {
    return this.post<any>(`/modules/${moduleId}/lessons`, lessonData);
  }

  async updateLesson(lessonId: string, lessonData: any) {
    return this.put<any>(`/lessons/${lessonId}`, lessonData);
  }

  async deleteLesson(lessonId: string) {
    return this.delete<any>(`/lessons/${lessonId}`);
  }

  // Progress
  async updateLessonProgress(lessonId: string, enrollmentId: string, status: string, timeSpentSeconds?: number) {
    return this.put<any>(`/lessons/${lessonId}/progress`, {
      enrollmentId,
      status,
      timeSpentSeconds,
    });
  }

  // Analytics
  async getCourseAnalytics(courseId: string) {
    return this.get<any>(`/courses/${courseId}/analytics`);
  }

  async getEnrollmentProgress(enrollmentId: string) {
    return this.get<any>(`/enrollments/${enrollmentId}/progress-details`);
  }

  async getCourseEnrollments(courseId: string) {
    return this.get<any>(`/enrollments/courses/${courseId}/list`);
  }

  // Admin
  async getUserStats() {
    return this.get<any>('/users/stats/overview');
  }

  async getCourseStats() {
    return this.get<any>('/courses/stats/overview');
  }

  async getAllUsers() {
    return this.get<any>('/users');
  }

  async getUser(userId: string) {
    return this.get<any>(`/users/${userId}`);
  }

  async deleteUser(userId: string) {
    return this.delete<any>(`/users/${userId}`);
  }

  async updateUser(userId: string, data: any) {
    return this.put<any>(`/users/${userId}`, data);
  }

  // Content Versioning
  async getLessonVersions(lessonId: string) {
    return this.get<any>(`/lessons/${lessonId}/versions`);
  }

  async getPendingVersionsByCourse(courseId: string) {
    return this.get<any>(`/courses/${courseId}/pending-versions`);
  }

  async approveVersion(versionId: string) {
    return this.post<any>(`/content-versions/${versionId}/approve`);
  }

  async rejectVersion(versionId: string) {
    return this.post<any>(`/content-versions/${versionId}/reject`);
  }
}

export const apiClient = new ApiClient();

