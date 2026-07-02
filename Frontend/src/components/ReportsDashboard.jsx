import React, { useState, useEffect } from 'react';

export default function ReportsDashboard({ companyId, onBack }) {
  // Tab selections mapping: FINANCIAL, INVENTORY, TRANSACTIONS, GST
  const [activeTab, setActiveTab] = useState('FINANCIAL'); 
  const [finData, setFinData] = useState(null);
  const [invData, setInvData] = useState(null);
  const [txData, setTxData] = useState(null);
  const [gstData, setGstData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟩 DAY 13: Define tabs list for array index lookup calculations
  const tabsList = ['FINANCIAL', 'INVENTORY', 'TRANSACTIONS', 'GST'];
  const [menuFocusIndex, setMenuFocusIndex] = useState(0);

  // Synchronize focus highlights if a user clicks an option manually with their mouse
  useEffect(() => {
    const matchedIdx = tabsList.indexOf(activeTab);
    if (matchedIdx !== -1) setMenuFocusIndex(matchedIdx);
  }, [activeTab]);

  // 🟩 DAY 13 UP/DOWN ARROW KEY NAVIGATION CONTROLLER LISTENER
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
      
      // Move selection highlight DOWN
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMenuFocusIndex((prevIdx) => (prevIdx + 1) % tabsList.length);
      }
      
      // Move selection highlight UP
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMenuFocusIndex((prevIdx) => (prevIdx - 1 + tabsList.length) % tabsList.length);
      }
      
      // Activate the highlighted tab view on pressing Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        setActiveTab(tabsList[menuFocusIndex]);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [menuFocusIndex, onBack]);

  // Aggregate data dynamically from all four backend report channels in parallel
  useEffect(() => {
    if (!companyId) return;
    setLoading(true);

    Promise.all([
      fetch(`http://localhost:5000/api/reports/financial/${companyId}`).then(res => res.json()),
      fetch(`http://localhost:5000/api/reports/inventory/${companyId}`).then(res => res.json()),
      fetch(`http://localhost:5000/api/reports/transactions/${companyId}`).then(res => res.json()),
      fetch(`http://localhost:5000/api/reports/gst/${companyId}`).then(res => res.json())
    ])
    .then(([fin, inv, tx, gst]) => {
      setFinData(fin);
      setInvData(inv);
      setTxData(tx);
      setGstData(gst);
      setLoading(false);
    })
    .catch(err => console.error("Error collecting system reports data matrix:", err));
  }, [companyId]);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
        <h3>Assembling Multi-Tier Master Reports Module View...</h3>
      </div>
    );
  }
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* LEFT VIEW: SIDEBAR SELECTOR PANEL WITH DAY 13 ARROW FOCUS OUTLINES */}
        <div style={{ width: '250px', backgroundColor: '#fff', border: '2px solid #002060', padding: '15px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#002060', borderBottom: '2px solid #002060', paddingBottom: '5px' }}>Reports Module</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <button 
              onClick={() => setActiveTab('FINANCIAL')} 
              style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #ccc', 
                backgroundColor: activeTab === 'FINANCIAL' ? '#ffc000' : (menuFocusIndex === 0 ? '#e2e2e2' : '#fff'),
                outline: menuFocusIndex === 0 ? '2px solid #002060' : 'none' }}
            >
              📊 Financial Reports
            </button>
            
            <button 
              onClick={() => setActiveTab('INVENTORY')} 
              style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #ccc', 
                backgroundColor: activeTab === 'INVENTORY' ? '#ffc000' : (menuFocusIndex === 1 ? '#e2e2e2' : '#fff'),
                outline: menuFocusIndex === 1 ? '2px solid #002060' : 'none' }}
            >
              📦 Inventory Reports
            </button>
            
            <button 
              onClick={() => setActiveTab('TRANSACTIONS')} 
              style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #ccc', 
                backgroundColor: activeTab === 'TRANSACTIONS' ? '#ffc000' : (menuFocusIndex === 2 ? '#e2e2e2' : '#fff'),
                outline: menuFocusIndex === 2 ? '2px solid #002060' : 'none' }}
            >
              📈 Sales & Purchase
            </button>
            
            <button 
              onClick={() => setActiveTab('GST')} 
              style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #ccc', 
                backgroundColor: activeTab === 'GST' ? '#ffc000' : (menuFocusIndex === 3 ? '#e2e2e2' : '#fff'),
                outline: menuFocusIndex === 3 ? '2px solid #002060' : 'none' }}
            >
              📋 GST Reports
            </button>

          </div>
          <button onClick={onBack} style={{ width: '100%', marginTop: '30px', padding: '8px', backgroundColor: '#777', color: '#fff', border: 'none', cursor: 'pointer' }}>Back (Esc)</button>
        </div>

        {/* RIGHT VIEW: DYNAMIC RENDERING DATA MODULE PANELS */}
        <div style={{ flex: 1, backgroundColor: '#fff', border: '2px solid #002060', padding: '20px', minHeight: '500px' }}>
          
          {/* TAB 1: FINANCIAL REPORTS PANEL */}
          {activeTab === 'FINANCIAL' && finData && (
            <div>
              <h3 style={{ color: '#002060', margin: '0 0 15px 0' }}>Financial Reports</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                <div style={{ flex: 1, border: '1px solid #ccc', padding: '12px', backgroundColor: '#fafafa' }}>
                  <strong>Profit & Loss Summary:</strong><hr/>
                  <div>Gross Profit: ₹{parseFloat(finData.profitLoss.grossProfit).toFixed(2)}</div>
                  {/* DYNAMIC TEXT TOGGLE FOR NET PROFIT VS NET LOSS VALUE RENDERING */}
                  <div style={{ fontWeight: 'bold', color: finData.profitLoss.netProfit >= 0 ? 'green' : 'red' }}>
                    {finData.profitLoss.netProfit >= 0 ? 'Net Profit: ' : 'Net Loss: '}
                    ₹{Math.abs(parseFloat(finData.profitLoss.netProfit)).toFixed(2)}
                  </div>
                </div>
                <div style={{ flex: 1, border: '1px solid #ccc', padding: '12px', backgroundColor: '#fafafa' }}>
                  <strong>Balance Sheet Summary:</strong><hr/>
                  <div>Total Assets: ₹{parseFloat(finData.balanceSheet.assets).toFixed(2)}</div>
                  <div>Liabilities + Equity: ₹{(parseFloat(finData.balanceSheet.liabilities) + parseFloat(finData.balanceSheet.equity)).toFixed(2)}</div>
                </div>
              </div>
              
              <h4>Trial Balance Statement Worksheet:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Ledger Name</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Account Group</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {finData.trialBalance.map((tb, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{tb.name}</td>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{tb.type}</td>
                      <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc', fontWeight: 'bold' }}>₹{parseFloat(tb.balance).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* TAB 2: INVENTORY REPORTS PANEL */}
          {activeTab === 'INVENTORY' && invData && (
            <div>
              <h3 style={{ color: '#002060', margin: '0 0 15px 0' }}>Inventory Reports</h3>
              <div style={{ border: '1px solid #ccc', padding: '12px', backgroundColor: '#fff2cc', marginBottom: '20px', fontWeight: 'bold', color: '#b26b00' }}>
                Gross Total Closing Stock Valuation At Cost: ₹{parseFloat(invData.total_inventory_valuation).toFixed(2)}
              </div>
              <h4 style={{ color: 'red', margin: '15px 0 5px 0' }}>⚠️ Low Stock Warnings Register (Items &lt;= 5 units):</h4>
              <ul>
                {invData.lowStockReport.map((item, i) => (
                  <li key={i} style={{ color: 'red', fontWeight: 'bold', marginBottom: '4px' }}>{item.name} (SKU: {item.sku}) - Only {item.quantity} units left!</li>
                ))}
                {invData.lowStockReport.length === 0 && <p style={{ color: 'green' }}>All stock levels are completely healthy.</p>}
              </ul>
              
              <h4 style={{ marginTop: '20px' }}>Full Stock Summary Ledger:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Item</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>SKU</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Qty Available</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invData.stockSummary.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{item.name}</td>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{item.sku}</td>
                      <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>₹{parseFloat(item.selling_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: TRANSACTION REPORTS PANEL */}
          {activeTab === 'TRANSACTIONS' && txData && (
            <div>
              <h3 style={{ color: '#002060', margin: '0 0 15px 0' }}>Sales & Purchase Registers</h3>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <h4>Daily/Monthly Sales Book:</h4>
                  <ol>
                    {txData.salesRegister.map((tx, i) => (
                      <li key={i} style={{ fontSize: '13px', marginBottom: '6px' }}><b>{new Date(tx.date).toLocaleDateString()}</b> - Doc: {tx.voucher_number} ({tx.narration})</li>
                    ))}
                  </ol>
                </div>
                <div style={{ flex: 1 }}>
                  <h4>Purchase Book Log:</h4>
                  <ol>
                    {txData.purchaseRegister.map((tx, i) => (
                      <li key={i} style={{ fontSize: '13px', marginBottom: '6px' }}><b>{new Date(tx.date).toLocaleDateString()}</b> - Doc: {tx.voucher_number} ({tx.narration})</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GST TAX LIABILITY REPORT PANEL */}
          {activeTab === 'GST' && gstData && (
            <div>
              <h3 style={{ color: '#002060', margin: '0 0 15px 0' }}>GST Reports (Tax Summary)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Tax Duty Component Account</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Collected Liability Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {gstData.taxSummary.map((tax, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #ccc' }}>{tax.name}</td>
                      <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc', fontWeight: 'bold' }}>₹{parseFloat(tax.current_balance).toFixed(2)}</td>
                    </tr>
                  ))}
                  {gstData.taxSummary.length === 0 && (
                    <tr><td colSpan="2" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>No dynamic GST records currently generated in the ledger pools.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
