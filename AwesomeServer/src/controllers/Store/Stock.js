import Stock from '../../models/Store/Stock.js';
import DailyFinancial from '../../models/Finance/DailyFinancial.js';
import StoreProduct from '../../models/Product/StoreProduct.js';
import Store from '../../models/Store/Store.js';
import { success } from 'zod/v4';
import { getBusinessDate } from '../../utils/dateHelper.js';

// Helper to get storeId
const getStoreId = async (req) => {
  if (req.user?.storeId) return req.user.storeId;

  const ownerId = req.user?.id;
  if (!ownerId) return null;

  const store = await Store.findOne({ ownerId });
  return store?._id;
};

export const addStock = async (req, reply) => {
  console.log("Add Stock API is called");
  console.log(req.body);

  const { date, storeProductId } = req.body;
  const createdBy = req.user?.id;

  try {
    const storeId = await getStoreId(req);
    if (!storeId) {
      return reply.code(401).send({ success: false, message: 'Store not found' });
    }

    // 1) ensure unique date for this store
    const exists = await Stock.findOne({ date, storeId });
    if (exists) {
      return reply.code(200).send({
        success: false,
        message: `Stock already exists for : ${date}`
      });
    }

    // 2) create stock
    const stock = await Stock.create({
      date,
      businessDate: getBusinessDate(),
      storeProductId,
      createdBy,
      storeId
    });

    // 3) compute per-manufacturer (category) totals
    // load all storeProducts in batch
    const ids = storeProductId.map(i => i.productId);
    const products = await StoreProduct.find({ _id: { $in: ids } })
      .populate({
        path: 'masterProductId',
        select: 'category costPrice sellingPrice',
        populate: { path: 'category', select: 'name' }
      });
    // console.log(products)
    // group by category
    const byCat = {};
    storeProductId.forEach(({ productId, quantity }) => {
      const sp = products.find(p => p._id.equals(productId));
      // console.log("sp", sp)
      if (!sp) return; // skip if product not found

      const catId = sp.masterProductId.category._id.toString();
      console.log("catId", catId)
      const cp = sp.costPrice, spx = sp.sellingPrice;
      console.log("cp", cp, "spx", spx)

      if (!byCat[catId]) {
        byCat[catId] = { totalQuantity: 0, totalPayable: 0, totalProfit: 0 };
        console.log("byCat", byCat)
      }

      byCat[catId].totalQuantity += quantity;
      byCat[catId].totalPayable += cp * quantity;
      byCat[catId].totalProfit += (spx - cp) * quantity;
    });

    // 4) upsert DailyFinancial per category
    await Promise.all(Object.entries(byCat).map(([catId, sums]) => {
      return DailyFinancial.findOneAndUpdate(
        { date, category: catId, storeId }, // Add storeId to filter
        {
          $set: {
            totalQuantity: sums.totalQuantity,
            totalPayable: sums.totalPayable,
            totalProfit: sums.totalProfit,
            stockEntry: stock._id,
            storeId // Ensure storeId is saved
          }
        },
        { upsert: true, new: true }
      );
    }));

    return reply.code(201).send({
      success: true,
      message: 'Stock added successfully',
      data: stock
    })
  } catch (err) {
    return reply.code(500).send({ success: false, message: err.message || 'Internal server error' });

  }
};


export const getStockByDate = async (req, res) => {
  console.log("✅ Get Stock By Date API called")
  console.log("req.query", req.params.date)
  try {
    const date = req.params.date || req.query.date;
    if (!date) {
      return res.code(400).send({ error: 'Date is required' });
    }

    const storeId = await getStoreId(req);
    if (!storeId) {
      return res.code(401).send({ error: 'Store not found' });
    }

    // Parse date to match only that day
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const stocks = await Stock.find({
      storeId, // Filter by storeId
      date: {
        $gte: start,
        $lte: end
      }
    })
      .populate({
        path: 'storeProductId.productId',
        populate: {
          path: 'masterProductId',
          model: 'MasterProduct'  // adjust to your actual model name
        }
      });

    return res.code(200).send({
      success: true,
      message: 'Stocks fetched successfully',
      data: stocks
    })
  } catch (err) {
    console.error('Error fetching stocks:', err);
    return res.code(500).send({ error: 'Server error' });
  }
};
