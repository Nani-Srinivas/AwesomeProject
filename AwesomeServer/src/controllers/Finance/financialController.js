import DailyFinancial from '../../models/Finance/DailyFinancial.js';

export const listDailyFinancial = async (req, reply) => {
  try {
    const date = req.query.date || req.params.date;

    let filter = {};
    if (date) {
      const exactDate = new Date(date);
      exactDate.setUTCHours(0, 0, 0, 0);  // force UTC midnight
      filter.date = exactDate;
    }

    console.log("list daily Financial API is called");
    console.log("filter", filter);

    const docs = await DailyFinancial.find(filter)
      .populate('category', 'name')
      .sort({ 'category.name': 1 })
      .lean();

    const grandTotals = docs.reduce(
      (acc, doc) => {
        acc.totalPayable += doc.totalPayable || 0;
        acc.totalProfit += doc.totalProfit || 0;
        acc.totalQuantity += doc.totalQuantity || 0;
        return acc;
      },
      { totalPayable: 0, totalProfit: 0, totalQuantity: 0 }
    );

    return reply.send({
      date,
      grandTotals,
      data: docs
    });

  } catch (err) {
    req.log.error(err);
    reply.code(500).send({ error: err.message });
  }
};


export const getMonthSummary = async (req, reply) => {
  try {
    const { month, year, category } = req.query;
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23,59,59,999);
    const match = { date: { $gte: start, $lte: end } };
    if (category) match.category = category;
    const summary = await DailyFinancial.aggregate([
      { $match: match },
      { $group: {
          _id: '$category',
          totalQty:     { $sum: '$totalQuantity' },
          totalPayable: { $sum: '$totalPayable' },
          totalProfit:  { $sum: '$totalProfit' }
      }},
      { $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
      }},
      { $unwind: '$category' },
      { $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$category.name',
          totalQty: 1, totalPayable:1, totalProfit:1
      }}
    ]);
    return reply.send(summary);
  } catch (err) {
    req.log.error(err);
    reply.code(500).send({ error: err.message });
  }
};
