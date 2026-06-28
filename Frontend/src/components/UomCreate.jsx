import React, { useRef, useEffect } from 'react';

export default function UomCreate({ companyId, onBack }) {
  const symbolRef = useRef(null);
  const formalNameRef = useRef(null);

  // 🟩 ADDED GLOBAL WINDOW KEYBOARD LISTENER
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onBack]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
        const payload = {
      company_id: companyId,
      symbol: symbolRef.current.value.toUpperCase().trim(), // 🟩 Force Uppercase (e.g., LTR)
      formal_name: formalNameRef.current.value.trim(),
    };

    if (!payload.symbol) {
      alert('Symbol is required (e.g., PCS, KG)');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/uoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert('Unit of Measure created successfully!');
      symbolRef.current.value = '';
      formalNameRef.current.value = '';
      symbolRef.current.focus();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div 
      onKeyDown={(e) => { if (e.key === 'Escape') onBack(); }} 
      tabIndex="0" 
      style={{ outline: 'none', padding: '20px', fontFamily: 'monospace', backgroundColor: '#f4f4f4', minHeight: '100vh' }}
    >
      <div style={{ maxWidth: '400px', backgroundColor: '#fff', padding: '20px', border: '1px solid #ccc' }}>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: 0 }}>Create Unit of Measure</h3>
        <p style={{ fontSize: '11px', color: '#666' }}>💡 Press <b>Esc</b> to return to Gateway menu workspace</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div>
            <label style={{ display: 'inline-block', width: '130px' }}>Symbol:</label>
            <input 
              ref={symbolRef} 
              type="text" 
              placeholder="e.g., PCS" 
              onKeyDown={(e) => handleKeyDown(e, formalNameRef)} 
              autoFocus 
              style={{ padding: '4px', fontFamily: 'monospace' }}
            />
          </div>
          <div>
            <label style={{ display: 'inline-block', width: '130px' }}>Formal Name:</label>
            <input 
              ref={formalNameRef} 
              type="text" 
              placeholder="e.g., Pieces" 
              onKeyDown={(e) => handleKeyDown(e, null)} 
              style={{ padding: '4px', fontFamily: 'monospace' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
