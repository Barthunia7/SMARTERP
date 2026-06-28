import React, { useState, useEffect, useRef } from 'react';

export default function LedgerCreate({ onBack }) {
  const currentCompanyId = localStorage.getItem('activeCompanyId') || '1';

  const [formData, setFormData] = useState({
    name: '',
    group_type: '', // Syncs with list selection
    opening_balance: '0.00',
    state: 'Delhi',
    gstin: ''
  });

  // Database Groups state
  const [groups, setGroups] = useState([]);
  
  // Track focused element index for form navigation
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Track selected index inside the accounting groups side panel list
  const [groupListIndex, setGroupListIndex] = useState(0);

  const formRefs = [
    useRef(null), // 0: Name
    useRef(null), // 1: Group Input Container
    useRef(null), // 2: Opening Balance
    useRef(null), // 3: State
    useRef(null), // 4: GSTIN
    useRef(null)  // 5: Accept Button
  ];

    // Fetch groups dynamically from NeonDB on component load
  useEffect(() => {
    fetch(`/api/groups/${currentCompanyId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setGroups(data);
      if (data.length > 0) {

        setFormData(prev => ({ ...prev, group_type: data[0].name }));
      }
    })
    .catch(err => console.error("Error loading accounting groups:", err));
  }, [currentCompanyId]);

  // Handle active field keyboard locking loops
  useEffect(() => {
    if (formRefs[focusedIndex]?.current) {
      formRefs[focusedIndex].current.focus();
    }
  }, [focusedIndex]);

  // Update form data text whenever group panel selection changes
  useEffect(() => {
    if (groups.length > 0 && focusedIndex === 1) {
      setFormData(prev => ({ ...prev, group_type: groups[groupListIndex].name }));
    }
  }, [groupListIndex, focusedIndex, groups]);

  // Handle Global Form Keyboard Intercept Traversal
  useEffect(() => {
    const handleFormKeys = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
      
      else if (e.key === 'Enter') {
        if (focusedIndex < formRefs.length - 1) {
          e.preventDefault();
          setFocusedIndex(focusedIndex + 1); // Move focus forward down the fields
        }
      }
      
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // If focused on the Group input field, navigate the SIDE PANEL LIST instead
        if (focusedIndex === 1) {
          if (groupListIndex > 0) {
            setGroupListIndex(groupListIndex - 1);
          }
        } else if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1); // Normal form back-up navigation
        }
      }
      
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // If focused on the Group input field, navigate the SIDE PANEL LIST instead
        if (focusedIndex === 1) {
          if (groupListIndex < groups.length - 1) {
            setGroupListIndex(groupListIndex + 1);
          }
        } else if (focusedIndex < formRefs.length - 1) {
          setFocusedIndex(focusedIndex + 1); // Normal form descending navigation
        }
      }
    };

    window.addEventListener('keydown', handleFormKeys);
    return () => window.removeEventListener('keydown', handleFormKeys);
  }, [focusedIndex, groupListIndex, groups]);

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
        onBack();
      } else {
        alert(`Error: ${data.error || 'Failed to save ledger record.'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network exception or database connection timeout error.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#e2f0d9', fontFamily: 'monospace', position: 'relative' }}>
      
      {/* Main Ledger Creation Card Container */}
      <div style={{ width: '480px', border: '2px solid #385723', backgroundColor: '#fff', boxShadow: '5px 5px 0px #385723', marginRight: focusedIndex === 1 ? '220px' : '0px', transition: 'margin 0.15s ease' }}>
        
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

          {/* Under Accounting Group Display Input Field */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>Under (Group):</label>
            <input 
              ref={formRefs[1]} name="group_type" type="text" readOnly value={formData.group_type}
              onFocus={() => setFocusedIndex(1)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 1 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold', cursor: 'default' }}
            />
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

          {/* State Input */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>State:</label>
            <input 
              ref={formRefs[3]} name="state" type="text" value={formData.state} onChange={handleChange}
              onFocus={() => setFocusedIndex(3)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 3 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold' }} 
            />
          </div>

          {/* GSTIN Input */}
          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '160px', fontWeight: 'bold', color: '#385723' }}>GSTIN:</label>
            <input 
              ref={formRefs[4]} name="gstin" type="text" maxLength="15" placeholder="Optional" value={formData.gstin} onChange={handleChange}
              onFocus={() => setFocusedIndex(4)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 4 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold', textTransform: 'uppercase' }} 
            />
          </div>

          {/* Accept Submit Button */}
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
                fontSize: '14px'
              }}
            >
              Accept (Enter)
            </button>
          </div>

        </form>
      </div>

            {/* TALLY POP-UP SIDE PANEL PANEL: Shows up only when focused on 'Under (Group)' */}
      {focusedIndex === 1 && (
        <div style={{ position: 'absolute', right: 'calc(50% - 460px)', top: 'calc(50% - 193px)', width: '220px', height: '386px', border: '2px solid #385723', backgroundColor: '#fff', boxShadow: '4px 4px 0px #385723', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div style={{ backgroundColor: '#385723', color: '#fff', textAlign: 'center', padding: '5px', fontWeight: 'bold', fontSize: '13px' }}>
            List of Groups
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '5px 0' }}>
            {groups.map((group, idx) => {
              const isSelected = idx === groupListIndex;
              return (
                <div 
                  key={group.id} 
                  style={{ 
                    padding: '4px 15px', 
                    backgroundColor: isSelected ? '#ffc000' : 'transparent', 
                    color: '#000', 
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setGroupListIndex(idx)}
                >
                  {group.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
