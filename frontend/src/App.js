import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Suspense } from "react";
import { useEffect } from 'react';
import Navbar from './components/NavBar';
import Login from './components/login';
import Home from "./components/Home";
import Plu2Checklist from "./components/Plu2Checklist";
import SalePosting from "./components/SalePosting";
import PosStatus from "./components/PosStatus";
import ScaleStatus from "./components/ScaleStatus";
import PosPerformanceChecklist from "./components/PosPerformance";
import UpsAmcStatus from "./components/UpsAmcStatus";
import PdtStatus from "./components/PdtStatus";
import ServerStatus from "./components/ServerStatus";
import IndStoreBackupStatus from "./components/IndStoreBackup";
import AcronicsBackupStatus from "./components/AcronicsBackup";
import SalesStatus from "./components/SalesStatus";
import ZvchrStatus from "./components/ZvchrStatus";
import PosDbBackupStatus from "./components/PosDbBackup";
import AdUserList  from "./components/AdUserList";
import GovernanceReport from "./components/GovernanceReport";
import IdtRegister from "./components/IdtRegister";
import NasBackup from "./components/NasBackup";
import PosUserStatus from "./components/PosUserStatus";
import PosPerformance from "./components/PosPerformance";
import ServerStorageStatus from "./components/ServerStorageStatus";
import POSPDTSCALE from "./components/Manage_POS_PDT_SCALE";
import Store from "./components/Store";
import Server from "./components/mangeserver";
import UPS from "./components/manage_ups";
import DailyChecklist from "./components/DailyChecklist";
import InvoiceHandovering  from "./components/InvoiceHandovering";
import ExpenseClaim from "./components/ExpenseClaim";
import Profile from "./components/profile";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserGroup = localStorage.getItem('userGroup');
    
    if (storedUsername && storedUserGroup) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.removeItem('username');
        localStorage.removeItem('userGroup');
        setIsLoggedIn(false);
        alert("You have been logged out due to inactivity.");
      }, 10 * 60 * 1000); 
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);


    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoggedIn]);

  return (
    <div className={`App ${isLoggedIn ? 'logged-in' : ''}`}>
      <BrowserRouter>
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <Navbar />
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/plu2_Checklist" element={<Plu2Checklist />} />
                  <Route path="/sale_posting" element={<SalePosting />} />
                  <Route path="/daily_checklist" element={<DailyChecklist />} />
                  <Route path="/invoicehandovering" element={<InvoiceHandovering />} />
                  <Route path="/expenseclaim" element={<ExpenseClaim />} />
                  <Route path="/pos_status" element={<PosStatus />} />
                  <Route path="/pos_performance_checklist" element={<PosPerformanceChecklist />} />
                  <Route path="/scale_status" element={<ScaleStatus />} />
                  <Route path="/ups_amc_status" element={<UpsAmcStatus />} />
                  <Route path="/pdt_status" element={<PdtStatus />} />
                  <Route path="/server_status" element={<ServerStatus />} />
                  <Route path="/server_storage_status" element={<ServerStorageStatus />} />
                  <Route path="/ind_store_backup_status" element={<IndStoreBackupStatus />} />
                  <Route path="/acronics_backup_status" element={<AcronicsBackupStatus />} />
                  <Route path="/sales_status" element={<SalesStatus />} />
                  <Route path="/zvchr_status" element={<ZvchrStatus />} />
                  <Route path="/pos_db_backup_status" element={<PosDbBackupStatus />} />
                  <Route path="/ad_user_list" element={<AdUserList />} />
                  <Route path="/governance_report" element={<GovernanceReport />} />
                  <Route path="/idt_register" element={<IdtRegister />} />
                  <Route path="/nas_backup" element={<NasBackup />} />
                  <Route path="/pos_performance_checklist" element={<PosPerformance />} />
                  <Route path="/pos_user_review" element={<PosUserStatus />} />
                  <Route path="/pos_scale_pdt" element={<POSPDTSCALE />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/manageserver" element={<Server />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/manageups" element={<UPS />} />
                </Routes>
              </Suspense>
          </>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;

