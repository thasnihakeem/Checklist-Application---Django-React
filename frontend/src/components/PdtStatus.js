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

const PdtStatus = () => {
  const [formData, setFormData] = useState({
    date: "",
    store: "",
    storename: "",
    submittedby:"",
    files: [{pdtnumber: "",  section: "", complaint: "", actiontaken: "", status: "", remarks: "" }],
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
  const [date, setDate] = useState("");
  const [store, setStore] = useState("");
  const [section, setSection] = useState("");
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [pdtData, setpdtData] = useState([]);
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
  
    if (
      storedUserGroup === 'Admin_User' &&
      location.state?.autoNavigateToTab2 &&
      location.state?.store &&
      location.state?.date
    ) {
      const today = location.state.date;
      const storeFromDashboard = location.state.store;
      const statusFromDashboard = location.state.status;
  
      setTabValue(1);
      setSelectedTab(1);
      setDate(today);
      setStore(storeFromDashboard);
  
      setTimeout(() => {
        fetchDataAuto(storeFromDashboard, today, statusFromDashboard); // Pass status
      }, 100);
    }
  }, [location.state]);
  

  const fetchDataAuto = async (storeCode, date, status) => {
    try {
      const localUsername = localStorage.getItem('username') || '';
      const fallbackStore = localStorage.getItem('store') || '';
  
      const params = {
        date: date,
        user: localUsername,
        store: storeCode || fallbackStore,
        status: status != null ? status : ["ok", "not ok"] // <- pass status here
      };
  
      const response = await axios.get(`${API_BASE_URL}/api/pdtstatus/`, { params });
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
      status: file.status || "Ok",
    }));

    const requiredFields = ['date', 'store', 'submittedby'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    const incompleteFiles = formData.files.map((file, index) => {
      const missingFileFields = [];
    
      if (!file.pdtnumber) missingFileFields.push('PDT Number');
      if (!file.status) missingFileFields.push('Status');
      if (!file.section) missingFileFields.push('Section');
    
      if (file.status === "Not Ok" && !file.remarks) {
        missingFileFields.push('Remarks (Required when Status is Not Ok)');
      }

      return { index, missingFileFields };
    }).filter(file => file.missingFileFields.length > 0);
    
    let message = '';
    
    if (missingFields.length > 0) {
      message += `Missing required fields: ${missingFields.join(', ')}. `;
    }
    
    if (incompleteFiles.length > 0) {
      incompleteFiles.forEach(file => {
        message += `File ${file.index + 1} is missing: ${file.missingFileFields.join(', ')}. `;
      });
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
        pdtnumber: file.pdtnumber,
        section: file.section,
        complaint: file.complaint || "",
        actiontaken: file.actiontaken || "",
        status: file.status,
        remarks: file.remarks || "",
      })),
      submitted_time: `${currentDate}T${currentTime}`,
      formatted_time: currentTime,
      user: username,
    };
  
    try {
      console.log("GET URL:", `${API_BASE_URL}/api/pdtstatus/`);
      const checkResponse = await axios.get(`${API_BASE_URL}/api/pdtstatus/`, {
        params: { date: currentDate, store: formData.store },
      });
  
      const existingEntries = checkResponse.data;
      let anyUpdateSuccess = false; // Track if any entry was updated
  
      for (let file of formData.files) {
        const existingEntry = existingEntries.find(entry =>
          entry.pdtnumber === file.pdtnumber &&
          entry.store === formData.store &&
          entry.date === formData.date &&
          entry.storename === formData.storename &&
          entry.section === file.section
        );
  
        if (existingEntry && existingEntry.verified) {
          setSnackbar({
            open: true,
            message: `Entry for PDT ${file.pdtnumber} is already verified and cannot be modified.`,
            severity: 'error',
          });
          continue; // Skip this entry
        }
  
        let response;
        if (existingEntry) {
          console.log("PUT URL:", `${API_BASE_URL}/api/update-pdtstatus/${existingEntry.id}/`);
          response = await axios.put(
            `${API_BASE_URL}/api/update-pdtstatus/${existingEntry.id}/`,
            { ...existingEntry, ...file, user: username }
          );
        } else {
          console.log("POST URL:", `${API_BASE_URL}/api/submit-pdtstatus/`);
          response = await axios.post(`${API_BASE_URL}/api/submit-pdtstatus/`, {
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
   
  const fetchDataForEdit = async (id) => {
    if (!id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/pdtstatus/${id}/`);
      setFormData({ ...response.data, user: username});
    } catch (error) {
      console.error("Error fetching data for edit:", error);
      setSnackbar({ open: true, message: "Failed to fetch data for editing.", severity: "error" });
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

  const fetchData = async () => {
    if (!date) {
      setSnackbar({ open: true, message: "Please enter a date.", severity: "warning" });
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
          setSnackbar({ open: true, message: "Please select a store.", severity: "warning" });
          return;
        }
        params.store = store;
      }

      if (section !== "None") params.section = section;  
  
      const response = await axios.get(`${API_BASE_URL}/api/pdtstatus/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({ open: true, message: "Failed to fetch data.", severity: "error" });
    }
  };
  
  const handleDownloadCSV = () => {
    if (!date) {
      setSnackbar({ open: true, message: "Please enter a date.", severity: "warning" });
      return;
    }
    const params = { date,
      user: username,
      action: "CSV"
     };
    if (store) params.store = store;
    axios
      .get(`${API_BASE_URL}/api/pdtstatus/download/`, {
        params,
        responseType: "json",
      })
      .then((response) => {
        const jsonData = response.data;
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `PDT_Status_${date}.csv`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading data:", error);
        setSnackbar({ open: true, message: "Failed to download data.", severity: "error" });
      });
  };

  const convertToCSV = (jsonData) => {
    const header = ["Date", "Store", "Store Name", "Section", "PDT Number", "Complaint", "Action taken",  "Status", "Remarks"];
    const rows = jsonData.map((item) => [
      item.date,
      item.store,
      item.storename,
      item.section,
      item.pdtnumber,
      item.complaint,
      item.actiontaken,
      item.status,
      `"${item.remarks || ""}"`,
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  };

  const handleDownloadPDF = () => {
    if (!date) {
      setSnackbar({ open: true, message: "Please enter a date.", severity: "warning" });
      return;
    }
  
    const params = {
      date,
      user: username,
      action: "PDF"
    };
    if (store) params.store = store;
  
    axios
      .get(`${API_BASE_URL}/api/pdtstatus/download/`, {
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
  
        const tableColumns = [
          "Date", "Store", "Store Name", "Section", 
          "PDT Number", "Complaint", "Action taken", 
          "Status", "Remarks"
        ];
  
        const tableData = jsonData.map((item) => [
          item.date,
          item.store,
          item.storename,
          item.section,
          item.pdtnumber,
          item.complaint,
          item.actiontaken,
          item.status,
          item.remarks,
        ]);
  
        doc.text("PDT Status", 14, 10);
        doc.autoTable({
          head: [tableColumns],
          body: tableData,
          startY: 20,
          theme: "striped",
        });
  
        doc.save(`PDT_Status_${date}.pdf`);
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
  //   const tableColumns = ["Date", "Store", "Store Name", "Section", "PDT Number", "Complaint", "Action taken",  "Status", "Remarks"];

  //   const tableData = data.map((item) => [
  //     item.date,
  //     item.store,
  //     item.storename,
  //     item.section,
  //     item.pdtnumber,
  //     item.complaint,
  //     item.actiontaken,
  //     item.status,
  //     item.remarks,
  //   ]);
  //   doc.text("PDT Status", 14, 10);
  //   doc.autoTable({
  //     head: [tableColumns],
  //     body: tableData,
  //     startY: 20,
  //     theme: "striped",
  //   });

  //   doc.save(`PDT_Status_${date}.pdf`);
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
        `${API_BASE_URL}/api/update-pdtstatus/${editRowId}/`,
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
        const response = await axios.delete(`${API_BASE_URL}/api/delete-pdtstatus/${id}/`, {
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
    const fetchStores = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stores/`);
        console.log("Fetched stores:", response.data);
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    const fetchPDTData = async () => {
        if (formData.store) {
            try {
                const storeParam = Array.isArray(formData.store) 
                    ? formData.store.join(",")  // Convert array to comma-separated string
                    : formData.store;

                const response = await axios.get(`${API_BASE_URL}/api/pospdtscale-numbers/`, {
                    params: { store: storeParam, type: 'PDT' }  // ✅ Send as string
                });

                console.log("Fetched PDT Data:", response.data);
                setpdtData(response.data);
            } catch (error) {
                console.error("Error fetching PDT data:", error);
            }
        }
    };

    fetchPDTData();
}, [formData.store]);


  useEffect(() => {
    if (pdtData.length > 0) {
      const files = pdtData.map((pdt) => ({
        pdtnumber: pdt.typenumber,
        section: pdt.section,
        complaint: "",
        actiontaken: "",
        status: "",
        remarks: "",
      }));
      setFormData((prev) => ({ ...prev, files }));
    } else {
      const emptyFiles = [{ pdtnumber: "", section:"",complaint: "", actiontaken: "", status: "", remarks: "" }];
      setFormData((prev) => ({ ...prev, files: emptyFiles }));
    }
  }, [pdtData]);

  const handleSectionChange = (event) => {
    const section = event.target.value;
    setFormData((prev) => ({ ...prev, section }));
  };

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
          pdtnumber: "",
          complaint: "",
          actiontaken: "",
          status: "",
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
      const response = await axios.get(`${API_BASE_URL}/api/pdtstatus/`, {
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
          axios.put(`${API_BASE_URL}/api/update-pdtstatus/${id}/`, { 
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

  const getTabsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <Tab value={0}>PDT Status Form</Tab>
            <Tab value={1}>PDT Status</Tab>
            <Tab value={2}>History</Tab>
          </>
        );
      case 'End_User':
        return <Tab value={0}>PDT Status Form</Tab>
      case 'Management_User':
        return (
          <>
            <Tab value={0}>PDT Status Form</Tab>
            <Tab value={1}>PDT Status</Tab>
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
              <Box sx={{ padding: 4, maxWidth: 1350, margin: '0 auto', minHeight: '1000px'}}>
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      PDT Status Form
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
                          <Grid container spacing={2}>
                            <Grid item xs={0.2}>
                              <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                {index + 1}
                              </Typography>
                            </Grid>
                            <Grid item xs={1.8}>
                              <TextField
                                label="PDT NO."
                                type="text"
                                fullWidth
                                value={file.pdtnumber}
                                onChange={(e) => handleFileChange(index, "pdtnumber", e.target.value)}
                                sx={{
                                  fontSize: '0.9rem',
                                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Section"
                                type="text"
                                fullWidth
                                value={file.section}
                                onChange={(e) => handleFileChange(index, "section", e.target.value)}
                                sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                              />
                            </Grid>
                            <Grid item xs={1.3}>
                              <FormControl fullWidth>
                                <InputLabel id={`status-label-${index}`} sx={{
                                  fontSize: '1rem',
                                  backgroundColor: 'white',
                                  px: 0.5,
                                  transform: 'translate(14px, 14px) scale(1)',
                                  '&.Mui-focused, &.MuiInputLabel-shrink': {
                                    transform: 'translate(14px, -6px) scale(0.75)',
                                  },
                                }}>
                                  Status
                                </InputLabel>
                                <Select
                                  labelId={`status-label-${index}`}
                                  value={file.status||"Ok"}
                                  onChange={(e) => handleFileChange(index, "status", e.target.value)}
                                  sx={{
                                    fontSize: '0.8rem',
                                    height: '56px',
                                    '& .MuiInputBase-input': {
                                      textAlign: 'left',
                                    },
                                  }}
                                >
                                  <MenuItem value="Ok">Ok</MenuItem>
                                  <MenuItem value="Not Ok">Not Ok</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={6.5}>
                              <TextField
                                label="Remarks (Eg:Ticket No.)"
                                fullWidth
                                multiline
                                rows={1}
                                name="remarks"
                                value={file.remarks}
                                onChange={(e) => handleFileChange(index, "remarks", e.target.value)}
                                sx={{
                                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                              />
                            </Grid>

                            {file.status === "Not Ok" && (
                              <Grid container spacing={2} sx={{ marginTop: 0.5,  marginLeft:4}}>
                                <Grid item xs={5.8}>
                                  <TextField
                                    label="Complaint"
                                    type="text"
                                    fullWidth
                                    value={file.complaint||""}
                                    onChange={(e) => handleFileChange(index, "complaint", e.target.value)}
                                    sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Action Taken"
                                    type="text"
                                    fullWidth
                                    value={file.actiontaken||""}
                                    onChange={(e) => handleFileChange(index, "actiontaken", e.target.value)}
                                    sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                                  />
                                </Grid>
                              </Grid>
                            )}
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
                              <TableCell align="center">{submittedData?.date}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                              <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                              <TableCell align="center">{submittedData?.submittedby}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                              <TableCell colSpan={2} align="center"><strong>{submittedData?.store||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                              <TableCell  colSpan={2} align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(submittedData?.files) && submittedData.files.length > 0 ? (
                              submittedData.files.map((file, index) => (
                                <React.Fragment key={index}>
                                  <TableRow>
                                    <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>PDT Number</TableCell>
                                    <TableCell align="center">{file?.pdtnumber}</TableCell>
                                    <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Section</TableCell>
                                    <TableCell align="center">{file?.section ||''}</TableCell>
                                    <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Status</TableCell>
                                    <TableCell align="center">{file?.status}</TableCell>
                                  </TableRow>
                                  {file?.status === "Not Ok" && (
                                    <>
                                      <TableRow>
                                        <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Complaint</TableCell>
                                        <TableCell colSpan={2}align="center">{file?.complaint}</TableCell>
                                        <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Action Taken</TableCell>
                                        <TableCell colSpan={2} align="center">{file?.actiontaken}</TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                  <TableRow>
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
                <h2>PDT Status</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5}}>
                <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} sx={{ flex: 1 }}/>
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
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="section-label"sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5, 
                              transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',},}}>
                    Section
                  </InputLabel>
                  <Select labelId="section-label" value={section} onChange={(e) => setSection(e.target.value)} >
                    <MenuItem value="Hypermarket">Hypermarket</MenuItem>
                    <MenuItem value="Connect">Connect</MenuItem>
                    <MenuItem value="Fashion Store"> Fashion Store</MenuItem>
                    <MenuItem value="Cash office">Cash office</MenuItem>
                    <MenuItem value="Celebrate">Celebrate</MenuItem>
                    <MenuItem value="Receiving">Receiving</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Webstore">Webstore</MenuItem>
                    <MenuItem value="Warehouse">Warehouse</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
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
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'section'} direction={sortConfig.key === 'section' ? sortConfig.direction : 'asc'} onClick={() => handleSort('section')}>Section</TableSortLabel>
                            </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'pdtnumber'} direction={sortConfig.key === 'pdtnumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('pdtnumber')}>PDT Number</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'status'} direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('status')}>Status</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'complaint'} direction={sortConfig.key === 'complaint' ? sortConfig.direction : 'asc'} onClick={() => handleSort('complaint')}>Complaint</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'actiontaken'} direction={sortConfig.key === 'actiontaken' ? sortConfig.direction : 'asc'} onClick={() => handleSort('actiontaken')}>Action Taken</TableSortLabel>
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
                        {data.map((item, i) => {
                        return (
                          <TableRow key={item.id} hover
                            sx={{ '&:hover': { backgroundColor: '#e3f2fd' }, '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' }, }} >
                            
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>                              
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="date" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                                  <Select labelId="section-label" name="section" value={updatedRow.section|| ''} onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="Hypermarket">Hypermarket</MenuItem>
                                    <MenuItem value="Connect">Connect</MenuItem>
                                    <MenuItem value="Fashion Store">Fashion Store</MenuItem>
                                    <MenuItem value="Cash office">Cash office</MenuItem>
                                    <MenuItem value="Celebrate">Celebrate</MenuItem>
                                    <MenuItem value="Receiving">Receiving</MenuItem>
                                    <MenuItem value="Others">Others</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="pdtnumber" value={updatedRow.pdtnumber|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <Select  name="status"  value={updatedRow.status || ''}  onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="Ok">Ok</MenuItem>
                                    <MenuItem value="Not Ok">Not Ok</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="complaint" value={updatedRow.complaint|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="actiontaken" value={updatedRow.actiontaken|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.section}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.pdtnumber}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.status === 'Not Ok' ? 'red' : 'black'}}>{item.status}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.complaint}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.actiontaken}</TableCell>
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
                      backgroundColor: snackbar.severity === "error" ? "#df7a7a" : snackbar.severity === "success" ? "green" : "",
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
            <Box sx={{ padding: 4, maxWidth: 1350, margin: '0 auto', minHeight: '1000px'}}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                    PDT Status Form
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
                        <Grid container spacing={2}>
                          <Grid item xs={0.2}>
                            <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                              {index + 1}
                            </Typography>
                          </Grid>
                          <Grid item xs={1.8}>
                            <TextField
                              label="PDT NO."
                              type="text"
                              fullWidth
                              value={file.pdtnumber}
                              onChange={(e) => handleFileChange(index, "pdtnumber", e.target.value)}
                              sx={{
                                fontSize: '0.9rem',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              label="Section"
                              type="text"
                              fullWidth
                              value={file.section}
                              onChange={(e) => handleFileChange(index, "section", e.target.value)}
                              sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                            />
                          </Grid>
                          <Grid item xs={1.3}>
                            <FormControl fullWidth>
                              <InputLabel id={`status-label-${index}`} sx={{
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                px: 0.5,
                                transform: 'translate(14px, 14px) scale(1)',
                                '&.Mui-focused, &.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -6px) scale(0.75)',
                                },
                              }}>
                                Status
                              </InputLabel>
                              <Select
                                labelId={`status-label-${index}`}
                                value={file.status||"Ok"}
                                onChange={(e) => handleFileChange(index, "status", e.target.value)}
                                sx={{
                                  fontSize: '0.8rem',
                                  height: '56px',
                                  '& .MuiInputBase-input': {
                                    textAlign: 'left',
                                  },
                                }}
                              >
                                <MenuItem value="Ok">Ok</MenuItem>
                                <MenuItem value="Not Ok">Not Ok</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={6.5}>
                            <TextField
                              label="Remarks (Eg:Ticket No.)"
                              fullWidth
                              multiline
                              rows={1}
                              name="remarks"
                              value={file.remarks}
                              onChange={(e) => handleFileChange(index, "remarks", e.target.value)}
                              sx={{
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                          </Grid>

                          {file.status === "Not Ok" && (
                            <Grid container spacing={2} sx={{ marginTop: 0.5,  marginLeft:4}}>
                              <Grid item xs={5.8}>
                                <TextField
                                  label="Complaint"
                                  type="text"
                                  fullWidth
                                  value={file.complaint||""}
                                  onChange={(e) => handleFileChange(index, "complaint", e.target.value)}
                                  sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  label="Action Taken"
                                  type="text"
                                  fullWidth
                                  value={file.actiontaken||""}
                                  onChange={(e) => handleFileChange(index, "actiontaken", e.target.value)}
                                  sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                                />
                              </Grid>
                            </Grid>
                          )}
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
                            <TableCell align="center">{submittedData?.date}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                            <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                            <TableCell align="center">{submittedData?.submittedby}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                            <TableCell colSpan={2} align="center"><strong>{submittedData?.store||''}</strong></TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                            <TableCell  colSpan={2} align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Array.isArray(submittedData?.files) && submittedData.files.length > 0 ? (
                            submittedData.files.map((file, index) => (
                              <React.Fragment key={index}>
                                <TableRow>
                                  <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>PDT Number</TableCell>
                                  <TableCell align="center">{file?.pdtnumber}</TableCell>
                                  <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Section</TableCell>
                                  <TableCell align="center">{file?.section ||''}</TableCell>
                                  <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Status</TableCell>
                                  <TableCell align="center">{file?.status}</TableCell>
                                </TableRow>
                                {file?.status === "Not Ok" && (
                                  <>
                                    <TableRow>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Complaint</TableCell>
                                      <TableCell colSpan={2}align="center">{file?.complaint}</TableCell>
                                      <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Action Taken</TableCell>
                                      <TableCell colSpan={2} align="center">{file?.actiontaken}</TableCell>
                                    </TableRow>
                                  </>
                                )}
                                <TableRow>
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
      case 'Management_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1350, margin: '0 auto', minHeight: '1000px'}}>
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                      PDT Status Form
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
                          <Grid container spacing={2}>
                            <Grid item xs={0.2}>
                              <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                {index + 1}
                              </Typography>
                            </Grid>
                            <Grid item xs={1.8}>
                              <TextField
                                label="PDT NO."
                                type="text"
                                fullWidth
                                value={file.pdtnumber}
                                onChange={(e) => handleFileChange(index, "pdtnumber", e.target.value)}
                                sx={{
                                  fontSize: '0.9rem',
                                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                label="Section"
                                type="text"
                                fullWidth
                                value={file.section}
                                onChange={(e) => handleFileChange(index, "section", e.target.value)}
                                sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                              />
                            </Grid>
                            <Grid item xs={1.3}>
                              <FormControl fullWidth>
                                <InputLabel id={`status-label-${index}`} sx={{
                                  fontSize: '1rem',
                                  backgroundColor: 'white',
                                  px: 0.5,
                                  transform: 'translate(14px, 14px) scale(1)',
                                  '&.Mui-focused, &.MuiInputLabel-shrink': {
                                    transform: 'translate(14px, -6px) scale(0.75)',
                                  },
                                }}>
                                  Status
                                </InputLabel>
                                <Select
                                  labelId={`status-label-${index}`}
                                  value={file.status||"Ok"}
                                  onChange={(e) => handleFileChange(index, "status", e.target.value)}
                                  sx={{
                                    fontSize: '0.8rem',
                                    height: '56px',
                                    '& .MuiInputBase-input': {
                                      textAlign: 'left',
                                    },
                                  }}
                                >
                                  <MenuItem value="Ok">Ok</MenuItem>
                                  <MenuItem value="Not Ok">Not Ok</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={6.5}>
                              <TextField
                                label="Remarks (Eg:Ticket No.)"
                                fullWidth
                                multiline
                                rows={1}
                                name="remarks"
                                value={file.remarks}
                                onChange={(e) => handleFileChange(index, "remarks", e.target.value)}
                                sx={{
                                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                              />
                            </Grid>

                            {file.status === "Not Ok" && (
                              <Grid container spacing={2} sx={{ marginTop: 0.5,  marginLeft:4}}>
                                <Grid item xs={5.8}>
                                  <TextField
                                    label="Complaint"
                                    type="text"
                                    fullWidth
                                    value={file.complaint||""}
                                    onChange={(e) => handleFileChange(index, "complaint", e.target.value)}
                                    sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Action Taken"
                                    type="text"
                                    fullWidth
                                    value={file.actiontaken||""}
                                    onChange={(e) => handleFileChange(index, "actiontaken", e.target.value)}
                                    sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                                  />
                                </Grid>
                              </Grid>
                            )}
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
                              <TableCell align="center">{submittedData?.date}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted Time</TableCell>
                              <TableCell align="center">{submittedData?.submitted_time}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
                              <TableCell align="center">{submittedData?.submittedby}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                              <TableCell colSpan={2} align="center"><strong>{submittedData?.store||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store Name</strong></TableCell>
                              <TableCell  colSpan={2} align="center"><strong>{submittedData?.storename ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(submittedData?.files) && submittedData.files.length > 0 ? (
                              submittedData.files.map((file, index) => (
                                <React.Fragment key={index}>
                                  <TableRow>
                                    <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>PDT Number</TableCell>
                                    <TableCell align="center">{file?.pdtnumber}</TableCell>
                                    <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Section</TableCell>
                                    <TableCell align="center">{file?.section ||''}</TableCell>
                                    <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Status</TableCell>
                                    <TableCell align="center">{file?.status}</TableCell>
                                  </TableRow>
                                  {file?.status === "Not Ok" && (
                                    <>
                                      <TableRow>
                                        <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Complaint</TableCell>
                                        <TableCell colSpan={2}align="center">{file?.complaint}</TableCell>
                                        <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Action Taken</TableCell>
                                        <TableCell colSpan={2} align="center">{file?.actiontaken}</TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                  <TableRow>
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
                <h2>PDT Status</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5}}>
                <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} sx={{ flex: 1 }}/>
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
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="section-label"sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5, 
                              transform: 'translate(14px, 14px) scale(1)', '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',},}}>
                    Section
                  </InputLabel>
                  <Select labelId="section-label" value={section} onChange={(e) => setSection(e.target.value)} >
                    <MenuItem value="Hypermarket">Hypermarket</MenuItem>
                    <MenuItem value="Connect">Connect</MenuItem>
                    <MenuItem value="Fashion Store"> Fashion Store</MenuItem>
                    <MenuItem value="Cash office">Cash office</MenuItem>
                    <MenuItem value="Celebrate">Celebrate</MenuItem>
                    <MenuItem value="Receiving">Receiving</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Webstore">Webstore</MenuItem>
                    <MenuItem value="Warehouse">Warehouse</MenuItem>
                    <MenuItem value="Production">Production</MenuItem>
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
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'section'} direction={sortConfig.key === 'section' ? sortConfig.direction : 'asc'} onClick={() => handleSort('section')}>Section</TableSortLabel>
                            </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'pdtnumber'} direction={sortConfig.key === 'pdtnumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('pdtnumber')}>PDT Number</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'status'} direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'} onClick={() => handleSort('status')}>Status</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig.key === 'complaint'} direction={sortConfig.key === 'complaint' ? sortConfig.direction : 'asc'} onClick={() => handleSort('complaint')}>Complaint</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'actiontaken'} direction={sortConfig.key === 'actiontaken' ? sortConfig.direction : 'asc'} onClick={() => handleSort('actiontaken')}>Action Taken</TableSortLabel>
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
                        {data.map((item, i) => {
                        return (
                          <TableRow key={item.id} hover
                            sx={{ '&:hover': { backgroundColor: '#e3f2fd' }, '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' }, }} >
                            
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="date" name="date" value={updatedRow.date || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                                  <Select labelId="section-label" name="section" value={updatedRow.section|| ''} onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="Hypermarket">Hypermarket</MenuItem>
                                    <MenuItem value="Connect">Connect</MenuItem>
                                    <MenuItem value="Fashion Store">Fashion Store</MenuItem>
                                    <MenuItem value="Cash office">Cash office</MenuItem>
                                    <MenuItem value="Celebrate">Celebrate</MenuItem>
                                    <MenuItem value="Receiving">Receiving</MenuItem>
                                    <MenuItem value="Others">Others</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="pdtnumber" value={updatedRow.pdtnumber|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <Select  name="status"  value={updatedRow.status || ''}  onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="Ok">Ok</MenuItem>
                                    <MenuItem value="Not Ok">Not Ok</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="complaint" value={updatedRow.complaint|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="actiontaken" value={updatedRow.actiontaken|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.section}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.pdtnumber}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%', color: item.status === 'Not Ok' ? 'red' : 'black'}}>{item.status}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.complaint}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.actiontaken}</TableCell>
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
                      backgroundColor: snackbar.severity === "error" ? "#df7a7a" : snackbar.severity === "success" ? "green" : "",
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

export default PdtStatus