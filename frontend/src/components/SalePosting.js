import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/system';
import { Tabs } from '@mui/base/Tabs';
import { TabsList as BaseTabsList } from '@mui/base/TabsList';
import { TabPanel as BaseTabPanel } from '@mui/base/TabPanel';
import { buttonClasses } from '@mui/base/Button';
import { Tab as BaseTab, tabClasses } from '@mui/base/Tab';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { Paper, Button, Box , Typography, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'; 
import Sheet from '@mui/joy/Sheet';
import DownloadIcon from '@mui/icons-material/Download';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Snackbar, Alert } from '@mui/material';
import { API_BASE_URL } from '../config';
import { TableSortLabel } from '@mui/material';
import { useLocation } from 'react-router-dom';

const primaryColor = '#113f6c';
const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Tab = styled(BaseTab)`
  font-family: 'IBM Plex Sans', sans-serif;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: transparent;
  width: 100%;
  padding: 10px 12px;
  margin: 6px 0;
  border: none;
  border-radius: 7px;
  display: flex;
  justify-content: center;

  &:hover {
    background-color: ${primaryColor};
  }

  &:focus {
    color: #fff;
    outline: 3px solid ${primaryColor};
  }

  &.${tabClasses.selected} {
    background-color: #fff;
    color: ${primaryColor};
  }

  &.${buttonClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabPanel = styled(BaseTabPanel)(
  ({ theme }) => `
  width: 107vw; /* Responsive width */
  max-width: 1500px;
  min-height: 89vh;
  height: auto;
  padding: 20px 12px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  border-radius: 12px;
  margin-left: 130px;
  margin-top: -30px;
  `,
);

const TabsList = styled(BaseTabsList)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: ${primaryColor};
  border-radius: 12px;
  margin-bottom: 16px;
  position: absolute;
  top: 92px;
  left: 290px;
  z-index: 1;
  padding: 10px;
  `,
);

