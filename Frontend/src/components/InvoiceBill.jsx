import React, { useState } from 'react';

export default function InvoiceBill({ voucherData, companyName, onClose }) {
  if (!voucherData) return null;

  // 🟩 DOCUMENT TYPE STATE ACCORDING TO SPECIFICATIONS
  const [docMode, setDocMode] = useState('GST INVOICE'); 

  const handlePrint = () => {
    window.print();
  };

    // 🟩 FIXED: Standardize variable lookups across both potential case signatures
  const activeItems = voucherData.inventory_items || voucherData.inventory_items || [];

  const totalQty = activeItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) || 0;
  const grossTotal = activeItems.reduce((sum, item) => sum + (parseFloat(item.total_amount || (item.quantity * item.rate))), 0) || 0;

  // Real-time tax evaluation engine rules 
  const gstRate = docMode === 'GST INVOICE' ? 0.18 : 0; 
  const gstAmount = grossTotal * gstRate;
  const grandTotal = grossTotal + gstAmount;

  return (
    <div className="no-print-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, overflowY: 'auto', padding: '40px 0' }}>
      
      {/* 🛠️ Print Layout Sheet Override Utility Layer */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice-pad, #printable-invoice-pad * { visibility: visible; }
          #printable-invoice-pad { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none !important; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Primary Worksheet Card Container */}
      <div id="printable-invoice-pad" style={{ backgroundColor: '#fff', width: '210mm', minHeight: '297mm', padding: '30px', fontFamily: 'monospace', color: '#000', boxShadow: '0px 10px 30px rgba(0,0,0,0.3)', border: '1px solid #333', position: 'relative', boxSizing: 'border-box' }}>
        
        {/* TOP CONTROL HEADERS PANEL (AUTOMATICALLY STRIPPED ON PRINT PAPER) */}
        <div className="no-print" style={{ backgroundColor: '#f5f5f5', border: '1px dashed #385723', padding: '15px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 'bold', display: 'block', color: '#385723', marginBottom: '8px' }}>⚡ Day 11 Billing Document Suite Controller</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDocMode('GST INVOICE')} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #000', cursor: 'pointer', backgroundColor: docMode === 'GST INVOICE' ? '#ffc000' : '#fff' }}>GST Invoice</button>
              <button onClick={() => setDocMode('PROFORMA INVOICE')} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #000', cursor: 'pointer', backgroundColor: docMode === 'PROFORMA INVOICE' ? '#ffc000' : '#fff' }}>Proforma</button>
              <button onClick={() => setDocMode('QUOTATION')} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #000', cursor: 'pointer', backgroundColor: docMode === 'QUOTATION' ? '#ffc000' : '#fff' }}>Quotation</button>
              <button onClick={() => setDocMode('ESTIMATE')} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #000', cursor: 'pointer', backgroundColor: docMode === 'ESTIMATE' ? '#ffc000' : '#fff' }}>Estimate</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} style={{ backgroundColor: '#385723', color: '#fff', border: 'none', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Print Invoice</button>
            <button onClick={onClose} style={{ backgroundColor: '#777', color: '#fff', border: 'none', padding: '8px 12px', cursor: 'pointer' }}>Close (Esc)</button>
          </div>
        </div>

        {/* COMPANY LETTERHEAD WRAPPER BLOCK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #000', padding: '15px', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: '0 0 5px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{companyName || "Demo Company Pvt Ltd"}</h2>
            <p style={{ margin: '0', fontSize: '12px', color: '#444' }}>Main Business Hub Workspace Plaza, Delhi, India</p>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid #000', paddingLeft: '20px' }}>
            <h3 style={{ margin: '0', color: '#385723', fontWeight: 'bold', letterSpacing: '1px' }}>{docMode}</h3>
            <span style={{ fontSize: '11px', color: '#666' }}>Original for Buyer</span>
          </div>
        </div>
        {/* AUTOMATED REFERENCE METRICS INFRASTRUCTURE ROW */}
        <div style={{ display: 'flex', border: '1px solid #000', borderTop: 'none', fontSize: '13px' }}>
          <div style={{ flex: 1, padding: '10px', borderRight: '1px solid #000', lineHeight: '1.6' }}>
            <strong>Bill To / Particular Customer:</strong><br />
            Sundry Debtor General Corporate Client A/c<br />
            Place of Supply: State Registration Code [Delhi - 07]
          </div>
          <div style={{ flex: 1, padding: '10px', lineHeight: '1.6' }}>
            {/* COMPLIANCE CHECK: AUTOMATED INVOICE NUMBER FORMATTING */}
            <strong>Invoice Reference No:</strong> {voucherData.voucher_number ? `INV-${voucherData.voucher_number.padStart(4, '0')}` : 'INV-0034'}<br />
            <strong>Date of Issue:</strong> {voucherData.date || new Date().toLocaleDateString()}<br />
            <strong>Transaction Type:</strong> {voucherData.voucher_type || "SALES"} Mode
          </div>
        </div>

        {/* ITEMIZED GOODS VALUATION GRID WORKSHEET SPREADSHEET */}
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #000', fontSize: '13px' }}>
              <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'center', width: '40px' }}>S.No</th>
              <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'left' }}>Description of Stock Goods Particulars</th>
              <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right', width: '80px' }}>Quantity</th>
              <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right', width: '100px' }}>Rate (₹)</th>
              <th style={{ padding: '8px', textAlign: 'right', width: '130px' }}>Net Value (₹)</th>
            </tr>
          </thead>
                    <tbody>
            {/* 🟩 FIXED: Mapping the unified activeItems array variable */}
            {activeItems.length > 0 ? (
              activeItems.map((item, idx) => (
                <tr key={idx} style={{ fontSize: '13px', borderBottom: '1px solid #ccc' }}>
                  <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ borderRight: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>{item.name}</td>
                  <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right' }}>{parseFloat(item.rate).toFixed(2)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>₹{parseFloat(item.total_amount || (item.quantity * item.rate)).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No linked inventory data records found.</td>
              </tr>
            )}


            {/* Aesthetic blank line placeholders spacing block cells filler */}
            {Array.from({ length: Math.max(0, 8 - (voucherData.inventory_items?.length || 0)) }).map((_, i) => (
              <tr key={`filler-${i}`} style={{ height: '28px' }}>
                <td style={{ borderRight: '1px solid #000' }}></td>
                <td style={{ borderRight: '1px solid #000' }}></td>
                <td style={{ borderRight: '1px solid #000' }}></td>
                <td style={{ borderRight: '1px solid #000' }}></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* COMPLEX TRANSACTIONAL BALANCE SUMMARY FOOTER SPLIT */}
        <div style={{ display: 'flex', border: '1px solid #000', borderTop: 'none', fontSize: '13px' }}>
          <div style={{ flex: 1.2, padding: '10px', borderRight: '1px solid #000', lineHeight: '1.8' }}>
            <strong>Declaration Check Remarks:</strong><br />
            We declare that this statement document shows the actual prices of the description items goods particulars indicated above.
          </div>
          <div style={{ flex: 1, padding: '10px', lineHeight: '1.8', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gross Sub-Total Value:</span>
              <span>₹{grossTotal.toFixed(2)}</span>
            </div>
            {docMode === 'GST INVOICE' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#444' }}>
                  <span>Central CGST (9%):</span>
                  <span>₹{(gstAmount / 2).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#444', borderBottom: '1px dotted #000', paddingBottom: '4px' }}>
                  <span>State SGST (9%):</span>
                  <span>₹{(gstAmount / 2).toFixed(2)}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', paddingTop: '4px', color: '#385723' }}>
              <span>Grand Total Due:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Corporate Authorized Validation Line Box Footer signature blocks */}
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <strong>Total Items Box Counts Accumulation:</strong> {totalQty} units packed.
          </div>
          <div style={{ textAlign: 'center', width: '220px', borderTop: '1px dashed #000', paddingTop: '6px', marginTop: '30px' }}>
            For {companyName || "Demo Company Pvt Ltd"}<br />
            <span style={{ fontSize: '10px', color: '#444', display: 'block', marginTop: '15px' }}>Authorized Accountant Signature</span>
          </div>
        </div>

      </div>
    </div>
  );
}
