import { AttendanceLog } from '../../models/AttendanceLog.js';
import StoreProduct from '../../models/Product/StoreProduct.js';
import { Customer } from '../../models/User/Customer.js'; // Import Customer model

export const submitAttendance1 = async (request, reply) => {
  try {
    console.log('Server received attendance submission:', JSON.stringify(request.body, null, 2));
    const { date, areaId, attendance } = request.body;

    if (!date || !areaId || !attendance) {
      return reply.code(400).send({ success: false, message: 'Date, areaId, and attendance array are required.' });
    }

    const requestDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to compare only date part

    if (requestDate < today) {
      return reply.code(400).send({ success: false, message: 'Cannot modify attendance for past dates.' });
    }

    // Validate products and quantities
    for (const customerAttendance of attendance) {
      if (!customerAttendance.customerId || !customerAttendance.products) {
        return reply.code(400).send({ success: false, message: 'Each customer attendance entry must have customerId and products.' });
      }

      // Validate Customer ID existence
      try {
        const existingCustomer = await Customer.findById(customerAttendance.customerId);
        if (!existingCustomer) {
          return reply.code(400).send({ success: false, message: `Customer with ID ${customerAttendance.customerId} not found.` });
        }
      } catch (customerError) {
        console.error(`Error finding customer ${customerAttendance.customerId}:`, customerError);
        return reply.code(400).send({ success: false, message: `Invalid Customer ID format or database error for ${customerAttendance.customerId}.` });
      }

      for (const product of customerAttendance.products) {
        if (!product.productId || product.quantity == null) {
          return reply.code(400).send({ success: false, message: 'Each product must have productId and quantity.' });
        }
        if (product.quantity <= 0) {
          return reply.code(400).send({ success: false, message: `Product quantity for ${product.productId} must be positive.` });
        }
        try {
          const existingProduct = await StoreProduct.findById(product.productId);
          if (!existingProduct) {
            return reply.code(400).send({ success: false, message: `StoreProduct with ID ${product.productId} not found.` });
          }
        } catch (productError) {
          console.error(`Error finding StoreProduct ${product.productId}:`, productError);
          return reply.code(400).send({ success: false, message: `Invalid StoreProduct ID format or database error for ${product.productId}.` });
        }
      }
    }

    const upsertOperations = attendance.map(async (customerAttendance) => {
      const { customerId, products } = customerAttendance;
      
      const existingRecord = await AttendanceLog.findOne({ customerId, date: requestDate, areaId });

      if (existingRecord) {
        // Update existing record
        await AttendanceLog.findOneAndUpdate(
          { customerId, date: requestDate, areaId },
          { $set: { products } },
          { new: true, runValidators: true }
        );
        return { customerId, status: 'updated' };
      } else {
        // Create new record
        await AttendanceLog.create({
          customerId,
          date: requestDate,
          areaId,
          products,
        });
        return { customerId, status: 'created' };
      }
    });

    const results = await Promise.all(upsertOperations);

    const updatedCount = results.filter(r => r.status === 'updated').length;
    const createdCount = results.filter(r => r.status === 'created').length;

    let message = '';
    if (updatedCount > 0 && createdCount > 0) {
      message = `Attendance updated for ${updatedCount} customers and created for ${createdCount} customers.`;
    } else if (updatedCount > 0) {
      message = `Attendance updated for ${updatedCount} customers.`;
    } else if (createdCount > 0) {
      message = `Attendance submitted for ${createdCount} customers.`;
    } else {
      message = 'No attendance records processed.';
    }

    console.log('Attempting to send successful response for attendance submission.');
    return reply.code(201).send({ message });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    return reply.code(500).send({ 
      success: false,
      message: error.message || 'Failed to submit attendance due to an internal server error.',
      details: error.stack // Include stack trace for debugging in development
    });
  }
};

