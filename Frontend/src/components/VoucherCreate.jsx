import React, { useRef, useState, useEffect } from 'react';

export default function VoucherCreate({ companyId, onBack }) {
    // Header Meta Input References
    const vNumRef = useRef(null);
    const dateRef = useRef(null);
    const narrationRef = useRef(null);

    // Core Voucher Modes matching your specification
    const [voucherType, setVoucherType] = useState('RECEIPT');

    // Multi-Row Balance Entry Splitting Array Matrix (Starts with 2 empty rows)
    const [rows, setRows] = useState([
        { entry_type: 'DR', ledger_id: '', ledger_name: '', amount: '' },
        { entry_type: 'CR', ledger_id: '', ledger_name: '', amount: '' }
    ]);

    // Autocomplete state tracking pools
    const [focusedRowIndex, setFocusedRowIndex] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedListIndex, setSelectedListIndex] = useState(0);

    // Global Key Listener to Go Back or switch Modes using Function Hotkeys
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

    // Trigger fuzzy auto-fetch when user types inside a ledger cell
    const handleLedgerInputChange = (index, searchString) => {
        const updatedRows = [...rows];
        updatedRows[index]['ledger_name'] = searchString;
        setRows(updatedRows);
        setFocusedRowIndex(index);
        setSelectedListIndex(0);

        if (!searchString.trim()) {
            setSearchResults([]);
            return;
        }

        // Call backend lookup endpoint dynamically
        fetch(`http://localhost:5000/api/ledgers-search/${companyId}?q=${encodeURIComponent(searchString)}`)
            .then(res => res.json())
            .then(data => setSearchResults(data))
            .catch(err => console.error("Error fetching ledgers lookup:", err));
    };

    // 🟩 UPGRADED TO HANDLE BOTH RAW DOM ELEMENTS AND REACT REFS
    const handleHeaderKeyDown = (e, nextTarget) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!nextTarget) return;

            // If it's a React ref (has a .current property)
            if (nextTarget.current) {
                nextTarget.current.focus();
            }
            // If it's a direct HTML element from document.getElementById
            else if (typeof nextTarget.focus === 'function') {
                nextTarget.focus();
            }
        }
    };


    const updateRowValue = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };
    // Keyboard navigation within cell inputs and drop-down menu popovers
    const handleCellKeyDown = (e, rowIndex, field) => {
        if (e.key === 'ArrowDown' && field === 'ledger_name' && searchResults.length > 0) {
            e.preventDefault();
            setSelectedListIndex((prev) => (prev + 1) % searchResults.length);
        }
        else if (e.key === 'ArrowUp' && field === 'ledger_name' && searchResults.length > 0) {
            e.preventDefault();
            setSelectedListIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        }
        else if (e.key === 'Enter') {
            e.preventDefault();

            if (field === 'entry_type') {
                document.getElementById(`ledger-${rowIndex}`).focus();
            }
            else if (field === 'ledger_name') {
                if (searchResults.length > 0 && searchResults[selectedListIndex]) {
                    const chosenLedger = searchResults[selectedListIndex];
                    const updatedRows = [...rows];
                    updatedRows[rowIndex]['ledger_id'] = chosenLedger.id;
                    updatedRows[rowIndex]['ledger_name'] = chosenLedger.name;
                    setRows(updatedRows);
                    setSearchResults([]);
                    setFocusedRowIndex(null);
                }
                document.getElementById(`amount-${rowIndex}`).focus();
            }
            else if (field === 'amount') {
                const currentAmount = parseFloat(rows[rowIndex].amount) || 0;

                // 🟩 IF AMOUNT IS ZERO OR EMPTY, BREAK LOOP AND GO TO NARRATION
                if (currentAmount === 0 || rows[rowIndex].amount === '') {
                    // Remove the extra unneeded empty row that was just created
                    if (rowIndex === rows.length - 1 && rows.length > 2) {
                        setRows(prev => prev.slice(0, -1));
                    }

                    // Instantly shift cursor focus down into narration text box
                    if (narrationRef.current) {
                        narrationRef.current.focus();
                    }
                    return;
                }

                // If amount has data, continue normal row generation flow
                if (rowIndex === rows.length - 1) {
                    const nextType = rows[rowIndex].entry_type === 'DR' ? 'CR' : 'DR';
                    setRows([...rows, { entry_type: nextType, ledger_id: '', ledger_name: '', amount: '' }]);
                    setTimeout(() => {
                        document.getElementById(`type-${rowIndex + 1}`).focus();
                    }, 50);
                } else {
                    document.getElementById(`type-${rowIndex + 1}`).focus();
                }
            }

        }
    };

    const selectLedgerFromMouse = (rowIndex, ledgerObj) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex]['ledger_id'] = ledgerObj.id;
        updatedRows[rowIndex]['ledger_name'] = ledgerObj.name;
        setRows(updatedRows);
        setSearchResults([]);
        setFocusedRowIndex(null);
        document.getElementById(`amount-${rowIndex}`).focus();
    };

      const handleSubmit = async () => {
    // 1. First, check if any row has text typed but is missing a backend ledger_id
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // If they filled out an amount but forgot to pick the ledger from our popup list
      if (parseFloat(row.amount) > 0 && !row.ledger_id) {
        alert(`Row ${i + 1} ("${row.ledger_name}") is not a valid ledger. Please re-type and select it from the autocomplete list using Arrow Keys + Enter!`);
        document.getElementById(`ledger-${i}`).focus();
        return;
      }
    }

    // 2. Filter down only clean, fully completed rows
    const validEntries = rows
      .filter(r => r.ledger_id && parseFloat(r.amount) > 0)
      .map(r => ({
        ledger_id: parseInt(r.ledger_id),
        entry_type: r.entry_type,
        amount: parseFloat(r.amount) || 0
      }));

    if (validEntries.length < 2) {
      alert("A valid voucher must contain at least one Debit and one Credit entry!");
      return;
    }

    const payload = {
      company_id: companyId,
      voucher_number: vNumRef.current.value,
      voucher_type: voucherType,
      date: dateRef.current.value,
      narration: narrationRef.current.value,
      entries: validEntries
    };

    try {
      const response = await fetch('http://localhost:5000/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert('Double-Entry Voucher Saved successfully!');
      onBack();
    } catch (err) {
      alert(`Error saving transaction: ${err.message}`);
    }
  };


    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', backgroundColor: '#385723', padding: '8px', color: '#fff', fontWeight: 'bold' }}>
                <span>[F6] Receipt</span> | <span>[F7] Journal</span> | <span>[F8] Sales</span> | <span>[F9] Purchase</span>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', border: '2px solid #385723' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #385723', paddingBottom: '10px' }}>
                    <h2 style={{ margin: 0, color: '#385723' }}>Voucher Entry: {voucherType}</h2>
                    <div>
                        <label>Date: </label>
                        <input ref={dateRef} type="date" defaultValue={new Date().toISOString().split('T')[0]} onKeyDown={(e) => handleHeaderKeyDown(e, vNumRef)} autoFocus />
                    </div>
                </div>

                <div style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
                    <div>
                        <label>Voucher No: </label>
                        {/* 🟩 Changed 'type-0' to all lowercase 'type-0' here */}
                        <input
                            ref={vNumRef}
                            type="text"
                            placeholder="e.g., 0001"
                            onKeyDown={(e) => handleHeaderKeyDown(e, document.getElementById('type-0'))}
                        />
                    </div>
                </div>

                <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '1px solid #385723' }}>
                            <th style={{ width: '80px', padding: '6px', textAlign: 'left' }}>Dr/Cr</th>
                            <th style={{ padding: '6px', textAlign: 'left' }}>Ledger Particulars Account Name</th>
                            <th style={{ width: '150px', padding: '6px', textAlign: 'right' }}>Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee', verticalAlign: 'top' }}>
                                <td style={{ padding: '6px' }}>
                                    <input
                                        id={`type-${index}`}
                                        type="text"
                                        value={row.entry_type}
                                        onChange={(e) => updateRowValue(index, 'entry_type', e.target.value.toUpperCase())}
                                        onKeyDown={(e) => handleCellKeyDown(e, index, 'entry_type')}
                                        style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                </td>

                                <td style={{ padding: '6px', position: 'relative' }}>
                                    <input
                                        id={`ledger-${index}`}
                                        type="text"
                                        placeholder="Start typing account ledger name... (e.g. Cash)"
                                        value={row.ledger_name}
                                        onChange={(e) => handleLedgerInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleCellKeyDown(e, index, 'ledger_name')}
                                        onBlur={() => setTimeout(() => { if (focusedRowIndex === index) setFocusedRowIndex(null); }, 200)}
                                        style={{ width: '95%', padding: '2px' }}
                                        autoComplete="off"
                                    />

                                    {focusedRowIndex === index && searchResults.length > 0 && (
                                        <div style={{ position: 'absolute', left: '6px', top: '28px', width: '94%', border: '1px solid #385723', backgroundColor: '#fff', zIndex: 1000, boxShadow: '3px 3px 10px rgba(0,0,0,0.15)' }}>
                                            {searchResults.map((ledger, sIdx) => {
                                                const isCurrentHighlight = sIdx === selectedListIndex;
                                                return (
                                                    <div
                                                        key={ledger.id}
                                                        onMouseDown={() => selectLedgerFromMouse(index, ledger)}
                                                        style={{
                                                            padding: '6px 10px',
                                                            backgroundColor: isCurrentHighlight ? '#ffc000' : 'transparent',
                                                            fontWeight: isCurrentHighlight ? 'bold' : 'normal',
                                                            color: '#000',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        <span>{ledger.name}</span>
                                                        <span style={{ fontSize: '11px', color: '#666' }}>({ledger.group_type}) - ₹{parseFloat(ledger.current_balance).toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </td>

                                <td style={{ padding: '6px', textAlign: 'right' }}>
                                    <input
                                        id={`amount-${index}`}
                                        type="number"
                                        placeholder="0.00"
                                        value={row.amount}
                                        onChange={(e) => updateRowValue(index, 'amount', e.target.value)}
                                        onKeyDown={(e) => handleCellKeyDown(e, index, 'amount')}
                                        style={{ width: '130px', textAlign: 'right', padding: '2px' }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Narration: </label>
                    <textarea
                        ref={narrationRef}
                        placeholder="Enter entry description remarks..."
                        onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
                        style={{ width: '100%', height: '50px', fontFamily: 'monospace', padding: '5px' }}
                    />
                    <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>💡 Press <b>Ctrl + Enter</b> inside Narration to save voucher directly.</p>
                </div>
            </div>
        </div>
    );
}
