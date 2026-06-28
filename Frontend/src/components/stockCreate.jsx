import React, { useRef, useState, useEffect } from 'react';

export default function StockCreate({ companyId, onBack }) {
  const nameRef = useRef(null);
  const skuRef = useRef(null);
  const purchaseRef = useRef(null);
  const sellingRef = useRef(null);
  const qtyRef = useRef(null);
  const gstRef = useRef(null);
  const uomInputRef = useRef(null);

  const [uoms, setUoms] = useState([]);
  const [showUomList, setShowUomList] = useState(false);
  const [selectedUomIndex, setSelectedUomIndex] = useState(0);
  const [chosenUom, setChosenUom] = useState({ id: null, symbol: 'Not Applicable' });

  // Global Keyboard Listener for Escape Key
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

  // Load fresh UOM data on mount
  useEffect(() => {
    if (!companyId) return;
    fetch(`http://localhost:5000/api/uoms/${companyId}?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => setUoms([{ id: null, symbol: 'Not Applicable' }, ...data]))
      .catch((err) => console.error('Error loading UOM records:', err));
  }, [companyId]);

  // Handle Enter Key focused shifts for normal inputs
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

  // 🟩 CUSTOM TALLY-STYLE KEYBOARD LIST NAVIGATION FOR UOM
  const handleUomKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowUomList(true);
      setSelectedUomIndex((prev) => (prev + 1) % uoms.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowUomList(true);
      setSelectedUomIndex((prev) => (prev - 1 + uoms.length) % uoms.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showUomList && uoms[selectedUomIndex]) {
        // Select active item from keyboard list matrix
        setChosenUom(uoms[selectedUomIndex]);
        setShowUomList(false);
        purchaseRef.current.focus(); // Jump to purchase price field instantly
      } else {
        setShowUomList(true);
      }
    }
  };

  const handleSubmit = async () => {
    const payload = {
      company_id: companyId,
      name: nameRef.current.value,
      sku: skuRef.current.value,
      purchase_price: parseFloat(purchaseRef.current.value) || 0,
      selling_price: parseFloat(sellingRef.current.value) || 0,
      quantity: parseInt(qtyRef.current.value) || 0,
      gst_percentage: parseFloat(gstRef.current.value) || 0,
      uom_id: chosenUom.id
    };

    try {
      const response = await fetch('http://localhost:5000/api/stock-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert('Stock item created successfully!');
      
      nameRef.current.value = '';
      skuRef.current.value = '';
      purchaseRef.current.value = '';
      sellingRef.current.value = '';
      qtyRef.current.value = '';
      gstRef.current.value = '';
      setChosenUom({ id: null, symbol: 'Not Applicable' });
      setSelectedUomIndex(0);
      nameRef.current.focus();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '500px', backgroundColor: '#fff', padding: '20px', border: '1px solid #ccc' }}>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: 0 }}>Stock Item Creation</h3>
        <p style={{ fontSize: '11px', color: '#666' }}>💡 Use Up/Down Arrows + Enter inside Unit box to pick options.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'inline-block', width: '150px' }}>Item Name:</label>
            <input ref={nameRef} type="text" onKeyDown={(e) => handleKeyDown(e, skuRef)} autoFocus />
          </div>
          
          <div>
            <label style={{ display: 'inline-block', width: '150px' }}>SKU:</label>
            <input ref={skuRef} type="text" onKeyDown={(e) => handleKeyDown(e, uomInputRef)} />
          </div>
          
          {/* 🟩 UPGRADED KEYBOARD SELECTION PANEL */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'inline-block', width: '150px' }}>Unit of Measure:</label>
            <input 
              ref={uomInputRef}
              type="text" 
              readOnly 
              value={chosenUom.symbol}
              onKeyDown={handleUomKeyDown}
              onFocus={() => setShowUomList(true)}
              onBlur={() => setTimeout(() => setShowUomList(false), 200)}
              style={{ width: '167px', cursor: 'pointer', backgroundColor: '#fffbf0', fontWeight: 'bold', padding: '2px' }}
            />
            
            {showUomList && (
              <div style={{ position: 'absolute', left: '150px', top: '24px', width: '173px', border: '1px solid #000', backgroundColor: '#fff', zIndex: 100, maxQuantity: '150px', overflowY: 'auto' }}>
                {uoms.map((unit, index) => {
                  const isCurrent = index === selectedUomIndex;

                  return (
                    <div 
                      key={unit.id || 'na'} 
                      style={{ 
                        padding: '4px 8px', 
                        backgroundColor: isCurrent ? '#ffc000' : 'transparent', 
                        fontWeight: isCurrent ? 'bold' : 'normal',
                        color: '#000',
                        cursor: 'pointer'
                      }}
                      onMouseDown={() => {
                        setChosenUom(unit);
                        purchaseRef.current.focus();
                      }}
                    >
                      {unit.symbol}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'inline-block', width: '150px' }}>Purchase Price:</label>
            <input ref={purchaseRef} type="number" onKeyDown={(e) => handleKeyDown(e, sellingRef)} />
          </div>
          
          <div>
            <label style={{ display: 'inline-block', width: '150px' }}>Selling Price:</label>
            <input ref={sellingRef} type="number" onKeyDown={(e) => handleKeyDown(e, qtyRef)} />
          </div>
          
          <div>
            <label style={{ display: 'inline-block', width: '150px' }}>Quantity:</label>
            <input ref={qtyRef} type="number" onKeyDown={(e) => handleKeyDown(e, gstRef)} />
          </div>
          
          <div>
            <label style={{ display: 'inline-block', width: '150px' }}>GST Percentage (%):</label>
            <input ref={gstRef} type="number" onKeyDown={(e) => handleKeyDown(e, null)} />
          </div>
        </div>
      </div>
    </div>
  );
}
