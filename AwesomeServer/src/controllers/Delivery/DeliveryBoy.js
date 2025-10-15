import DeliveryBoy from '../../models/Delivery/DeliveryBoy.js';
import Area from '../../models/Delivery/Area.js';
import { StoreManager } from '../../models/User/StoreManager.js';

export const createDeliveryBoy = async (req, reply) => {
  console.log("Create Delivery Boy is Called");
  
  const { areaId, name, phone, currentStockItems, isAvailable, isActive } = req.body;
  try {

    // ✅ 1. Validate input
    if (!areaId || !name || !phone) {
      return reply.status(400).send({
        success: false,
        message: 'areaId, name, and phone are required.'
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
    if (!storeManager) {
      return reply.status(404).send({
        success: false,
        message: 'StoreManager not found.'
      });
    }

    // ✅ 4. Check if Area exists
    const area = await Area.findById(areaId);
    if (!area) {
        return reply.status(404).send({
            success: false,
            message: 'Area not found.'
        });
    }

    // ✅ 5. Check for duplicate phone number for this StoreManager
    const existingDeliveryBoy = await DeliveryBoy.findOne({ phone, createdBy: storeManager._id });
    if (existingDeliveryBoy) {
      return reply.status(409).send({
        success: false,
        message: `Delivery Boy with phone "${phone}" already exists for this StoreManager.`
      });
    }

    // ✅ 6. Create DeliveryBoy
    const deliveryBoy = new DeliveryBoy({
      areaId,
      name,
      phone,
      createdBy,
      currentStockItems,
      isAvailable,
      isActive
    });

    await deliveryBoy.save();

    // ✅ 7. Send success response
    return reply.status(201).send({
      success: true,
      message: `Delivery Boy "${name}" created successfully.`,
      data: deliveryBoy
    });

  } catch (error) {
    if (error.code === 11000) {
      return reply.status(409).send({
        success: false,
        message: `Delivery Boy with this phone number already exists.`
      });
    }
    console.error('Create DeliveryBoy error:', error.message);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllDeliveryBoys = async (req, reply) => {
    try {
        const deliveryBoys = await DeliveryBoy.find().populate('areaId', 'name');
        return reply.status(200).send({
            success: true,
            data: deliveryBoys
        });
    } catch (error) {
        console.error('Error fetching delivery boys:', error.message);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

export const getDeliveryBoysByArea = async (req, reply) => {
    try {
        const areaId = req.params.areaId;
        const deliveryBoys = await DeliveryBoy.find({ areaId: areaId }).populate('areaId', 'name');
        return reply.status(200).send({
            success: true,
            data: deliveryBoys
        });
    } catch (error) {
        console.error('Error fetching delivery boys by area:', error.message);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

export const updateDeliveryBoy = async (req, reply) => {
    try {
        const deliveryBoyId = req.params.id;
        const { areaId, name, phone, currentStockItems, isAvailable, isActive } = req.body;

        const ownerId = req.user?.id;
        if (!ownerId) {
            return reply.status(401).send({ 
                success: false,
                message: 'Authentication required.' 
            });
        }

        const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
        if (!deliveryBoy) {
            return reply.status(404).send({
                success: false,
                message: 'Delivery Boy not found.'
            });
        }

        if (deliveryBoy.createdBy.toString() !== ownerId) {
            return reply.status(403).send({
                success: false,
                message: 'You do not have permission to update this delivery boy.'
            });
        }

        if (areaId) {
            const area = await Area.findById(areaId);
            if (!area) {
                return reply.status(404).send({
                    success: false,
                    message: 'Area not found.'
                });
            }
            deliveryBoy.areaId = areaId;
        }
        if (name) deliveryBoy.name = name;
        if (phone) deliveryBoy.phone = phone;
        if (currentStockItems !== undefined) deliveryBoy.currentStockItems = currentStockItems;
        if (isAvailable !== undefined) deliveryBoy.isAvailable = isAvailable;
        if (isActive !== undefined) deliveryBoy.isActive = isActive;

        await deliveryBoy.save();

        return reply.status(200).send({
            success: true,
            message: 'Delivery Boy updated successfully.',
            data: deliveryBoy
        });

    } catch (error) {
        console.error('Error updating delivery boy:', error.message);
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteDeliveryBoy = async (req, reply) => {
    try {
        const deliveryBoyId = req.params.id;

        const ownerId = req.user?.id;
        if (!ownerId) {
            return reply.status(401).send({ message: 'Authentication required.' });
        }

        const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
        if (!deliveryBoy) {
            return reply.status(404).send({
                success: false,
                message: 'Delivery Boy not found.'
            });
        }

        if (deliveryBoy.createdBy.toString() !== ownerId) {
            return reply.status(403).send({
                success: false,
                message: 'You do not have permission to delete this delivery boy.'
            });
        }

        await DeliveryBoy.findByIdAndDelete(deliveryBoyId);

        return reply.status(200).send({
            success: true,
            message: `Delivery Boy "${deliveryBoy.name}" deleted successfully.`
        });

    } catch (error) {
        console.error('Error deleting delivery boy:', error.message);
        return reply.status(500).send({ 
            success: false,
            message: 'Internal server error'
        });
    }
};