import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      success: true,
      message: 'Online Teaching Platform API',
      version: '1.0.0',
      documentation: '/api',
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          register: 'POST /auth/register',
          google: 'POST /auth/google',
        },
        teachers: 'GET /teacher',
        students: 'GET /student',
        lessons: 'GET /lesson',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  healthCheck() {
    return {
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
