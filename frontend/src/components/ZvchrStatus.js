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
import Grid from '@mui/material/Grid';
import { Paper, Button, Box , Typography, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'; 
import Sheet from '@mui/joy/Sheet';
import DownloadIcon from '@mui/icons-material/Download';
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
import { Today } from "@mui/icons-material";
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

const ZvchrStatus = () => {
  const [formData, setFormData] = useState({
    date: '',
    store: '',
    storename:'',
    pter: '',
    ptes: '',
    ptvr: '',
    ptvs: '',
    zqer: '',
    zqgr: '',
    zqgs: '',
    submittedby:"",
    remarks: '', 
  });

  const navigate = useNavigate();
  const [submittedData, setSubmittedData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [date, setDate] = useState('');
  const [store, setStore] = useState("");
  const [data, setData] = useState([]);

  const [stores, setStores] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
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
      const today = location.state.date;
      const storeFromDashboard = location.state.store;

      setTabValue(1);
      setSelectedTab(1);
      setDate(today);
      setStore(storeFromDashboard);

      setTimeout(() => {
        fetchDataAuto(storeFromDashboard, today);
      }, 100);
    }
  }, [userGroup, location.state]);  

  const fetchDataAuto = async (storeCode, date) => {
    try {
      const localUsername = localStorage.getItem('username') || '';
      const fallbackStore = localStorage.getItem('store') || '';
  
      const params = {
        date: date,
        user: localUsername,
        store: storeCode || fallbackStore,
      };
  
      const response = await axios.get(`${API_BASE_URL}/api/upload-zvchr-status/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbarMessage("Failed to fetch auto-loaded data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
      setSnackbarMessage("Error fetching profile.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
};

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stores/`);
      setStores(response.data);
    } catch (error) {
      setSnackbarMessage("Error fetching store.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
  useEffect(() => {
    if (snackbarOpen) {
      const timeout = setTimeout(() => {
        setSnackbarOpen(false);
      }, 3000); 
      return () => clearTimeout(timeout);
    }
  }, [snackbarOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "store", "date", "submittedby", 
      "pter", "ptes", "ptvs", "ptvr", 
      "zqgr", "zqgs", "zqer"
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if ((formData.pter === "Not Updated" || formData.pter === "Error" ||
         formData.ptes === "Not Updated" || formData.ptes === "Error" ||
         formData.ptvr === "Not Updated" || formData.ptvr === "Error" ||
         formData.ptvs === "Not Updated" || formData.ptvs === "Error" ||
         formData.zqer === "Not Updated" || formData.zqer === "Error" ||
         formData.zqgr === "Not Updated" || formData.zqgr === "Error" ||
         formData.zqgs === "Not Updated" || formData.zqgs === "Error" ) 
         && !formData.remarks) {
      missingFields.push("remarks");
    }

    if (missingFields.length > 0) {
      const message = `Missing required fields: ${missingFields.join(", ")}.`;
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    

    const currentDateTime = new Date();

    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    const currentDate = currentDateTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // Format as YYYY-MM-DD
    const currentTime = currentDateTime.toLocaleTimeString('en-GB', options)

    const dataToSubmit = {
      ...formData,
      date: formData.date,
      submitted_time: `${currentDate}T${currentTime}`,
      formatted_time: currentTime,
      user: username,
    };

    try {
      const checkResponse = await axios.get(`${API_BASE_URL}/api/upload-zvchr-status/`, {
        params: { store: formData.store, date: formData.date },
      });

      let response;
      if (checkResponse.data.length > 0) {
        const existingEntry = checkResponse.data[0];
        if (existingEntry.verified) {
          setSnackbarMessage("This entry is already verified and cannot be modified.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }  
        response = await axios.put(`${API_BASE_URL}/api/upload-zvchr-status/${existingEntry.id}/`, dataToSubmit);
      } else {
        response = await axios.post(`${API_BASE_URL}/api/upload-zvchr-status/`, dataToSubmit);
      }

      if (response.status === 200 || response.status === 201) {
        setSnackbarMessage("Data successfully submitted!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsEditMode(false);
        setSubmittedData(dataToSubmit);
      } else {
        setSnackbarMessage("Something went wrong!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setSnackbarMessage("Failed to upload data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const fetchDataForEdit = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/update-zvchr-status/${id}/`, {
        params: { user: username }  
      });
      
      setFormData({
        ...response.data,
        user: username,  
      });
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };
  
  useEffect(() => {
    if (isEditMode && formData.id) {
      fetchDataForEdit(formData.id); 
    }
  }, [isEditMode, formData.id]);
  

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const fetchData = async () => {
    if (!date) {
      setSnackbarMessage("Please enter a date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/${userid}/`);
      const profile = profileResponse.data;
      
      let params = { date, user: username };
  
      if (profile.designation === 'Admin' || profile.designation === 'IT Manager') {
        if (store && store !== "None") {
          params.store = store;
        }
      } else {
        if (!store || store === "None") {
          setSnackbarMessage("Please enter a store.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        params.store = store;
      }
      const response = await axios.get(`${API_BASE_URL}/api/upload-zvchr-status/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbarMessage("Failed to fetch data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDownloadCSV = () => {
    if (!date) {
      setSnackbarMessage("Please enter a date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    const params = { date,
      user: username,
      action: "CSV"
     };
    if (store !== "None") params.store = store;
    axios
      .get(`${API_BASE_URL}/api/zvchr-status/download/`, {
        params,
        responseType: 'json',
      })
      .then((response) => {
        const jsonData = response.data;
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `ZVCHR_Status_${date}.csv`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading data:", error);
        setSnackbarMessage("Failed to download data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };
  
  function convertToCSV(jsonData) {
    const header = [
      'Date', 'Store', 'Store Name', 'PTER', 'PTES', 'PTVR', 'PTVS', 'ZQER', 'ZQGR', 'ZQGS', 'Remarks'
    ];
    const rows = jsonData.map(item => [
      item.date,
      item.store,
      item.storename,
      item.pter,
      item.ptes,
      item.ptvr,
      item.ptvs,
      item.zqer,
      item.zqgr, 
      item.zqgs,
      item.remarks || "",
    ]);
  
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
  const handleDownloadPDF = () => {
    if (!date) {
      setSnackbarMessage("Please enter a date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    const params = {
      date,
      user: username,
      action: "PDF"
    };
    if (store !== "None") params.store = store;
  
    axios
      .get(`${API_BASE_URL}/api/zvchr-status/download/`, {
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
  
        const tableColumns = ['Date', 'Store', 'Store Name', 'PTER', 'PTES', 'PTVR', 'PTVS', 'ZQER', 'ZQGR', 'ZQGS', 'Remarks'];
  
        const tableData = jsonData.map(item => [
          item.date,
          item.store,
          item.storename,
          item.pter,
          item.ptes,
          item.ptvr,
          item.ptvs,
          item.zqer,
          item.zqgr,
          item.zqgs,
          item.remarks
        ]);
  
        doc.text("ZVCHR Status", 14, 10);
        doc.autoTable({
          head: [tableColumns],
          body: tableData,
          startY: 20,
          theme: 'striped',
        });
  
        doc.save(`ZVCHR_Status_${date}.pdf`);
        setSnackbarMessage("PDF downloaded successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
        setSnackbarMessage("Failed to download PDF.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };
  


  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();
  //   const tableColumns = ['Date', 'Store', 'Store Name', 'PTER', 'PTES', 'PTVR', 'PTVS', 'ZQER', 'ZQGR', 'ZQGS', 'Remarks'];
    
  //   const tableData = data.map(item => [
  //     item.date,
  //     item.store,
  //     item.storename,
  //     item.pter,
  //     item.ptes,
  //     item.ptvr,
  //     item.ptvs,
  //     item.zqer,
  //     item.zqgr, 
  //     item.zqgs,
  //     item.remarks
  //   ]);

  //   doc.text("ZVCHR Status", 14, 10);
  
  //   doc.autoTable({
  //     head: [tableColumns],
  //     body: tableData,
  //     startY: 20,
  //     theme: 'striped', 
  //   });
  
  //   doc.save(`ZVCHR_Status_${date}.pdf`);
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
  
  const handleSaveClick = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/zvchr-status/${editRowId}/`,  
        { ...updatedRow, user: username }  
      );
      if (response.status === 200) {
        setSnackbarMessage("Row updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setData((prevData) =>
          prevData.map((item) =>
            item.id === editRowId ? { ...updatedRow, user: username } : item
          )
        );
        setEditRowId(null);
      } else {
        setSnackbarMessage("Failed to update data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      setSnackbarMessage("Error saving updates.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (confirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/zvchr-status/${id}/`, {
          data: { user: username }  
        });
  
        if (response.status === 200) {
          setData((prevData) => prevData.filter(item => item.id !== id));
          setSnackbarMessage("Record deleted successfully!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage("Failed to delete the record.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error deleting row:", error);
        setSnackbarMessage("Failed to delete the record.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
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
      const response = await axios.get(`${API_BASE_URL}/api/zvchr-status/`, {
        params: { action: 'history' }
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleVerify = async () => {
    try {
      const idsToVerify = data.filter(item => !item.verified).map(item => item.id);
  
      if (idsToVerify.length > 0) {
        await Promise.all(idsToVerify.map(id =>
          axios.put(`${API_BASE_URL}/api/upload-zvchr-status/${id}/`, { 
            verified: true, Varifiedby:username, user: username })
        ));
  
        setData([]);  
        fetchData(false); 
        
        setSnackbarMessage("Selected records have been verified.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("No records selected for verification.");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error verifying records:", error);
      setSnackbarMessage("Failed to verify records.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
      const valA = a[key] ?? ''; // Convert null/undefined to empty string
      const valB = b[key] ?? '';
  
      if (valA === '' && valB !== '') return direction === 'asc' ? 1 : -1; // Move nulls to the bottom
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
          <Tab value={0}>ZVCHR Status Form</Tab>
          <Tab value={1}>ZVCHR Status </Tab>
          <Tab value={2}>History</Tab>
          </>
        );
      case 'End_User':
        return <Tab value={0}>ZVCHR Status Form</Tab>;
      case 'Management_User':
        return (
          <>
          <Tab value={0}>ZVCHR Status Form</Tab>
          <Tab value={1}>ZVCHR Status </Tab>
          <Tab value={2}>History</Tab>
          </>
        );
      default:
        return null;
    }
  };

  const getTabPanelsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 600, margin: '0 auto', minHeight: '1000px' , marginTop:"-20px"}}> {/* Increased minHeight */}
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    ZVCHR Status
                  </Typography>
                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                      Submit
                    </Button> )}
                </Box>
                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
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
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
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
                        </Box>
                      </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <TextField
                          label="Store Name"
                          name="storename"
                          value={formData.storename}
                          onChange={handleChange}
                          fullWidth
                          sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="pter-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTER</InputLabel>
                          <Select
                            labelId="pter-label"
                            name="pter"
                            value={formData.pter}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="ptes-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTES</InputLabel>
                          <Select
                            labelId="ptes-label"
                            name="ptes"
                            value={formData.ptes}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="ptvr-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTVR</InputLabel>
                          <Select
                            labelId="ptvr-label"
                            name="ptvr"
                            value={formData.ptvr}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="ptvs-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTVS</InputLabel>
                          <Select
                            labelId="ptvs-label"
                            name="ptvs"
                            value={formData.ptvs}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="zqer-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQER</InputLabel>
                          <Select
                            labelId="zqer-label"
                            name="zqer"
                            value={formData.zqer}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="zqgr-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQGR</InputLabel>
                          <Select
                            labelId="zqgr-label"
                            name="zqgr"
                            value={formData.zqgr}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="zqgs-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQGS</InputLabel>
                          <Select
                            labelId="zqgs-label"
                            name="zqgs"
                            value={formData.zqgs}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <TextField
                          label="Submitted By"
                          name="submittedby"
                          value={formData.submittedby}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Remarks (Eg:Ticket No.)"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                      />
                    </Grid>
                  </Grid>
                </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                              <TableCell><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              <TableCell>Store Name</TableCell>
                              <TableCell align="center">{submittedData?.storename}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Submitted Time</TableCell>
                              <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                              <TableCell>Submitted By</TableCell>
                              <TableCell align="center">{submittedData?.submittedby}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell align="center"><strong>{submittedData?.date}</strong></TableCell>
                              <TableCell>PTER</TableCell>
                              <TableCell align="center"><strong>{submittedData?.pter}</strong></TableCell>
                            </TableRow>
                            <TableRow>  
                              <TableCell>PTES</TableCell>
                              <TableCell align="center"><strong>{submittedData?.ptes}</strong></TableCell>
                              <TableCell>PTVS</TableCell>
                              <TableCell align="center"><strong>{submittedData?.ptvs}</strong></TableCell>
                            </TableRow>
                            <TableRow>  
                              <TableCell>PTVR</TableCell>
                              <TableCell align="center"><strong>{submittedData?.ptvr}</strong></TableCell>
                              <TableCell>ZQER</TableCell>
                              <TableCell align="center"><strong>{submittedData?.zqer}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>ZQGR</TableCell>
                              <TableCell align="center"><strong>{submittedData?.zqgr }</strong></TableCell>
                              <TableCell>ZQGS</TableCell>
                              <TableCell align="center"><strong>{submittedData?.zqgs}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Remarks</TableCell>
                              <TableCell align="center">{submittedData?.remarks || 'N/A'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                    <Button variant="contained" color="primary" onClick={handleEdit}
                      sx={{ marginTop: 2, backgroundColor: '#113f6c', '&:hover': {  backgroundColor: '#0f3555', }, }} fullWidth >
                      Edit
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                      sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e', }, }} fullWidth >
                      Home
                    </Button>
                  </Box>
                  )}
                </Paper>
              </Box>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
              >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </TabPanel>
            <TabPanel value={1}>
              <div>
                <h2>ZVCHR Status</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5 }}>
                  <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} sx={{ flex: 1 }} />
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
                    sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px',}}>
                    Fetch Data
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleDownloadCSV} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                    <DownloadIcon />
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleDownloadPDF} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#800000', '&:hover': { backgroundColor: '#660000' }}} >
                    <PictureAsPdfIcon />
                  </Button>
                </Box>
                <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                  <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1, overflowY: 'auto'}}>
                  <div style={{ maxHeight: '589px', overflowY: 'auto' , border: '1px solid #113f6c'}}>
                    <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                      <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1000}}>
                        <TableRow sx={{ backgroundColor: '#f5f5f5'}}>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
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
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'pter'} direction={sortConfig.key === 'pter' ? sortConfig.direction : 'asc'} onClick={() => handleSort('pter')}>PTER</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'ptes'} direction={sortConfig.key === 'ptes' ? sortConfig.direction : 'asc'} onClick={() => handleSort('ptes')}>PTES</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'ptvr'} direction={sortConfig.key === 'ptvr' ? sortConfig.direction : 'asc'} onClick={() => handleSort('ptvr')}>PTVR</TableSortLabel>
                          </TableCell> 
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'ptvs'} direction={sortConfig.key === 'ptvs' ? sortConfig.direction : 'asc'} onClick={() => handleSort('ptvs')}>PTVS</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'zqer'} direction={sortConfig.key === 'zqer' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zqer')}>ZQER</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'zqgr'} direction={sortConfig.key === 'zqgr' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zqgr')}>ZQGR</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'zqgs'} direction={sortConfig.key === 'zqgs' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zqgs')}>ZQGS</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'remarks'} direction={sortConfig.key === 'remarks' ? sortConfig.direction : 'asc'} onClick={() => handleSort('remarks')}>Remarks</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'verifiedby'} direction={sortConfig.key === 'verifiedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('verifiedby')}>Verified By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((item, i) => (
                          <TableRow
                            key={item.id}
                            hover
                            sx={{
                              '&:hover': { backgroundColor: '#e3f2fd' },
                              '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' },
                            }}
                          >
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="date" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select  name="pter"  value={updatedRow.pter || ''}  onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select  name="ptes"   value={updatedRow.ptes|| ''}  onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},},},}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="ptvr" value={updatedRow.ptvr || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': { fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="ptvs" value={updatedRow.ptvs || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{ PaperProps: { sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="zqer" value={updatedRow.zqer || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},}, },}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="zqgr" value={updatedRow.zqgr || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},}, },}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="zqgs" value={updatedRow.zqgs || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},}, },}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="remarks" value={updatedRow.remarks || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" color="primary" onClick={handleSaveClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#466957', '&:hover': { backgroundColor: '#466957' },  minHeight : "30px" ,minWidth : "50px"   }} >
                                      <DoneOutlineIcon/>
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={handleCancelClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#732f2ab8', '&:hover': { backgroundColor: '#732f2ab8' },   minHeight : "30px" ,minWidth : "50px"   }} >
                                      <CloseIcon/>
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.pter === 'Not Updated' || item.pter === 'Error' ? 'red' : item.pter === 'No Updates' ? 'gray' : 'black' }}>{item.pter}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.ptes === 'Not Updated' || item.ptes === 'Error' ? 'red' : item.ptes === 'No Updates' ? 'gray' : 'black', }}>{item.ptes}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.ptvr === 'Not Updated' || item.ptvr === 'Error' ? 'red' : item.ptvr === 'No Updates' ? 'gray' : 'black', }}>{item.ptvr}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.ptvs === 'Not Updated' || item.ptvs === 'Error' ? 'red' : item.ptvs === 'No Updates' ? 'gray' : 'black', }}>{item.ptvs}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.zqer === 'Not Updated' || item.zqer === 'Error' ? 'red' : item.zqer === 'No Updates' ? 'gray' : 'black', }}>{item.zqer}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.zqgr === 'Not Updated' || item.zqgr === 'Error' ? 'red' : item.zqgr === 'No Updates' ? 'gray' : 'black', }}>{item.zqgr}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.zqgs === 'Not Updated' || item.zqgs === 'Error' ? 'red' : item.zqgs === 'No Updates' ? 'gray' : 'black',}}>{item.zqgs}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </TableContainer>
                </Sheet>
              </div>
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
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
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
            <Box sx={{ padding: 4, maxWidth: 600, margin: '0 auto', minHeight: '1000px' , marginTop:"-20px"}}> {/* Increased minHeight */}
            <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  ZVCHR Status
                </Typography>
                {isEditMode && (
                  <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                    sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                    Submit
                  </Button> )}
              </Box>
              {isEditMode ? (
                <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
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
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
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
                      </Box>
                    </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <TextField
                        label="Store Name"
                        name="storename"
                        value={formData.storename}
                        onChange={handleChange}
                        fullWidth
                        sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="pter-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',},}}>PTER</InputLabel>
                        <Select
                          labelId="pter-label"
                          name="pter"
                          value={formData.pter}
                          onChange={handleChange}
                          required
                          sx={{
                            fontSize: '0.8rem',
                            height: '56px',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.9rem',
                                  padding: '4px 8px',
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="Updated">Updated</MenuItem>
                          <MenuItem value="Not Updated">Not Updated</MenuItem>
                          <MenuItem value="No Updates">No Updates</MenuItem>
                          <MenuItem value="Error">Error</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="ptes-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',},}}>PTES</InputLabel>
                        <Select
                          labelId="ptes-label"
                          name="ptes"
                          value={formData.ptes}
                          onChange={handleChange}
                          required
                          sx={{
                            fontSize: '0.8rem',
                            height: '56px',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.9rem',
                                  padding: '4px 8px',
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="Updated">Updated</MenuItem>
                          <MenuItem value="Not Updated">Not Updated</MenuItem>
                          <MenuItem value="No Updates">No Updates</MenuItem>
                          <MenuItem value="Error">Error</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="ptvr-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',},}}>PTVR</InputLabel>
                        <Select
                          labelId="ptvr-label"
                          name="ptvr"
                          value={formData.ptvr}
                          onChange={handleChange}
                          required
                          sx={{
                            fontSize: '0.8rem',
                            height: '56px',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.9rem',
                                  padding: '4px 8px',
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="Updated">Updated</MenuItem>
                          <MenuItem value="Not Updated">Not Updated</MenuItem>
                          <MenuItem value="No Updates">No Updates</MenuItem>
                          <MenuItem value="Error">Error</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="ptvs-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',},}}>PTVS</InputLabel>
                        <Select
                          labelId="ptvs-label"
                          name="ptvs"
                          value={formData.ptvs}
                          onChange={handleChange}
                          required
                          sx={{
                            fontSize: '0.8rem',
                            height: '56px',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.9rem',
                                  padding: '4px 8px',
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="Updated">Updated</MenuItem>
                          <MenuItem value="Not Updated">Not Updated</MenuItem>
                          <MenuItem value="No Updates">No Updates</MenuItem>
                          <MenuItem value="Error">Error</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="zqer-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQER</InputLabel>
                        <Select
                          labelId="zqer-label"
                          name="zqer"
                          value={formData.zqer}
                          onChange={handleChange}
                          required
                          sx={{
                            fontSize: '0.8rem',
                            height: '56px',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.9rem',
                                  padding: '4px 8px',
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="Updated">Updated</MenuItem>
                          <MenuItem value="Not Updated">Not Updated</MenuItem>
                          <MenuItem value="No Updates">No Updates</MenuItem>
                          <MenuItem value="Error">Error</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="zqgr-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQGR</InputLabel>
                        <Select
                          labelId="zqgr-label"
                          name="zqgr"
                          value={formData.zqgr}
                          onChange={handleChange}
                          required
                          sx={{
                            fontSize: '0.8rem',
                            height: '56px',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.9rem',
                                  padding: '4px 8px',
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="Updated">Updated</MenuItem>
                          <MenuItem value="Not Updated">Not Updated</MenuItem>
                          <MenuItem value="No Updates">No Updates</MenuItem>
                          <MenuItem value="Error">Error</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="zqgs-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                          transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQGS</InputLabel>
                        <Select
                          labelId="zqgs-label"
                          name="zqgs"
                          value={formData.zqgs}
                          onChange={handleChange}
                          required
                          sx={{
                            fontSize: '0.8rem',
                            height: '56px',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                '& .MuiMenuItem-root': {
                                  fontSize: '0.9rem',
                                  padding: '4px 8px',
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="Updated">Updated</MenuItem>
                          <MenuItem value="Not Updated">Not Updated</MenuItem>
                          <MenuItem value="No Updates">No Updates</MenuItem>
                          <MenuItem value="Error">Error</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                      <TextField
                        label="Submitted By"
                        name="submittedby"
                        value={formData.submittedby}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Remarks (Eg:Ticket No.)"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  </Grid>
                </Grid>
              </form>
              ) : (
                <Box>
                  <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                    <TableContainer>
                      <Table>
                      <TableHead>
                          <TableRow>
                            <TableCell><strong>Store</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                            <TableCell>Store Name</TableCell>
                            <TableCell align="center">{submittedData?.storename}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Submitted Time</TableCell>
                            <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell align="center">{submittedData?.submittedby}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="center"><strong>{submittedData?.date}</strong></TableCell>
                            <TableCell>PTER</TableCell>
                            <TableCell align="center"><strong>{submittedData?.pter}</strong></TableCell>
                          </TableRow>
                          <TableRow>  
                            <TableCell>PTES</TableCell>
                            <TableCell align="center"><strong>{submittedData?.ptes}</strong></TableCell>
                            <TableCell>PTVS</TableCell>
                            <TableCell align="center"><strong>{submittedData?.ptvs}</strong></TableCell>
                          </TableRow>
                          <TableRow>  
                            <TableCell>PTVR</TableCell>
                            <TableCell align="center"><strong>{submittedData?.ptvr}</strong></TableCell>
                            <TableCell>ZQER</TableCell>
                            <TableCell align="center"><strong>{submittedData?.zqer}</strong></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>ZQGR</TableCell>
                            <TableCell align="center"><strong>{submittedData?.zqgr }</strong></TableCell>
                            <TableCell>ZQGS</TableCell>
                            <TableCell align="center"><strong>{submittedData?.zqgs}</strong></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Remarks</TableCell>
                            <TableCell align="center">{submittedData?.remarks || 'N/A'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                  <Button variant="contained" color="primary" onClick={handleEdit}
                    sx={{ marginTop: 2, backgroundColor: '#113f6c', '&:hover': {  backgroundColor: '#0f3555', }, }} fullWidth >
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                    sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e', }, }} fullWidth >
                    Home
                  </Button>
                </Box>
                )}
              </Paper>
            </Box>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </TabPanel>;
      case 'Management_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 600, margin: '0 auto', minHeight: '1000px' , marginTop:"-20px"}}> {/* Increased minHeight */}
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    ZVCHR Status
                  </Typography>
                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                      Submit
                    </Button> )}
                </Box>
                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
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
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
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
                        </Box>
                      </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <TextField
                          label="Store Name"
                          name="storename"
                          value={formData.storename}
                          onChange={handleChange}
                          fullWidth
                          sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="pter-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTER</InputLabel>
                          <Select
                            labelId="pter-label"
                            name="pter"
                            value={formData.pter}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="ptes-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTES</InputLabel>
                          <Select
                            labelId="ptes-label"
                            name="ptes"
                            value={formData.ptes}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="ptvr-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTVR</InputLabel>
                          <Select
                            labelId="ptvr-label"
                            name="ptvr"
                            value={formData.ptvr}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="ptvs-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>PTVS</InputLabel>
                          <Select
                            labelId="ptvs-label"
                            name="ptvs"
                            value={formData.ptvs}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="zqer-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQER</InputLabel>
                          <Select
                            labelId="zqer-label"
                            name="zqer"
                            value={formData.zqer}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="zqgr-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQGR</InputLabel>
                          <Select
                            labelId="zqgr-label"
                            name="zqgr"
                            value={formData.zqgr}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="zqgs-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',},}}>ZQGS</InputLabel>
                          <Select
                            labelId="zqgs-label"
                            name="zqgs"
                            value={formData.zqgs}
                            onChange={handleChange}
                            required
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  '& .MuiMenuItem-root': {
                                    fontSize: '0.9rem',
                                    padding: '4px 8px',
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="Updated">Updated</MenuItem>
                            <MenuItem value="Not Updated">Not Updated</MenuItem>
                            <MenuItem value="No Updates">No Updates</MenuItem>
                            <MenuItem value="Error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ marginBottom: 1.8, boxShadow: 2, borderRadius: 1 }}>
                        <TextField
                          label="Submitted By"
                          name="submittedby"
                          value={formData.submittedby}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Remarks (Eg:Ticket No.)"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                      />
                    </Grid>
                  </Grid>
                </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                              <TableCell><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              <TableCell>Store Name</TableCell>
                              <TableCell align="center">{submittedData?.storename}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Submitted Time</TableCell>
                              <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                              <TableCell>Submitted By</TableCell>
                              <TableCell align="center">{submittedData?.submittedby}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell align="center"><strong>{submittedData?.date}</strong></TableCell>
                              <TableCell>PTER</TableCell>
                              <TableCell align="center"><strong>{submittedData?.pter}</strong></TableCell>
                            </TableRow>
                            <TableRow>  
                              <TableCell>PTES</TableCell>
                              <TableCell align="center"><strong>{submittedData?.ptes}</strong></TableCell>
                              <TableCell>PTVS</TableCell>
                              <TableCell align="center"><strong>{submittedData?.ptvs}</strong></TableCell>
                            </TableRow>
                            <TableRow>  
                              <TableCell>PTVR</TableCell>
                              <TableCell align="center"><strong>{submittedData?.ptvr}</strong></TableCell>
                              <TableCell>ZQER</TableCell>
                              <TableCell align="center"><strong>{submittedData?.zqer}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>ZQGR</TableCell>
                              <TableCell align="center"><strong>{submittedData?.zqgr }</strong></TableCell>
                              <TableCell>ZQGS</TableCell>
                              <TableCell align="center"><strong>{submittedData?.zqgs}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Remarks</TableCell>
                              <TableCell align="center">{submittedData?.remarks || 'N/A'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                    <Button variant="contained" color="primary" onClick={handleEdit}
                      sx={{ marginTop: 2, backgroundColor: '#113f6c', '&:hover': {  backgroundColor: '#0f3555', }, }} fullWidth >
                      Edit
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                      sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e', }, }} fullWidth >
                      Home
                    </Button>
                  </Box>
                  )}
                </Paper>
              </Box>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
              >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </TabPanel>
            <TabPanel value={1}>
              <div>
                <h2>ZVCHR Status</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5 }}>
                  <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} sx={{ flex: 1 }} />
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
                    sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px',}}>
                    Fetch Data
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleDownloadCSV} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                    <DownloadIcon />
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleDownloadPDF} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#800000', '&:hover': { backgroundColor: '#660000' }}} >
                    <PictureAsPdfIcon />
                  </Button>
                </Box>
                <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1, overflowY: 'auto'}}>
                  <div style={{ maxHeight: '589px', overflowY: 'auto' , border: '1px solid #113f6c'}}>
                    <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                      <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1000}}>
                        <TableRow sx={{ backgroundColor: '#f5f5f5'}}>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
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
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'pter'} direction={sortConfig.key === 'pter' ? sortConfig.direction : 'asc'} onClick={() => handleSort('pter')}>PTER</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'ptes'} direction={sortConfig.key === 'ptes' ? sortConfig.direction : 'asc'} onClick={() => handleSort('ptes')}>PTES</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'ptvr'} direction={sortConfig.key === 'ptvr' ? sortConfig.direction : 'asc'} onClick={() => handleSort('ptvr')}>PTVR</TableSortLabel>
                          </TableCell> 
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'ptvs'} direction={sortConfig.key === 'ptvs' ? sortConfig.direction : 'asc'} onClick={() => handleSort('ptvs')}>PTVS</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'zqer'} direction={sortConfig.key === 'zqer' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zqer')}>ZQER</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'zqgr'} direction={sortConfig.key === 'zqgr' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zqgr')}>ZQGR</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '9%' }}>
                            <TableSortLabel active={sortConfig.key === 'zqgs'} direction={sortConfig.key === 'zqgs' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zqgs')}>ZQGS</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'remarks'} direction={sortConfig.key === 'remarks' ? sortConfig.direction : 'asc'} onClick={() => handleSort('remarks')}>Remarks</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'verifiedby'} direction={sortConfig.key === 'verifiedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('verifiedby')}>Verified By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((item, i) => (
                          <TableRow
                            key={item.id}
                            hover
                            sx={{
                              '&:hover': { backgroundColor: '#e3f2fd' },
                              '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' },
                            }}
                          >
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="date" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select  name="pter"  value={updatedRow.pter || ''}  onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select  name="ptes"   value={updatedRow.ptes|| ''}  onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},},},}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="ptvr" value={updatedRow.ptvr || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': { fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="ptvs" value={updatedRow.ptvs || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{ PaperProps: { sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="zqer" value={updatedRow.zqer || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},}, },}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="zqgr" value={updatedRow.zqgr || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},}, },}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <Select name="zqgs" value={updatedRow.zqgs || ''} onChange={handleInputChange} fullWidth
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                    MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},}, },}}>
                                    <MenuItem value="Updated">Updated</MenuItem>
                                    <MenuItem value="Not Updated">Not Updated</MenuItem>
                                    <MenuItem value="No Updates">No Updates</MenuItem>
                                    <MenuItem value="Error">Error</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="remarks" value={updatedRow.remarks || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" color="primary" onClick={handleSaveClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#466957', '&:hover': { backgroundColor: '#466957' },  minHeight : "30px" ,minWidth : "50px"   }} >
                                      <DoneOutlineIcon/>
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={handleCancelClick}
                                      sx={{ fontSize: '0.7rem', padding: '4px 12px', backgroundColor: '#732f2ab8', '&:hover': { backgroundColor: '#732f2ab8' },   minHeight : "30px" ,minWidth : "50px"   }} >
                                      <CloseIcon/>
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.pter === 'Not Updated' || item.pter === 'Error' ? 'red' : item.pter === 'No Updates' ? 'gray' : 'black' }}>{item.pter}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.ptes === 'Not Updated' || item.ptes === 'Error' ? 'red' : item.ptes === 'No Updates' ? 'gray' : 'black' }}>{item.ptes}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.ptvr === 'Not Updated' || item.ptvr === 'Error' ? 'red' : item.ptvr === 'No Updates' ? 'gray' : 'black' }}>{item.ptvr}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.ptvs === 'Not Updated' || item.ptvs === 'Error' ? 'red' : item.ptvs === 'No Updates' ? 'gray' : 'black' }}>{item.ptvs}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.zqer === 'Not Updated' || item.zqer === 'Error' ? 'red' : item.zqer === 'No Updates' ? 'gray' : 'black' }}>{item.zqer}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.zqgr === 'Not Updated' || item.zqgr === 'Error' ? 'red' : item.zqgr === 'No Updates' ? 'gray' : 'black' }}>{item.zqgr}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%', color: item.zqgs === 'Not Updated' || item.zqgs === 'Error' ? 'red' : item.zqgs === 'No Updates' ? 'gray' : 'black' }}>{item.zqgs}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </TableContainer>
                </Sheet>
              </div>
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
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
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

export default ZvchrStatus