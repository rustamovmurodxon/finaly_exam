import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  private http: AxiosInstance;

  constructor(baseURL: string) {
    this.http = axios.create({ baseURL, timeout: 15000 });
  }

  async registerStudent(firstName: string, phoneNumber: string) {
    return this.http.post('/auth/student/register', { firstName, phoneNumber });
  }

  async loginStudent(phoneNumber: string) {
    return this.http.post('/auth/student/login', { phoneNumber });
  }

  async getProfile(token: string) {
    return this.http.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateStudentTg(
    studentId: string,
    token: string,
    tgid: string,
    tgUsername?: string,
  ) {
    return this.http.put(
      `/student/${studentId}`,
      { tgid, tgUsername: tgUsername || null },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  async todaySchedule(token: string, phoneNumber: string) {
    return this.http.get('/student/schedule/today', {
      params: { phoneNumber },
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async weeklySchedule(token: string, phoneNumber: string) {
    return this.http.get('/student/schedule/weekly', {
      params: { phoneNumber },
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async payments(token: string, phoneNumber: string) {
    return this.http.get('/student/payments', {
      params: { phoneNumber },
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async logout(token: string, phoneNumber: string) {
    return this.http.post(
      '/student/logout',
      { phoneNumber },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  async upcomingLessons(botSecret: string, minutesBefore = 30) {
    return this.http.get('/student/upcoming-lessons', {
      params: { minutesBefore },
      headers: { 'x-bot-secret': botSecret },
    });
  }
}
