import { Admin, StoreManager, Customer, DeliveryPartner } from "../../models/User/index.js";
import Store from "../../models/Store/Store.js"; // Import Store model
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// Email Sender Function
const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Auth System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// Email Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ✅ Verify Email
export const verifyEmail = async (req, reply) => {
  console.log("Verify API");
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { id, purpose, role } = decoded;

    if (purpose !== 'email_verification') {
      return reply.status(400).send({ message: 'Invalid verification link' });
    }

    let Model;
    switch (role) {
      case 'Customer': Model = Customer; break;
      case 'StoreManager': Model = StoreManager; break;
      case 'DeliveryPartner': Model = DeliveryPartner; break;
      case 'Admin': Model = Admin; break;
      default: return reply.status(400).send({ message: 'Invalid role in token' });
    }

    let user = await Model.findById(id);

    if (!user) return reply.status(400).send({ message: 'Invalid verification link' });

    if (user.isVerified) {
      return reply.send({ message: 'Email already verified' });
    }

    user.isVerified = true;
    user.emailVerifiedAt = new Date();

    await user.save();

    return reply.send({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error:', err);

    if (err.name === 'TokenExpiredError') {
      return reply.status(400).send({ message: 'Verification link has expired' });
    }

    return reply.status(400).send({ message: 'Invalid or expired verification link' });
  }
};

// 🧪 TEST ENDPOINT - Simple endpoint to test API connectivity
export const testEndpoint = async (req, reply) => {
  console.log('✅ TEST ENDPOINT HIT!');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  return reply.send({
    success: true,
    message: 'Test endpoint working! Server is reachable.',
    timestamp: new Date().toISOString(),
    serverTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    receivedData: req.body,
    environment: process.env.NODE_ENV || 'development'
  });
};


// controllers/authController.js
export const register = async (req, reply) => {
  console.log("Register API Calling");
  const { role, name, email, password, phone, storeName, longitude, latitude } = req.body;

  let user;
  let Model;

  try {
    // Determine model based on role
    switch (role) {
      case 'Customer': Model = Customer; break;
      case 'StoreManager': Model = StoreManager; break;
      case 'DeliveryPartner': Model = DeliveryPartner; break;
      case 'Admin': Model = Admin; break;
      default: return reply.status(400).send({ message: 'Invalid role specified' });
    }

    // 1. Check if user exists (specific to collection)
    let existingUser = await Model.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return reply.status(400).send({ message: "User already registered" });
    }

    // 2. Hash password if provided
    let hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // 3. Create using the correct model
    switch (role) {
      case 'Customer':
        user = await Customer.create({
          email,
          phone,
          password: hashedPassword,
          name,
          roles: [role],
        });
        break;

      case 'StoreManager':
        user = await StoreManager.create({
          email,
          phone,
          password: hashedPassword,
          name,
          roles: [role],
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        });
        break;

      case 'DeliveryPartner':
        user = await DeliveryPartner.create({
          email,
          phone,
          password: hashedPassword,
          name,
          roles: [role],
          aadhar: req.body.aadhar,
        });
        break;

      case 'Admin':
        user = await Admin.create({
          email,
          phone,
          password: hashedPassword,
          name,
          roles: [role],
        });
        break;
    }

    console.log(`New ${role} created with _id:`, user._id);

    // 4. Send verification email if required
    if (user.email && (role === 'DeliveryPartner' || role === 'StoreManager' || role === 'Admin')) {
      const token = jwt.sign(
        { id: user._id, purpose: 'email_verification', role: role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '2h' }
      );
      const url = `${process.env.BASE_URL}/api/auth/verify?token=${token}`;

      await sendEmail(
        user.email,
        'Verify Your Email',
        `<p>Hello ${user.name || user.email},</p><p>Please click the link below to verify your email:</p><a href="${url}">Verify Email</a><p>This link will expire in 2 hours.</p>`
      );

      return reply.send({
        message: 'Verification email sent',
        user: { id: user._id, email: user.email, roles: user.roles },
      });
    }

    // 5. Default response
    return reply.send({
      success: true,
      message: `${role} registered successfully`,
      user: { id: user._id, email: user.email, phone: user.phone, roles: user.roles },
    });

  } catch (err) {
    console.error('Registration error:', err);

    // ROLLBACK: Delete user if created but error occurred (e.g. email failed)
    if (user && user._id && Model) {
      console.log(`Rolling back creation of user ${user._id} due to error`);
      await Model.findByIdAndDelete(user._id);
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return reply.status(400).send({ message: `${field} already registered` });
    }
    return reply.status(500).send({ message: 'An error occurred', error: err.message || err });
  }
};




