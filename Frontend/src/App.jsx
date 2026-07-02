import React, { useState, useEffect } from 'react';
import GatewayDashboard from './components/GatewayDashboard';
import LedgerCreate from './components/LedgerCreate';
import GroupCreate from './components/GroupCreate';
import StockCreate from './components/stockCreate';
import StockDashboard from './components/StockDashboard';
import UomCreate from './components/UomCreate';
import VoucherCreate from './components/VoucherCreate';
// 🟩 DAY 12: REGISTER INDEPENDENT REPORTS DASHBOARD MASTER VIEWS
import ReportsDashboard from './components/ReportsDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('DASHBOARD');
  
  // Extract active company tracking parameter matching Gateway configuration setup
  const activeCompanyId = localStorage.getItem('activeCompanyId') || '1';

  // 🟩 DAY 12: KEYBOARD HOTKEY NAVIGATION OVERRIDE TUNNEL
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Security check: Ignore window shortcuts if cursor is active inside input elements
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      const keyTyped = e.key.toLowerCase();

      if (currentView === 'DASHBOARD') {
        // [V] Key hotkey routes straight to Accounting Transactions Screen
        if (keyTyped === 'v') {
          e.preventDefault();
          setCurrentView('VOUCHER_CREATE');
        }
        // [R] Key hotkey routes straight to Reports Console Screen
        if (keyTyped === 'r') {
          e.preventDefault();
          setCurrentView('REPORTS_DASHBOARD');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [currentView]);

  // Existing Master Render Blocks
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

  if (currentView === 'UOM_CREATE') {
    return <UomCreate companyId={activeCompanyId} onBack={() => setCurrentView('DASHBOARD')} />;
  }

  if (currentView === 'VOUCHER_CREATE') {
    return <VoucherCreate companyId={activeCompanyId} onBack={() => setCurrentView('DASHBOARD')} />;
  }

  // 🟩 DAY 12: FINANCIAL, INVENTORY, AND SALES/PURCHASE REPORTS CONTAINER MOUNT
  if (currentView === 'REPORTS_DASHBOARD') {
    return <ReportsDashboard companyId={activeCompanyId} onBack={() => setCurrentView('DASHBOARD')} />;
  }

  return (
    <GatewayDashboard
      onNavigateToCreateLedger={() => setCurrentView('LEDGER_CREATE')}
      onNavigateToCreateGroup={() => setCurrentView('GROUP_CREATE')}
      onNavigateToCreateStock={() => setCurrentView('STOCK_CREATE')}
      onNavigateToStockDashboard={() => setCurrentView('STOCK_DASHBOARD')}
      onNavigateToCreateUom={() => setCurrentView('UOM_CREATE')}
      onNavigateToCreateVoucher={() => setCurrentView('VOUCHER_CREATE')}
      // 🟩 BRIDGE HANDLER FOR DIRECT MENU NAVIGATION FROM THE SIDEBAR LINKS
      onNavigateToReports={() => setCurrentView('REPORTS_DASHBOARD')}
    />
  );
}