export const submitAttendance = async (request, reply) => {
  try {
    console.log('Server received attendance submission:', JSON.stringify(request.body, null, 2));
    const { date, areaId, attendance } = request.body;

    if (!date || !areaId || !attendance || !Array.isArray(attendance)) {
      return reply.code(400).send({ success: false, message: 'Date, areaId, and attendance array are required.' });
    }

    const requestDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestDate < today) {
      return reply.code(400).send({ success: false, message: 'Cannot modify attendance for past dates.' });
    }

    // 🧠 Step 1: Check if attendance already exists for this date and area
    const existingRecords = await AttendanceLog.find({ date: requestDate, areaId });

    if (existingRecords.length > 0) {
      return reply.code(409).send({
        success: false,
        message: 'Attendance for this date and area has already been submitted. Please edit existing records instead.',
      });
    }

    // 🧩 Step 2: Validate each attendance entry
    for (const customerAttendance of attendance) {
      if (!customerAttendance.customerId || !customerAttendance.products) {
        return reply.code(400).send({
          success: false,
          message: 'Each customer attendance entry must have customerId and products.',
        });
      }

      // Validate customer existence
      const existingCustomer = await Customer.findById(customerAttendance.customerId);
      if (!existingCustomer) {
        return reply.code(400).send({
          success: false,
          message: `Customer with ID ${customerAttendance.customerId} not found.`,
        });
      }

      // Validate products
      for (const product of customerAttendance.products) {
        if (!product.productId || product.quantity == null) {
          return reply.code(400).send({
            success: false,
            message: 'Each product must have productId and quantity.',
          });
        }

        if (product.quantity <= 0) {
          return reply.code(400).send({
            success: false,
            message: `Product quantity for ${product.productId} must be positive.`,
          });
        }

        const existingProduct = await StoreProduct.findById(product.productId);
        if (!existingProduct) {
          return reply.code(400).send({
            success: false,
            message: `StoreProduct with ID ${product.productId} not found.`,
          });
        }
      }
    }

    // 🧩 Step 3: Save attendance
    const createdRecords = await AttendanceLog.insertMany(
      attendance.map(({ customerId, products }) => ({
        customerId,
        products,
        date: requestDate,
        areaId,
      }))
    );

    console.log('Attendance submitted successfully:', createdRecords.length);

    return reply.code(201).send({
      success: true,
      message: `Attendance submitted successfully for ${createdRecords.length} customers.`,
    });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error.',
    });
  }
};


export const getAttendance = async (request, reply) => {
  try {
    const { areaId, date } = request.query;

    if (!areaId || !date) {
      return reply.code(400).send({ success: false, message: 'areaId and date are required query parameters.' });
    }

    const attendanceRecords = await AttendanceLog.find({ areaId, date: new Date(date) })
      .populate('customerId', 'name') // Populate customer name
      .populate('products.productId', 'name'); // Populate product name

    return reply.code(200).send({ success: true, data: attendanceRecords });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return reply.code(500).send({ success: false, message: error.message || 'Failed to fetch attendance due to an internal server error.' });
  }
};

export const updateAttendance = async (request, reply) => {
  try {
    const { attendanceId } = request.params;
    const { date, areaId, attendance } = request.body;

    if (!attendanceId) {
      return reply.code(400).send({ success: false, message: 'Attendance ID is required.' });
    }

    if (!date || !areaId || !attendance || !Array.isArray(attendance)) {
      return reply.code(400).send({ success: false, message: 'Date, areaId, and attendance array are required.' });
    }

    const requestDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestDate < today) {
      return reply.code(400).send({ success: false, message: 'Cannot modify attendance for past dates.' });
    }

    // Validate each attendance entry
    for (const customerAttendance of attendance) {
      if (!customerAttendance.customerId || !customerAttendance.products) {
        return reply.code(400).send({
          success: false,
          message: 'Each customer attendance entry must have customerId and products.',
        });
      }

      // Validate customer existence
      const existingCustomer = await Customer.findById(customerAttendance.customerId);
      if (!existingCustomer) {
        return reply.code(400).send({
          success: false,
          message: `Customer with ID ${customerAttendance.customerId} not found.`,
        });
      }

      // Validate products
      for (const product of customerAttendance.products) {
        if (!product.productId || product.quantity == null) {
          return reply.code(400).send({
            success: false,
            message: 'Each product must have productId and quantity.',
          });
        }

        if (product.quantity <= 0) {
          return reply.code(400).send({
            success: false,
            message: `Product quantity for ${product.productId} must be positive.`,
          });
        }

        const existingProduct = await StoreProduct.findById(product.productId);
        if (!existingProduct) {
          return reply.code(400).send({
            success: false,
            message: `StoreProduct with ID ${product.productId} not found.`,
          });
        }
      }
    }

    const updatedAttendance = await AttendanceLog.findByIdAndUpdate(
      attendanceId,
      { date: requestDate, areaId, attendance: attendance.map(({ customerId, products }) => ({ customerId, products })) },
      { new: true, runValidators: true }
    );

    if (!updatedAttendance) {
      return reply.code(404).send({ success: false, message: 'Attendance record not found.' });
    }

    return reply.code(200).send({
      success: true,
      message: 'Attendance record updated successfully.',
      data: updatedAttendance,
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return reply.code(500).send({
      success: false,
      message: error.message || 'Internal server error.',
    });
  }
};
