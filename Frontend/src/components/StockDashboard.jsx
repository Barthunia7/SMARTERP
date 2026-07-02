import React, { useState, useEffect } from 'react';

export default function StockDashboard({ companyId, onBack }) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟩 DAY 13: KEYBOARD ESCAPE INTERCEPTOR ROUTING TUNNEL
  useEffect(() => {
    const handleDashboardKeys = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack(); // Returns user safely back to Gateway Menu desk mouse-free
      }
    };
    window.addEventListener('keydown', handleDashboardKeys);
    return () => window.removeEventListener('keydown', handleDashboardKeys);
  }, [onBack]);

  // Fetch live inventory items data records matrix
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

  // Overall financial inventory cost valuation check loop (With floor clamps)
  const totalValuation = stock.reduce((sum, item) => {
    const qty = Math.max(0, parseInt(item.quantity || 0));
    const price = parseFloat(item.purchase_price || 0);
    return sum + (qty * price);
  }, 0);

  if (loading) {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
        <h3>Loading Inventory Matrix Summary...</h3>
      </div>
    );
  }
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', border: '2px solid #385723', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* DASHBOARD COMPONENT TOP LAYER BAR */}
        <div style={{ borderBottom: '2px solid #385723', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#385723' }}>Stock Summary (Inventory Dashboard)</h2>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>Company ID: {companyId}</span>
            <span style={{ fontSize: '11px', color: '#385723', fontWeight: 'bold' }}>💡 Press <b>Esc</b> to return to Gateway Menu</span>
          </div>
        </div>

        {/* FULL INVENTORY LINE RECORD DISPLAY ROWS TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc', marginTop: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #385723' }}>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Item Name</th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>SKU</th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>UOM</th>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Qty Available</th>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Pur. Price (₹)</th>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Sell. Price (₹)</th>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>GST %</th>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Total Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item, i) => {
              // 🟩 CLAMP NEGATIVE FLOAT indicators down safely to zero 
              const displayQty = Math.max(0, parseInt(item.quantity || 0));
              const displayTotalValue = displayQty * (parseFloat(item.purchase_price) || 0);

              return (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>{item.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc', color: '#555' }}>{item.sku || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{item.uom_name || 'N/A'}</td>
                  <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc', color: parseInt(item.quantity) <= 0 ? 'red' : '#000', fontWeight: parseInt(item.quantity) <= 0 ? 'bold' : 'normal' }}>
                    {displayQty}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>{parseFloat(item.purchase_price || 0).toFixed(2)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>{parseFloat(item.selling_price || 0).toFixed(2)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc', color: '#666' }}>{parseFloat(item.gst_rate || 0).toFixed(2)}%</td>
                  <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc', fontWeight: 'bold' }}>
                    ₹{displayTotalValue.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {stock.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No active stock records found in the warehouse grid system.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* VALUATION CALCULATIONS FOOTER BANNER BOX */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', border: '1px solid #385723', backgroundColor: '#fafafa', padding: '12px 15px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#385723' }}>
            Total Closing Stock Value: ₹{totalValuation.toFixed(2)}
          </div>
        </div>

      </div>
    </div>
  );
}
