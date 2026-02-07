import { submitAttendance, getAttendance, updateAttendance, deleteAttendanceByDate } from '../controllers/Attendance/attendanceController.js';
import { verifyToken } from '../middleware/auth.js'; // Import verifyToken

export const attendanceRoutes = async (fastify) => {
  fastify.post('/attendance', { preHandler: [verifyToken] }, submitAttendance); // Add preHandler
  fastify.get('/attendance', { preHandler: [verifyToken] }, getAttendance);    // Add preHandler
  fastify.delete('/attendance/date/:date', { preHandler: [verifyToken] }, deleteAttendanceByDate); // Delete by date
  // fastify.get('/', { preHandler: [verifyToken] }, checkAttendanceExists);    // Add preHandler
  // fastify.get('/:date/:areaId', { preHandler: [verifyToken] }, getAttendanceByDate);    // Add preHandler
  fastify.put('/attendance/:attendanceId', { preHandler: [verifyToken] }, updateAttendance);    // Add preHandler
};