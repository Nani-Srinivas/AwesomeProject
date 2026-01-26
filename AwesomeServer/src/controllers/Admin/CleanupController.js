import Area from '../../models/Delivery/Area.js';
import { Customer } from '../../models/User/Customer.js';
import { AttendanceLog } from '../../models/AttendanceLog.js';

/**
 * DELETE /admin/cleanup/area/:areaId
 * Deletes an area and all related customers and attendance logs
 */
export const cleanupArea = async (req, reply) => {
    try {
        const { areaId } = req.params;

        if (!areaId) {
            return reply.code(400).send({
                message: 'Area ID is required'
            });
        }

        console.log(`[Cleanup] Starting cleanup for area ID: ${areaId}`);

        // 1. Find the area by ID
        const area = await Area.findById(areaId);

        if (!area) {
            return reply.code(404).send({
                message: `Area with ID "${areaId}" not found`
            });
        }

        console.log(`[Cleanup] Found area: "${area.name}" (${area._id})`);

        // 2. Delete all customers in this area
        const customerDeleteResult = await Customer.deleteMany({
            area: areaId
        });
        console.log(`[Cleanup] Deleted ${customerDeleteResult.deletedCount} customers`);

        // 3. Delete all attendance logs for this area
        const attendanceDeleteResult = await AttendanceLog.deleteMany({
            areaId: areaId
        });
        console.log(`[Cleanup] Deleted ${attendanceDeleteResult.deletedCount} attendance logs`);

        // 4. Delete the area itself
        await Area.findByIdAndDelete(areaId);
        console.log(`[Cleanup] Deleted area "${area.name}"`);

        return reply.code(200).send({
            message: `Successfully cleaned up area "${area.name}"`,
            deleted: {
                area: area.name,
                customers: customerDeleteResult.deletedCount,
                attendanceLogs: attendanceDeleteResult.deletedCount
            }
        });

    } catch (error) {
        console.error('[Cleanup] Error:', error);
        return reply.code(500).send({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * DELETE /admin/cleanup/area-content/:areaId
 * Deletes ONLY customers and attendance logs for an area, but KEEPS the area itself.
 * Use this when you want to re-upload data for an existing area.
 */
export const cleanupAreaContent = async (req, reply) => {
    try {
        const { areaId } = req.params;

        if (!areaId) {
            return reply.code(400).send({
                message: 'Area ID is required'
            });
        }

        console.log(`[Cleanup Content] Starting content cleanup for area ID: ${areaId}`);

        // 1. Find the area by ID
        const area = await Area.findById(areaId);

        if (!area) {
            return reply.code(404).send({
                message: `Area with ID "${areaId}" not found`
            });
        }

        console.log(`[Cleanup Content] Found area: "${area.name}" (${area._id}) - Preserving Area`);

        // 2. Delete all customers in this area
        const customerDeleteResult = await Customer.deleteMany({
            area: areaId
        });
        console.log(`[Cleanup Content] Deleted ${customerDeleteResult.deletedCount} customers`);

        // 3. Delete all attendance logs for this area
        const attendanceDeleteResult = await AttendanceLog.deleteMany({
            areaId: areaId
        });
        console.log(`[Cleanup Content] Deleted ${attendanceDeleteResult.deletedCount} attendance logs`);

        // NOTE: We do NOT delete the area here.

        return reply.code(200).send({
            message: `Successfully cleaned up content for area "${area.name}" (Area preserved)`,
            deleted: {
                areaPreserved: true,
                customers: customerDeleteResult.deletedCount,
                attendanceLogs: attendanceDeleteResult.deletedCount
            }
        });

    } catch (error) {
        console.error('[Cleanup Content] Error:', error);
        return reply.code(500).send({
            message: 'Internal server error',
            error: error.message
        });
    }
};
