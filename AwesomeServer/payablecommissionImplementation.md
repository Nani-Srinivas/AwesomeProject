# Split Vendor Commission Implementation Plan

## Scenario Description (Word by Word)

> Scenario: i am a store manager i have tieups with differnt vendors for the bulk produccts, for example we will take milk products while we connect to the distributors of the milk like heritage. jersey, vijaya we have differnt things like we will get profits of the sales in 2 was 1 method you get daily base commissioned bill example if we order vijaya products we will get the bill for the payable for the products with full discounted price like if the Toned milk selling price is 62rupee for the liter we will get it for 57 rupee liter which the bill for number of quantity is we order from the vijaya vendor, but the 2nd method is we get 5 rupee is divided and given 1 rupee discount on the selling price on the day base and remaing 4 rupee multiple for complete month 30days and credited into your account, in my application i have the code for the payables bill generation based on the selling price and cost price difference as the profit but only vijaya i am getting the bill generated correctly as it will be calculated for the spot discount but for heritage i get the wrong bill generated as it has discount price on the same day and and remaining as commission for the entire month, how we can solve this issue i need you to understand the scenatio and look at the code which is generating the payable related files and suggest some implementation to achieve this scenario.

## The Problem

In the current codebase:
1.  **Vijaya Method (Spot Discount):** `Cost Price = 57`, `Selling Price = 62`. Profit = 5. Payable = 57. This works fine.
2.  **Heritage Method (Split Discount):** `Cost Price = 61` (what you pay on delivery), `Selling Price = 62`. Current logic only shows **Profit = 1**, ignoring the **4 rupee monthly commission**.
3.  If you set `Cost Price = 57`, the Profit is correct (5), but the **Payable** to the vendor becomes incorrect (57 instead of 61).

## Implementation Plan

To solve this, we will introduce a `commission` field in the product settings.

### 1. Database Schema Updates

- **[MODIFY] StoreProduct Model:** 
    - Add a `commission` field (Number, default 0). 
    - This will track the deferred profit (e.g., the 4 rupees for Heritage).
- **[MODIFY] DailyFinancial Model:** 
    - Add a `totalCommission` field.

### 2. Logic Updates (Stock Controller)

- **[MODIFY] `addStock` in `src/controllers/Store/Stock.js`:**
    - Update the profit calculation formula:
        ```javascript
        directProfit = (sellingPrice - costPrice) * quantity;
        deferredCommission = commission * quantity;
        totalProfit = directProfit + deferredCommission;
        ```
    - The `totalPayable` will remain as `costPrice * quantity`, which correctly reflects the vendor's daily bill (e.g., 61 for Heritage).

### 3. Reporting

- **[MODIFY] `financialController.js`:**
    - Ensure the reports pull the aggregate `totalProfit` which now includes both the direct margin and the deferred commission.
    - Optionally show "Commission" as a separate field for better bookkeeping.

## Open Questions for User Review

- [ ] **Bulk Upload:** Should the `commission` field be added to the bulk upload CSV template?
- [ ] **Finance UI:** Should we show "Spot Profit" vs "Commission Profit" separately in the app, or is one "Total Profit" enough?



---------------------------------------------------
Implementation Plan
---------------------------------------------------

Split Commission Calculator Implementation Plan
This implementation plan outlines the exact changes required to correctly compute daily payables and spot vs. deferred margins for different types of vendors (like Heritage vs Vijaya).

Overview
We will introduce a commission field at the StoreProduct and DailyFinancial levels. The commission represents the deferred or delayed margin (e.g. ₹4 paid at the end of the month for Heritage).

When processing stock:

Cost Price will now strictly mean Invoice/Spot Price.
Total Payable will remain Cost Price * Quantity.
Total Profit will be upgraded to ((Selling Price - Cost Price) + Commission) * Quantity.
We will track totalCommission independently for clearer financial tracking for the user.
User Review Required
IMPORTANT

By adding commission to StoreProduct, you will need to map this field if you do bulk CSV uploads. Existing records will default to 0. Is default 0 acceptable?
Total Profit presented in financialController.js will now automatically include both the spot profit + delayed commission. Is this the intended behavior for the reports?
Proposed Changes
Models
[MODIFY] 
StoreProduct.js
Add a new commission field to StoreProductSchema of type Number with a default of 0 and min of 0.
Remove duplicate description: String, line.
[MODIFY] 
DailyFinancial.js
Add a new totalCommission field of type Number with a default of 0 to keep track of the deferred profits for that specific day.
Controllers
[MODIFY] 
Stock.js
In the addStock method, when calculating byCat (around line 72):
Initialize totalCommission: 0 alongside other keys.
Extract const commission = sp.commission || 0; alongside cp and spx.
Update math formulas:
totalProfit += ((spx - cp) * quantity) + (commission * quantity)
totalCommission += (commission * quantity)
In the DailyFinancial.findOneAndUpdate mapping, save the new sums.totalCommission field to totalCommission.
[MODIFY] 
financialController.js
In listDailyFinancial: Include doc.totalCommission in the grandTotals accumulator, appending it to the grand total response.
In getMonthSummary: Use $sum: '$totalCommission' inside the MongoDB aggregation match to also return the totalCommission for the monthly review screen.
Verification Plan
Automated/Manual Testing
Use an existing API tool (or direct HTTP request) to trigger addStock for a mock product.
Verify that the sum of totalProfit strictly equals Spot Profit + Monthly Commission inside the database.
Verify that totalPayable remains untouched and acts normally.
Verify /finance/daily or /finance/monthly responses to ensure grandTotals handles default: 0 correctly and exposes totalCommission.
