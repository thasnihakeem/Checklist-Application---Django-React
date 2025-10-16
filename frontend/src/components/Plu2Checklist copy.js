import React, { useState, useEffect  } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, MenuItem, Select, Button, Paper } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { styled } from '@mui/system';
import { Tabs } from '@mui/base/Tabs';
import { TabsList as BaseTabsList } from '@mui/base/TabsList';
import { TabPanel as BaseTabPanel } from '@mui/base/TabPanel';
import { buttonClasses } from '@mui/base/Button';
import { Tab as BaseTab, tabClasses } from '@mui/base/Tab';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
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


const Plu2Checklist = () => {
  const [formData, setFormData] = useState({
    date:'',
    store: '',
    storename: '',
    plu2Status: '',
    eodStatus: '',
    idocFileStatus: '',
    comparisonCheck: '',
    zread:'',
    customercount:'',
    folderStatus: '',
    remarks: '',
    submittedby:"",
  });

  const [stores, setStores] = useState([]);
  const [profile, setProfile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [username, setUsername] = useState('');
  const [userid, setUserid] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);

  const navigate = useNavigate();

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
  

  const fetchEmployeeProfile = async (employeeId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/profile/${employeeId}/`);
        const profile = response.data;

        if (profile.designation === 'IT Support') {
            const storeResponse = await axios.get(`${API_BASE_URL}/api/store/${profile.storecode}/`);
            const storeDetails = storeResponse.data;

            setStores([{ storecode: storeDetails.storecode, storename: storeDetails.storename }]);
            setFormData((prev) => ({
                ...prev,
                store: storeDetails.storecode,
                storename: storeDetails.storename,
            }));
            setIsRestricted(true);
        } else if (['Assistant IT Incharge', 'IT Incharge'].includes(profile.designation)) {
            const storeResponse = await axios.get(`${API_BASE_URL}/api/store/${profile.storecode}/`);
            const storeDetails = storeResponse.data;

            setStores([{ storecode: storeDetails.storecode, storename: storeDetails.storename }]);
            setFormData((prev) => ({
                ...prev,
                store: storeDetails.storecode,
                storename: storeDetails.storename,
            }));
        } else if (profile.designation === 'Regional IT Manager') {
          const storeCodes = profile.storeunder 
              ? profile.storeunder.split(',').map(code => code.trim()) 
              : [];
          if (!storeCodes.includes(profile.storecode)) {
              storeCodes.unshift(profile.storecode);
          }
      
          if (storeCodes.length > 0) {
              const storeRequests = storeCodes.map(code => axios.get(`${API_BASE_URL}/api/store/${code}/`));
              const storeResponses = await Promise.all(storeRequests);
      
              const storeDetails = storeResponses.map(res => ({
                  storecode: res.data.storecode,
                  storename: res.data.storename
              }));
      
              setStores(storeDetails);
              setFormData((prev) => ({
                  ...prev,
                  store: storeDetails.map(store => store.storecode), 
                  storename: storeDetails.storename,
              }));
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

  const handleSnackbarClose = () => setSnackbar({ open: false, message: "", severity: "" });
  const [submittedData, setSubmittedData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [store, setStore] = useState("");
  const [date, setDate] = useState('');
  const [data, setData] = useState([]);

  
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
    'date', 
    'store', 
    'plu2Status', 
    'submittedby', 
    'eodStatus', 
    'idocFileStatus', 
    'zread', 
    'folderStatus'
  ];
  
  const missingFields = requiredFields.filter(field => !formData[field]);
  
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
  
  const dataToSubmit = {
    ...formData,
    date: formData.date,
    submitted_time: `${currentDate}T${currentTime}`, 
    user: username,
    userid:userid,
  };

  try {
    const checkResponse = await axios.get(`${API_BASE_URL}/api/upload-plu2-data/`, {
      params: { store: formData.store },
    });
  
    const existingEntry = checkResponse.data.find(entry => entry.date === formData.date);
  
    if (!existingEntry) {
      const response = await axios.post(`${API_BASE_URL}/api/upload-plu2-data/`, dataToSubmit);
      if (response.status === 201) {
        setSnackbar({ open: true, message: 'Data successfully submitted!', severity: 'success' });
        setIsEditMode(false);
        setSubmittedData(dataToSubmit);
      } else {
        setSnackbar({ open: true, message: 'Something went wrong!', severity: 'error' });
      }
      return;
    }
  
    if (existingEntry.verified) {
      setSnackbar({ open: true, message: 'This entry is already verified and cannot be modified.', severity: 'error' });
      return;
    }
  
    const response = await axios.put(`${API_BASE_URL}/api/upload-plu2-data/${existingEntry.id}/`, dataToSubmit);
  
    if (response.status === 200) {
      setSnackbar({ open: true, message: 'Data successfully updated!', severity: 'success' });
      setIsEditMode(false);
      setSubmittedData(dataToSubmit);
    } else {
      setSnackbar({ open: true, message: 'Something went wrong!', severity: 'error' });
    }
  } catch (error) {
    console.error('Error submitting data:', error);
    setSnackbar({ open: true, message: 'Failed to upload data.', severity: 'error' });
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
  
  const fetchDataForEdit = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/update-plu2-data/${id}/`, {
        params: { user: username }  
      });
      
      setFormData({
        ...response.data,
        user: username,  
      });
    } catch (error) {
      console.error("Error fetching data for edit:", error);
      setSnackbar({ open: true, message: "Failed to fetch data for edit.", severity: "error" });
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

  const fetchData1 = async () => {
    if (!date) {
      setSnackbar({ open: true, message: "Please enter a date.", severity: "warning" });
      return;
    }
    try {
      const params = { date, user: username };  
      if (store !== "None") params.store = store
      const response = await axios.get(`${API_BASE_URL}/api/upload-plu2-data/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({ open: true, message: "Failed to fetch data.", severity: "error" });
    }
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
      
      let params = { start_date: startDate, end_date: endDate, user: username };
  
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
  
      const response = await axios.get(`${API_BASE_URL}/api/upload-plu2-data/`, { params });
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
    };
    if (store) params.store = store;
    axios
      .get(`${API_BASE_URL}/api/plu2-checklist/download/`, {
        params,
        responseType: 'json',
      })
      .then((response) => {
        const jsonData = response.data;
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `plu2_checklist_${date}.csv`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading data:", error);
        setSnackbar({ open: true, message: "Failed to download data.", severity: "error" });
      });
  };

  function convertToCSV(jsonData) {
    const header = ['Date', 'Store', 'Store Name' , 'PLU2 Status', 'PLU2 Containing Folder', 'EOD Final Status', 'IDOC File Upload Status', 'ZREAD', 'Customer Count', 'Remarks'];
    const rows = jsonData.map(item => [
      item.date,
      item.store,
      item.storename,
      item.plu2Status,
      item.folderStatus,
      item.eodStatus,
      item.idocFileStatus,
      item.zread,
      item.customercount,
      item.remarks || "",  
    ]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm', 
      format: [400, 230]
    });
    const tableColumns = ['Date', 'Store', 'Store Name' , 'PLU2 Status', 'PLU2 Containing Folder', 'EOD Final Status', 'IDOC File Upload Status', 'ZREAD', 'Customer Count', 'Remarks'];
  
    const tableData = data.map(item => [
      item.date, item.store, item.storename, item.plu2Status, item.folderStatus, item.eodStatus, item.idocFileStatus,
      item.zread, item.customercount, item.remarks
    ]);
  
    doc.text("PLU2 Checklist", 14, 10);
  
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 20,
      theme: 'striped', 
    });
  
    doc.save(`plu2_checklist_${date}.pdf`);
  };

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
        `${API_BASE_URL}/api/plu2-checklist/${editRowId}/`,  
        { ...updatedRow, user: username }  
      );
      if (response.status === 200) {
        setSnackbar({ open: true, message: "Row updated successfully!", severity: "success" });
        setData((prevData) =>
          prevData.map((item) =>
            item.id === editRowId ? { ...updatedRow, user: username } : item  
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
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (confirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/plu2-checklist/${id}/`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/plu2_checklist/`, {
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
          axios.put(`${API_BASE_URL}/api/upload-plu2-data/${id}/`, { 
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
      setSnackbar({ open: true, message:"Failed to verify records, No authorization", severity: "error" });
    }
  };
  

  const getTabsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <Tab value={0}>Plu2 Checklist Form</Tab>
            <Tab value={1}>Plu2 Checklist</Tab>
            <Tab value={2}>History</Tab>
          </>
        );
      case 'End_User':
        return <Tab value={0}>Plu2 Checklist Form</Tab>;
      case 'Management_User':
        return (
          <>
            <Tab value={0}>Plu2 Checklist Form</Tab>;
            <Tab value={1}>Plu2 Checklist</Tab>;
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
              <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', marginTop:"-20px", minHeight: '1000px'  }}> 
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      PLU2 Checklist
                    </Typography>
                    {isEditMode && (
                      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                        sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                        Submit
                      </Button> )}
                  </Box>
                  {isEditMode ? (
                    <form onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Date"
                          variant="outlined"
                          fullWidth
                          name="date"
                          type="date" // Ensures this field is a date picker
                          value={formData.date}
                          onChange={handleChange}
                          InputLabelProps={{
                            shrink: true, // Ensures the label doesn't overlap the input
                          }}
                        />

                        <TextField
                          label="Submitted By"
                          name="submittedby"
                          value={formData.submittedby}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
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

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="plu2-status-label"
                            sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)',}, }} >
                            PLU2 Status
                          </InputLabel>
                          <Select labelId="plu2-status-label" id="plu2Status" name="plu2Status" value={formData.plu2Status} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': {  textAlign: 'left', }, }} >
                            <MenuItem value="Generated">Generated</MenuItem>
                            <MenuItem value="Manually Generated">Manually Generated</MenuItem>
                            <MenuItem value="Not Generated">Not Generated</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="folder-status-label"
                            sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)', },  }} >
                            PLU2 Containing Folder
                          </InputLabel>
                          <Select labelId="folder-status-label" id="folderStatus" name="folderStatus" value={formData.folderStatus} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' }, }} >
                            <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Processed">F:\TPDotnet\Server\HostData\Upload\Processed</MenuItem>
                            <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Invalid">F:\TPDotnet\Server\HostData\Upload\Invalid</MenuItem>
                            <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Data">F:\TPDotnet\Server\HostData\Upload\Data</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="eod-status-label"
                            sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)', }, }} >
                            EOD Final Status
                          </InputLabel>
                          <Select labelId="eod-status-label" id="eodStatus" name="eodStatus" value={formData.eodStatus} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left'}, }} >
                            <MenuItem value="Success">Success</MenuItem>
                            <MenuItem value="Failure">Failure</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="idoc-file-status-label"
                            sx={{  fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)',}, }} >
                            IDOC File Upload Status - F:\TPDotnet\LuLu_PosLog\
                          </InputLabel>
                          <Select labelId="idoc-file-status-label" id="idocFileStatus" name="idocFileStatus" value={formData.idocFileStatus} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left', }, }} >
                            <MenuItem value="Success">Success</MenuItem>
                            <MenuItem value="Failure">Failure</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Zread"
                          name="zread"
                          value={formData.zread}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/,/g, ""); // Remove commas
                            handleChange({ target: { name: "zread", value: newValue } });
                          }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                        <TextField
                          label="Customer Count"
                          name="customercount"
                          value={formData.customercount}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/,/g, ""); // Remove commas
                            handleChange({ target: { name: "customercount", value: newValue } });
                          }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      <TextField label="Remarks" variant="outlined" fullWidth multiline rows={4} name="remarks" value={formData.remarks} onChange={handleChange}
                        sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1, }} />
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
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                                <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                                <TableCell align="center">{submittedData?.submittedby}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{whiteSpace: 'nowrap'}}>Store name</TableCell>
                                <TableCell align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="center">{submittedData?.date}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>PLU2 Status</TableCell>
                                <TableCell align="center">{submittedData?.plu2Status}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>PLU2 Containing Folder</TableCell>
                                <TableCell align="center">{submittedData?.folderStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>EOD Final Status</TableCell>
                                <TableCell align="center">{submittedData?.eodStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>IDOC File Upload Status</TableCell>
                                <TableCell align="center">{submittedData?.idocFileStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>ZREAD</TableCell>
                                <TableCell align="center">{submittedData?.zread}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Customer Count</TableCell>
                                <TableCell align="center">{submittedData?.customercount}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Remarks</TableCell>
                                <TableCell align="center">{submittedData?.remarks}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                      <Button variant="contained"  color="primary" onClick={handleEdit}
                        sx={{ marginTop: 2, backgroundColor: '#113f6c',  '&:hover': { backgroundColor: '#0f3555',  }, }} fullWidth >
                        Edit
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                        sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e',  },}} fullWidth>
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
                <h2>PLU2 Checklist</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5 }}>
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
                  <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1 }}>
                  <div style={{ maxHeight: '589px', overflowY: 'auto'  }}>
                    <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'date'} direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'submitted_time'} direction={sortConfig.key === 'submitted_time' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submitted_time')}>Time</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'submittedby'} direction={sortConfig.key === 'submittedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submittedby')}>Submitted By</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                          <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'storename'} direction={sortConfig.key === 'storename' ? sortConfig.direction : 'asc'} onClick={() => handleSort('storename')}>Store Name</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig.key === 'plu2Status'} direction={sortConfig.key === 'plu2Status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('plu2Status')}>PLU2 Status</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig.key === 'folderStatus'} direction={sortConfig.key === 'folderStatus' ? sortConfig.direction : 'asc'} onClick={() => handleSort('folderStatus')}>PLU2 Containing Folder</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig.key === 'eodStatus'} direction={sortConfig.key === 'eodStatus' ? sortConfig.direction : 'asc'} onClick={() => handleSort('eodStatus')}>EOD Final Status</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig.key === 'idocFileStatus'} direction={sortConfig.key === 'idocFileStatus' ? sortConfig.direction : 'asc'} onClick={() => handleSort('idocFileStatus')}>IDOC File Upload Status</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig.key === 'zread'} direction={sortConfig.key === 'zread' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zread')}>ZREAD</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'customercount'} direction={sortConfig.key === 'customercount' ? sortConfig.direction : 'asc'} onClick={() => handleSort('customercount')}>Customer Count</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'remarks'} direction={sortConfig.key === 'remarks' ? sortConfig.direction : 'asc'} onClick={() => handleSort('remarks')}>Remarks</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'verifiedby'} direction={sortConfig.key === 'verifiedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('verifiedby')}>Verified By</TableSortLabel>
                          </TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.map((item) => (
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
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                    <input type="text" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                    <input type="text" name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                    <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select  name="plu2Status"  value={updatedRow.plu2Status || ''}  onChange={handleInputChange}  fullWidth 
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                      MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                      <MenuItem value="Generated">Generated</MenuItem>
                                      <MenuItem value="Manually Generated">Manually Generated</MenuItem>
                                      <MenuItem value="Not Generated">Not Generated</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select  name="folderStatus"   value={updatedRow.folderStatus || ''}  onChange={handleInputChange} fullWidth
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                      MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},},},}}>
                                      <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Processed">F:\TPDotnet\Server\HostData\Upload\Processed</MenuItem>
                                      <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Invalid">F:\TPDotnet\Server\HostData\Upload\Invalid</MenuItem>
                                      <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Data">F:\TPDotnet\Server\HostData\Upload\Data</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select name="eodStatus" value={updatedRow.eodStatus || ''} onChange={handleInputChange} fullWidth
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                      MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': { fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                      <MenuItem value="Success">Success</MenuItem>
                                      <MenuItem value="Failure">Failure</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select name="idocFileStatus" value={updatedRow.idocFileStatus || ''} onChange={handleInputChange} fullWidth
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                      MenuProps={{ PaperProps: { sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                      <MenuItem value="Success">Success</MenuItem>
                                      <MenuItem value="Failure">Failure</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                    <input type="text" name="zread" value={updatedRow.zread || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                    <input type="text" name="customercount" value={updatedRow.customercount || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.date}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submitted_time}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.store}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.storename}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.plu2Status === 'Not Generated' ? 'red' : 'black' }}>{item.plu2Status}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.folderStatus === 'Failure' ? 'red' : 'black', }}>{item.folderStatus}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.eodStatus === 'Failure' ? 'red' : 'black', }}>{item.eodStatus}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.idocFileStatus === 'Failure' ? 'red' : 'black', }}>{item.idocFileStatus}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.zread}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.customercount}</TableCell>
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
                            <TableCell style={{ fontSize: '0.71rem' }}> {formatDetails(log.details)}</TableCell>
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
              <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', marginTop:"-20px", minHeight: '1000px'  }}> 
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      PLU2 Checklist
                    </Typography>
                    {isEditMode && (
                      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                        sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                        Submit
                      </Button> )}
                  </Box>
                  {isEditMode ? (
                    <form onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Date"
                          variant="outlined"
                          fullWidth
                          name="date"
                          type="date" // Ensures this field is a date picker
                          value={formData.date}
                          onChange={handleChange}
                          InputLabelProps={{
                            shrink: true, // Ensures the label doesn't overlap the input
                          }}
                        />

                        <TextField
                          label="Submitted By"
                          name="submittedby"
                          value={formData.submittedby}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
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

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="plu2-status-label"
                            sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)',}, }} >
                            PLU2 Status
                          </InputLabel>
                          <Select labelId="plu2-status-label" id="plu2Status" name="plu2Status" value={formData.plu2Status} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': {  textAlign: 'left', }, }} >
                            <MenuItem value="Generated">Generated</MenuItem>
                            <MenuItem value="Manually Generated">Manually Generated</MenuItem>
                            <MenuItem value="Not Generated">Not Generated</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="folder-status-label"
                            sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)', },  }} >
                            PLU2 Containing Folder
                          </InputLabel>
                          <Select labelId="folder-status-label" id="folderStatus" name="folderStatus" value={formData.folderStatus} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' }, }} >
                            <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Processed">F:\TPDotnet\Server\HostData\Upload\Processed</MenuItem>
                            <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Invalid">F:\TPDotnet\Server\HostData\Upload\Invalid</MenuItem>
                            <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Data">F:\TPDotnet\Server\HostData\Upload\Data</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="eod-status-label"
                            sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)', }, }} >
                            EOD Final Status
                          </InputLabel>
                          <Select labelId="eod-status-label" id="eodStatus" name="eodStatus" value={formData.eodStatus} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left'}, }} >
                            <MenuItem value="Success">Success</MenuItem>
                            <MenuItem value="Failure">Failure</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="idoc-file-status-label"
                            sx={{  fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)',}, }} >
                            IDOC File Upload Status - F:\TPDotnet\LuLu_PosLog\
                          </InputLabel>
                          <Select labelId="idoc-file-status-label" id="idocFileStatus" name="idocFileStatus" value={formData.idocFileStatus} onChange={handleChange}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left', }, }} >
                            <MenuItem value="Success">Success</MenuItem>
                            <MenuItem value="Failure">Failure</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Zread"
                          name="zread"
                          value={formData.zread}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/,/g, ""); // Remove commas
                            handleChange({ target: { name: "zread", value: newValue } });
                          }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                        <TextField
                          label="Customer Count"
                          name="customercount"
                          value={formData.customercount}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/,/g, ""); // Remove commas
                            handleChange({ target: { name: "customercount", value: newValue } });
                          }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      <TextField label="Remarks" variant="outlined" fullWidth multiline rows={4} name="remarks" value={formData.remarks} onChange={handleChange}
                        sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1, }} />
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
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                                <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                                <TableCell align="center">{submittedData?.submittedby}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{whiteSpace: 'nowrap'}}>Store name</TableCell>
                                <TableCell align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="center">{submittedData?.date}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>PLU2 Status</TableCell>
                                <TableCell align="center">{submittedData?.plu2Status}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>PLU2 Containing Folder</TableCell>
                                <TableCell align="center">{submittedData?.folderStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>EOD Final Status</TableCell>
                                <TableCell align="center">{submittedData?.eodStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>IDOC File Upload Status</TableCell>
                                <TableCell align="center">{submittedData?.idocFileStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>ZREAD</TableCell>
                                <TableCell align="center">{submittedData?.zread}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Customer Count</TableCell>
                                <TableCell align="center">{submittedData?.customercount}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Remarks</TableCell>
                                <TableCell align="center">{submittedData?.remarks}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                      <Button variant="contained"  color="primary" onClick={handleEdit}
                        sx={{ marginTop: 2, backgroundColor: '#113f6c',  '&:hover': { backgroundColor: '#0f3555',  }, }} fullWidth >
                        Edit
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                        sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e',  },}} fullWidth>
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
          </TabPanel>;
      case 'Management_User':
        return (
          <>
            <TabPanel value={0}>
                <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', marginTop:"-20px", minHeight: '1000px'  }}> 
                  <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        PLU2 Checklist
                      </Typography>
                      {isEditMode && (
                        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                          sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                          Submit
                        </Button> )}
                    </Box>
                    {isEditMode ? (
                      <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                          <TextField
                            label="Date"
                            variant="outlined"
                            fullWidth
                            name="date"
                            type="date" 
                            value={formData.date}
                            onChange={handleChange}
                            InputLabelProps={{
                              shrink: true, 
                            }}
                          />

                          <TextField
                            label="Submitted By"
                            name="submittedby"
                            value={formData.submittedby}
                            onChange={handleChange}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
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

                        <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                          <FormControl fullWidth>
                            <InputLabel id="plu2-status-label"
                              sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -6px) scale(0.75)',}, }} >
                              PLU2 Status
                            </InputLabel>
                            <Select labelId="plu2-status-label" id="plu2Status" name="plu2Status" value={formData.plu2Status} onChange={handleChange}
                              sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': {  textAlign: 'left', }, }} >
                              <MenuItem value="Generated">Generated</MenuItem>
                              <MenuItem value="Manually Generated">Manually Generated</MenuItem>
                              <MenuItem value="Not Generated">Not Generated</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                          <FormControl fullWidth>
                            <InputLabel id="folder-status-label"
                              sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -6px) scale(0.75)', },  }} >
                              PLU2 Containing Folder
                            </InputLabel>
                            <Select labelId="folder-status-label" id="folderStatus" name="folderStatus" value={formData.folderStatus} onChange={handleChange}
                              sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' }, }} >
                              <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Processed">F:\TPDotnet\Server\HostData\Upload\Processed</MenuItem>
                              <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Invalid">F:\TPDotnet\Server\HostData\Upload\Invalid</MenuItem>
                              <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Data">F:\TPDotnet\Server\HostData\Upload\Data</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                          <FormControl fullWidth>
                            <InputLabel id="eod-status-label"
                              sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -6px) scale(0.75)', }, }} >
                              EOD Final Status
                            </InputLabel>
                            <Select labelId="eod-status-label" id="eodStatus" name="eodStatus" value={formData.eodStatus} onChange={handleChange}
                              sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left'}, }} >
                              <MenuItem value="Success">Success</MenuItem>
                              <MenuItem value="Failure">Failure</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                          <FormControl fullWidth>
                            <InputLabel id="idoc-file-status-label"
                              sx={{  fontSize: '0.9rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -6px) scale(0.75)',}, }} >
                              IDOC File Upload Status - F:\TPDotnet\LuLu_PosLog\
                            </InputLabel>
                            <Select labelId="idoc-file-status-label" id="idocFileStatus" name="idocFileStatus" value={formData.idocFileStatus} onChange={handleChange}
                              sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left', }, }} >
                              <MenuItem value="Success">Success</MenuItem>
                              <MenuItem value="Failure">Failure</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                          <TextField
                            label="Zread"
                            name="zread"
                            value={formData.zread}
                            onChange={(e) => {
                              const newValue = e.target.value.replace(/,/g, ""); // Remove commas
                              handleChange({ target: { name: "zread", value: newValue } });
                            }}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                          />
                          <TextField
                            label="Customer Count"
                            name="customercount"
                            value={formData.customercount}
                            onChange={(e) => {
                              const newValue = e.target.value.replace(/,/g, ""); // Remove commas
                              handleChange({ target: { name: "customercount", value: newValue } });
                            }}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                          />
                        </Box>
                        <TextField label="Remarks" variant="outlined" fullWidth multiline rows={4} name="remarks" value={formData.remarks} onChange={handleChange}
                          sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1, }} />
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
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell style={{ whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                                  <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell style={{ whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                                  <TableCell align="center">{submittedData?.submittedby}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell style={{whiteSpace: 'nowrap'}}>Store name</TableCell>
                                  <TableCell align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Date</TableCell>
                                  <TableCell align="center">{submittedData?.date}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>PLU2 Status</TableCell>
                                  <TableCell align="center">{submittedData?.plu2Status}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>PLU2 Containing Folder</TableCell>
                                  <TableCell align="center">{submittedData?.folderStatus}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>EOD Final Status</TableCell>
                                  <TableCell align="center">{submittedData?.eodStatus}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>IDOC File Upload Status</TableCell>
                                  <TableCell align="center">{submittedData?.idocFileStatus}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>ZREAD</TableCell>
                                  <TableCell align="center">{submittedData?.zread}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Customer Count</TableCell>
                                  <TableCell align="center">{submittedData?.customercount}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Remarks</TableCell>
                                  <TableCell align="center">{submittedData?.remarks}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Paper>
                        <Button variant="contained"  color="primary" onClick={handleEdit}
                          sx={{ marginTop: 2, backgroundColor: '#113f6c',  '&:hover': { backgroundColor: '#0f3555',  }, }} fullWidth >
                          Edit
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                          sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e',  },}} fullWidth>
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
            </TabPanel>;
            <TabPanel value={1}>
              <div>
                <h2>PLU2 Checklist</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5 }}>
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
                    <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1 }}>
                    <div style={{ maxHeight: '589px', overflowY: 'auto'  }}>
                      <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'date'} direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'submitted_time'} direction={sortConfig.key === 'submitted_time' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submitted_time')}>Time</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'submittedby'} direction={sortConfig.key === 'submittedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submittedby')}>Submitted By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'storename'} direction={sortConfig.key === 'storename' ? sortConfig.direction : 'asc'} onClick={() => handleSort('storename')}>Store Name</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'plu2Status'} direction={sortConfig.key === 'plu2Status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('plu2Status')}>PLU2 Status</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'folderStatus'} direction={sortConfig.key === 'folderStatus' ? sortConfig.direction : 'asc'} onClick={() => handleSort('folderStatus')}>PLU2 Containing Folder</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'eodStatus'} direction={sortConfig.key === 'eodStatus' ? sortConfig.direction : 'asc'} onClick={() => handleSort('eodStatus')}>EOD Final Status</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'idocFileStatus'} direction={sortConfig.key === 'idocFileStatus' ? sortConfig.direction : 'asc'} onClick={() => handleSort('idocFileStatus')}>IDOC File Upload Status</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'zread'} direction={sortConfig.key === 'zread' ? sortConfig.direction : 'asc'} onClick={() => handleSort('zread')}>ZREAD</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'customercount'} direction={sortConfig.key === 'customercount' ? sortConfig.direction : 'asc'} onClick={() => handleSort('customercount')}>Customer Count</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'remarks'} direction={sortConfig.key === 'remarks' ? sortConfig.direction : 'asc'} onClick={() => handleSort('remarks')}>Remarks</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'verifiedby'} direction={sortConfig.key === 'verifiedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('verifiedby')}>Verified By</TableSortLabel>
                          </TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.map((item) => (
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
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                    <input type="text" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                    <input type="text" name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                    <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select  name="plu2Status"  value={updatedRow.plu2Status || ''}  onChange={handleInputChange}  fullWidth 
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                      MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                      <MenuItem value="Generated">Generated</MenuItem>
                                      <MenuItem value="Manually Generated">Manually Generated</MenuItem>
                                      <MenuItem value="Not Generated">Not Generated</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select  name="folderStatus"   value={updatedRow.folderStatus || ''}  onChange={handleInputChange} fullWidth
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                      MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',},},},}}>
                                      <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Processed">F:\TPDotnet\Server\HostData\Upload\Processed</MenuItem>
                                      <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Invalid">F:\TPDotnet\Server\HostData\Upload\Invalid</MenuItem>
                                      <MenuItem value="F:\TPDotnet\Server\HostData\Upload\Data">F:\TPDotnet\Server\HostData\Upload\Data</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select name="eodStatus" value={updatedRow.eodStatus || ''} onChange={handleInputChange} fullWidth
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                      MenuProps={{PaperProps: {sx: {'& .MuiMenuItem-root': { fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                      <MenuItem value="Success">Success</MenuItem>
                                      <MenuItem value="Failure">Failure</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <Select name="idocFileStatus" value={updatedRow.idocFileStatus || ''} onChange={handleInputChange} fullWidth
                                      sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }}
                                      MenuProps={{ PaperProps: { sx: {'& .MuiMenuItem-root': {fontSize: '0.8rem', padding: '4px 8px',}, },},}}>
                                      <MenuItem value="Success">Success</MenuItem>
                                      <MenuItem value="Failure">Failure</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                    <input type="text" name="zread" value={updatedRow.zread || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                    <input type="text" name="customercount" value={updatedRow.customercount || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.date}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submitted_time}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.store}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.storename}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.plu2Status === 'Not Generated' ? 'red' : 'black' }}>{item.plu2Status}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.folderStatus === 'Failure' ? 'red' : 'black', }}>{item.folderStatus}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.eodStatus === 'Failure' ? 'red' : 'black', }}>{item.eodStatus}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.idocFileStatus === 'Failure' ? 'red' : 'black', }}>{item.idocFileStatus}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.zread}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.customercount}</TableCell>
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
                            <TableCell style={{ fontSize: '0.71rem' }}> {formatDetails(log.details)}</TableCell>
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

export default Plu2Checklist;


