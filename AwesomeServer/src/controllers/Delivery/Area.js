// controllers/areaController.js
import Area from '../../models/Delivery/Area.js';
import { StoreManager } from '../../models/User/StoreManager.js';
import Store from '../../models/Store/Store.js';

// Helper to get storeId
const getStoreId = async (req) => {
  if (req.user?.storeId) return req.user.storeId;

  const ownerId = req.user?.id;
  if (!ownerId) return null;

  const store = await Store.findOne({ ownerId });
  return store?._id;
};

export const createArea = async (req, reply) => {
  console.log("Create Area is Called");
  const { name, totalSubscribedItems, isActive } = req.body;
  try {

    // ✅ 1. Validate input
    if (!name || totalSubscribedItems == null) {
      return reply.status(400).send({
        success: false,
        message: 'Both "name" and "totalSubscribedItems" are required.'
      });
    }

    // ✅ 2. Get Store ID
    const storeId = await getStoreId(req);
    const createdBy = req.user?.id;

    if (!storeId || !createdBy) {
      return reply.status(401).send({
        success: false,
        message: 'Authentication required or Store not found.'
      });
    }

    // ✅ 3. Check for duplicate area name for this Store
    const existingArea = await Area.findOne({ name, storeId });
    if (existingArea) {
      return reply.status(409).send({
        success: false,
        message: `Area "${name}" already exists for this Store.`
      });
    }

    // ✅ 4. Create area
    const area = new Area({
      name,
      createdBy,
      storeId,
      totalSubscribedItems: totalSubscribedItems,
      isActive
    });

    await area.save();

    // ✅ 5. Send success response
    return reply.status(201).send({
      success: true,
      message: `Area "${name}" created successfully.`,
      data: {
        id: area._id,
        name: area.name,
        totalSubscribedItems: area.totalSubscribedItems,
        isActive: area.isActive,
        storeId: area.storeId
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
  console.log("Get All Area is Called");
  try {
    // ✅ Filter by Store ID
    const storeId = await getStoreId(req);
    if (!storeId) {
      return reply.status(401).send({ message: 'Authentication required' });
    }

    const areas = await Area.find({ storeId });
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
  console.log("Get Area By User is Called");
  try {
    const storeId = await getStoreId(req);
    if (!storeId) {
      return reply.status(401).send({ message: 'Authentication required' });
    }

    const area = await Area.find({ storeId });

    if (!area || area.length === 0) {
      return reply.status(404).send({ message: 'No Areas found for this Store' });
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
    const { name, totalSubscribedItems, isActive } = req.body;

    // ✅ 1. Validate input 
    if (!name || totalSubscribedItems == null) {
      return reply.status(400).send({
        success: false,
        message: 'Please provide both "name" and "totalSubscribedItems".'
      });
    }

    // ✅ 2. Get Store ID
    const storeId = await getStoreId(req);
    if (!storeId) {
      return reply.status(401).send({
        success: false,
        message: 'Authentication required.'
      });
    }

    // ✅ 3. Check if area exists and belongs to store
    const area = await Area.findOne({ _id: areaId, storeId });
    if (!area) {
      return reply.status(404).send({
        success: false,
        message: 'Area not found or does not belong to your store.'
      });
    }

    // ✅ 4. Check for duplicate name under this Store
    const duplicateArea = await Area.findOne({
      name,
      storeId,
      _id: { $ne: areaId } // exclude the current area itself
    });

    if (duplicateArea) {
      return reply.status(409).send({
        success: false,
        message: `Another area with the name "${name}" already exists in your store.`
      });
    }

    // ✅ 5. Update and save
    area.name = name;
    area.totalSubscribedItems = totalSubscribedItems;
    if (isActive !== undefined) {
      area.isActive = isActive;
    }
    await area.save();

    return reply.status(200).send({
      success: true,
      message: 'Area updated successfully.',
      data: {
        id: area._id,
        name: area.name,
        totalSubscribedItems: area.totalSubscribedItems,
        isActive: area.isActive
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

    // ✅ Get Store ID
    const storeId = await getStoreId(req);
    if (!storeId) {
      return reply.status(401).send({ message: 'Authentication required.' });
    }

    // ✅ Check if area exists and belongs to store
    const area = await Area.findOne({ _id: areaId, storeId });
    if (!area) {
      return reply.status(404).send({
        success: false,
        message: 'Area not found or does not belong to your store.'
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
