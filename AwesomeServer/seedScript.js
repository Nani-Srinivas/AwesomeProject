import "dotenv/config.js";
import mongoose from "mongoose";
import Category from "./src/models/Product/Category.js";
import Subcategory from "./src/models/Product/Subcategory.js";
import MasterProduct from "./src/models/Product/MasterProduct.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
  console.log('Starting seedDatabase function...');
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB.');

    // Clear existing collections
    console.log('Clearing existing MasterProduct collection...');
    await MasterProduct.deleteMany({});
    console.log('MasterProduct collection cleared.');

    console.log('Clearing existing Subcategory collection...');
    await Subcategory.deleteMany({});
    console.log('Subcategory collection cleared.');

    console.log('Clearing existing Category collection...');
    await Category.deleteMany({});
    console.log('Category collection cleared.');

    // Dummy creator (replace with a real Admin/StoreManager from your DB if available)
    const createdBy = new mongoose.Types.ObjectId();
    const createdByModel = "Admin";

    // Insert Categories
    console.log('Inserting categories...');
    const categoryDocs = await Category.insertMany(
      categories.map((cat) => ({
        name: cat.name,
        description: cat.description || "",
        imageUrl: cat.image,
        createdBy,
        createdByModel,
      }))
    );
    console.log(`Inserted ${categoryDocs.length} categories.`);

    // Map category name → ID
    const categoryMap = categoryDocs.reduce((map, cat) => {
      map[cat.name] = cat._id;
      return map;
    }, {});

    // Insert Subcategories
    let subcategoryDocs = [];
    console.log('Inserting subcategories...');
    for (const cat of categories) {
      const catId = categoryMap[cat.name];
      if (cat.subcategories && cat.subcategories.length > 0) {
        const subs = cat.subcategories.map((sub) => ({
          name: sub.name,
          categoryId: catId,
          createdBy,
          createdByModel,
        }));
        const insertedSubs = await Subcategory.insertMany(subs);
        subcategoryDocs = [...subcategoryDocs, ...insertedSubs];
      }
    }
    console.log(`Inserted ${subcategoryDocs.length} subcategories.`);

    // Map subcategory name → ID
    const subcategoryMap = subcategoryDocs.reduce((map, sub) => {
      map[sub.name] = sub._id;
      return map;
    }, {});

    // Insert Master Products
    console.log('Inserting master products...');
    const masterProductsWithRefs = products.map((product) => ({
      name: product.name,
      description: product.description || "",
      basePrice: product.price,
      category: categoryMap[product.category],
      subcategory: subcategoryMap[product.subcategory],
      images: [product.image],
      createdBy,
      createdByModel,
    }));

    await MasterProduct.insertMany(masterProductsWithRefs);
    console.log(`Inserted ${masterProductsWithRefs.length} master products.`);

    console.log("✅ DATABASE SEEDED SUCCESSFULLY");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    console.error('MONGO_URI:', process.env.MONGO_URI);
  } finally {
    console.log('Closing MongoDB connection.');
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}


seedDatabase();