const SalePosting = () => {
  const [formData, setFormData] = useState({
    date: "",
    store: '',
    storename: '',
    totalpayment: "",
    expectedpayment: "",
    actualpayment: "",
    cashiershortexcess: "",
    zdsr: "",
    zread: "",
    zdsrzread: "",
    posrounding: "",
    zpmc: "",
    difference: "",
    totalarticlesale: "",
    exception: "",
    submittedby:"",
    remarks: "",
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const handleSnackbarClose = () => setSnackbar({ open: false, message: "", severity: "" });
  const [submittedData, setSubmittedData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [store, setStore] = useState("");
  const [userid, setUserid] = useState('');
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [profile, setProfile] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserid = localStorage.getItem('userid');
    const storedUserGroup = localStorage.getItem('userGroup');
  
    setUsername(storedUsername || '');
    setUserid(storedUserid || '');
    setUserGroup(storedUserGroup || '');
  
    if (storedUserGroup === 'End_User' && storedUserid) {
      fetchEmployeeProfile(storedUserid);
    } else if (storedUserGroup === 'Management_User' && storedUserid) {
      fetchEmployeeProfile(storedUserid); 
    } else {
      fetchStores();
    }
  }, []);
    
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const storedUserGroup = localStorage.getItem('userGroup');
    setUserGroup(storedUserGroup || '');

    if (userGroup && location.state?.autoNavigateToTab2 && userGroup === 'Admin_User') {
      const yesterday = location.state.date;
      const storeFromDashboard = location.state.store;

      setTabValue(1);
      setSelectedTab(1);
      setStartDate(yesterday);
      setEndDate(yesterday);
      setStore(storeFromDashboard);

      setTimeout(() => {
        fetchDataAuto(storeFromDashboard, yesterday);
      }, 100);
    }
  }, [userGroup, location.state]);


  const fetchDataAuto = async (storeCode, date) => {
    try {
      const localUsername = localStorage.getItem('username') || '';
      const fallbackStore = localStorage.getItem('store') || ''; // fallback

      const params = {
        start_date: date,
        end_date: date,
        user: localUsername,
        store: storeCode || fallbackStore,
      };

      const response = await axios.get(`${API_BASE_URL}/api/sale-posting/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch auto-loaded data.",
        severity: "error",
      });
    }
  };

  const fetchEmployeeProfile = async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profile/${employeeId}/`);
      const profile = response.data;
  
      if (["IT Support", "Regional IT Manager", "Assistant IT Incharge", "IT Incharge"].includes(profile.designation)) {
        const storeCodes = profile.storeunder
          ? profile.storeunder.split(",").map((code) => code.trim())
          : [];
  
        if (!storeCodes.includes(profile.storecode)) {
          storeCodes.unshift(profile.storecode);
        }
  
        if (storeCodes.length > 0) {
          const storeRequests = storeCodes.map((code) => axios.get(`${API_BASE_URL}/api/store/${code}/`));
          const storeResponses = await Promise.all(storeRequests);
  
          const storeDetails = storeResponses.map((res) => ({
            storecode: res.data.storecode,
            storename: res.data.storename,
          }));
  
          setStores(storeDetails);
  
          if (storeDetails.length === 1) {
            // Automatically select the only available store
            setFormData({
              store: storeDetails[0].storecode,
              storename: storeDetails[0].storename,
            });
          } else {
            setFormData((prev) => ({
              ...prev,
              store: storeDetails.map((store) => store.storecode),
              storename: storeDetails.storename,
            }));
          }
        }
      } else {
        fetchStores();
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error fetching profile/store details.", severity: "error" });
    }
  };
  
  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stores/`);
      setStores(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: "Error fetching stores.", severity: "error" });
    }
  };

  const handleStoreChange = (event) => {
    const selectedStoreCode = event.target.value;
    if (selectedStoreCode === "None") {
      setFormData({ ...formData, store: "", storename: "" });
    } else {
      const selectedStore = stores.find(store => store.storecode === selectedStoreCode);
      if (selectedStore) {
        setFormData({
          ...formData,
          store: selectedStore.storecode,
          storename: selectedStore.storename,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const updatedFormData = {
      ...formData,
      zpmc: (parseFloat(formData.totalpayment) - parseFloat(formData.expectedpayment)).toFixed(2),
      zdsrzread: (parseFloat(formData.zdsr) - parseFloat(formData.zread)).toFixed(2),
      difference: (parseFloat(formData.zdsr) - parseFloat(formData.actualpayment) + parseFloat(formData.cashiershortexcess)).toFixed(2),
      exception: (parseFloat(formData.totalpayment) - parseFloat(formData.totalarticlesale)).toFixed(2),
    };
  
    const requiredFields = ['date', 'store', 'submittedby', 'totalpayment', 'expectedpayment', 'zdsr', 'zread'];
    const missingFields = requiredFields.filter(field => !updatedFormData[field]);
  
    if (missingFields.length > 0) {
      setSnackbar({
        open: true,
        message: `Please fill the following required fields: ${missingFields.join(', ')}`,
        severity: 'warning',
      });
      return;
    }
  
    const currentDateTime = new Date();
    const options = { timeZone: "Asia/Kolkata", hour12: false };
    const currentDate = currentDateTime.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const currentTime = currentDateTime.toLocaleTimeString("en-GB", options);
  
    const dataToPost = {
      ...updatedFormData,
      user: username,
      submitted_time: `${currentDate}T${currentTime}`,
    };
  
    try {
      // Check if sale posting exists for the given store and date
      const checkResponse = await axios.get(`${API_BASE_URL}/api/sale-posting/`, {
        params: { date: formData.date, store: formData.store },
      });
  
      const existingEntry = checkResponse.data.find(entry => entry.date === formData.date);
  
      if (!existingEntry) {
        // No existing record, create a new entry
        const response = await axios.post(`${API_BASE_URL}/api/submit-sale-posting/`, dataToPost);
        if (response.status === 201) {
          setSnackbar({ open: true, message: 'Sale posting successfully submitted!', severity: 'success' });
          setIsEditMode(false);
          setSubmittedData(dataToPost);
        } else {
          setSnackbar({ open: true, message: 'Something went wrong!', severity: 'error' });
        }
        return;
      }
  
      // If the existing entry is verified, prevent modification
      if (existingEntry.verified) {
        setSnackbar({ open: true, message: 'This entry is already verified and cannot be modified.', severity: 'error' });
        return;
      }
  
      // If not verified, update the existing entry
      const response = await axios.put(`${API_BASE_URL}/api/update-sale-posting/${existingEntry.id}/`, dataToPost);
  
      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Sale posting successfully updated!', severity: 'success' });
        setIsEditMode(false);
        setSubmittedData(dataToPost);
      } else {
        setSnackbar({ open: true, message: 'Something went wrong!', severity: 'error' });
      }
    } catch (error) {
      console.error('Error submitting sale posting:', error);
      setSnackbar({ open: true, message: 'Failed to upload sale posting data.', severity: 'error' });
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value, 
    });
  };
  
  const fetchDataForEdit = async (id) => {
    if (!id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sale-posting/${id}/`);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching data for edit:", error);
      setSnackbar({ open: true, message: "Failed to fetch data for edit.", severity: "error" });
    }
  };
  
  const { id } = useParams(); 
  useEffect(() => {
    if (isEditMode && id) {
      fetchDataForEdit(id);
    }
  }, [isEditMode, id]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: "Please select a valid start and end date.", severity: "warning" });
      return;
    }
  

    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/${userid}/`);
      const profile = profileResponse.data;

      let params = {  start_date: startDate, end_date: endDate, user: username };
  
      if (profile.designation === 'Admin' || profile.designation === 'IT Manager') {
        if (store && store !== "None") {
          params.store = store;
        }
      } else {
        if (!store || store === "None") {
          setSnackbar({ open: true, message: "Please select a store.", severity: "warning" });
          return;
        }
        params.store = store;
      }
      const response = await axios.get(`${API_BASE_URL}/api/sale-posting/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({ open: true, message: "Failed to fetch data.", severity: "error" });
    }
  };

  const handleDownloadCSV = () => {
    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: "Please select a valid start and end date.", severity: "warning" });
      return;
    }
    const params = {
      start_date: startDate,
      end_date: endDate,
      user: username,
      action: "CSV"
    };
    if (store) params.store = store;
    axios
      .get(`${API_BASE_URL}/api/sale-posting/download/`, {
        params,
        responseType: 'json',
      })
      .then((response) => {
        const jsonData = response.data;
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Sale_Posting_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading data:", error);
        setSnackbar({ open: true, message: "Failed to download data.", severity: "error" });
      });
  };

  const convertToCSV = (jsonData) => {
    const header = ['Date', 'Store', 'Store Name' , 'Total Payment', 'Expected Payment', 'Actual Payment', 'Cashier Short/Excess', 'ZDSR', 'ZRead', 'ZDSRZRead', 
      'ZPMC', 'Difference', 'Total Article Sale', 'Exception', 'Remarks'];
    const rows = jsonData.map(item => [
      item.date,
      item.store,
      item.storename,
      item.totalpayment,
      item.expectedpayment,
      item.actualpayment,
      item.cashiershortexcess,
      item.zdsr,
      item.zread,
      item.zdsrzread,
      item.zpmc,
      item.difference,
      item.totalarticlesale,
      item.exception,
      `"${item.remarks || ""}"`,
    ]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  };

  const handleDownloadPDF = () => {
    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: "Please select a valid start and end date.", severity: "warning" });
      return;
    }
  
    const params = {
      start_date: startDate,
      end_date: endDate,
      user: username,
      action: "PDF"
    };
    if (store) params.store = store;
  
    axios
      .get(`${API_BASE_URL}/api/sale-posting/download/`, {
        params,
        responseType: 'json',
      })
      .then((response) => {
        const jsonData = response.data;
  
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [400, 230]
        });
  
        const tableColumns = ["Date", "Store", "Store Name", "Total Payment", "Expected Payment", "Actual Payment", "Cashier Short/Excess", "ZDSR",
          "ZRead", "ZDSRZRead", "ZPMC", "Difference", "Total Article Sale", "Exception", "Remarks"];
  
        const tableData = jsonData.map(item => [
          item.date, item.store, item.storename, item.totalpayment, item.expectedpayment, item.actualpayment,
          item.cashiershortexcess, item.zdsr, item.zread, item.zdsrzread,
          item.zpmc, item.difference, item.totalarticlesale, item.exception, item.remarks
        ]);
  
        doc.text("Sale Posting Data", 14, 10);
  
        doc.autoTable({
          head: [tableColumns],
          body: tableData,
          startY: 20,
          theme: 'striped',
        });
  
        doc.save(`Sale_Posting_${startDate}_to_${endDate}.pdf`);
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
        setSnackbar({ open: true, message: "Failed to download PDF.", severity: "error" });
      });
  };
  

  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF({
  //     orientation: 'landscape',
  //     unit: 'mm', 
  //     format: [400, 230]
  //   });
  //   const tableColumns = ["Date", 'Store', 'Store Name' , "Total Payment", "Expected Payment", "Actual Payment", "Cashier Short/Excess", "ZDSR",
  //      "ZRead", "ZDSRZRead", "ZPMC", "Difference", "Total Article Sale", "Exception", "Remarks"];
  
  //   const tableData = data.map(item => [
  //     item.date, item.store, item.storename, item.totalpayment, item.expectedpayment, item.actualpayment,
  //     item.cashiershortexcess, item.zdsr, item.zread, item.zdsrzread,
  //     item.zpmc, item.difference, item.totalarticlesale, item.exception, item.remarks
  //   ]);
  //   doc.text("Sale Posting Data", 14, 10);
  //   doc.autoTable({
  //     head: [tableColumns],
  //     body: tableData,
  //     startY: 20,
  //     theme: 'striped',
  //   });
  
  //   doc.save(`sale_posting_${date}.pdf`);
  // };
  
  const [editRowId, setEditRowId] = useState(null);
  const [updatedRow, setUpdatedRow] = useState({});
  
  const handleEditClick = (id) => {
    setEditRowId(id);
    const rowToEdit = data.find((item) => item.id === id);
    setUpdatedRow(rowToEdit);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRow({
      ...updatedRow,
      [name]: value,
    });
  };

  const handleInputChange1 = (e) => {
    const { name, value } = e.target;
  
    // Update the row with the changed value
    const newRow = {
      ...updatedRow,
      [name]: value,
    };
  
    // Parse float safely
    const safeParse = (val) => parseFloat(val) || 0;
  
    // Recalculate derived values
    newRow.zpmc = (safeParse(newRow.totalpayment) - safeParse(newRow.expectedpayment)).toFixed(2);
    newRow.zdsrzread = (safeParse(newRow.zdsr) - safeParse(newRow.zread)).toFixed(2);
    newRow.difference = (
      safeParse(newRow.zdsr) - safeParse(newRow.actualpayment) + safeParse(newRow.cashiershortexcess)
    ).toFixed(2);
    newRow.exception = (safeParse(newRow.totalpayment) - safeParse(newRow.totalarticlesale)).toFixed(2);
  
    setUpdatedRow(newRow);
  };
  
  const handleSaveClick = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/update-sale-posting/${editRowId}/`, 
        { ...updatedRow, user: username }  
      );
      if (response.status === 200) {
        setSnackbar({ open: true, message: "Row updated successfully!", severity: "success" });
        setData((prevData) =>
          prevData.map((item) =>
            item.id === editRowId ?  { ...updatedRow, user: username } : item  
          )
        );
        setEditRowId(null);
      } else {
        setSnackbar({ open: true, message: "Failed to update data.", severity: "error" });
      }
    } catch (error) {
      console.error("Error updating data:", error);
      setSnackbar({ open: true, message: "Error saving updates.", severity: "error" });
    }
  };
  
  const handleCancelClick = () => {
    setEditRowId(null);
  };
  
  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this sale posting?");
    if (confirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/delete-sale-posting/${id}/`, {
          data: { user: username }  
        });
        if (response.status === 200) {
          setData((prevData) => prevData.filter(item => item.id !== id));
          setSnackbar({ open: true, message: "Record deleted successfully!", severity: "success" });
        } else {
          setSnackbar({ open: true, message: "Failed to delete the record.", severity: "error" });
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        setSnackbar({ open: true, message: "Failed to delete the record.", severity: "error" });
      }
    }
  };
  
  const formatDetails = (details) => {
    if (details && typeof details === 'object') {
      return Object.entries(details)
        .map(([key, value]) => {
          const formattedValue = typeof value === 'object' ? formatDetails(value) : `"${value}"`;
          return `"${key}":${formattedValue}`;
        })
        .join(", ");
    }
    return `"${details}"`; 
  };
  
  const [history, setHistory] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (selectedTab === 2) {  
      fetchHistory();
    }
  }, [selectedTab]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sale-posting/`, {
        params: { action: 'history' }
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  
    const sortedData = [...data].sort((a, b) => {
      const valA = a[key] ?? ''; 
      const valB = b[key] ?? '';
  
      if (valA === '' && valB !== '') return direction === 'asc' ? 1 : -1; 
      if (valA !== '' && valB === '') return direction === 'asc' ? -1 : 1;
  
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
  
      return valA.toString().localeCompare(valB.toString(), undefined, { numeric: true }) * (direction === 'asc' ? 1 : -1);
    });
  
    setData(sortedData);
  };
  

  const getTabsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <Tab value={0}>Sales Posting Form</Tab>
            <Tab value={1}>Sales Data</Tab>
            <Tab value={2}>History</Tab>
          </>
        );
      case 'End_User':
        return <Tab value={0}>Sales Posting Form</Tab>
      case 'Management_User':
        return (
          <>
            <Tab value={0}>Sales Posting Form</Tab>
            <Tab value={1}>Sales Data</Tab>
            <Tab value={2}>History</Tab>
          </>
        );
      default:
        return null;
    }
  };

  const handleVerify = async () => {
    try {
      const idsToVerify = data.filter(item => !item.verified).map(item => item.id);
  
      if (idsToVerify.length > 0) {
        await Promise.all(idsToVerify.map(id =>
          axios.put(`${API_BASE_URL}/api/update-sale-posting/${id}/`, { 
            verified: true, Varifiedby:username, user: username })
        ));
  
        setData([]);  
        fetchData(false); 
        
        setSnackbar({ open: true, message:"Selected records have been verified.", severity: "success" });
      } else {
        setSnackbar({ open: true, message:"No records selected for verification.", severity: "error" });
      }
    } catch (error) {
      console.error("Error verifying records:", error);
      setSnackbar({ open: true, message:"Failed to verify records.", severity: "error" });
    }
  };
  

  const getTabPanelsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto', minHeight: '1000px' }}>
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      Sale Posting
                    </Typography>
                    {isEditMode && (
                      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                        sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                        Submit
                      </Button>
                    )}
                  </Box>
                  {isEditMode ? (
                    <form onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Date"
                          name="date"
                          type="date"
                          fullWidth
                          value={formData.date}
                          onChange={handleChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            fontSize: '0.75rem', 
                          }}
                        />
                        <FormControl fullWidth>
                          <InputLabel id="store-select-label" 
                          sx={{
                            fontSize: '1rem',
                            backgroundColor: 'white',
                            px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)',
                            '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',
                            },
                          }}>
                            Store</InputLabel>
                          <Select
                            labelId="store-select-label"
                            value={formData.store}
                            onChange={(e) => {
                              console.log('Store selected:', e.target.value);
                              handleStoreChange(e);
                            }}
                            name="store"
                            required
                            sx={{ fontSize: '0.8rem', height: '56px', '& .MuiInputBase-input': { textAlign: 'left'}}}
                            MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px'}} }}}
                          >
                            {stores.length > 0 ? (
                              stores.map((store) => (
                                <MenuItem key={store.storecode} value={store.storecode}>
                                  {store.storecode}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No stores available</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Store Name"
                          name="storename"
                          value={formData.storename}
                          onChange={handleChange}
                          fullWidth
                          sx={{ fontSize: '0.35rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Total Payment" type="number" fullWidth name="totalpayment" value={formData.totalpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZDSR" type="number" fullWidth name="zdsr" value={formData.zdsr} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Cashier Short / Excess" type="number" fullWidth name="cashiershortexcess" value={formData.cashiershortexcess} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Expected Payment" type="number" name="expectedpayment" fullWidth value={formData.expectedpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZREAD" type="number" fullWidth name="zread" value={formData.zread} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Exception" fullWidth name="exception" value={(Math.round((formData.totalpayment-formData.totalarticlesale) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Actual Payment" type="number" fullWidth name="actualpayment" value={formData.actualpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/> 
                        <TextField label="ZPMC Difference" type="number" fullWidth name="zpmc" value={(Math.round((formData.totalpayment-formData.expectedpayment) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Difference" type="number" fullWidth name="difference" value={(Math.round((formData.zdsr - formData.actualpayment + formData.cashiershortexcess) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Total Article Sale" type="number" fullWidth name="totalarticlesale" value={formData.totalarticlesale} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZDSR - ZREAD" type="number" fullWidth name="zdsrzread" value={(Math.round((formData.zdsr - formData.zread) * 100) / 100).toFixed(2)}  onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField
                          label="Submitted By"
                          name="submittedby"
                          value={formData.submittedby}
                          onChange={handleChange}
                          fullWidth
                          type="text"
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      <Box sx={{ marginBottom: 4 }}>
                        <TextField label="Remarks" fullWidth multiline rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
                      </Box>
                    </form>
                  ):(
                    <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1200 }}>
                      <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                              <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          <TableRow>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                            <TableCell align="center">{submittedData?.date}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                            <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                            <TableCell align="center">{submittedData?.submittedby}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell  colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Expected Payment</TableCell>
                            <TableCell align="center">{submittedData?.expectedpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZDSR</TableCell>
                            <TableCell align="center">{submittedData?.zdsr}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Actual Payment</TableCell>
                            <TableCell align="center">{submittedData?.actualpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZREAD</TableCell>
                            <TableCell align="center">{submittedData?.zread}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Total Payment</TableCell>
                            <TableCell align="center">{submittedData?.totalpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZPMC Difference</TableCell>
                            <TableCell align="center">{submittedData?.zpmc}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Total Article Sale</TableCell>
                            <TableCell align="center">{submittedData?.totalarticlesale}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZDSR - ZREAD</TableCell>
                            <TableCell align="center">{submittedData?.zdsrzread}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Exception</TableCell>
                            <TableCell align="center">{submittedData?.exception}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Cashier Short / Excess</TableCell>
                            <TableCell align="center">{submittedData?.cashiershortexcess}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Difference</TableCell>
                            <TableCell align="center">{submittedData?.difference}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Remarks</TableCell>
                            <TableCell align="center">{submittedData?.remarks}</TableCell>
                          </TableRow>
                          </TableBody>
                        </Table>
                        </TableContainer>
                    </Paper>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleEdit}
                      sx={{
                        marginTop: 2,
                        backgroundColor: '#113f6c', 
                        '&:hover': {
                          backgroundColor: '#0f3555', 
                        },
                      }}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => navigate('/')} 
                      sx={{
                        marginTop: 2,
                        backgroundColor: '#5a9a82',
                        '&:hover': {
                          backgroundColor: '#3e755e', 
                        },
                      }}
                      fullWidth
                    >
                      Home
                    </Button>
                  </Box>
                )}
              </Paper>
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert onClose={handleSnackbarClose} severity={snackbar.type}           
                  sx={{
                    width: "100%",
                    marginTop: "70px",
                    backgroundColor: snackbar.severity === "error" ? "#df7a7a" : snackbar.severity === "success" ? "green" : "",
                    color: "black",
                  }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
              </Box>
            </TabPanel>
            <TabPanel value={1}>
              <div>
                <h2>Sales Posting</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5}}>
                  <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }}  value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ flex: 1 }} />
                  <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ flex: 1 }} />
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel id="store-select-label" 
                    sx={{
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      px: 0.5,
                      transform: 'translate(14px, 14px) scale(1)',
                      '&.Mui-focused, &.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -6px) scale(0.75)',
                      },
                    }}>
                      Store</InputLabel>
                      <Select
                        labelId="store-select-label"
                        value={store|| "None"}
                        onChange={(e) => {
                          setStore( e.target.value);
                          handleStoreChange(e);
                        }}
                        name="store"
                      >
                        <MenuItem value="None">All</MenuItem>
                        {stores.length > 0 ? (
                          stores.map((store) => (
                            <MenuItem key={store.storecode} value={store.storecode}>
                              {store.storecode}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No stores available</MenuItem>
                        )}
                      </Select>
                  </FormControl>
                  <Button variant="contained" onClick={fetchData}
                    sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px', }}>
                    Fetch Data
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleDownloadCSV} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                    <DownloadIcon />
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleDownloadPDF} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#800000', '&:hover': { backgroundColor: '#660000' }}} >
                    <PictureAsPdfIcon />
                  </Button>
                </Box>

                <Sheet sx={{ marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                  <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1, overflowY: 'auto'}}>
                  <div style={{ maxHeight: '589px', overflowY: 'auto' , border: '1px solid #113f6c'}}>
                    <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                      <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1000}}>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                             <TableSortLabel active={sortConfig.key === 'date'} direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'submitted_time'} direction={sortConfig.key === 'submitted_time' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submitted_time')}>Time</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'submittedby'} direction={sortConfig.key === 'submittedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submittedby')}>Submitted By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'storename'} direction={sortConfig.key === 'storename' ? sortConfig.direction : 'asc'} onClick={() => handleSort('storename')}>Store Name</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}> 
                            <TableSortLabel active={sortConfig.key === 'totalpayment'} direction={sortConfig.key === 'totalpayment' ? sortConfig.direction : 'asc'} onClick={() => handleSort('totalpayment')}>Total Payment</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'expectedpayment'} direction={sortConfig.key === 'expectedpayment' ? sortConfig.direction : 'asc'} onClick={() => handleSort('expectedpayment')}>Expected Payment</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'actualpayment'} direction={sortConfig.key === 'actualpayment' ? sortConfig.direction : 'asc'} onClick={() => handleSort('actualpayment')}>Actual Payment</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'cashiershortexcess'} direction={sortConfig.key === 'cashiershortexcess' ? sortConfig.direction : 'asc'} onClick={() => handleSort('cashiershortexcess')}>Cashier Short / Excess</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zdsr'} direction={sortConfig.key === 'zdsr' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zdsr')}>ZDSR</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zread'} direction={sortConfig.key === 'zread' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zread')}>ZREAD</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zdsrzread'} direction={sortConfig.key === 'zdsrzread' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zdsrzread')}>ZDSR - ZREAD</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zpmc'} direction={sortConfig.key === 'zpmc' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zpmc')}>ZPMC Difference</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'difference'} direction={sortConfig.key === 'difference' ? sortConfig.direction : 'asc'} onClick={() => handleSort('difference')}>Difference</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'totalarticlesale'} direction={sortConfig.key === 'totalarticlesale' ? sortConfig.direction : 'asc'} onClick={() => handleSort('totalarticlesale')}>Total Article Sale</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>                        
                            <TableSortLabel active={sortConfig.key === 'exception'} direction={sortConfig.key === 'exception' ? sortConfig.direction : 'asc'} onClick={() => handleSort('exception')}>Exception</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'remarks'} direction={sortConfig.key === 'remarks' ? sortConfig.direction : 'asc'} onClick={() => handleSort('remarks')}>Remarks</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'verifiedby'} direction={sortConfig.key === 'verifiedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('verifiedby')}>Verified By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((item, i) => {
                          const isMismatch =
                            item.zdsr !== item.zread ||
                            item.zdsr !== item.totalpayment ||
                            item.zdsr !== item.expectedpayment;

                        return (
                          <TableRow key={item.id} hover
                            sx={{ '&:hover': { backgroundColor: '#e3f2fd' }, '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' }, }} >
                            
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '3%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="text" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                  <input type="text" name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                  <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="totalpayment" value={updatedRow.totalpayment || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="expectedpayment" value={updatedRow.expectedpayment || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="actualpayment" value={updatedRow.actualpayment || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="cashiershortexcess"  value={updatedRow.cashiershortexcess || ''} onChange={handleInputChange}  style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zdsr" value={updatedRow.zdsr || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zread" value={updatedRow.zread || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }}  />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zdsrzread"  value={updatedRow.zdsrzread || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zpmc" value={updatedRow.zpmc || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="difference" value={updatedRow.difference || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="totalarticlesale" value={updatedRow.totalarticlesale || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="exception" value={updatedRow.exception || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="remarks" value={updatedRow.remarks || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={handleSaveClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#466957', '&:hover': { backgroundColor: '#466957' }, minHeight: "30px", minWidth: "50px" }}
                                    >
                                      <DoneOutlineIcon />
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="secondary"
                                      onClick={handleCancelClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#732f2ab8', '&:hover': { backgroundColor: '#732f2ab8' }, minHeight: "30px", minWidth: "50px" }}
                                    >
                                      <CloseIcon />
                                    </Button>
                                  </Box>
                                </TableCell>
                              </>
                            ) : (
                              <>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '3%' }}>
                                {i + 1}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.date}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submitted_time}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.store}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.storename}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.totalpayment}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.expectedpayment}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.actualpayment}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.cashiershortexcess}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.zdsr}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.zread}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' , color: item.zdsrzread  !== '0.00' ? 'red' : 'black' }}>{item.zdsrzread}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' , color: item.zpmc  !== '0.00' ? 'red' : 'black' }}>{item.zpmc}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' , color: item.difference  !== '0.00' ? 'red' : 'black' }}>{item.difference}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.totalarticlesale}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.exception}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.remarks}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.verifiedby}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button  variant="contained" color="primary" onClick={() => handleEditClick(item.id)}
                                    sx={{ fontSize: '0.4rem', padding: '4px 12px', backgroundColor: '#466957', '&:hover': { backgroundColor: '#466957' },minWidth : "5px" }} >
                                    <EditIcon />
                                  </Button>
                                  <Button variant="contained" color="secondary" onClick={() => handleDeleteClick(item.id)}
                                    sx={{ fontSize: '0.4rem', padding: '4px 12px', backgroundColor: '#732f2ab8', '&:hover': { backgroundColor: '#732f2ab8' },minWidth : "5px"}} >
                                    <DeleteIcon />
                                  </Button>
                                </Box>
                              </TableCell>
                              </>
                            )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    </div>
                  </TableContainer>
                </Sheet>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerify}
                  disabled={data.every(item => item.verified)} // Disable if all are verified
                  sx={{
                    backgroundColor: data.every(item => item.verified) ? '#9e9e9e' : '#4caf50', 
                    '&:hover': { backgroundColor: !data.every(item => item.verified) ? '#388e3c' : '#9e9e9e' },
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    width:"130vh",
                    marginTop:"6px",
                    marginLeft:"17px"
                  }}
                >
                  Verify
                </Button>
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
                  <Alert onClose={handleSnackbarClose} severity={snackbar.severity} 
                    sx={{
                      width: "100%",
                      marginTop: "70px",
                      backgroundColor: snackbar.severity === "error" ? "red" : snackbar.severity === "success" ? "green" : "",
                      color: "black",
                    }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
              </div>
            </TabPanel>
            <TabPanel value={2}>
              <div style={{ width: '100%',marginLeft:"90px", marginTop: '20px' }}>
                {history.length > 0 ? (
                  <TableContainer component={Paper} style={{ maxHeight: 750, maxWidth: 1330, overflow: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Action</strong></TableCell>
                          <TableCell><strong>User</strong></TableCell>
                          <TableCell><strong>Timestamp</strong></TableCell>
                          <TableCell><strong>Details</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell style={{ fontSize: '0.71rem' }}>{log.action}</TableCell>
                            <TableCell style={{ fontSize: '0.71rem' }}>{log.user}</TableCell>
                            <TableCell style={{ fontSize: '0.71rem' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell style={{ fontSize: '0.71rem' }}>{formatDetails(log.details)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <p>No history available.</p>
                )}
              </div>
            </TabPanel>
          </>
        );
        case 'End_User':
          return <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto', minHeight: '1000px' }}>
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      Sale Posting
                    </Typography>
                    {isEditMode && (
                      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                        sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                        Submit
                      </Button>
                    )}
                  </Box>
                  {isEditMode ? (
                    <form onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <TextField
                          label="Date"
                          name="date"
                          type="date"
                          fullWidth
                          value={formData.date}
                          onChange={handleChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            fontSize: '0.75rem', 
                          }}
                        />
                        <FormControl fullWidth>
                          <InputLabel id="store-select-label" 
                          sx={{
                            fontSize: '1rem',
                            backgroundColor: 'white',
                            px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)',
                            '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',
                            },
                          }}>
                            Store</InputLabel>
                          <Select
                            labelId="store-select-label"
                            value={formData.store}
                            onChange={(e) => {
                              console.log('Store selected:', e.target.value);
                              handleStoreChange(e);
                            }}
                            name="store"
                            required
                            sx={{ fontSize: '0.8rem', height: '56px', '& .MuiInputBase-input': { textAlign: 'left'}}}
                            MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px'}} }}}
                          >
                            {stores.length > 0 ? (
                              stores.map((store) => (
                                <MenuItem key={store.storecode} value={store.storecode}>
                                  {store.storecode}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No stores available</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Store Name"
                          name="storename"
                          value={formData.storename}
                          onChange={handleChange}
                          fullWidth
                          sx={{ fontSize: '0.35rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Total Payment" type="number" fullWidth name="totalpayment" value={formData.totalpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZDSR" type="number" fullWidth name="zdsr" value={formData.zdsr} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Cashier Short / Excess" type="number" fullWidth name="cashiershortexcess" value={formData.cashiershortexcess} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Expected Payment" type="number" name="expectedpayment" fullWidth value={formData.expectedpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZREAD" type="number" fullWidth name="zread" value={formData.zread} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Exception" fullWidth name="exception" value={(Math.round((formData.totalpayment-formData.totalarticlesale) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Actual Payment" type="number" fullWidth name="actualpayment" value={formData.actualpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/> 
                        <TextField label="ZPMC Difference" type="number" fullWidth name="zpmc" value={(Math.round((formData.totalpayment-formData.expectedpayment) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Difference" type="number" fullWidth name="difference" value={(Math.round((formData.zdsr - formData.actualpayment + formData.cashiershortexcess) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Total Article Sale" type="number" fullWidth name="totalarticlesale" value={formData.totalarticlesale} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZDSR - ZREAD" type="number" fullWidth name="zdsrzread" value={(Math.round((formData.zdsr - formData.zread) * 100) / 100).toFixed(2)}  onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField
                          label="Submitted By"
                          name="submittedby"
                          value={formData.submittedby}
                          onChange={handleChange}
                          fullWidth
                          type="text"
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      <Box sx={{ marginBottom: 4 }}>
                        <TextField label="Remarks" fullWidth multiline rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
                      </Box>
                    </form>
                  ):(
                    <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1200 }}>
                      <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                              <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          <TableRow>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                            <TableCell align="center">{submittedData?.date}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                            <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                            <TableCell align="center">{submittedData?.submittedby}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell  colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Expected Payment</TableCell>
                            <TableCell align="center">{submittedData?.expectedpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZDSR</TableCell>
                            <TableCell align="center">{submittedData?.zdsr}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Actual Payment</TableCell>
                            <TableCell align="center">{submittedData?.actualpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZREAD</TableCell>
                            <TableCell align="center">{submittedData?.zread}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Total Payment</TableCell>
                            <TableCell align="center">{submittedData?.totalpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZPMC Difference</TableCell>
                            <TableCell align="center">{submittedData?.zpmc}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Total Article Sale</TableCell>
                            <TableCell align="center">{submittedData?.totalarticlesale}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZDSR - ZREAD</TableCell>
                            <TableCell align="center">{submittedData?.zdsrzread}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Exception</TableCell>
                            <TableCell align="center">{submittedData?.exception}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Cashier Short / Excess</TableCell>
                            <TableCell align="center">{submittedData?.cashiershortexcess}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Difference</TableCell>
                            <TableCell align="center">{submittedData?.difference}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Remarks</TableCell>
                            <TableCell align="center">{submittedData?.remarks}</TableCell>
                          </TableRow>
                          </TableBody>
                        </Table>
                        </TableContainer>
                    </Paper>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleEdit}
                      sx={{
                        marginTop: 2,
                        backgroundColor: '#113f6c', 
                        '&:hover': {
                          backgroundColor: '#0f3555', 
                        },
                      }}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => navigate('/')} 
                      sx={{
                        marginTop: 2,
                        backgroundColor: '#5a9a82',
                        '&:hover': {
                          backgroundColor: '#3e755e', 
                        },
                      }}
                      fullWidth
                    >
                      Home
                    </Button>
                  </Box>
                )}
              </Paper>
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert onClose={handleSnackbarClose} severity={snackbar.type}           
                  sx={{
                    width: "100%",
                    marginTop: "70px",
                    backgroundColor: snackbar.severity === "error" ? "#df7a7a" : snackbar.severity === "success" ? "green" : "",
                    color: "black",
                  }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
              </Box>
            </TabPanel>
      case 'Management_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto', minHeight: '1000px' }}>
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      Sale Posting
                    </Typography>
                    {isEditMode && (
                      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                        sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                        Submit
                      </Button>
                    )}
                  </Box>
                  {isEditMode ? (
                    <form onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                            label="Date"
                            name="date"
                            type="date"
                            fullWidth
                            value={formData.date}
                            onChange={handleChange}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            sx={{
                              fontSize: '0.75rem', 
                            }}
                          />
                          <FormControl fullWidth>
                            <InputLabel id="store-select-label" 
                            sx={{
                              fontSize: '1rem',
                              backgroundColor: 'white',
                              px: 0.5,
                              transform: 'translate(14px, 14px) scale(1)',
                              '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)',
                              },
                            }}>
                              Store</InputLabel>
                            <Select
                              labelId="store-select-label"
                              value={formData.store}
                              onChange={(e) => {
                                console.log('Store selected:', e.target.value);
                                handleStoreChange(e);
                              }}
                              name="store"
                              required
                              sx={{ fontSize: '0.8rem', height: '56px', '& .MuiInputBase-input': { textAlign: 'left'}}}
                              MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px'}} }}}
                            >
                              {stores.length > 0 ? (
                                stores.map((store) => (
                                  <MenuItem key={store.storecode} value={store.storecode}>
                                    {store.storecode}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>No stores available</MenuItem>
                              )}
                            </Select>
                          </FormControl>
                          <TextField
                            label="Store Name"
                            name="storename"
                            value={formData.storename}
                            onChange={handleChange}
                            fullWidth
                            sx={{ fontSize: '0.35rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                          />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Total Payment" type="number" fullWidth name="totalpayment" value={formData.totalpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZDSR" type="number" fullWidth name="zdsr" value={formData.zdsr} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Cashier Short / Excess" type="number" fullWidth name="cashiershortexcess" value={formData.cashiershortexcess} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Expected Payment" type="number" name="expectedpayment" fullWidth value={formData.expectedpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZREAD" type="number" fullWidth name="zread" value={formData.zread} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Exception" fullWidth name="exception" value={(Math.round((formData.totalpayment-formData.totalarticlesale) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Actual Payment" type="number" fullWidth name="actualpayment" value={formData.actualpayment} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/> 
                        <TextField label="ZPMC Difference" type="number" fullWidth name="zpmc" value={(Math.round((formData.totalpayment-formData.expectedpayment) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="Difference" type="number" fullWidth name="difference" value={(Math.round((formData.zdsr - formData.actualpayment + formData.cashiershortexcess) * 100) / 100).toFixed(2)} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField label="Total Article Sale" type="number" fullWidth name="totalarticlesale" value={formData.totalarticlesale} onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField label="ZDSR - ZREAD" type="number" fullWidth name="zdsrzread" value={(Math.round((formData.zdsr - formData.zread) * 100) / 100).toFixed(2)}  onChange={handleChange} sx={{ fontSize: '0.9rem',}} inputProps={{ step: "0.01" }}/>
                        <TextField
                          label="Submitted By"
                          name="submittedby"
                          value={formData.submittedby}
                          onChange={handleChange}
                          fullWidth
                          type="text"
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      <Box sx={{ marginBottom: 4 }}>
                        <TextField label="Remarks" fullWidth multiline rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
                      </Box>
                    </form>
                  ):(
                    <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1200 }}>
                      <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                              <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          <TableRow>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                            <TableCell align="center">{submittedData?.date}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                            <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                            <TableCell align="center">{submittedData?.submittedby}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell  colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Expected Payment</TableCell>
                            <TableCell align="center">{submittedData?.expectedpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZDSR</TableCell>
                            <TableCell align="center">{submittedData?.zdsr}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Actual Payment</TableCell>
                            <TableCell align="center">{submittedData?.actualpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZREAD</TableCell>
                            <TableCell align="center">{submittedData?.zread}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Total Payment</TableCell>
                            <TableCell align="center">{submittedData?.totalpayment}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZPMC Difference</TableCell>
                            <TableCell align="center">{submittedData?.zpmc}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Total Article Sale</TableCell>
                            <TableCell align="center">{submittedData?.totalarticlesale}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>ZDSR - ZREAD</TableCell>
                            <TableCell align="center">{submittedData?.zdsrzread}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Exception</TableCell>
                            <TableCell align="center">{submittedData?.exception}</TableCell>
                            <TableCell colSpan={2} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Cashier Short / Excess</TableCell>
                            <TableCell align="center">{submittedData?.cashiershortexcess}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Difference</TableCell>
                            <TableCell align="center">{submittedData?.difference}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Remarks</TableCell>
                            <TableCell align="center">{submittedData?.remarks}</TableCell>
                          </TableRow>
                          </TableBody>
                        </Table>
                        </TableContainer>
                    </Paper>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleEdit}
                      sx={{
                        marginTop: 2,
                        backgroundColor: '#113f6c', 
                        '&:hover': {
                          backgroundColor: '#0f3555', 
                        },
                      }}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => navigate('/')} 
                      sx={{
                        marginTop: 2,
                        backgroundColor: '#5a9a82',
                        '&:hover': {
                          backgroundColor: '#3e755e', 
                        },
                      }}
                      fullWidth
                    >
                      Home
                    </Button>
                  </Box>
                )}
              </Paper>
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert onClose={handleSnackbarClose} severity={snackbar.type}           
                  sx={{
                    width: "100%",
                    marginTop: "70px",
                    backgroundColor: snackbar.severity === "error" ? "#df7a7a" : snackbar.severity === "success" ? "green" : "",
                    color: "black",
                  }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
              </Box>
            </TabPanel>
            <TabPanel value={1}>
              <div>
                <h2>Sales Posting</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5}}>
                  <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }}  value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ flex: 1 }} />
                  <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ flex: 1 }} />
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel
                      id="store-select-label"
                      sx={{
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        px: 0.5,
                        transform: 'translate(14px, 14px) scale(1)',
                        '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',
                        },
                      }}
                    >
                      Store
                    </InputLabel>
                    <Select
                      labelId="store-select-label"
                      value={store || (profile?.designation === 'Admin' || profile?.designation === 'IT Manager' ? "None" : "")}
                      onChange={(e) => {
                        setStore(e.target.value);
                        handleStoreChange(e);
                      }}
                      name="store"
                    >
                      {(profile?.designation === 'Admin' || profile?.designation === 'IT Manager') && (
                        <MenuItem value="None">All</MenuItem>
                      )}
                      
                      {stores.length > 0 ? (
                        stores.map((store) => (
                          <MenuItem key={store.storecode} value={store.storecode}>
                            {store.storecode} - {store.storename}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No stores available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <Button variant="contained" onClick={fetchData}
                    sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px', }}>
                    Fetch Data
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleDownloadCSV} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                    <DownloadIcon />
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleDownloadPDF} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#800000', '&:hover': { backgroundColor: '#660000' }}} >
                    <PictureAsPdfIcon />
                  </Button>
                </Box>

                <Sheet sx={{ marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1, overflowY: 'auto'}}>
                  <div style={{ maxHeight: '589px', overflowY: 'auto' , border: '1px solid #113f6c'}}>
                    <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                      <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1000}}>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                             <TableSortLabel active={sortConfig.key === 'date'} direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'submitted_time'} direction={sortConfig.key === 'submitted_time' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submitted_time')}>Time</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'submittedby'} direction={sortConfig.key === 'submittedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submittedby')}>Submitted By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'storename'} direction={sortConfig.key === 'storename' ? sortConfig.direction : 'asc'} onClick={() => handleSort('storename')}>Store Name</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}> 
                            <TableSortLabel active={sortConfig.key === 'totalpayment'} direction={sortConfig.key === 'totalpayment' ? sortConfig.direction : 'asc'} onClick={() => handleSort('totalpayment')}>Total Payment</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'expectedpayment'} direction={sortConfig.key === 'expectedpayment' ? sortConfig.direction : 'asc'} onClick={() => handleSort('expectedpayment')}>Expected Payment</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'actualpayment'} direction={sortConfig.key === 'actualpayment' ? sortConfig.direction : 'asc'} onClick={() => handleSort('actualpayment')}>Actual Payment</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'cashiershortexcess'} direction={sortConfig.key === 'cashiershortexcess' ? sortConfig.direction : 'asc'} onClick={() => handleSort('cashiershortexcess')}>Cashier Short / Excess</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zdsr'} direction={sortConfig.key === 'zdsr' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zdsr')}>ZDSR</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zread'} direction={sortConfig.key === 'zread' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zread')}>ZREAD</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zdsrzread'} direction={sortConfig.key === 'zdsrzread' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zdsrzread')}>ZDSR - ZREAD</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zpmc'} direction={sortConfig.key === 'zpmc' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zpmc')}>ZPMC Difference</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'difference'} direction={sortConfig.key === 'difference' ? sortConfig.direction : 'asc'} onClick={() => handleSort('difference')}>Difference</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'totalarticlesale'} direction={sortConfig.key === 'totalarticlesale' ? sortConfig.direction : 'asc'} onClick={() => handleSort('totalarticlesale')}>Total Article Sale</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>                        
                            <TableSortLabel active={sortConfig.key === 'exception'} direction={sortConfig.key === 'exception' ? sortConfig.direction : 'asc'} onClick={() => handleSort('exception')}>Exception</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'remarks'} direction={sortConfig.key === 'remarks' ? sortConfig.direction : 'asc'} onClick={() => handleSort('remarks')}>Remarks</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'verifiedby'} direction={sortConfig.key === 'verifiedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('verifiedby')}>Verified By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((item, i) => {
                          const isMismatch =
                            item.zdsr !== item.zread ||
                            item.zdsr !== item.totalpayment ||
                            item.zdsr !== item.expectedpayment;

                        return (
                          <TableRow key={item.id} hover
                            sx={{ '&:hover': { backgroundColor: '#e3f2fd' }, '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' }, }} >
                            
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="text" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                  <input type="text" name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                  <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="totalpayment" value={updatedRow.totalpayment || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="expectedpayment" value={updatedRow.expectedpayment || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="actualpayment" value={updatedRow.actualpayment || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="cashiershortexcess"  value={updatedRow.cashiershortexcess || ''} onChange={handleInputChange}  style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zdsr" value={updatedRow.zdsr || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zread" value={updatedRow.zread || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }}  />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zdsrzread"  value={updatedRow.zdsrzread || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="zpmc" value={updatedRow.zpmc || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="difference" value={updatedRow.difference || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="totalarticlesale" value={updatedRow.totalarticlesale || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="exception" value={updatedRow.exception || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="remarks" value={updatedRow.remarks || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={handleSaveClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#466957', '&:hover': { backgroundColor: '#466957' }, minHeight: "30px", minWidth: "50px" }}
                                    >
                                      <DoneOutlineIcon />
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="secondary"
                                      onClick={handleCancelClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#732f2ab8', '&:hover': { backgroundColor: '#732f2ab8' }, minHeight: "30px", minWidth: "50px" }}
                                    >
                                      <CloseIcon />
                                    </Button>
                                  </Box>
                                </TableCell>
                              </>
                            ) : (
                              <>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '1%' }}>
                                {i + 1}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.date}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submitted_time}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.store}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.storename}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.totalpayment}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.expectedpayment}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.actualpayment}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.cashiershortexcess}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.zdsr}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: isMismatch ? '#d32f2f' : 'inherit' }}>{item.zread}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' , color: item.zdsrzread  !== '0.00' ? 'red' : 'black' }}>{item.zdsrzread}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' , color: item.zpmc  !== '0.00' ? 'red' : 'black' }}>{item.zpmc}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' , color: item.difference  !== '0.00' ? 'red' : 'black' }}>{item.difference}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.totalarticlesale}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.exception}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.remarks}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.verifiedby}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button  variant="contained" color="primary" onClick={() => handleEditClick(item.id)}
                                    sx={{ fontSize: '0.4rem', padding: '4px 12px', backgroundColor: '#466957', '&:hover': { backgroundColor: '#466957' },minWidth : "5px" }} >
                                    <EditIcon />
                                  </Button>
                                  <Button variant="contained" color="secondary" onClick={() => handleDeleteClick(item.id)}
                                    sx={{ fontSize: '0.4rem', padding: '4px 12px', backgroundColor: '#732f2ab8', '&:hover': { backgroundColor: '#732f2ab8' },minWidth : "5px"}} >
                                    <DeleteIcon />
                                  </Button>
                                </Box>
                              </TableCell>
                              </>
                            )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    </div>
                  </TableContainer>
                </Sheet>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerify}
                  disabled={data.every(item => item.verified)} // Disable if all are verified
                  sx={{
                    backgroundColor: data.every(item => item.verified) ? '#9e9e9e' : '#4caf50', 
                    '&:hover': { backgroundColor: !data.every(item => item.verified) ? '#388e3c' : '#9e9e9e' },
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    width:"130vh",
                    marginTop:"6px",
                    marginLeft:"17px"
                  }}
                >
                  Verify
                </Button>
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
                  <Alert onClose={handleSnackbarClose} severity={snackbar.severity} 
                    sx={{
                      width: "100%",
                      marginTop: "70px",
                      backgroundColor: snackbar.severity === "error" ? "red" : snackbar.severity === "success" ? "green" : "",
                      color: "black",
                    }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
              </div>
            </TabPanel>
            <TabPanel value={2}>
              <div style={{ width: '100%',marginLeft:"90px", marginTop: '20px' }}>
                {history.length > 0 ? (
                  <TableContainer component={Paper} style={{ maxHeight: 750, maxWidth: 1330, overflow: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Action</strong></TableCell>
                          <TableCell><strong>User</strong></TableCell>
                          <TableCell><strong>Timestamp</strong></TableCell>
                          <TableCell><strong>Details</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell style={{ fontSize: '0.71rem' }}>{log.action}</TableCell>
                            <TableCell style={{ fontSize: '0.71rem' }}>{log.user}</TableCell>
                            <TableCell style={{ fontSize: '0.71rem' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell style={{ fontSize: '0.71rem' }}>{formatDetails(log.details)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <p>No history available.</p>
                )}
              </div>
            </TabPanel>         
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Tabs value={selectedTab} onChange={(event, value) => setSelectedTab(value)}>
        <TabsList>
          {getTabsForUserGroup()}
        </TabsList>
        {getTabPanelsForUserGroup()}
      </Tabs>
    </div>
  );
};

export default SalePosting;



