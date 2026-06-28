// Backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); 

const authMiddleware = require('../middleware/auth.js'); 

// Fetch dashboard state for a specific company
router.get('/:companyId', authMiddleware, async (req, res) => {
    try {
        const { companyId } = req.params;
        const userId = req.user.id; // From authMiddleware

        // 1. Verify company belongs to user
        const companyCheck = await pool.query(
            'SELECT id, company_name, state, gst_number FROM companies WHERE id = $1 AND user_id = $2',
            [companyId, userId]
        );

        if (companyCheck.rows.length === 0) {
            return res.status(404).json({ message: "Company not found or unauthorized" });
        }

        const company = companyCheck.rows[0];

            // 2. Fetch last voucher entry date (Safely handle if table does not exist yet)
    let lastVoucherDate = "No Vouchers Entry";
    
    try {
        const lastVoucherQuery = await pool.query(
            'SELECT created_at FROM invoices WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1',
            [companyId]
        );
        
        if (lastVoucherQuery.rows.length > 0) {
            lastVoucherDate = new Date(lastVoucherQuery.rows[0].created_at).toLocaleDateString('en-IN');
        }
    } catch (tableError) {
        // Fallback gracefully since invoices table is scheduled for later project days
        lastVoucherDate = "No Vouchers Entry";
    }

    // 3. Send combined dashboard payload response
    return res.status(200).json({
        companyName: company.company_name,
        state: company.state,
        gstNumber: company.gst_number,
        lastVoucherDate: lastVoucherDate
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
