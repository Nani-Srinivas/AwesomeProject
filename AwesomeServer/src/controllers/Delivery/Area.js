// controllers/areaController.js
import Area from '../../models/Delivery/Area.js';
import { StoreManager } from '../../models/User/StoreManager.js';

export const createArea = async (req, reply) => {
  console.log("Create Area is Called");
  
  const { name, stockCount } = req.body;
  try {

    // ✅ 1. Validate input
    if (!name || stockCount == null) {
      return reply.status(400).send({
        success: false,
        message: 'Both "name" and "stockCount" are required.'
      });
    }

    // ✅ 2. Get StoreManager ID from JWT
    const createdBy = req.user?.id;
    if (!createdBy) {
      return reply.status(401).send({
        success: false,
        message: 'Authentication required.'
      });
    }

    // ✅ 3. Check if StoreManager exists
    const storeManager = await StoreManager.findById(createdBy);
    console.log(storeManager);
    if (!storeManager) {
      return reply.status(404).send({
        success: false,
        message: 'StoreManager not found.'
      });
    }

    // ✅ 4. Check for duplicate area name for this StoreManager
    const existingArea = await Area.findOne({ name, createdBy: storeManager._id });
    if (existingArea) {
      return reply.status(409).send({
        success: false,
        message: `Area "${name}" already exists for this StoreManager.`
      });
    }

    // ✅ 5. Create area
    const area = new Area({
      name,
      createdBy,
      stockCount: stockCount
    });

    await area.save();

    // ✅ 6. Send success response
    return reply.status(201).send({
      success: true,
      message: `Area "${name}" created successfully.`,
      data: {
        id: area._id,
        name: area.name,
        stockCount: area.stockCount
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return reply.status(409).send({
        success: false,
        message: `Area "${name}" already exists.`
      });
    }
    console.error('Create Area error:', error.message);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};



export const getAllArea = async (req, reply) => {
  try {
    const areas = await Area.find();
    return reply.status(200).send({
      success: true,
      data: areas
    });
  } catch (error) {
    console.error('Error fetching areas:', error.message);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};


export const getAreaByUser = async (req, reply) => {
  try {
    const ownerId = req.user?.id;
    console.log(ownerId);
    if (!ownerId) {
      return reply.status(401).send({ message: 'Authentication required' });
    }

    const area = await Area.find({ createdBy: ownerId });
    console.log(area);
    if (!area) {
      return reply.status(404).send({ message: 'No Areas found for this StoreManager' });
    }
    return reply.status(200).send({
      success: true,
      data: area
    });
  } catch (error) {
    console.error('Error fetching area:', error.message);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};


export const updateArea = async (req, reply) => {
  console.log("Update Area is Called");
  console.log(req.body)
  try {
    const areaId = req.params.id;
    console.log(areaId);
    const { name, stockCount } = req.body;

    // ✅ 1. Validate input 
    if (!name || stockCount == null) {
      return reply.status(400).send({
        success: false,
        message: 'Please provide both "name" and "stockCount".'
      });
    }

    // ✅ 2. Get StoreManager ID from JWT
    const ownerId = req.user?.id;
    if (!ownerId) {
      return reply.status(401).send({ 
        success: false,
        message: 'Authentication required.' 
      });
    }

    // ✅ 3. Check if area exists
    const area = await Area.findById(areaId);
    if (!area) {
      return reply.status(404).send({
        success: false,
        message: 'Area not found.'
      });
    }

    // ✅ 4. Ensure area belongs to this StoreManager
    if (area.createdBy.toString() !== ownerId) {
      return reply.status(403).send({
        success: false,
        message: 'You do not have permission to update this area.'
      });
    }

    // ✅ 5. Check for duplicate name under this StoreManager
    const duplicateArea = await Area.findOne({ 
      name, 
      createdBy: ownerId,
      _id: { $ne: areaId } // exclude the current area itself
    });

    if (duplicateArea) {
      return reply.status(409).send({
        success: false,
        message: `Another area with the name "${name}" already exists under your account.`
      });
    }

    // ✅ 6. Update and save
    area.name = name;
    area.stockCount = stockCount;
    await area.save();

    return reply.status(200).send({
      success: true,
      message: 'Area updated successfully.',
      data: {
        id: area._id,
        name: area.name,
        stockCount: area.stockCount
      }
    });

  } catch (error) {
    console.error('Error updating area:', error.message);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};



export const deleteArea = async (req, reply) => {
  console.log("Delete Area is Called");
  try {
    // ✅ Get area ID from URL params
    const areaId = req.params.id;

    // ✅ Get StoreManager ID from JWT
    const ownerId = req.user?.id;
    if (!ownerId) {
      return reply.status(401).send({ message: 'Authentication required.' });
    }

    // ✅ Check if area exists
    const area = await Area.findById(areaId);
    if (!area) {
      return reply.status(404).send({
        success: false,
        message: 'Area not found.'
      });
    }

    // ✅ Ensure the area belongs to this StoreManager
    if (area.createdBy.toString() !== ownerId) {
      return reply.status(403).send({
        success: false,
        message: 'You do not have permission to delete this area.'
      });
    }

    // ✅ Delete the area
    await Area.findByIdAndDelete(areaId);

    // ✅ Respond success
    return reply.status(200).send({
      success: true,
      message: `Area "${area.name}" deleted successfully.`
    });

  } catch (error) {
    console.error('Error deleting area:', error.message);
    return reply.status(500).send({ 
      success: false,
      message: 'Internal server error'
    });
  }
};
