import { AttendanceLog } from '../../models/AttendanceLog.js';

export const checkAttendanceLogs = async (req, reply) => {
    try {
        const { customerId } = req.params;
        if (!customerId) {
            return reply.code(400).send({ message: 'Customer ID is required' });
        }

        // Fetch all logs that contain this customer
        const logs = await AttendanceLog.find({
            'attendance.customerId': customerId
        }).sort({ date: 1 }).lean();

        const result = logs.map(log => {
            const entry = log.attendance.find(a => a.customerId.toString() === customerId);
            return {
                logId: log._id,
                date: log.date,
                businessDate: log.businessDate, // The field we suspect is duplicated
                products: entry ? entry.products : [],
                createdAt: log.createdAt
            };
        });

        // Check for duplicates
        const dateCounts = {};
        const duplicates = [];
        result.forEach(r => {
            // Use YYYY-MM-DD or businessDate as key
            const key = r.date.toISOString().split('T')[0];
            if (!dateCounts[key]) dateCounts[key] = 0;
            dateCounts[key]++;
            if (dateCounts[key] > 1) {
                if (!duplicates.includes(key)) duplicates.push(key);
            }
        });

        return reply.send({
            message: 'Attendance Check',
            totalLogs: logs.length,
            duplicateDates: duplicates,
            logs: result
        });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: error.message });
    }
};
