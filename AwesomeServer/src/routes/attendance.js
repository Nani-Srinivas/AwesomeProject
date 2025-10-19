import { submitAttendance, getAttendance, updateAttendance } from '../controllers/Attendance/attendanceController.js';
import { verifyToken } from '../middleware/auth.js'; // Import verifyToken

export const attendanceRoutes = async (fastify) => {
  fastify.post('/attendance', { preHandler: [verifyToken] }, submitAttendance); // Add preHandler
  fastify.get('/attendance', { preHandler: [verifyToken] }, getAttendance);    // Add preHandler
  // fastify.get('/', { preHandler: [verifyToken] }, checkAttendanceExists);    // Add preHandler
  // fastify.get('/:date/:areaId', { preHandler: [verifyToken] }, getAttendanceByDate);    // Add preHandler
    //fastify.put('/:attendanceId', { preHandler: [verifyToken] }, updateAttendance);    // Add preHandler
};
