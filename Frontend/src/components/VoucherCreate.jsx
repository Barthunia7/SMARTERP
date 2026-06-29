import React, { useRef, useState, useEffect } from 'react';

export default function VoucherCreate({ companyId, onBack }) {
  // Core Form Input references
  const vNumRef = useRef(null);
  const dateRef = useRef(null);
  const narrationRef = useRef(null);

  // Active Screen Mode Tracker (Default set to RECEIPT, switches via hotkeys)
  const [voucherType, setVoucherType] = useState('RECEIPT'); 

  // Matrix 1: Double-Entry Split Ledger Array
  const [rows, setRows] = useState([
    { entry_type: 'DR', ledger_id: '', ledger_name: '', amount: '' },
    { entry_type: 'CR', ledger_id: '', ledger_name: '', amount: '' }
  ]);

  // Matrix 2: DAY 10 ITEMISED INVENTORY SALES GRID ARRAY (Starts with 1 empty row)
  const [inventoryRows, setInventoryRows] = useState([
    { stock_item_id: '', name: '', sku: '', quantity: '', rate: '', total_amount: 0 }
  ]);

  // Dropdown UI tracking states for accounts particulars
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedListIndex, setSelectedListIndex] = useState(0);

  // Dropdown UI tracking states for stock items particulars
  const [focusedInvIndex, setFocusedInvIndex] = useState(null);
  const [itemSearchResults, setItemSearchResults] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // Global Key Listener to handle Esc and state switches
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
      if (e.key === 'F6') { e.preventDefault(); setVoucherType('RECEIPT'); }
      if (e.key === 'F7') { e.preventDefault(); setVoucherType('JOURNAL'); }
      if (e.key === 'F8') { e.preventDefault(); setVoucherType('SALES'); }
      if (e.key === 'F9') { e.preventDefault(); setVoucherType('PURCHASE'); }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [onBack]);

  // Fetch ledgers for autocomplete rows
  const handleLedgerInputChange = (index, searchString) => {
    const updatedRows = [...rows];
    updatedRows[index]['ledger_name'] = searchString;
    setRows(updatedRows);
    setFocusedRowIndex(index);
    setSelectedListIndex(0);

    if (!searchString.trim()) { setSearchResults([]); return; }

    fetch(`http://localhost:5000/api/ledgers-search/${companyId}?q=${encodeURIComponent(searchString)}`)
      .then(res => res.json())
      .then(data => setSearchResults(data))
      .catch(err => console.error("Error looking up ledger entries:", err));
  };
  // DAY 10: FETCH INVENTORY STOCK ITEMS FOR AUTOCOMPLETE ITEMS SEARCH GRID
  const handleItemInputChange = (index, searchString) => {
    const updatedInv = [...inventoryRows];
    updatedInv[index]['name'] = searchString;
    setInventoryRows(updatedInv);
    setFocusedInvIndex(index);
    setSelectedItemIndex(0);

    if (!searchString.trim()) { setItemSearchResults([]); return; }

    fetch(`http://localhost:5000/api/stock-items-search/${companyId}?q=${encodeURIComponent(searchString)}`)
      .then(res => res.json())
      .then(data => setItemSearchResults(data))
      .catch(err => console.error("Error looking up product items:", err));
  };

  const updateInventoryCell = (index, field, val) => {
    const updatedInv = [...inventoryRows];
    updatedInv[index][field] = val;
    
    // Automatically recalculate item total amount on column input change
    if (field === 'quantity' || field === 'rate') {
      const q = parseFloat(updatedInv[index]['quantity']) || 0;
      const r = parseFloat(updatedInv[index]['rate']) || 0;
      updatedInv[index]['total_amount'] = q * r;
    }
    setInventoryRows(updatedInv);
  };

  const updateRowValue = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleCellKeyDown = (e, rowIndex, field) => {
    if (e.key === 'ArrowDown' && field === 'ledger_name' && searchResults.length > 0) {
      e.preventDefault(); setSelectedListIndex((prev) => (prev + 1) % searchResults.length);
    } 
    else if (e.key === 'ArrowUp' && field === 'ledger_name' && searchResults.length > 0) {
      e.preventDefault(); setSelectedListIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'entry_type') { document.getElementById(`ledger-${rowIndex}`).focus(); } 
      else if (field === 'ledger_name') {
        if (searchResults.length > 0 && searchResults[selectedListIndex]) {
          const choice = searchResults[selectedListIndex];
          const updated = [...rows];
          updated[rowIndex]['ledger_id'] = choice.id;
          updated[rowIndex]['ledger_name'] = choice.name;
          setRows(updated); setSearchResults([]); setFocusedRowIndex(null);
        }
        document.getElementById(`amount-${rowIndex}`).focus();
      } 
      else if (field === 'amount') {
        const amt = parseFloat(rows[rowIndex].amount) || 0;
        if (amt === 0 || rows[rowIndex].amount === '') {
          if (rowIndex === rows.length - 1 && rows.length > 2) setRows(p => p.slice(0, -1));
          
          if (voucherType === 'SALES') {
            setTimeout(() => {
              const firstInvItem = document.getElementById('inv-item-0');
              if (firstInvItem) firstInvItem.focus();
            }, 50);
          } else if (narrationRef.current) {
            narrationRef.current.focus();
          }
          return;
        }
        if (rowIndex === rows.length - 1) {
          const nextType = rows[rowIndex].entry_type === 'DR' ? 'CR' : 'DR';
          setRows([...rows, { entry_type: nextType, ledger_id: '', ledger_name: '', amount: '' }]);
          setTimeout(() => document.getElementById(`type-${rowIndex + 1}`).focus(), 50);
        } else {
          document.getElementById(`type-${rowIndex + 1}`).focus();
        }
      }
    }
  };

  const handleInvKeyDown = (e, index, field) => {
    if (e.key === 'ArrowDown' && field === 'name' && itemSearchResults.length > 0) {
      e.preventDefault(); setSelectedItemIndex(p => (p + 1) % itemSearchResults.length);
    }
    else if (e.key === 'ArrowUp' && field === 'name' && itemSearchResults.length > 0) {
      e.preventDefault(); setSelectedItemIndex(p => (p - 1 + itemSearchResults.length) % itemSearchResults.length);
    }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'name') {
        if (itemSearchResults.length > 0 && itemSearchResults[selectedItemIndex]) {
          const item = itemSearchResults[selectedItemIndex];
          const updated = [...inventoryRows];
          updated[index]['stock_item_id'] = item.id;
          updated[index]['name'] = item.name;
          updated[index]['sku'] = item.sku;
          updated[index]['rate'] = item.selling_price;
          setInventoryRows(updated); setItemSearchResults([]); setFocusedInvIndex(null);
        }
        document.getElementById(`inv-qty-${index}`).focus();
      }
      else if (field === 'quantity') { document.getElementById(`inv-rate-${index}`).focus(); }
      else if (field === 'rate') {
        const qty = parseFloat(inventoryRows[index].quantity) || 0;
        if (qty === 0 || inventoryRows[index].quantity === '') {
          if (index === inventoryRows.length - 1 && inventoryRows.length > 1) {
            setInventoryRows(p => p.slice(0, -1));
          }
          if (narrationRef.current) narrationRef.current.focus();
          return;
        }

        if (index === inventoryRows.length - 1) {
          setInventoryRows([...inventoryRows, { stock_item_id: '', name: '', sku: '', quantity: '', rate: '', total_amount: 0 }]);
          setTimeout(() => {
            const nextItemInput = document.getElementById(`inv-item-${index + 1}`);
            if (nextItemInput) nextItemInput.focus();
          }, 50);
        } else {
          const nextItemInput = document.getElementById(`inv-item-${index + 1}`);
          if (nextItemInput) nextItemInput.focus();
        }
      }
    }
  };

  const selectItemFromMouse = (index, itemObj) => {
    const updated = [...inventoryRows];
    updated[index]['stock_item_id'] = itemObj.id;
    updated[index]['name'] = itemObj.name;
    updated[index]['sku'] = itemObj.sku;
    updated[index]['rate'] = itemObj.selling_price;
    setInventoryRows(updated); setItemSearchResults([]); setFocusedInvIndex(null);
    document.getElementById(`inv-qty-${index}`).focus();
  };
  const handleSubmit = async () => {
    const cleanEntries = rows.filter(r => r.ledger_id && parseFloat(r.amount) > 0).map(r => ({
      ledger_id: parseInt(r.ledger_id), entry_type: r.entry_type, amount: parseFloat(r.amount)
    }));

    const cleanInventory = inventoryRows.filter(r => r.stock_item_id && parseInt(r.quantity) > 0).map(r => ({
      stock_item_id: parseInt(r.stock_item_id), quantity: parseInt(r.quantity), rate: parseFloat(r.rate)
    }));

    if (cleanEntries.length < 2) { alert("A valid voucher requires at least two balanced accounts!"); return; }

    const payload = {
      company_id: companyId,
      voucher_number: vNumRef.current.value,
      voucher_type: voucherType,
      date: dateRef.current.value,
      narration: narrationRef.current.value,
      entries: cleanEntries,
      inventory_items: voucherType === 'SALES' ? cleanInventory : []
    };

    try {
      const res = await fetch('http://localhost:5000/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Sales Voucher saved and items stock deducted successfully!');
      onBack();
    } catch (err) { alert(`Submission failed: ${err.message}`); }
  };

    // 🟩 FIXED: Unbroken mathematical reduce execution loop
  const totalInvoiceValue = inventoryRows.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', backgroundColor: '#385723', padding: '8px', color: '#fff', fontWeight: 'bold' }}>
        <span>[F6] Receipt</span> | <span>[F7] Journal</span> | <span style={{ textDecoration: 'underline', color: '#ffc000' }}>[F8] Sales</span> | <span>[F9] Purchase</span>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', border: '2px solid #385723' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #385723', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, color: '#385723' }}>Voucher Entry: {voucherType}</h2>
          <div>
            <label>Date: </label>
            <input ref={dateRef} type="date" defaultValue={new Date().toISOString().split('T')[0]} onKeyDown={(e) => { if(e.key === 'Enter') vNumRef.current.focus(); }} autoFocus />
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label>Voucher No: </label>
          <input ref={vNumRef} type="text" placeholder="0001" onKeyDown={(e) => { if(e.key === 'Enter') document.getElementById('type-0').focus(); }} />
        </div>

        <h4 style={{ color: '#385723', marginBottom: '5px', marginTop: '20px' }}>Accounts Particulars</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '1px solid #385723' }}>
              <th style={{ width: '80px', padding: '6px', textAlign: 'left' }}>Dr/Cr</th>
              <th style={{ padding: '6px', textAlign: 'left' }}>Ledger Account Particulars</th>
              <th style={{ width: '150px', padding: '6px', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px' }}>
                  <input id={`type-${index}`} type="text" value={row.entry_type} onChange={(e) => updateRowValue(index, 'entry_type', e.target.value.toUpperCase())} onKeyDown={(e) => handleCellKeyDown(e, index, 'entry_type')} style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }} />
                </td>
                <td style={{ padding: '6px', position: 'relative' }}>
                  <input id={`ledger-${index}`} type="text" placeholder="Select customer/sales ledger..." value={row.ledger_name} onChange={(e) => handleLedgerInputChange(index, e.target.value)} onKeyDown={(e) => handleCellKeyDown(e, index, 'ledger_name')} onBlur={() => setTimeout(() => { if(focusedRowIndex === index) setFocusedRowIndex(null); }, 200)} style={{ width: '95%', padding: '2px' }} autoComplete="off" />
                  {focusedRowIndex === index && searchResults.length > 0 && (
                    <div style={{ position: 'absolute', left: '6px', top: '28px', width: '94%', border: '1px solid #385723', backgroundColor: '#fff', zIndex: 1000 }}>
                      {searchResults.map((ledger, sIdx) => (
                        <div key={ledger.id} onMouseDown={() => { const u = [...rows]; u[index]['ledger_id'] = ledger.id; u[index]['ledger_name'] = ledger.name; setRows(u); setSearchResults([]); setFocusedRowIndex(null); document.getElementById(`amount-${index}`).focus(); }} style={{ padding: '6px', backgroundColor: sIdx === selectedListIndex ? '#ffc000' : '#fff', cursor: 'pointer' }}>{ledger.name}</div>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ padding: '6px' }}><input id={`amount-${index}`} type="number" placeholder="0.00" value={row.amount} onChange={(e) => updateRowValue(index, 'amount', e.target.value)} onKeyDown={(e) => handleCellKeyDown(e, index, 'amount')} style={{ width: '130px', textAlign: 'right' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SECTION B: ITEMISED SALES INVENTORY SPREADSHEET VIEW */}
        {voucherType === 'SALES' && (
          <div style={{ marginTop: '25px' }}>
            <h4 style={{ color: '#b26b00', marginBottom: '5px' }}>Inventory Items Particulars (Stock Deduction Matrix)</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#fff2cc', borderBottom: '1px solid #b26b00' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Item Name</th>
                  <th style={{ width: '100px', padding: '6px', textAlign: 'left' }}>SKU</th>
                  <th style={{ width: '100px', padding: '6px', textAlign: 'right' }}>Quantity</th>
                  <th style={{ width: '120px', padding: '6px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ width: '150px', padding: '6px', textAlign: 'right' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map((inv, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee', verticalAlign: 'top' }}>
                    <td style={{ padding: '6px', position: 'relative' }}>
                      <input id={`inv-item-${index}`} type="text" placeholder="Type stock item name... (e.g. gdg)" value={inv.name} onChange={(e) => handleItemInputChange(index, e.target.value)} onKeyDown={(e) => handleInvKeyDown(e, index, 'name')} onBlur={() => setTimeout(() => setFocusedInvIndex(null), 200)} style={{ width: '95%', padding: '2px' }} autoComplete="off" />
                      {focusedInvIndex === index && itemSearchResults.length > 0 && (
                        <div style={{ position: 'absolute', left: '6px', top: '28px', width: '94%', border: '1px solid #b26b00', backgroundColor: '#fff', zIndex: 1000 }}>
                          {itemSearchResults.map((item, sIdx) => (
                            <div key={item.id} onMouseDown={() => selectItemFromMouse(index, item)} style={{ padding: '6px', backgroundColor: sIdx === selectedItemIndex ? '#ffc000' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{item.name}</span><span style={{ fontSize: '11px', color: '#666' }}>Stock Avail: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px', color: '#555', fontWeight: 'bold' }}>{inv.sku || '-'}</td>
                    <td style={{ padding: '6px' }}><input id={`inv-qty-${index}`} type="number" placeholder="0" value={inv.quantity} onChange={(e) => updateInventoryCell(index, 'quantity', e.target.value)} onKeyDown={(e) => handleInvKeyDown(e, index, 'quantity')} style={{ width: '90px', textAlign: 'right' }} /></td>
                    <td style={{ padding: '6px' }}><input id={`inv-rate-${index}`} type="number" placeholder="0.00" value={inv.rate} onChange={(e) => updateInventoryCell(index, 'rate', e.target.value)} onKeyDown={(e) => handleInvKeyDown(e, index, 'rate')} style={{ width: '110px', textAlign: 'right' }} /></td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>₹{parseFloat(inv.total_amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', marginTop: '10px', fontWeight: 'bold', color: '#b26b00' }}>Gross Inventory Valuation Sum: ₹{totalInvoiceValue.toFixed(2)}</div>
          </div>
        )}

        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Narration: </label>
          <textarea id="narration" ref={narrationRef} placeholder="Enter entry description remarks..." onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }} style={{ width: '100%', height: '50px', fontFamily: 'monospace', padding: '5px' }} />
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>💡 Press <b>Ctrl + Enter</b> inside Narration to save your Sales Voucher.</p>
        </div>
      </div>
    </div>
  );
}
