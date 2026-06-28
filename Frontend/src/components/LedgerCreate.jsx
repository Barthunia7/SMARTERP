import React, { useState, useEffect, useRef } from 'react';

export default function LedgerCreate({ onBack }) {
  const currentCompanyId = localStorage.getItem('activeCompanyId') || '1';

  // Form Fields matched to NeonDB schema column names
  const [formData, setFormData] = useState({
    name: '',
    group_type: 'Sundry Debtors', // Default to Customers
    opening_balance: '0.00',
    state: 'Delhi',
    gstin: ''
  });

  // Track focused element index for keyboard iteration loops
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Create references for all sequential input element blocks
  const formRefs = [
    useRef(null), // Name [0]
    useRef(null), // Group [1]
    useRef(null), // Opening Balance [2]
    useRef(null), // State [3]
    useRef(null), // GSTIN [4]
    useRef(null)  // Accept Button [5]
  ];

  // Lifecycle to lock browser focus to the keyboard loop state
  useEffect(() => {
    if (formRefs[focusedIndex]?.current) {
      formRefs[focusedIndex].current.focus();
    }
  }, [focusedIndex]);

  // Handle Form Keyboard Traversal
  useEffect(() => {
    const handleFormKeys = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack(); // Hit Escape to leave and drop back to Gateway of SmartERP
      }
      
      else if (e.key === 'Enter') {
        // Prevent default submit action unless focused on the actual submit button
        if (focusedIndex < formRefs.length - 1) {
          e.preventDefault();
          setFocusedIndex(focusedIndex + 1); // Move focus forward down the layout list
        }
      }
      
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1); // Allow backing up via Up Arrow
        }
      }
      
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusedIndex < formRefs.length - 1) {
          setFocusedIndex(focusedIndex + 1); // Allow descending via Down Arrow
        }
      }
    };

    window.addEventListener('keydown', handleFormKeys);
    return () => window.removeEventListener('keydown', handleFormKeys);
  }, [focusedIndex]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/ledgers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, company_id: currentCompanyId })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Ledger Created Successfully in NeonDB!");
        onBack(); // Navigate cleanly back to dashboard
      } else {
        alert(`Error: ${data.error || 'Failed to save ledger record.'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network exception or database connection timeout error.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#e2f0d9', fontFamily: 'monospace' }}>
      <div style={{ width: '480px', border: '2px solid #385723', backgroundColor: '#fff', boxShadow: '5px 5px 0px #385723' }}>
        
        {/* Tally Top Screen Banner Header */}
        <div style={{ backgroundColor: '#385723', color: '#fff', padding: '6px 12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>Ledger Creation (Master)</span>
          <span style={{ fontSize: '12px', color: '#ffc000' }}>[Esc: Quit]</span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '25px 20px' }}>
          
          {/* Ledger Name Input */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>Name:</label>
            <input 
              ref={formRefs[0]} name="name" type="text" value={formData.name} onChange={handleChange} required
              onFocus={() => setFocusedIndex(0)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 0 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold' }} 
            />
          </div>

          {/* Under Accounting Group Select Dropdown */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>Under (Group):</label>
            <select 
              ref={formRefs[1]} name="group_type" value={formData.group_type} onChange={handleChange}
              onFocus={() => setFocusedIndex(1)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 1 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold' }}
            >
              <option value="Sundry Debtors">Sundry Debtors (Customers)</option>
              <option value="Sundry Creditors">Sundry Creditors (Suppliers)</option>
            </select>
          </div>

          {/* Opening Balance Field */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>Opening Balance:</label>
            <input 
              ref={formRefs[2]} name="opening_balance" type="number" step="0.01" value={formData.opening_balance} onChange={handleChange}
              onFocus={() => setFocusedIndex(2)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 2 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold' }} 
            />
          </div>

          {/* State Selection Input */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>State:</label>
            <input 
              ref={formRefs[3]} name="state" type="text" value={formData.state} onChange={handleChange}
              onFocus={() => setFocusedIndex(3)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 3 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold' }} 
            />
          </div>

          {/* Statutory Tax GSTIN Registration Input */}
          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>GSTIN:</label>
            <input 
              ref={formRefs[4]} name="gstin" type="text" maxLength="15" placeholder="Optional" value={formData.gstin} onChange={handleChange}
              onFocus={() => setFocusedIndex(4)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 4 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold', textTransform: 'uppercase' }} 
            />
          </div>

          {/* Final Commit Accept Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              ref={formRefs[5]} type="submit"
              onFocus={() => setFocusedIndex(5)}
              style={{ 
                backgroundColor: focusedIndex === 5 ? '#385723' : '#ffc000', 
                color: focusedIndex === 5 ? '#fff' : '#000', 
                border: '1px solid #385723', 
                padding: '6px 24px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: focusedIndex === 5 ? 'inset 0 0 4px #000' : 'none'
              }}
            >
              Accept (Enter)
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
