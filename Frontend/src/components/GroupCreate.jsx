import React, { useState, useEffect, useRef } from 'react';

export default function GroupCreate({ onBack }) {
  const currentCompanyId = localStorage.getItem('activeCompanyId') || '1';

  const [formData, setFormData] = useState({
    name: '',
    parent_group: 'Primary' // Synchronizes with side panel list
  });

  // Core base Tally parent groups from your requirement specifications doc
  const parentGroupsList = ['Primary', 'Assets', 'Liabilities', 'Income', 'Expenses'];

  // Track focused element input rows index
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Track selected index row inside the right side listing panel container
  const [listSelectedIndex, setListSelectedIndex] = useState(0);

  const formRefs = [
    useRef(null), // 0: Group Name
    useRef(null), // 1: Under Parent Input Field
    useRef(null)  // 2: Accept Button
  ];

  // Sync keyboard focus down to input refs array lifecycle hooks
  useEffect(() => {
    if (formRefs[focusedIndex]?.current) {
      formRefs[focusedIndex].current.focus();
    }
  }, [focusedIndex]);

  // Sync current form data state value whenever sidebar layout array choice switches focus
  useEffect(() => {
    if (focusedIndex === 1) {
      setFormData(prev => ({ ...prev, parent_group: parentGroupsList[listSelectedIndex] }));
    }
  }, [listSelectedIndex, focusedIndex]);

  // Handle Form Keyboard Loops
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack(); // Drop straight back out onto Gateway
      }
      
      else if (e.key === 'Enter') {
        if (focusedIndex < formRefs.length - 1) {
          e.preventDefault();
          setFocusedIndex(focusedIndex + 1); // Jump down a field item row entry container
        }
      }
      
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // If focused on the parent block field box, navigate the SIDE PANEL LIST instead
        if (focusedIndex === 1) {
          if (listSelectedIndex > 0) {
            setListSelectedIndex(listSelectedIndex - 1);
          }
        } else if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1); // Standard backup form list loop traversal
        }
      }
      
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // If focused on the parent block field box, navigate the SIDE PANEL LIST instead
        if (focusedIndex === 1) {
          if (listSelectedIndex < parentGroupsList.length - 1) {
            setListSelectedIndex(listSelectedIndex + 1);
          }
        } else if (focusedIndex < formRefs.length - 1) {
          setFocusedIndex(focusedIndex + 1); // Descend down standard form layouts fields
        }
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [focusedIndex, listSelectedIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, company_id: currentCompanyId })
      });
      
      if (res.ok) {
        alert("Accounting Group Created Successfully inside NeonDB!");
        onBack();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to save group cluster.'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Database link connection timed out or exception error.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#e2f0d9', fontFamily: 'monospace', position: 'relative' }}>
      
      {/* Main Form Entry Card View Wrapper block container */}
      <div style={{ width: '420px', border: '2px solid #385723', backgroundColor: '#fff', boxShadow: '5px 5px 0px #385723', marginRight: focusedIndex === 1 ? '220px' : '0px', transition: 'margin 0.15s ease' }}>
        
        <div style={{ backgroundColor: '#385723', color: '#fff', padding: '6px 12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>Group Creation (Master)</span>
          <span style={{ color: '#ffc000', fontSize: '12px' }}>[Esc: Quit]</span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '25px 20px' }}>
          
          {/* 1. Group Name Input */}
          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '130px', fontWeight: 'bold', color: '#385723' }}>Group Name:</label>
            <input 
              ref={formRefs[0]} // 🟩 FIX: Added explicit index [0] here
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              required 
              onFocus={() => setFocusedIndex(0)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 0 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold' }} 
            />
          </div>

          {/* 2. Under Classification Input Field */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '130px', fontWeight: 'bold', color: '#385723' }}>Under:</label>
            <input 
              ref={formRefs[1]} // 🟩 FIX: Added explicit index [1] here
              name="parent_group" 
              type="text" 
              readOnly 
              value={formData.parent_group}
              onFocus={() => setFocusedIndex(1)}
              style={{ flex: 1, padding: '5px', border: '1px solid #385723', backgroundColor: focusedIndex === 1 ? '#ffc000' : '#fff', color: '#000', outline: 'none', fontWeight: 'bold', cursor: 'default' }}
            />
          </div>

          {/* 3. Accept Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              ref={formRefs[2]} // 🟩 FIX: Added explicit index [2] here
              type="submit"
              onFocus={() => setFocusedIndex(2)}
              style={{ 
                backgroundColor: focusedIndex === 2 ? '#385723' : '#ffc000', 
                color: focusedIndex === 2 ? '#fff' : '#000', 
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

      {/* 🟩 TALLY SIDE PANEL: Slides open automatically on right when 'Under' is highlighted focus */}
      {focusedIndex === 1 && (
        <div style={{ position: 'absolute', right: 'calc(50% - 430px)', top: 'calc(50% - 138px)', width: '220px', height: '276px', border: '2px solid #385723', backgroundColor: '#fff', boxShadow: '4px 4px 0px #385723', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div style={{ backgroundColor: '#385723', color: '#fff', textAlign: 'center', padding: '5px', fontWeight: 'bold', fontSize: '13px' }}>
            List of Parent Groups
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '5px 0' }}>
            {parentGroupsList.map((parentName, idx) => {
              const isSelected = idx === listSelectedIndex;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '4px 15px', 
                    backgroundColor: isSelected ? '#ffc000' : 'transparent', 
                    color: '#000', 
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setListSelectedIndex(idx)}
                >
                  {parentName}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
