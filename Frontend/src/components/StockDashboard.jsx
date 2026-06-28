import React, { useState, useEffect } from 'react';

export default function StockCreate({ companyId, onBack }) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    
    fetch(`http://localhost:5000/api/stock-dashboard/${companyId}`)
      .then((res) => res.json())
      .then((data) => {
        setStock(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching inventory summary:', err);
        setLoading(false);
      });
  }, [companyId]);

  // Calculate overall financial value of stored stock
  const totalValuation = stock.reduce((sum, item) => sum + (item.quantity * item.purchase_price), 0);

  if (loading) return <div style={{ fontFamily: 'monospace', padding: '20px' }}>Loading Inventory Matrix...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#fff', color: '#000' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <h2>Stock Summary (Inventory Dashboard)</h2>
        <span style={{ fontWeight: 'bold' }}>Company ID: {companyId}</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '1px solid #000' }}>
            <th style={{ padding: '8px' }}>Item Name</th>
            <th style={{ padding: '8px' }}>SKU</th>
            <th style={{ padding: '8px' }}>UOM</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Pur. Price</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Sell. Price</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>GST %</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {stock.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No inventory records found.</td>
            </tr>
          ) : (
            stock.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.name}</td>
                <td style={{ padding: '8px' }}>{item.sku || '-'}</td>
                <td style={{ padding: '8px' }}>{item.uom || 'N/A'}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>₹{parseFloat(item.purchase_price).toFixed(2)}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>₹{parseFloat(item.selling_price).toFixed(2)}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{item.gst_percentage}%</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                  ₹{(item.quantity * item.purchase_price).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Tally-Style Valuation Footer Bar */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #000', backgroundColor: '#f9f9f9', textAlign: 'right' }}>
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Total Closing Stock Value: ₹{totalValuation.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
