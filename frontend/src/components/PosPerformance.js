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
import Grid from '@mui/material/Grid';
import 'jspdf-autotable'; 
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Snackbar, Alert } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
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

const PosPerformance = () => {
  const [formData, setFormData] = useState({
    date: "",
    store: "",
    storename: "",
    submittedby:"",
    files: [{ posnumber: "", posuptime: "", posdowntime: "",remarks: "" ,}],
  });

  const [stores, setStores] = useState([]);
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    
  const [submittedData, setSubmittedData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [store, setStore] = useState("");
  const [data, setData] = useState([]);
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [posData, setPosData] = useState([]);
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
      const fallbackStore = localStorage.getItem('store') || '';
  
      const params = {
        start_date: date,
        end_date: date,
        user: localUsername,
        store: storeCode || fallbackStore,
      };
  
      const response = await axios.get(`${API_BASE_URL}/api/posperformance/`, { params });
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
            setFormData((prev) => ({
              ...prev,
              store: storeDetails[0].storecode,
              storename: storeDetails[0].storename,
            }));
            handleStoreChange({ target: { value: storeDetails[0].storecode } });
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

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.files = formData.files.map(file => ({
      ...file,
      posuptime: file.posuptime || "24.00",
      posdowntime: file.posdowntime || "00.00",
    }));

    const requiredFields = ['date', 'store', 'submittedby'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    const incompleteFiles = formData.files.map((file, index) => {
      const missingFileFields = [];
    
      if (!file.posnumber) missingFileFields.push('POS Number');
      if (!file.posuptime) missingFileFields.push('POS Uptime');
      if (!file.posdowntime) missingFileFields.push('POS Downtime');
    
      return missingFileFields.length > 0 ? { index: index + 1, missingFileFields } : null;
    }).filter(file => file !== null);
    
    let message = '';
    
    if (missingFields.length > 0) {
      message += `Missing required fields: ${missingFields.join(', ')}. `;
    }
    
    if (incompleteFiles.length > 0) {
      message += incompleteFiles.map(file => 
        `File ${file.index} is missing: ${file.missingFileFields.join(', ')}.`
      ).join(' ');
    }
    
    if (message) {
      setSnackbar({ open: true, message: message.trim(), severity: "warning" });
      return;
    }
    
    const currentDateTime = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    const currentDate = currentDateTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); 
    const currentTime = currentDateTime.toLocaleTimeString('en-GB', options); 
    
    const dataToPost = {
      date: formData.date,
      store: formData.store,
      storename: formData.storename,
      submittedby:formData.submittedby,
      files: formData.files.map(file => ({
        posnumber: file.posnumber,
        posuptime: file.posuptime,
        posdowntime: file.posdowntime,
        remarks: file.remarks ,
      })),      
      submitted_time: `${currentDate}T${currentTime}`,
      formatted_time: currentTime,
      user: username,
    };
    
    try {
      const checkResponse = await axios.get(`${API_BASE_URL}/api/posperformance/`, {
        params: { date: currentDate, store: formData.store },
      });
  
      const existingEntries = checkResponse.data;
      let response;
      let anyUpdateSuccess = false; // Track if any entry was updated
  
      for (let file of formData.files) {
        const existingEntry = existingEntries.find(entry =>
          entry.posnumber === file.posnumber &&
          entry.store === formData.store &&
          entry.date === formData.date &&
          entry.storename === formData.storename
        );
  
        if (existingEntry && existingEntry.verified) {
          setSnackbar({
            open: true,
            message: `Entry for POS ${file.posnumber} is already verified and cannot be modified.`,
            severity: 'error',
          });
          continue; // Skip this entry
        }
        if (existingEntry) {
          response = await axios.put(
            `${API_BASE_URL}/api/update-posperformance/${existingEntry.id}/`,
            { ...existingEntry, ...file, user: username}
          );
        } else {
          response = await axios.post(`${API_BASE_URL}/api/submit-posperformance/`, {
            ...dataToPost,
            files: [file],
          });
        }

        if (response.status === 200 || response.status === 201) {
          anyUpdateSuccess = true; // Mark at least one success
        }
      }

      if (anyUpdateSuccess) {
        setSnackbar({
          open: true,
          message: "Data successfully submitted!",
          severity: "success",
        });
        setIsEditMode(false);
        setSubmittedData(dataToPost);
      } else {
        setSnackbar({
          open: true,
          message: "No changes were made as all entries were already verified.",
          severity: "info",
        });
      }
    } catch (error) {
      console.error("Error submitting data:", error.message);
      setSnackbar({ open: true, message: "Failed to upload data.", severity: "error" });
    }
  };

  const { id } = useParams();
  useEffect(() => {
    if (isEditMode && id) {
      fetchDataForEdit(id);
    }
  }, [isEditMode, id]);


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
  
      console.log("Fetching data with params:", params);
  
      const response = await axios.get(`${API_BASE_URL}/api/posperformance/`, { params });
  
      console.log("API Response Data:", response.data);
  
      setData(response.data);
    } catch (error) {
      console.error("Axios error:", error.response || error.message);
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
      .get(`${API_BASE_URL}/api/posperformance/download/`, {
        params,
        responseType: "json",
      })
      .then((response) => {
        const jsonData = response.data;
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `POS_Performance_Status_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        setSnackbar({ open: true, message: "CSV downloaded successfully!", severity: "success" });
      })
      .catch((error) => {
        console.error("Error downloading data:", error);
        setSnackbar({ open: true, message: "Failed to download data.", severity: "error" });
      });
  };

  const convertToCSV = (jsonData) => {
    const header = ["Date", "Store", "Store Name", "POS Number", "POS Up Time", "POS Down Time", "Remarks"];
    const rows = jsonData.map((item) => [
      item.date,
      item.store,
      item.storename,
      item.posnumber,
      item.posuptime,
      item.posdowntime,
      `"${item.remarks || ""}"`,
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
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
      .get(`${API_BASE_URL}/api/posperformance/download/`, {
        params,
        responseType: "json",
      })
      .then((response) => {
        const jsonData = response.data;
  
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [400, 230],
        });
  
        const tableColumns = ["Date", "Store", "Store Name", "POS Number", "POS Up Time", "POS Down Time", "Remarks"];
  
        const tableData = jsonData.map((item) => [
          item.date,
          item.store,
          item.storename,
          item.posnumber,
          item.posuptime,
          item.posdowntime,
          item.remarks,
        ]);
  
        doc.text("POS Performance Status", 14, 10);
  
        doc.autoTable({
          head: [tableColumns],
          body: tableData,
          startY: 20,
          theme: "striped",
        });
  
        doc.save(`POS_Performance_Status_${startDate}_to_${endDate}.pdf`);
        setSnackbar({ open: true, message: "PDF downloaded successfully!", severity: "success" });
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
        setSnackbar({ open: true, message: "Failed to download PDF.", severity: "error" });
      });
  };
  

  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF({
  //     orientation: "landscape",
  //     unit: "mm",
  //     format: [400, 230],
  //   });
  //   const tableColumns = ["Date", "Store", "Store Name", "POS Number", "POS Up Time", "POS Down Time", "Remarks"];

  //   const tableData = data.map((item) => [
  //     item.date,
  //     item.store,
  //     item.storename,
  //     item.posnumber,
  //     item.posuptime,
  //     item.posdowntime,
  //     item.remarks,
  //   ]);
  //   doc.text("POS Performance Status", 14, 10);
  //   doc.autoTable({
  //     head: [tableColumns],
  //     body: tableData,
  //     startY: 20,
  //     theme: "striped",
  //   });

  //   doc.save(`POS_Performance_Status_${date}.pdf`);
  // };

  const fetchDataForEdit = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/update-ad-user-list/${id}/`);
      setFormData({ ...response.data, user: username});
      setSnackbar({ open: true, message: "Data fetched successfully for editing.", severity: "success" });
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
        `${API_BASE_URL}/api/update-posperformance/${editRowId}/`,
        { ...updatedRow, user: username } 
      );
      if (response.status === 200) {
        setSnackbar({ open: true, message: "Data updated successfully!", severity: "success" });
        setData((prevData) =>
          prevData.map((item) => (item.id === editRowId ? { ...updatedRow, user: username } : item))
        );
        setEditRowId(null);
      } else {
        setSnackbar({ open: true, message: "Failed to update.", severity: "error" });
      }
    } catch (error) {
      console.error("Error updating:", error);
      setSnackbar({ open: true, message: "Error saving updates.", severity: "error" });
    }
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this details?");
    if (confirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/delete-posperformance/${id}/`, {
          data: { user: username }  
        });
        if (response.status === 200) {
          setData((prevData) => prevData.filter((item) => item.id !== id));
          setSnackbar({ open: true, message: "Deleted successfully!", severity: "success" });
        } else {
          setSnackbar({ open: true, message: "Failed to delete.", severity: "error" });
        }
      } catch (error) {
        console.error("Error deleting:", error);
        setSnackbar({ open: true, message: "Failed to delete.", severity: "error" });
      }
    }
  };
  
  useEffect(() => {
    const fetchPOSData = async () => {
        if (formData.store) {
            try {
                const storeParam = Array.isArray(formData.store) 
                    ? formData.store.join(",")  // Convert array to comma-separated string
                    : formData.store;

                const response = await axios.get(`${API_BASE_URL}/api/pospdtscale-numbers/`, {
                    params: { store: storeParam, type: 'POS' }  // ✅ Send as string
                });

                console.log("Fetched POS Data:", response.data);
                setPosData(response.data);
            } catch (error) {
                console.error("Error fetching POS data:", error);
            }
        }
    };

    fetchPOSData();
}, [formData.store]);

  useEffect(() => {
    if (posData.length > 0) {
      const files = posData.map((pos) => ({
        posnumber: pos.typenumber,
      }));
      setFormData((prev) => ({ ...prev, files }));
    } else {
      const emptyFiles = [{ posnumber: ""}];
      setFormData((prev) => ({ ...prev, files: emptyFiles }));
    }
  }, [posData]);

  const handleFileChange = (index, field, value) => {
    const updatedFiles = [...formData.files];  
    updatedFiles[index] = { 
      ...updatedFiles[index], 
      [field]: value, 
    };
    setFormData({
      ...formData,
      files: updatedFiles, 
    });
  };

  const handleAddFile = () => {
    setFormData({
      ...formData,
      files: [
        ...formData.files,
        {
          posnumber: "",
          posuptime: "",
          posdowntime: "",
          remarks: "",
        },
      ],
    });
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = formData.files.filter((_, i) => i !== index);
    setFormData({ ...formData, files: updatedFiles });
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
      const response = await axios.get(`${API_BASE_URL}/api/posperformance/`, {
        params: { action: 'history' }
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const getTabsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <Tab value={0}>Pos Performance Form</Tab>
            <Tab value={1}>Pos Performance Checklist </Tab>
            <Tab value={2}>History</Tab>
          </>
        );
      case 'End_User':
        return <Tab value={0}>Pos Performance Form</Tab>;
      case 'Management_User':
        return (
          <>
            <Tab value={0}>Pos Performance Form</Tab>
            <Tab value={1}>Pos Performance Checklist </Tab>
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
          axios.put(`${API_BASE_URL}/api/update-posperformance/${id}/`, { 
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
              <Box sx={{ padding: 4, maxWidth: 1350, margin: '0 auto', marginLeft:"120PX", minHeight: '1000px'}}>
                  <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      POS Status Form
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
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              fontSize: '0.75rem',
                              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
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
                            sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
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
                        {formData.files.map((file, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                            <Grid container spacing={1.5} alignItems="center">
                              <Grid item xs={0.2}>
                                <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                  {index + 1}
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS NO."
                                  type="text"
                                  fullWidth
                                  value={file.posnumber}
                                  onChange={(e) => handleFileChange(index, "posnumber", e.target.value)}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS Uptime (HH.MM)"
                                  type="number"
                                  fullWidth
                                  value={file.posuptime||"24.00"}
                                  onChange={(e) => handleFileChange(index, "posuptime", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS Downtime (HH.MM)"
                                  type="number"
                                  fullWidth
                                  value={file.posdowntime||"00.00"}
                                  onChange={(e) => handleFileChange(index, "posdowntime", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid> 
                              <Grid item xs={5.8}>
                                <TextField 
                                  label="Remarks" 
                                  fullWidth
                                  multiline
                                  rows={1}
                                  name="remarks"
                                  value={file.remarks||""}
                                  onChange={(e) => handleFileChange(index, "remarks", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                  />
                              </Grid> 
                            </Grid>
                            <Button onClick={() => handleRemoveFile(index)}><RemoveIcon /></Button>
                            <Button onClick={handleAddFile}><AddIcon /></Button>
                          </Box>
                        ))}
                      </form>
                      ):(
                      <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1300 }}>
                        <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                        <TableContainer>
                          <Table>
                          <TableHead>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Date</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.date}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.submitted_time}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.submittedby}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                                <TableCell colSpan={4} align="center"><strong>{submittedData?.store||''}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                                <TableCell colSpan={4} align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Array.isArray(submittedData?.files) && submittedData.files.length > 0 ? (
                                submittedData.files.map((file, index) => (
                                  <React.Fragment key={index}>
                                    <TableRow>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS NUMBER</TableCell>
                                      <TableCell align="center">{file?.posnumber}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS Up Time</TableCell>
                                      <TableCell align="center">{file?.posuptime}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS Down Time</TableCell>
                                      <TableCell align="center">{file?.posdowntime}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Remarks</TableCell>
                                      <TableCell colSpan={5} align="center">{file?.remarks}</TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} align="center">No files submitted</TableCell>
                                </TableRow>
                              )}
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
                <h2>POS Performance Status</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2, marginLeft: 20, marginRight: 10 , marginTop:5 }}>
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
                  <Button variant="contained" onClick={fetchData} sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px'}} > Fetch Data </Button>
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
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'posnumber'} direction={sortConfig.key === 'posnumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('posnumber')}>POS Number</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'posuptime'} direction={sortConfig.key === 'posuptime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('posuptime')}>POS Up Time (HH.MM)</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'posdowntime'} direction={sortConfig.key === 'posdowntime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('posdowntime')}>POS Down Time (HH.MM)</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '30%' }}>
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
                          <TableRow key={item.id} hover sx={{'&:hover': { backgroundColor: '#e3f2fd' },'&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' },}} >
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '3%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <input type="date" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}}/>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                                  <input  type="text"  name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="posnumber" value={updatedRow.posnumber || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="posuptime" value={updatedRow.posuptime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="posdowntime" value={updatedRow.posdowntime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>
                                  <input type="text" name="remarks" value={updatedRow.remarks || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '7%' }}>{item.date} </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submitted_time}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.store} </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.storename}  </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%'}}>{item.posnumber} </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%', color: item.posuptime  !== '24.00' ? 'red' : 'black'}}>{item.posuptime} </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%', color: item.posdowntime  !== '0.00' ? 'red' : 'black' }}>{item.posdowntime} </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.remarks}  </TableCell>
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
              </div>
            </TabPanel>
            <TabPanel value={2}>
              <div style={{ width: '100%',marginLeft:"140px", marginTop: '20px' }}>
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
                            <TableCell style={{ fontSize: '0.71rem' }}>  ID: {log.related_object}  {formatDetails(log.details)}</TableCell>
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
              <Box sx={{ padding: 4, maxWidth: 1350, margin: '0 auto', marginLeft:"120PX", minHeight: '1000px'}}>
                  <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      POS Status Form
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
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              fontSize: '0.75rem',
                              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
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
                            sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
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
                        {formData.files.map((file, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                            <Grid container spacing={1.5} alignItems="center">
                              <Grid item xs={0.2}>
                                <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                  {index + 1}
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS NO."
                                  type="text"
                                  fullWidth
                                  value={file.posnumber}
                                  onChange={(e) => handleFileChange(index, "posnumber", e.target.value)}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS Uptime (HH.MM)"
                                  type="number"
                                  fullWidth
                                  value={file.posuptime||"24.00"}
                                  onChange={(e) => handleFileChange(index, "posuptime", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS Downtime (HH.MM)"
                                  type="number"
                                  fullWidth
                                  value={file.posdowntime||"00.00"}
                                  onChange={(e) => handleFileChange(index, "posdowntime", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid> 
                              <Grid item xs={5.8}>
                                <TextField 
                                  label="Remarks" 
                                  fullWidth
                                  multiline
                                  rows={1}
                                  name="remarks"
                                  value={file.remarks||""}
                                  onChange={(e) => handleFileChange(index, "remarks", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                  />
                              </Grid> 
                            </Grid>
                            <Button onClick={() => handleRemoveFile(index)}><RemoveIcon /></Button>
                            <Button onClick={handleAddFile}><AddIcon /></Button>
                          </Box>
                        ))}
                      </form>
                      ):(
                      <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1300 }}>
                        <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                        <TableContainer>
                          <Table>
                          <TableHead>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Date</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.date}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.submitted_time}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.submittedby}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                                <TableCell colSpan={4} align="center"><strong>{submittedData?.store||''}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                                <TableCell colSpan={4} align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Array.isArray(submittedData?.files) && submittedData.files.length > 0 ? (
                                submittedData.files.map((file, index) => (
                                  <React.Fragment key={index}>
                                    <TableRow>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS NUMBER</TableCell>
                                      <TableCell align="center">{file?.posnumber}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS Up Time</TableCell>
                                      <TableCell align="center">{file?.posuptime}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS Down Time</TableCell>
                                      <TableCell align="center">{file?.posdowntime}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Remarks</TableCell>
                                      <TableCell colSpan={5} align="center">{file?.remarks}</TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} align="center">No files submitted</TableCell>
                                </TableRow>
                              )}
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
        </TabPanel>;
      case 'Management_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1350, margin: '0 auto', marginLeft:"120PX", minHeight: '1000px'}}>
                  <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      POS Status Form
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
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              fontSize: '0.75rem',
                              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
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
                            sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
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
                        {formData.files.map((file, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                            <Grid container spacing={1.5} alignItems="center">
                              <Grid item xs={0.2}>
                                <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                  {index + 1}
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS NO."
                                  type="text"
                                  fullWidth
                                  value={file.posnumber}
                                  onChange={(e) => handleFileChange(index, "posnumber", e.target.value)}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS Uptime (HH.MM)"
                                  type="number"
                                  fullWidth
                                  value={file.posuptime||"24.00"}
                                  onChange={(e) => handleFileChange(index, "posuptime", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <TextField
                                  label="POS Downtime (HH.MM)"
                                  type="number"
                                  fullWidth
                                  value={file.posdowntime||"00.00"}
                                  onChange={(e) => handleFileChange(index, "posdowntime", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Grid> 
                              <Grid item xs={5.8}>
                                <TextField 
                                  label="Remarks" 
                                  fullWidth
                                  multiline
                                  rows={1}
                                  name="remarks"
                                  value={file.remarks||""}
                                  onChange={(e) => handleFileChange(index, "remarks", e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    fontSize: '0.9rem',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                  }}
                                  />
                              </Grid> 
                            </Grid>
                            <Button onClick={() => handleRemoveFile(index)}><RemoveIcon /></Button>
                            <Button onClick={handleAddFile}><AddIcon /></Button>
                          </Box>
                        ))}
                      </form>
                      ):(
                      <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1300 }}>
                        <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                        <TableContainer>
                          <Table>
                          <TableHead>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Date</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.date}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.submitted_time}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.submittedby}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                                <TableCell colSpan={4} align="center"><strong>{submittedData?.store||''}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                                <TableCell colSpan={4} align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Array.isArray(submittedData?.files) && submittedData.files.length > 0 ? (
                                submittedData.files.map((file, index) => (
                                  <React.Fragment key={index}>
                                    <TableRow>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS NUMBER</TableCell>
                                      <TableCell align="center">{file?.posnumber}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS Up Time</TableCell>
                                      <TableCell align="center">{file?.posuptime}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>POS Down Time</TableCell>
                                      <TableCell align="center">{file?.posdowntime}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Remarks</TableCell>
                                      <TableCell colSpan={5} align="center">{file?.remarks}</TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} align="center">No files submitted</TableCell>
                                </TableRow>
                              )}
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
                <h2>POS Performance Status</h2>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2, marginLeft: 20, marginRight: 10 , marginTop:5 }}>
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
                    <Button variant="contained" onClick={fetchData} sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px'}} > Fetch Data </Button>
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
                            <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                              <TableSortLabel active={sortConfig.key === 'posnumber'} direction={sortConfig.key === 'posnumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('posnumber')}>POS Number</TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                              <TableSortLabel active={sortConfig.key === 'posuptime'} direction={sortConfig.key === 'posuptime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('posuptime')}>POS Up Time (HH.MM)</TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                              <TableSortLabel active={sortConfig.key === 'posdowntime'} direction={sortConfig.key === 'posdowntime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('posdowntime')}>POS Down Time (HH.MM)</TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '30%' }}>
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
                            <TableRow key={item.id} hover sx={{'&:hover': { backgroundColor: '#e3f2fd' },'&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' },}} >
                              {editRowId === item.id ? (
                                <>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '3%' }}>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                    <input type="date" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}}/>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                                    <input  type="text"  name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <input type="text" name="posnumber" value={updatedRow.posnumber || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <input type="text" name="posuptime" value={updatedRow.posuptime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                    <input type="text" name="posdowntime" value={updatedRow.posdowntime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>
                                    <input type="text" name="remarks" value={updatedRow.remarks || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
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
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '7%' }}>{item.date} </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submitted_time}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.store} </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.storename}  </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%'}}>{item.posnumber} </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%', color: item.posuptime  !== '24.00' ? 'red' : 'black'}}>{item.posuptime} </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%', color: item.posdowntime  !== '0.00' ? 'red' : 'black' }}>{item.posdowntime} </TableCell>
                                  <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.remarks}  </TableCell>
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
              </div>
            </TabPanel>
            <TabPanel value={2}>
              <div style={{ width: '100%',marginLeft:"140px", marginTop: '20px' }}>
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
                            <TableCell style={{ fontSize: '0.71rem' }}>  ID: {log.related_object}  {formatDetails(log.details)}</TableCell>
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

export default PosPerformance