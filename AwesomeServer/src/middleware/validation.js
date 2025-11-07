import Joi from 'joi';

const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

// Customer validation schemas
export const customerValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10 digits'
    }),
    email: Joi.string().email().optional(),
    address: Joi.object({
      FlatNo: Joi.string().optional(),
      Apartment: Joi.string().optional(),
      city: Joi.string().default('Hyderabad'),
      state: Joi.string().default('Telangana'),
      country: Joi.string().default('India'),
      zip: Joi.string().optional()
    }).optional(),
    deliveryCost: Joi.number().min(0).optional(),
    requiredProduct: Joi.array().items(Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })).optional()
  })
};

// Payment validation schemas
export const paymentValidation = {
  create: Joi.object({
    customerId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('Cash', 'Online', 'Card', 'UPI', 'Net Banking', 'Pay Later').required(),
    transactionId: Joi.when('paymentMethod', {
      is: 'Cash',
      then: Joi.any().forbidden(),
      otherwise: Joi.string().required()
    }),
    notes: Joi.string().max(500).optional()
  })
};

export default validationMiddleware;