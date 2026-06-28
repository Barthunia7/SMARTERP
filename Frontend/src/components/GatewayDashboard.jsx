import React, { useState, useEffect } from 'react';

// 1. Define the Tally Menu Structure
const MENU_ITEMS = [
  { label: "Masters", type: "section" },
  { label: "Create Ledger", type: "item", link: "/ledgers/create", key: "L" },
  { label: "Alter Company", type: "item", link: "/company/alter", key: "A" },
  { label: "Transactions", type: "section" },
  { label: "Accounting Vouchers", type: "item", link: "/vouchers", key: "V" },
  { label: "Reports", type: "section" },
  { label: "Balance Sheet", type: "item", link: "/reports/balance-sheet", key: "B" },
  { label: "Profit & Loss A/c", type: "item", link: "/reports/pl", key: "P" },
  { label: "Quit", type: "item", link: "/quit", key: "Q" }
];

export default function GatewayDashboard(props) {
 
  // Active company state (replace with your global state or routing parameters if applicable)
  const currentCompanyId = localStorage.getItem('activeCompanyId') || '1'; 


  const [dashboardData, setDashboardData] = useState({
    companyName: "Loading...",
    lastVoucherDate: "..."
  });

  // Track keyboard selection index (Start at the first 'item', index 1)
  const [selectedIndex, setSelectedIndex] = useState(1);

  // Fetch backend API data
  useEffect(() => {
    fetch(`/api/dashboard/${currentCompanyId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setDashboardData(data))
    .catch(err => console.error("Error loading dashboard metrics:", err));
  }, [currentCompanyId]);

  // Handle Keyboard Navigation (Arrow Keys, Enter, and Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        let nextIndex = selectedIndex;
        do {
          nextIndex = (nextIndex + 1) % MENU_ITEMS.length;
        } while (MENU_ITEMS[nextIndex].type === 'section');
        setSelectedIndex(nextIndex);
      } 
      
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        let prevIndex = selectedIndex;
        do {
          prevIndex = (prevIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        } while (MENU_ITEMS[prevIndex].type === 'section');
        setSelectedIndex(prevIndex);
      } 
      
      else if (e.key === 'Enter') {
        e.preventDefault();
        handleAction(MENU_ITEMS[selectedIndex].link);
      } 
      
      // Tally Hotkey triggers (e.g., pressing 'V' opens Vouchers)
      else {
        const matchedItem = MENU_ITEMS.find(item => item.type === 'item' && item.key === key);
        if (matchedItem) {
          e.preventDefault();
          handleAction(matchedItem.link);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  // Handle routing action
  const handleAction = (link) => {
    console.log(`Navigating to: ${link}`);
    
    if (link === '/ledgers/create') {
      if (props.onNavigateToCreateLedger) {
        props.onNavigateToCreateLedger();
      }
    } else if (link === '/quit') {
      alert("Quitting SmartERP...");
    }
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#e2f0d9', height: '100vh', fontFamily: 'monospace', padding: '20px' }}>
      
      {/* Left Column: Company Meta Info */}
      <div style={{ width: '50%', borderRight: '2px solid #548235', padding: '10px' }}>
        <h2 style={{ color: '#385723' }}>{dashboardData.companyName}</h2>
        <p><strong>Last Voucher Date:</strong> {dashboardData.lastVoucherDate}</p>
      </div>

      {/* Right Column: Gateway Menu Container */}
      <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '350px', border: '2px solid #385723', backgroundColor: '#fff', boxShadow: '5px 5px 0px #385723' }}>
          
          <div style={{ backgroundColor: '#385723', color: '#fff', textAlign: 'center', padding: '5px', fontWeight: 'bold' }}>
            Gateway of SmartERP
          </div>

          <div style={{ padding: '10px 0' }}>
            {MENU_ITEMS.map((item, index) => {
              if (item.type === 'section') {
                return (
                  <div key={index} style={{ padding: '5px 20px', color: '#7f7f7f', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>
                    {item.label}
                  </div>
                );
              }

              const isActive = index === selectedIndex;
              // Highlight the Tally bold hotkey character in the label
              const charIndex = item.label.indexOf(item.key);
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    padding: '5px 30px', 
                    backgroundColor: isActive ? '#ffc000' : 'transparent', 
                    color: isActive ? '#000' : '#000',
                    cursor: 'pointer',
                    fontWeight: isActive ? 'bold' : 'normal'
                  }}
                  onClick={() => setSelectedIndex(index)}
                  onDoubleClick={() => handleAction(item.link)}
                >
                  {charIndex !== -1 ? (
                    <>
                      {item.label.substring(0, charIndex)}
                      <span style={{ color: isActive ? 'red' : '#c00000', fontWeight: 'bold', textDecoration: 'underline' }}>{item.key}</span>
                      {item.label.substring(charIndex + 1)}
                    </>
                  ) : item.label}
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
