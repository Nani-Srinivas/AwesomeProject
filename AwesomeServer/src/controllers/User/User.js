// Login API
import { DeliveryPartner } from "../../models/User/index.js";
import Store from '../../models/Store/Store.js';
import bcrypt from 'bcryptjs';
import Area from "../../models/Delivery/Area.js";


export const createDeliveryPartner1 = async (req, reply) => {
  console.log("createDeliveryPartner API is Called");
  // Destructure necessary fields from the request body
  const { name, email, password, phone, aadhar, area, address } = req.body;
  console.log(req.body)
  try {
    // Check if the phone already exists
    let existingPhoneUser = await DeliveryPartner.findOne({ phone });
    if (existingPhoneUser) {
      return reply.status(400).send({ message: 'User with this phone number already exists' });
    }

    // Check if the email is provided and only check for uniqueness if email is present
    if (email) {
      let existingEmailUser = await DeliveryPartner.findOne({ email });
      if (existingEmailUser) {
        return reply.status(400).send({ message: 'User with this email already exists' });
      }
    }

    // Check if the area is provided and only check for uniqueness
    if (area) {
      let existingArea = await Area.findById(area);
      if (!existingArea) {
        return reply.status(400).send({ message: 'NO Area exists' });
      }
    }

    // 2. Get StoreManager ID from JWT
    const createdBy = req.user.id;
    console.log("CreaedBy", createdBy);
    if (!createdBy) {
      return reply.status(401).send({ message: 'Authentication required' });
    }

    const store = await Store.findOne({ownerId:createdBy});
    // console.log("Store", store)
        if (!store) {
        return reply.status(400).send({ message: 'No Store is available' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user, allowing email to be null
    const newUser = new DeliveryPartner({
      name,
      email: email || null, // Allow null email
      password: hashedPassword,
      phone,
      aadhar,
      area: area,
      address,
      store,
      createdBy
    });

    // Save the user to the database
    await newUser.save();
    // console.log("newUser", newUser);

    return reply.status(201).send({
      statusCode: 200,
      success: true,
      message: 'DeliveryPartner created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Delivery Partner creation error:', error.message);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// Create Delivery Partner
export const createDeliveryPartner = async (req, reply) => {
  console.log("createDeliveryPartner API is Called");
  console.log(req.body);
  const { name, phone, aadhar, area } = req.body;

  try {
    // Ensure authenticated store manager
    const createdBy = req.user?.id;
    if (!createdBy) {
      return reply.status(401).send({ message: 'Authentication required' });
    }

    // Validate phone uniqueness
    const existingPhone = await DeliveryPartner.findOne({ phone });
    if (existingPhone) {
      return reply.status(400).send({ message: 'Phone already registered' });
    }

    // Validate area exists
    let foundArea = null;
    if (area) {
      foundArea = await Area.findById(area);
      if (!foundArea) {
        return reply.status(400).send({ message: 'Invalid area ID' });
      }
    }

    // Validate store
    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) {
      return reply.status(400).send({ message: 'No store found for this manager' });
    }

    // Create delivery partner
    const newPartner = new DeliveryPartner({
      name,
      phone,
      aadhar,
      area,
      store: store._id,
      createdBy
    });

    await newPartner.save();
    await newPartner.populate('area');

    // Return complete object for optimistic UI replacement
    return reply.status(201).send({
      success: true,
      message: 'Delivery partner created successfully',
      data: {
        _id: newPartner._id,
        name: newPartner.name,
        phone: newPartner.phone,
        aadhar: newPartner.aadhar,
        area: newPartner.area ? {
          _id: newPartner.area._id,
          name: newPartner.area.name
        } : null
      }
    });
  } catch (err) {
    console.error('Create Delivery Partner Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};


export const getDeliveryPartnersByStore = async (req, reply) => {
  console.log("getDeliveryPartnersByStore API is Called");
  try {
    const createdBy = req.user?.id;
    console.log(createdBy);
    if (!createdBy) {
      return reply.status(401).send({ message: 'Authentication required' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    console.log(store);
    if (!store) {
      return reply.status(400).send({ message: 'No store found' });
    }

    const partners = await DeliveryPartner.find({ store: store._id })
      .populate('area', 'name')  // populate area name
      // .select('-password');      // remove password

    return reply.send({
      success: true,
      count: partners.length,
      data: partners
    });
  } catch (err) {
    console.error('Get Delivery Partners Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getSingleDeliveryPartner = async (req, reply) => {
  console.log("getSingleDeliveryPartner API is Called");
  console.log(req.params.id)
  try {
    const partner = await DeliveryPartner.findById(req.params.id)
      .populate('area', 'name')
      // .select('-password');

    if (!partner) {
      return reply.status(404).send({ message: 'Delivery partner not found' });
    }

    return reply.send({ success: true, data: partner });
  } catch (err) {
    console.error('Get Single Delivery Partner Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// export const updateDeliveryPartner = async (req, reply) => {
//   console.log("updateDeliveryPartner API is Called");
//   console.log(req.body)
//   try {
//     const createdBy = req.user?.id;
//         if (!createdBy) {
//       return reply.status(401).send({ message: 'Authentication required' });
//     }


//     const updateData = { ...req.body };

//     if (updateData.area && !(await Area.findById(updateData.area))) {
//       return reply.status(400).send({ message: 'Invalid area ID' });
//     }

//     const partner = await DeliveryPartner.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!partner) {
//       return reply.status(404).send({ message: 'Delivery partner not found' });
//     }

//     return reply.send({
//       success: true,
//       message: 'Delivery partner updated',
//       data: partner
//     });
//   } catch (err) {
//     console.error('Update Delivery Partner Error:', err);
//     return reply.status(500).send({ message: 'Internal server error' });
//   }
// };
export const updateDeliveryPartner = async (req, reply) => {
  console.log("updateDeliveryPartner API Called");
  const { id } = req.params;
  const { name, phone, aadhar, area } = req.body;

  try {
    // Validate area if provided
    if (area && !(await Area.findById(area))) {
      return reply.status(400).send({ message: 'Invalid area ID' });
    }

    const updatedPartner = await DeliveryPartner.findByIdAndUpdate(
      id,
      { name, phone, aadhar, area },
      { new: true, runValidators: true }
    ).populate('area');

    if (!updatedPartner) {
      return reply.status(404).send({ message: 'Delivery partner not found' });
    }

    return reply.status(200).send({
      success: true,
      message: 'Delivery partner updated successfully',
      data: {
        _id: updatedPartner._id,
        name: updatedPartner.name,
        phone: updatedPartner.phone,
        aadhar: updatedPartner.aadhar,
        area: updatedPartner.area ? {
          _id: updatedPartner.area._id,
          name: updatedPartner.area.name
        } : null
      }
    });
  } catch (err) {
    console.error('Update Delivery Partner Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const deleteDeliveryPartner = async (req, reply) => {
  console.log("deleteDeliveryPartner API is Called");
  console.log(req.params.id)
  try {
    const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return reply.status(404).send({ message: 'Delivery partner not found' });
    }
    return reply.send({ success: true, message: 'Delivery partner deleted' });
  } catch (err) {
    console.error('Delete Delivery Partner Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};



