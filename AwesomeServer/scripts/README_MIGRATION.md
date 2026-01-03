# StoreBrand ID Migration Guide

## Problem

Products created before the `storeBrandId` mapping fix don't have this field set, causing:
- Products not appearing under brand tabs on Products Screen
- Products not showing in Add Stock for vendors

## Solution

Run the migration script to automatically populate `storeBrandId` for existing products.

## How to Run

### Step 1: Preview Changes (Dry Run)

First, run in dry-run mode to see what will be changed:

```bash
cd AwesomeServer
node scripts/migrate_storebrand_ids.js --dry-run
```

This will show you:
- How many products will be updated
- Which products can be auto-updated
- Which products need manual intervention

### Step 2: Run the Migration

If the dry run looks good, run the actual migration:

```bash
node scripts/migrate_storebrand_ids.js
```

## What the Script Does

### Auto-Updated Products
Products with `masterProductId` (from onboarding):
- ✅ Script looks up the brand from MasterProduct
- ✅ Finds the matching StoreBrand for the store
- ✅ Sets `storeBrandId` automatically

### Manual Intervention Needed
Products without `masterProductId` (manually created):
- ⚠️ Script cannot determine the brand automatically
- 💡 These need to be assigned manually via the app or admin panel

## Example Output

```
🔍 Starting migration: Add storeBrandId to StoreProducts...

Found 15 products without storeBrandId

✅ Updated: Sangam Standard Milk -> Brand: Sangam
✅ Updated: Heritage Curd 500gm -> Brand: Heritage
⚠️  Skipped: My Custom Product - No masterProductId (manually created)

============================================================
📊 Migration Summary:
============================================================
Total products processed: 15
✅ Successfully updated: 12
⚠️  Skipped (needs manual intervention): 3
❌ Errors: 0
============================================================
```

## After Migration

### Verify the Migration

Check your database to confirm:

```javascript
// In MongoDB shell
db.storeproducts.find({ 
  storeBrandId: null 
}).count()  // Should be 0 or only manually created products

db.storeproducts.find({}, {
  name: 1,
  storeBrandId: 1,
  masterProductId: 1
})
```

### Handle Manually Created Products

For products that couldn't be auto-updated:

1. **Option A - Via App:**
   - Go to Products Screen
   - Edit each product
   - Select the correct brand
   - Save

2. **Option B - Via Database:**
   ```javascript
   // Find the StoreBrand ID for your brand
   db.storebrands.find({ name: "Your Brand Name" })
   
   // Update the product
   db.storeproducts.updateOne(
     { _id: ObjectId("PRODUCT_ID") },
     { $set: { storeBrandId: ObjectId("STOREBRAND_ID") } }
   )
   ```

## Safety

- ✅ Script only updates products missing `storeBrandId`
- ✅ Dry run mode available for preview
- ✅ Detailed logging of all changes
- ✅ No data deletion - only adds missing field

## Troubleshooting

### "StoreBrand not found" warnings

If you see this warning, it means:
- A product has a `masterProductId` with a `brandId`
- But no matching `StoreBrand` exists in your store

**Solution:**
The `StoreBrand` might not have been created during onboarding. You can:
1. Create the missing `StoreBrand` manually
2. Run the migration again
3. Or assign the brand manually via the app

### Products still not showing

After migration, if products still don't appear:
1. Restart the server to clear any caches
2. Check that vendors have brands assigned
3. Verify the brand assignment in the database