// Token generation
const generateTokens = (user, storeId = null) => {
  const tokenPayload = {
    id: user._id,
    roles: user.roles
  };

  // Include storeId if provided
  if (storeId) {
    tokenPayload.storeId = storeId;
  }

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' } // Shortened from 1d for better security
  );

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// ✅ Login Store Manager
export const loginStoreManager = async (req, reply) => {
  console.log("StoreManager Login API is called");
  console.log(req.body);

  const { email, phone, password } = req.body;

  try {
    // 1. Validate input - require either email OR phone, plus password
    if ((!email && !phone) || !password) {
      return reply.status(400).send({
        success: false,
        message: "Email or phone number, and password are required",
      });
    }

    // 2. Build query to find user by email OR phone
    const query = {};
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    }

    // 3. Find user and ensure it's a StoreManager
    const user = await StoreManager.findOne(query).select("+password");
    if (!user || !user.roles.includes("StoreManager")) {
      return reply
        .status(404)
        .send({ success: false, message: "Store manager not found" });
    }

    // 4. Ensure email is verified
    if (!user.isVerified) {
      return reply
        .status(403)
        .send({ success: false, message: "Please verify your email before logging in" });
    }

    // 5. Validate password
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return reply
        .status(401)
        .send({ success: false, message: "Invalid credentials" });
    }

    // 6. Get store manager details
    const storeManagerDoc = await StoreManager.findById(user._id);

    // 7. Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user, storeManagerDoc?.storeId);

    // 8. Hash refresh token and save
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // 9. Return success response
    // Build user object - only include onboarding arrays if onboarding is incomplete
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      storeId: storeManagerDoc?.storeId,
      hasSelectedCategories: storeManagerDoc?.hasSelectedCategories,
      hasSelectedSubcategories: storeManagerDoc?.hasSelectedSubcategories,
      hasSelectedProducts: storeManagerDoc?.hasSelectedProducts,
      hasAddedProductPricing: storeManagerDoc?.hasAddedProductPricing,
      additionalDetailsCompleted: storeManagerDoc?.additionalDetailsCompleted,
    };

    // Only include temporary onboarding arrays if onboarding is not complete
    if (!storeManagerDoc?.additionalDetailsCompleted) {
      userResponse.selectedCategoryIds = storeManagerDoc?.selectedCategoryIds;
      userResponse.selectedSubcategoryIds = storeManagerDoc?.selectedSubcategoryIds;
      userResponse.selectedProductIds = storeManagerDoc?.selectedProductIds;
    }

    return reply.send({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userResponse,
    },
    );
  } catch (err) {
    console.error("Login error:", err);
    return reply
      .status(500)
      .send({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ Login Customer
export const loginCustomer = async (req, reply) => {
  console.log("Customer Login API Is called")
  const { phone } = req.body;

  try {
    // 1. Validate input
    if (!phone) {
      return reply.status(400).send({
        success: false,
        message: 'Phone number is required'
      });
    }

    // 2. Find user and check role
    const user = await Customer.findOne({ phone });
    if (!user || !user.roles.includes('Customer')) {
      return reply.status(404).send({ message: 'Customer not found or invalid credentials' });
    }

    // 3. Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // 4. Hash refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // 5. Save refresh token (optional)
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // 6. Return response
    return reply.send({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name, // Include name for consistency
        phone: user.phone,
        roles: user.roles // Return all roles
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return reply.status(500).send({ message: 'Server error' });
  }
};

// ✅ Login Delivery Partner
export const loginDeliveryPartner = async (req, reply) => {
  console.log("Delivery Partner Login API Is called")
  const { email, password } = req.body;

  try {
    // 1. Validate input
    if (!email || !password) {
      return reply.status(400).send({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 2. Find user and check role
    const user = await DeliveryPartner.findOne({ email }).select('+password');

    if (!user || !user.roles.includes('DeliveryPartner')) {
      return reply.status(404).send({ message: 'Delivery partner not found or invalid credentials' });
    }

    // Cast to DeliveryPartner discriminator to access role-specific fields
    let deliveryPartnerDoc = null;
    if (user.roles.includes('DeliveryPartner')) {
      deliveryPartnerDoc = await DeliveryPartner.findById(user._id);
    }

    // 3. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ message: 'Invalid credentials' });
    }

    // 4. Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // 5. Hash refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // 6. Save refresh token (optional)
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // 7. Return response
    return reply.send({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        aadhar: deliveryPartnerDoc ? deliveryPartnerDoc.aadhar : undefined // Include aadhar if available
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return reply.status(500).send({ message: 'Server error' });
  }
};


// ✅ Refresh Token (by Role)
export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return reply.status(401).send({ message: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const role = decoded.roles && decoded.roles[0];

    let Model;
    switch (role) {
      case 'Customer': Model = Customer; break;
      case 'StoreManager': Model = StoreManager; break;
      case 'DeliveryPartner': Model = DeliveryPartner; break;
      case 'Admin': Model = Admin; break;
      default: return reply.status(403).send({ message: 'Invalid role in token' });
    }

    let user = await Model.findById(decoded.id);

    if (!user) {
      return reply.status(403).send({ message: 'Invalid refresh token' });
    }

    // Compare the incoming plain refresh token with the stored hashed token
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken || '');
    if (!isMatch) {
      return reply.status(403).send({ message: 'Invalid refresh token' });
    }

    // Check if the decoded roles match any of the user's roles
    if (!user.roles.some(r => decoded.roles.includes(r))) {
      return reply.status(403).send({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user, user.storeId);
    // Hash the new refresh token before saving
    const hashedNewRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshToken = hashedNewRefreshToken;
    await user.save();

    return reply.send({ message: 'Token refreshed', ...tokens });
  } catch (err) {
    console.error('Refresh token error:', err);
    return reply.status(403).send({ message: 'Invalid or expired refresh token' });
  }
};


// ✅ Logout (Invalidate Refresh Token)
export const logout = async (req, reply) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return reply.status(200).send({
      success: true,
      message: 'Already logged out'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const role = decoded.roles && decoded.roles[0];

    let Model;
    switch (role) {
      case 'Customer': Model = Customer; break;
      case 'StoreManager': Model = StoreManager; break;
      case 'DeliveryPartner': Model = DeliveryPartner; break;
      case 'Admin': Model = Admin; break;
      default:
        return reply.status(200).send({
          success: true,
          message: 'Logged out'
        });
    }

    const user = await Model.findById(decoded.id);
    if (user) {
      // Clear the refresh token to invalidate it
      user.refreshToken = null;
      await user.save();
    }

    return reply.send({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    // Even if token is invalid/expired, consider it a successful logout
    console.log('Logout token verification failed (expected):', err.message);
    return reply.status(200).send({
      success: true,
      message: 'Logged out'
    });
  }
};


// ✅ Fetch User API
export const fetchUser = async (req, reply) => {
  console.log("Fetch User API is called");
  const { roles, id } = req.user; // user comes from auth middleware
  console.log(req.user);
  const role = roles[0]; // Assume the first role is the primary one
  const discriminator = {
    Customer: Customer,
    StoreManager: StoreManager,
    DeliveryPartner: DeliveryPartner,
    Admin: Admin,
  }[role];

  if (!discriminator) {
    return reply.code(400).send({ message: 'Invalid role' });
  }

  try {
    let user = await discriminator.findById(id).select('-password');

    if (!user || !user.roles.includes(role)) {
      return reply.code(404).send({ message: 'User not found or role mismatch' });
    }

    return reply.code(200).send({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return reply.code(500).send({
      success: false,
      message: 'Server error',
    });
  }
};

// ✅ Update User Profile
export const updateUserProfile = async (req, reply) => {
  console.log("Update User Profile API is called");
  const { roles, id } = req.user; // user comes from auth middleware
  const { name, upiId } = req.body;

  const role = roles[0]; // Primary role
  const discriminator = {
    Customer: Customer,
    StoreManager: StoreManager,
    DeliveryPartner: DeliveryPartner,
    Admin: Admin,
  }[role];

  if (!discriminator) {
    return reply.code(400).send({
      success: false,
      message: 'Invalid role'
    });
  }

  try {
    // Find user
    let user = await discriminator.findById(id);

    if (!user || !user.roles.includes(role)) {
      return reply.code(404).send({
        success: false,
        message: 'User not found or role mismatch'
      });
    }

    // Update allowed fields
    if (name !== undefined && name.trim()) {
      user.name = name.trim();
    }

    // Only update UPI ID for StoreManagers
    if (role === 'StoreManager' && upiId !== undefined) {
      user.upiId = upiId ? upiId.trim() : null;
    }

    // Save changes
    await user.save();

    // Return updated user (exclude password)
    const updatedUser = await discriminator.findById(id).select('-password');

    return reply.code(200).send({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return reply.code(500).send({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};