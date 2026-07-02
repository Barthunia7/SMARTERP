const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==========================================
// 1. FINANCIAL REPORTS ENDPOINT
// ==========================================
router.get('/api/reports/financial/:company_id', async (req, res) => {
  const { company_id } = req.params;
  try {
    const ledgers = await pool.query(
      `SELECT name, group_type, current_balance FROM ledgers WHERE company_id = $1`,
      [company_id]
    );

    let sales = 0, purchases = 0, expenses = 0, assets = 0, liabilities = 0, equity = 0;
    let trialBalance = [];

    ledgers.rows.forEach(l => {
      const type = l.group_type.toLowerCase();
      // Ensure your sales running balance is inverted to positive for clear spreadsheet presentation
      const bal = type.includes('sales') ? Math.abs(parseFloat(l.current_balance || 0)) : (parseFloat(l.current_balance) || 0);

      // Trial Balance List Array Generation Mapping
      trialBalance.push({ name: l.name, type: l.group_type, balance: bal });

      if (type.includes('sales')) sales += bal;
      else if (type.includes('purchase')) purchases += bal;
      else if (type.includes('expense')) expenses += bal;
      else if (type.includes('asset') || type.includes('cash') || type.includes('bank')) assets += bal;
      else if (type.includes('liability') || type.includes('creditor')) liabilities += bal;
      else if (type.includes('capital') || type.includes('equity')) equity += bal;
    });


    const grossProfit = sales - purchases;
    const netProfit = grossProfit - expenses;

    res.json({
      profitLoss: { sales, purchases, expenses, grossProfit, netProfit },
      balanceSheet: { assets, liabilities, equity, netProfitRetained: netProfit },
      trialBalance: trialBalance
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 2. INVENTORY REPORTS ENDPOINT
// ==========================================
router.get('/api/reports/inventory/:company_id', async (req, res) => {
  const { company_id } = req.params;
  try {
    // Fetch Stock Summary & Low Stock Warnings (Threshold set to under 5 units)
    const stockItems = await pool.query(
      `SELECT id, name, sku, quantity, purchase_price, selling_price,
       (CASE WHEN quantity < 0 THEN 0 ELSE quantity END * purchase_price) AS valuation_at_cost
       FROM stock_items WHERE company_id = $1`,
      [company_id]
    );

    const summary = stockItems.rows.map(item => ({
      ...item,
      // Clamp dynamic float views to 0 to prevent negative rendering artifacts
      quantity: Math.max(0, parseInt(item.quantity || 0))
    }));


    const lowStock = summary.filter(item => item.quantity <= 5);
    const totalValuation = summary.reduce((sum, item) => sum + parseFloat(item.valuation_at_cost || 0), 0);

    res.json({
      stockSummary: summary,
      lowStockReport: lowStock,
      total_inventory_valuation: totalValuation
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 3. SALES & PURCHASE REPORTS ENDPOINT
// ==========================================
router.get('/api/reports/transactions/:company_id', async (req, res) => {
  const { company_id } = req.params;
  try {
    // Aggregate Daily and Monthly trends from Vouchers Table
    const salesTx = await pool.query(
      `SELECT date, voucher_number, narration 
       FROM vouchers 
       WHERE company_id = $1 AND voucher_type = 'SALES'
       ORDER BY date DESC`,
      [company_id]
    );

    const purchaseTx = await pool.query(
      `SELECT date, voucher_number, narration 
       FROM vouchers 
       WHERE company_id = $1 AND voucher_type = 'PURCHASE'
       ORDER BY date DESC`,
      [company_id]
    );

    res.json({
      salesRegister: salesTx.rows,
      purchaseRegister: purchaseTx.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 4. GST REPORTS ENDPOINT
// ==========================================
router.get('/api/reports/gst/:company_id', async (req, res) => {
  const { company_id } = req.params;
  try {
    // Calculates summary metrics from tax ledgers
    const taxLedgers = await pool.query(
      `SELECT name, current_balance FROM ledgers 
       WHERE company_id = $1 AND (name ILIKE '%CGST%' OR name ILIKE '%SGST%' OR name ILIKE '%IGST%')`,
      [company_id]
    );

    res.json({ taxSummary: taxLedgers.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
