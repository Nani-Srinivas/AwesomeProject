// controllers/storeController.js
import Store from '../../models/Store/Store.js';
import { StoreManager } from '../../models/User/StoreManager.js';
import mongoose from 'mongoose';

export const createStore = async (req, reply) => {
    console.log("Create Store API Is called")
    try {
        const { name, address, location, status } = req.body;
        const { coordinates } = location;
        const [longitude, latitude] = coordinates;

        // 1. Validate input
        if (!name || !address || !location || !coordinates || coordinates.length !== 2) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields or invalid location data'
            });
        }

        if (typeof longitude !== 'number' || typeof latitude !== 'number') {
            return reply.status(400).send({
                success: false,
                message: 'Invalid coordinates'
            });
        }
        const ownerId = req.user?.id || req.user?._id; // 🔄 Try both
        if (!ownerId) {
            console.log("OwnerId", ownerId)
            return reply.status(401).send({
                success: false,
                message: 'Authentication required'
            });
        }

        // 2. Check if store manager already owns a store
        const existingStore = await Store.findOne({ ownerId });
        if (existingStore) {
            return reply.status(400).send({
                success: false,
                message: `Store already exists for owner: ${existingStore.name}`
            });
        }

        // 3. Create store
        const store = new Store({
            name,
            ownerId,
            address,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            status: status || 'active'
        });

        await store.save();
        await StoreManager.findByIdAndUpdate(ownerId, { storeId: store._id });

        return reply.status(201).send({
            success: true,
            message: `${name} store created successfully`,
            store: store
        });
    } catch (error) {
        console.error('Store creation error:', error);
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
};