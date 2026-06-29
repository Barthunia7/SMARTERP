import React, { useState } from 'react';
import GatewayDashboard from './components/GatewayDashboard';
import LedgerCreate from './components/LedgerCreate';
import GroupCreate from './components/GroupCreate';
import StockCreate from './components/stockCreate';
import StockDashboard from './components/StockDashboard';
import UomCreate from './components/UomCreate';
import VoucherCreate from './components/VoucherCreate';
export default function App() {
  const [currentView, setCurrentView] = useState('DASHBOARD');
  
  // Extract active company tracking parameter matching Gateway configuration setup
  const activeCompanyId = localStorage.getItem('activeCompanyId') || '1';

  if (currentView === 'LEDGER_CREATE') {
    return <LedgerCreate onBack={() => setCurrentView('DASHBOARD')} />;
  }

  if (currentView === 'GROUP_CREATE') {
    return <GroupCreate onBack={() => setCurrentView('DASHBOARD')} />;
  }

  if (currentView === 'STOCK_CREATE') {
    return <StockCreate companyId={activeCompanyId} onBack={() => setCurrentView('DASHBOARD')} />;
  }

  if (currentView === 'STOCK_DASHBOARD') {
    return <StockDashboard companyId={activeCompanyId} onBack={() => setCurrentView('DASHBOARD')} />;
  }

  // 🟩 ADDED RENDERING LAYER FOR UNIT CREATION PANEL
  if (currentView === 'UOM_CREATE') {
    return <UomCreate companyId={activeCompanyId} onBack={() => setCurrentView('DASHBOARD')} />;
  }
if (currentView === 'VOUCHER_CREATE') {
    return <VoucherCreate companyId={activeCompanyId} onBack={() => setCurrentView('DASHBOARD')} />;
  }

  return (
    <GatewayDashboard
      onNavigateToCreateLedger={() => setCurrentView('LEDGER_CREATE')}
      onNavigateToCreateGroup={() => setCurrentView('GROUP_CREATE')}
      onNavigateToCreateStock={() => setCurrentView('STOCK_CREATE')}
      onNavigateToStockDashboard={() => setCurrentView('STOCK_DASHBOARD')}
      onNavigateToCreateUom={() => setCurrentView('UOM_CREATE')}
       onNavigateToCreateVoucher={() => setCurrentView('VOUCHER_CREATE')}
    />
  );
}
