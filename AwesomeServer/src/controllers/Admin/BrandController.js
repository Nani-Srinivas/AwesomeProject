// controllers/Admin/BrandController.js
import Brand from "../../models/Product/Brand.js";

export const getBrands = async (req, reply) => {
    try {
        const brands = await Brand.find({}).sort({ createdAt: -1 });
        return reply.status(200).send({
            success: true,
            message: 'Brands fetched successfully',
            data: brands,
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

export const createBrand = async (req, reply) => {
    try {
        const { name, description, imageUrl } = req.body;

        if (!req.user?.id || req.user?.role !== 'Admin') {
            return reply.status(401).send({ message: 'Unauthorized: Only Admin can create brands.' });
        }

        // Check for duplicate brand name
        const existingBrand = await Brand.findOne({ name });
        if (existingBrand) {
            return reply.status(409).send({ message: 'A brand with this name already exists.' });
        }

        const newBrand = new Brand({
            name,
            description,
            imageUrl,
            createdBy: req.user.id,
            createdByModel: req.user.role,
        });

        await newBrand.save();

        return reply.status(201).send({
            success: true,
            message: 'Brand created successfully',
            data: newBrand,
        });
    } catch (error) {
        console.error('Error creating brand:', error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

export const updateBrand = async (req, reply) => {
    try {
        const { id } = req.params;
        const { name, description, imageUrl } = req.body;

        if (!req.user?.id || req.user?.role !== 'Admin') {
            return reply.status(401).send({ message: 'Unauthorized: Only Admin can update brands.' });
        }

        // Check for duplicate name (excluding current brand)
        if (name) {
            const existingBrand = await Brand.findOne({ name, _id: { $ne: id } });
            if (existingBrand) {
                return reply.status(409).send({ message: 'A brand with this name already exists.' });
            }
        }

        const updatedBrand = await Brand.findByIdAndUpdate(
            id,
            { name, description, imageUrl },
            { new: true, runValidators: true }
        );

        if (!updatedBrand) {
            return reply.status(404).send({ message: 'Brand not found.' });
        }

        return reply.status(200).send({
            success: true,
            message: 'Brand updated successfully',
            data: updatedBrand,
        });
    } catch (error) {
        console.error('Error updating brand:', error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};

export const deleteBrand = async (req, reply) => {
    try {
        const { id } = req.params;

        if (!req.user?.id || req.user?.role !== 'Admin') {
            return reply.status(401).send({ message: 'Unauthorized: Only Admin can delete brands.' });
        }

        const deletedBrand = await Brand.findByIdAndDelete(id);

        if (!deletedBrand) {
            return reply.status(404).send({ message: 'Brand not found.' });
        }

        return reply.status(200).send({
            success: true,
            message: 'Brand deleted successfully',
            data: deletedBrand,
        });
    } catch (error) {
        console.error('Error deleting brand:', error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
};
