import "dotenv/config";
import mongoose from "mongoose";
import MasterProduct from "./src/models/Product/MasterProduct.js";
import Category from "./src/models/Product/Category.js";
import Subcategory from "./src/models/Product/Subcategory.js";

async function debugFilter() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Fetch all categories
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories`);

        // 2. Pick a category with subcategories (e.g., "Vegetables & Fruits")
        const targetCategory = categories.find(c => c.name.includes("Vegetables"));
        if (!targetCategory) {
            console.log("Target category not found");
            return;
        }
        console.log(`Target Category: ${targetCategory.name} (${targetCategory._id})`);

        // 3. Fetch subcategories for this category
        const subcategories = await Subcategory.find({ categoryId: targetCategory._id });
        console.log(`Found ${subcategories.length} subcategories:`, subcategories.map(s => `${s.name} (${s._id})`));

        // 4. Fetch products for this category (simulating OnboardingController)
        const products = await MasterProduct.find({ category: targetCategory._id })
            .populate('category')
            .populate('subcategory');

        console.log(`Found ${products.length} products`);
        products.forEach(p => {
            console.log(`- ${p.name}: Subcategory=${p.subcategory ? `${p.subcategory.name} (${p.subcategory._id})` : 'NULL'}`);
        });

        // 5. Simulate Frontend Filtering
        // Select the first subcategory (e.g., "Milk")
        if (subcategories.length === 0) return;
        const selectedSubId = subcategories[0]._id.toString();
        const selectedSubcategories = [selectedSubId]; // User selected "Milk"

        console.log(`\nSimulating Frontend Filter with selected subcategory: ${subcategories[0].name} (${selectedSubId})`);

        // Logic from SelectProductScreen
        const categorySubIds = subcategories.map(s => s._id.toString());
        const selectedInThisCategory = selectedSubcategories.filter(id => categorySubIds.includes(id));

        console.log(`Selected in this category: ${selectedInThisCategory.length}`);

        const filteredProducts = selectedInThisCategory.length > 0
            ? products.filter(p => {
                const hasSubcategory = !!p.subcategory;
                const subId = p.subcategory?._id?.toString() || p.subcategory?.toString(); // Ensure string comparison
                const isMatch = hasSubcategory && selectedInThisCategory.includes(subId);

                console.log(`  Checking ${p.name}: SubId=${subId}, Match=${isMatch}`);
                return isMatch;
            })
            : products;

        console.log(`\nFiltered Products Count: ${filteredProducts.length}`);
        filteredProducts.forEach(p => console.log(`  - ${p.name}`));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.connection.close();
    }
}

debugFilter();
