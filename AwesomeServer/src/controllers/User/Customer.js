import { Customer } from '../../models/User/Customer.js';
import Store from '../../models/Store/Store.js';
import Area from '../../models/Delivery/Area.js';
import StoreProduct from '../../models/Product/StoreProduct.js';

// ✅ Get all customers
export const getCustomers = async (req, reply) => {
  console.log("getCustomers API is Called");
  try {
    const createdBy = req.user?.id;
    console.log(createdBy);
    if (!createdBy) return reply.status(401).send({ message: 'Authentication required' });

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) return reply.status(404).send({ message: 'Store not found' });

    const customers = await Customer.find({ store: store._id })
      .populate('area')
            .populate({
        path: 'requiredProduct.product',
        model: 'StoreProduct', // this tells Mongoose which model to use
        populate: {
          path: 'masterProductId',
          model: 'MasterProduct',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    if (!customers.length) {
      return reply.status(200).send({ success: true, data: customers, message: 'No customers found for this store' });
    }

    return reply.status(200).send({
      success: true,
      data: customers,
      message: 'Customers fetched successfully'
    });
  } catch (err) {
    console.error('Get Customers Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Get customers by area
export const getCustomersByArea = async (req, reply) => {
  try {
    const customers = await Customer.find({ area: req.params.areaId }).populate({
      path: 'requiredProduct.product',
      model: 'StoreProduct',
      populate: {
        path: 'masterProductId',
        model: 'MasterProduct',
        select: 'name'
      }
    });
    return reply.send({ success: true, data: customers });
  } catch (err) {
    console.error('Get Customers by Area Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};


// ✅ Get single customer
export const getSingleCustomer = async (req, reply) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('area', 'name');
    if (!customer) return reply.status(404).send({ message: 'Customer not found' });
    return reply.send({ success: true, data: customer });
  } catch (err) {
    console.error('Get Single Customer Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Create customer
export const createCustomer = async (req, reply) => {
  console.log("createCustomer API is Called");
  console.log(req.body);

  const { name, phone, requiredProduct, deliveryCost, isSubscribed, advanceAmount, Bill, area, address } = req.body;

  try {
    const createdBy = req.user?.id;
    if (!createdBy) return reply.status(401).send({ message: 'Authentication required' });

    if (await Customer.findOne({ phone })) {
      return reply.status(400).send({ message: 'Phone already registered' });
    }

    if (area && !(await Area.findById(area))) {
      return reply.status(400).send({ message: 'Invalid area ID' });
    }

    const store = await Store.findOne({ ownerId: createdBy });
    if (!store) return reply.status(400).send({ message: 'No store found for this manager' });

    const newCustomer = new Customer({
      name,
      phone,
      roles: ['Customer'],
      requiredProduct,
      deliveryCost,
      isSubscribed,
      advanceAmount,
      Bill,
      area,
      address,
      store: store._id,
      createdBy
    });

    await newCustomer.save();
    await newCustomer.populate([
      { path: 'area' },
      {
        path: 'requiredProduct.product',
        model: 'StoreProduct',
        populate: {
          path: 'masterProductId',
          model: 'MasterProduct',
          select: 'name'
        }
      }
    ]);

    return reply.status(201).send({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (err) {
    console.error('Create Customer Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

// ✅ Update customer
export const updateCustomer = async (req, reply) => {
  console.log("updateCustomer API is Called");
  console.log("req.body", req.body);
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return reply.status(404).send({ message: 'Customer not found' });

    const { name, phone, advanceAmount, Bill, area, address, deliveryCost, isSubscribed, requiredProduct } = req.body;

    if (phone && String(phone) !== String(customer.phone)) {
      const existingPhone = await Customer.findOne({ phone });
      if (existingPhone) return reply.status(400).send({ message: 'Phone already in use' });
    }

    if (area && !(await Area.findById(area))) {
      return reply.status(400).send({ message: 'Invalid area ID' });
    }

    // 👍 update ALL fields
    customer.name = name ?? customer.name;
    customer.phone = phone ?? customer.phone;
    customer.advanceAmount = advanceAmount ?? customer.advanceAmount;
    customer.deliveryCost = deliveryCost ?? customer.deliveryCost;
    customer.Bill = Bill ?? customer.Bill;
    customer.area = area ?? customer.area;
    customer.address = address ?? customer.address;
    customer.isSubscribed = isSubscribed ?? customer.isSubscribed;
    customer.requiredProduct = requiredProduct ?? customer.requiredProduct;

    await customer.populate('area');
    await customer.save();

    return reply.send({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (err) {
    console.error('Update Customer Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};



// ✅ Delete customer
export const deleteCustomer = async (req, reply) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return reply.status(404).send({ message: 'Customer not found' });

    await customer.deleteOne();
    return reply.send({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Delete Customer Error:', err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};