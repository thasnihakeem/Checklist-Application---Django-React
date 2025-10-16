import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from '@mui/material';
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

const IdtRegister = () => {
  const [formData, setFormData] = useState({
    date: '',
    store: '',
    storename: '',
    vendorName: '',
    vendorPhone: '',
    purpose: '',
    accessType: '',
    inTime: '',
    outTime: '',
    remarks: '',
    assistedby:"",
    submittedby:"",
  });
  
  const [isEditMode, setIsEditMode] = useState(true);
  const [submittedData, setSubmittedData] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();
  const [store, setStore] = useState("9201");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
      setSnackbarMessage("Error fetching stores.");
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
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = () => {
    setIsEditMode(true);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
        'date', 'store', 'submittedby', 'assistedby', 'purpose', 
         'inTime', 'outTime', 'accessType'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        setSnackbarMessage( `Please fill the following required fields: ${missingFields.join(', ')}`);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

    const dataToPost = { ...formData, user: username}; 

    try {
        const response = await axios.post(`${API_BASE_URL}/api/submit-Idt-register/`, dataToPost);

        if (response.status === 201) {
            setSnackbarMessage('Data successfully submitted!');
            setSnackbarSeverity('success');
            setIsEditMode(false);
            setSubmittedData(dataToPost);
        } else {
            setSnackbarMessage('Something went wrong!');
            setSnackbarSeverity('error');
        }
    } catch (error) {
        console.error('Error submitting data:', error);
        setSnackbarMessage('Failed to upload data.');
        setSnackbarSeverity('error');
    }

    setOpenSnackbar(true);
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedRow, setUpdatedRow] = useState({});
  const [startDateTab2, setStartDateTab2] = useState('');
  const [endDateTab2, setEndDateTab2] = useState('');
  const [storeTab2, setStoreTab2] = useState('');   
  const [dataTab2, setDataTab2] = useState([]);

  const fetchData = async (isVerified = false) => {
    console.log("Fetching data for verified:", isVerified);  
    if (!startDate || !endDate) {
      setSnackbarMessage("Please select a valid start and end date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/${userid}/`);
      const profile = profileResponse.data;
      let params = { start_date: startDate, end_date: endDate, verified: isVerified ? "true" : "false", user: username };

      if (profile.designation === "Admin" || profile.designation === "IT Manager") {
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
      const endpoint = `${API_BASE_URL}/api/Idt-register/`;  
      const response = await axios.get(endpoint, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbarMessage("Failed to fetch data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  const handleVerify = async () => {
    try {
      const idsToVerify = data.filter(item => !item.verified).map(item => item.id);
  
      if (idsToVerify.length > 0) {
        await Promise.all(idsToVerify.map(id =>
          axios.put(`${API_BASE_URL}/api/update-Idt-register/${id}/`, { 
            verified: true, user: username })
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
  
  const handleDownloadCSV = () => {
    if (!startDate || !endDate) {
      setSnackbarMessage("Please select a valid start and end date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    const params = {
      start_date: startDate,
      end_date: endDate,
      store,
      user: username,
      action: "CSV"
    };
  
    axios
      .get(`${API_BASE_URL}/api/Idt-register/download/`, { params })
      .then((response) => {
        const jsonData = response.data.filter((item) => item.verified === false); // Fix: Check for 'verified' instead of 'varified'
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `IDT_Register_Varified_${startDateTab2}_to_${endDateTab2}.csv`);  // Fix filename to reflect correct filter
        document.body.appendChild(link);
        link.click();
        setSnackbarMessage("CSV downloaded successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error downloading data.", error);
        setSnackbarMessage("Failed to download data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };
  
  function convertToCSV(jsonData) {
    const header = [
      'Date', 'Store', 'Store Name', 'Vendor Name', 
      'Vendor Phone Number', 'Purpose', 'Access Type', 
      'In Time', 'Out Time', 'Assisted By', 'Remarks'
    ];
    const rows = jsonData.map(item => [
      item.date,
      item.store,
      item.storename,
      item.vendorName,
      item.vendorPhone || "",
      item.purpose,
      item.accessType,
      item.inTime,
      item.outTime,
      item.assistedby,  
      item.remarks || "",    
    ]);
  
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
  
  const handleDownloadPDF = () => {
    if (!startDate || !endDate) {
      setSnackbarMessage("Please select a valid start and end date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    const params = {
      start_date: startDate,
      end_date: endDate,
      store,
      user: username,
      action: "PDF"
    };
  
    axios
      .get(`${API_BASE_URL}/api/Idt-register/download/`, { params })
      .then((response) => {
        const filteredData = response.data.filter((item) => item.verified === false);
  
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [400, 230]
        });
        const tableColumns = [
          'Date', 'Store', 'Store Name', 'Vendor Name',
          'Vendor Phone Number', 'Purpose', 'Access Type',
          'In Time', 'Out Time', 'Assisted By', 'Remarks',
        ];
  
        const tableData = filteredData.map((item) => [
          item.date,
          item.store,
          item.storename,
          item.vendorName,
          item.vendorPhone,
          item.purpose,
          item.accessType,
          item.inTime,
          item.outTime,
          item.assistedby,
          item.remarks,
        ]);
  
        doc.text("IDT Register (Not Verified)", 14, 10);
  
        doc.autoTable({
          head: [tableColumns],
          body: tableData,
          startY: 20,
          theme: 'striped',
        });
  
        doc.save(`IDT_Register_Not_Verified_${startDate}_to_${endDate}.pdf`);
        setSnackbarMessage("PDF downloaded successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error downloading PDF data.", error);
        setSnackbarMessage("Failed to download PDF.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };
  

  // const handleDownloadPDF = () => {
  //   const filteredData = data.filter((item) => item.verified === false);  // Fix: Check for 'verified' instead of 'varified'
  
  //   const doc = new jsPDF();
  //   const tableColumns = [
  //     'Date', 'Store', 'Store Name', 'Vendor Name',
  //     'Vendor Phone Number', 'Purpose', 'Access Type',
  //     'In Time', 'Out Time','Assisted By', 'Remarks',
  //   ];
  
  //   const tableData = filteredData.map((item) => [
  //     item.date, item.store, item.storename, item.vendorName,
  //     item.vendorPhone, item.purpose, item.accessType,
  //     item.inTime, item.outTime, item.assistedby,  item.remarks,
  //   ]);
  
  //   doc.text("IDT Register (Not Verified) ", 14, 10);
  
  //   doc.autoTable({
  //     head: [tableColumns],
  //     body: tableData,
  //     startY: 20,
  //     theme: 'striped',
  //   });
  
  //   doc.save(`IDT_Register_Not_Varified_${startDate}_${endDate}.pdf`);  // Fix filename to reflect correct filter
  // };

  const fetchDataForEdit = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/update-Idt-register/${id}/`, {
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

  const handleEditClick = (id) => {
    setEditRowId(id);
    const rowToEdit = data.find((item) => item.id === id);
    setUpdatedRow(rowToEdit);
  };
  
  const handleEditClick1 = (id) => {
    setEditRowId(id);
    const rowToEdit = dataTab2.find((item) => item.id === id);
    console.log("Row to edit:", rowToEdit);  
    setUpdatedRow(rowToEdit);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRow({
      ...updatedRow,
      [name]: value || '', 
    });
  };
  
  const handleSaveClick = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/update-Idt-register/${editRowId}/`,
        { ...updatedRow, user: username }  
      );
      if (response.status === 200) {
        setSnackbarMessage("Row updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setData((prevData) =>
          prevData.map((item) => (item.id === editRowId ? response.data : item))
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

  const handleSaveClick1 = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/update-Idt-register/${editRowId}/`,
        { ...updatedRow, user: username }
      );
      if (response.status === 200) {
        setSnackbarMessage("Row updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
  
        setDataTab2((prevData) =>
          prevData.map((item) =>
            item.id === editRowId ? { ...item, ...response.data } : item
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
        const response = await axios.delete(`${API_BASE_URL}/api/delete-Idt-register/${id}/`, {
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
        console.error("Error deleting data:", error);
        setSnackbarMessage("Failed to delete the record.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  
    const sortedData = [...dataTab2].sort((a, b) => {
      const valA = a[key] ?? ''; // Convert null/undefined to empty string
      const valB = b[key] ?? '';
  
      if (valA === '' && valB !== '') return direction === 'asc' ? 1 : -1; // Move nulls to the bottom
      if (valA !== '' && valB === '') return direction === 'asc' ? -1 : 1;
  
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
  
      return valA.toString().localeCompare(valB.toString(), undefined, { numeric: true }) * (direction === 'asc' ? 1 : -1);
    });
  
    setDataTab2(sortedData);
  };
   
  const [sortConfig1, setSortConfig1] = useState({ key: '', direction: 'asc' });

  const handleSort1 = (key) => {
    let direction = 'asc';
    if (sortConfig1.key === key && sortConfig1.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig1({ key, direction });
  
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

  const fetchDataTab2 = async (isVerified = true) => {
    if (!startDateTab2 || !endDateTab2) {
      setSnackbarMessage("Please select a valid start and end date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/${userid}/`);
      const profile = profileResponse.data;
  
      let params = { start_date: startDateTab2, end_date: endDateTab2, verified: isVerified ? "true" : "false", user: username };
  
      if (profile.designation === "Admin" || profile.designation === "IT Manager") {
        if (storeTab2 && storeTab2 !== "None") {
          params.store = storeTab2;
        }
      } else {
        if (!storeTab2 || storeTab2 === "None") {
          setSnackbarMessage("Please enter a store.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        params.store = storeTab2;
      }
  
      const endpoint = `${API_BASE_URL}/api/Idt-register/`;
      const response = await axios.get(endpoint, { params });
      setDataTab2(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbarMessage("Failed to fetch data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  const handleDownloadCSV1 = () => {
    if (!startDateTab2 || !endDateTab2) {
      setSnackbarMessage("Please select a valid start and end date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    const params = {
      start_date: startDateTab2,
      end_date: endDateTab2,
      user: username,
      action: "CSV"
    };
    if (storeTab2 && storeTab2 !== 'None') params.store = storeTab2;
  
    axios
      .get(`${API_BASE_URL}/api/Idt-register/download/`, { params })
      .then((response) => {
        // Ensure the data is filtered based on verification status
        const jsonData = response.data.filter((item) => item.verified === true); // Filter verified data
        const csv = convertToCSV(jsonData); // Pass filtered data for CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `IDT_Register_List_Tab2_${startDateTab2}_to_${endDateTab2}.csv`);
        document.body.appendChild(link);
        link.click();
        setSnackbarMessage("CSV downloaded successfully for Tab 2.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error downloading data for Tab 2:", error);
        setSnackbarMessage("Failed to download data for Tab 2.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleDownloadPDF1 = () => {
    if (!startDateTab2 || !endDateTab2) {
      setSnackbarMessage("Please select a valid start and end date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    const params = {
      start_date: startDateTab2,
      end_date: endDateTab2,
      user: username,
      action: "PDF"
    };
    if (storeTab2 && storeTab2 !== 'None') params.store = storeTab2;
  
    axios
      .get(`${API_BASE_URL}/api/Idt-register/download/`, { params })
      .then((response) => {
        const filteredDataTab2 = response.data.filter((item) => item.verified === true);
  
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [400, 230]
        });
        const tableColumns = [
          'Date', 'Store', 'Store Name', 'Vendor Name',
          'Vendor Phone Number', 'Purpose', 'Access Type',
          'In Time', 'Out Time', 'Assisted By', 'Remarks',
        ];
  
        const tableDataTab2 = filteredDataTab2.map((item) => [
          item.date,
          item.store,
          item.storename,
          item.vendorName,
          item.vendorPhone,
          item.purpose,
          item.accessType,
          item.inTime,
          item.outTime,
          item.assistedby,
          item.remarks,
        ]);
  
        doc.text("IDT Register (Verified)", 14, 10);
  
        doc.autoTable({
          head: [tableColumns],
          body: tableDataTab2,
          startY: 20,
          theme: 'striped',
        });
  
        doc.save(`IDT_Register_Verified_${startDateTab2}_to_${endDateTab2}.pdf`);
        setSnackbarMessage("PDF downloaded successfully for Tab 2.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error downloading PDF for Tab 2:", error);
        setSnackbarMessage("Failed to download PDF for Tab 2.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };
  

  // const handleDownloadPDF1 = () => {
  //   const filteredDataTab2 = dataTab2.filter((item) => item.verified === true); // Filter verified data

  //   const doc = new jsPDF();
  //   const tableColumns = [
  //     'Date', 'Store', 'Store Name', 'Vendor Name',
  //     'Vendor Phone Number', 'Purpose', 'Access Type',
  //     'In Time', 'Out Time', 'Assisted By', 'Remarks',
  //   ];

  //   const tableDataTab2 = filteredDataTab2.map((item) => [
  //     item.date, item.store, item.storename, item.vendorName,
  //     item.vendorPhone, item.purpose, item.accessType,
  //     item.inTime, item.outTime,item.assistedby, item.remarks,
  //   ]);

  //   doc.text("IDT Register (Verified)", 14, 10); // Corrected text

  //   doc.autoTable({
  //     head: [tableColumns],
  //     body: tableDataTab2,
  //     startY: 20,
  //     theme: 'striped',
  //   });

  //   doc.save(`IDT_Register_Verified_${startDateTab2}_${endDateTab2}.pdf`);
  // };

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
      const response = await axios.get(`${API_BASE_URL}/api/Idt-register/`, {
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
          <Tab value={0}>IDT Register Form</Tab>
          <Tab value={1}>Varification</Tab>
          <Tab value={2}>IDT Register</Tab>
          <Tab value={3}>History</Tab>
          </>
        );
      case 'End_User':
        return <Tab value={0}>IDT Register Form</Tab>;
      case 'Management_User':
        return (
          <>
          <Tab value={0}>IDT Register Form</Tab>
          <Tab value={1}>Varification</Tab>
          <Tab value={2}>IDT Register</Tab>
          <Tab value={3}>History</Tab>
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
            <Box sx={{ padding: 4, maxWidth: 1000, margin: "0 auto" , marginTop: "-5px"}}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c'  }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }}>
                    IDT Register
                  </Typography>
                  {isEditMode && (
                        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                          sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                          Submit
                        </Button>
                      )}
                    <Snackbar
                      open={openSnackbar}
                      autoHideDuration={6000}
                      onClose={() => setOpenSnackbar(false)}
                    >
                      <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                      </Alert>
                    </Snackbar>
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
                            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',  // Adding shadow to the TextField
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
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Vendor Name"
                          name="vendorName"
                          value={formData.vendorName}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                        <TextField
                          label="Vendor Phone Number"
                          name="vendorPhone"
                          value={formData.vendorPhone}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Purpose"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                        />
                        <FormControl
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                        >
                          <InputLabel
                            id="access-type-label"
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
                            Access Type
                          </InputLabel>
                          <Select
                            labelId="access-type-label"
                            name="accessType"
                            value={formData.accessType}
                            onChange={handleChange}
                            sx={{
                              fontSize: '0.9rem',
                              height: '56px',
                              '& .MuiInputBase-input': { textAlign: 'left' },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px' } },
                              },
                            }}
                          >
                            <MenuItem value="IDT">IDT</MenuItem>
                            <MenuItem value="SERVER">SERVER</MenuItem>
                            <MenuItem value="IDT&SERVER">IDT & SERVER</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="In Time"
                          name="inTime"
                          type="time"
                          value={formData.inTime}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  // Adding shadow
                        />
                        <TextField
                          label="Out Time"
                          name="outTime"
                          type="time"
                          value={formData.outTime}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  // Adding shadow
                        />
                        <TextField 
                          label="Assisted By" 
                          name="assistedby" 
                          value={formData.assistedby} 
                          onChange={handleChange} 
                          fullWidth 
                          sx={{ fontSize: '0.9rem' }} 
                        />
                      </Box>

                      <Box sx={{ marginBottom: 4 }}>
                        <TextField
                          label="Remarks"
                          fullWidth
                          multiline
                          rows={3}
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleChange}
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                        />
                      </Box>
                    </form>
                  ):(
                    <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1000 }}>
                      <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store Name</TableCell>
                              <TableCell align="center">{submittedData?.storename}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                              <TableCell align="center">{submittedData?.date}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Submitted By</TableCell>
                              <TableCell align="center">{submittedData?.submittedby}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Vendor Name</TableCell>
                              <TableCell align="center">{submittedData?.vendorName}</TableCell>
                              <TableCell>Vendor Phone Number</TableCell>
                              <TableCell align="center">{submittedData?.vendorPhone}</TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Access Type</TableCell>
                              <TableCell align="center">{submittedData?.accessType}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Assisted By</TableCell>
                              <TableCell align="center">{submittedData?.assistedby}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Purpose</TableCell>
                              <TableCell colSpan={3} align="center">{submittedData?.purpose}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>In Time</TableCell>
                              <TableCell align="center">{submittedData?.inTime}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Out Time</TableCell>
                              <TableCell align="center">{submittedData?.outTime}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Remarks</TableCell>
                              <TableCell colSpan={3} align="center">{submittedData?.remarks}</TableCell>
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
            </Box>
          </TabPanel>
          <TabPanel value={1}>
            <div>
              <h2>IDT Register</h2>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, margintop: 2, marginLeft: 19, marginRight: 10 , marginTop:10 }}>
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
                      value={store|| "9201"}
                      onChange={(e) => {
                        setStore( e.target.value);
                        handleStoreChange(e);
                      }}
                      name="store"
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
                <Button
                  variant="contained"
                  onClick={() => fetchData(false)} 
                  sx={{
                    backgroundColor: '#113f6c',
                    '&:hover': { backgroundColor: '#0e2a47' },
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                  }}
                >
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
                <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1, overflowY: 'auto' }}>
                  <div style={{ maxHeight: '589px', overflowY: 'auto' , border: '1px solid #113f6c'}}>
                  <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                    <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1000}}>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig1.key === 'date'} direction={sortConfig1.key === 'date' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('date')}>Date</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                          <TableSortLabel active={sortConfig1.key === 'submittedby'} direction={sortConfig1.key === 'submittedby' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('submittedby')}>Submitted By</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                          <TableSortLabel active={sortConfig1.key === 'store'} direction={sortConfig1.key === 'store' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('store')}>Store</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig1.key === 'storename'} direction={sortConfig1.key === 'storename' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('storename')}>Store Name</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig1.key === 'vendorName'} direction={sortConfig1.key === 'vendorName' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('vendorName')}>Vendor Name</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig1.key === 'vendorPhone'} direction={sortConfig1.key === 'vendorPhone' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('vendorPhone')}>Vendor Phone Number</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '15%' }}>
                          <TableSortLabel active={sortConfig1.key === 'purpose'} direction={sortConfig1.key === 'purpose' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('purpose')}>Purpose</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig1.key === 'accessType'} direction={sortConfig1.key === 'accessType' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('accessType')}>Access Type</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig1.key === 'inTime'} direction={sortConfig1.key === 'inTime' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('inTime')}>In Time</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig1.key === 'outTime'} direction={sortConfig1.key === 'outTime' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('outTime')}>Out Time</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig1.key === 'assistedby'} direction={sortConfig1.key === 'assistedby' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('assistedby')}>Assisted By</TableSortLabel>
                        </TableCell>   
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                          <TableSortLabel active={sortConfig1.key === 'remarks'} direction={sortConfig1.key === 'remarks' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('remarks')}>Remarks</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.filter(item => !item.verified).map((item, i) => (
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
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                <input type="text" name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="vendorName" value={updatedRow.vendorName || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="vendorPhone" value={updatedRow.vendorPhone || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="purpose" value={updatedRow.purpose || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <Select  name="accessType"  value={updatedRow.accessType || ''}  onChange={handleInputChange}  fullWidth 
                                  sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                  MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                  <MenuItem value="IDT">IDT</MenuItem>
                                  <MenuItem value="SERVER">SERVER</MenuItem>
                                  <MenuItem value="IDT&SERVER">IDT & SERVER</MenuItem>
                                </Select>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                <input type="time" name="inTime" value={updatedRow.inTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                <input type="time" name="outTime" value={updatedRow.outTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="assistedby" value={updatedRow.assistedby || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>
                                <input type="text" name="remarks" value={updatedRow.remarks || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
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
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.store} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.storename}  </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorName}  </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorPhone} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.purpose} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.accessType} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.inTime} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.outTime} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.assistedby} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.remarks}  </TableCell>
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
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
            <Button
                variant="contained"
                color="primary"
                onClick={handleVerify}
                disabled={!data.length} 
                sx={{
                  backgroundColor: !data.length ? '#9e9e9e' : '#4caf50', 
                  '&:hover': { backgroundColor: data.length ? '#388e3c' : '#9e9e9e' },
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  width:"130vh",
                  marginTop:"6px",
                  marginLeft:"17px"
                }}
              >
                Verify
            </Button>
          </TabPanel>
          <TabPanel value={2}>
            <div>
              <h2>IDT Register</h2>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, margintop: 2, marginLeft: 19, marginRight: 10 , marginTop:10 }}>
                <TextField
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={startDateTab2}
                  onChange={(e) => setStartDateTab2(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={endDateTab2}
                  onChange={(e) => setEndDateTab2(e.target.value)}
                  sx={{ flex: 1 }}
                />
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
                      value={storeTab2|| "None"}
                      onChange={(e) => {
                        setStoreTab2( e.target.value);
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
                <Button
                  variant="contained"
                  onClick={() => fetchDataTab2(true)} 
                  sx={{
                    backgroundColor: '#113f6c',
                    '&:hover': { backgroundColor: '#0e2a47' },
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                  }}
                >
                  Fetch Data
                </Button>
                <Button variant="contained" color="primary" onClick={handleDownloadCSV1} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                  <DownloadIcon />
                </Button>
                <Button variant="contained" color="secondary" onClick={handleDownloadPDF1} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#800000', '&:hover': { backgroundColor: '#660000' }}} >
                  <PictureAsPdfIcon />
                </Button>
              </Box>
              <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1 , overflowY: 'auto' }}>
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
                          <TableSortLabel active={sortConfig.key === 'submittedby'} direction={sortConfig.key === 'submittedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submittedby')}>Submitted By</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                          <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'storename'} direction={sortConfig.key === 'storename' ? sortConfig.direction : 'asc'} onClick={() => handleSort('storename')}>Store Name</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig.key === 'vendorName'} direction={sortConfig.key === 'vendorName' ? sortConfig.direction : 'asc'} onClick={() => handleSort('vendorName')}>Vendor Name</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                          <TableSortLabel active={sortConfig.key === 'vendorPhone'} direction={sortConfig.key === 'vendorPhone' ? sortConfig.direction : 'asc'} onClick={() => handleSort('vendorPhone')}>Vendor Phone Number</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '15%' }}>
                          <TableSortLabel active={sortConfig.key === 'purpose'} direction={sortConfig.key === 'purpose' ? sortConfig.direction : 'asc'} onClick={() => handleSort('purpose')}>Purpose</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'accessType'} direction={sortConfig.key === 'accessType' ? sortConfig.direction : 'asc'} onClick={() => handleSort('accessType')}>Access Type</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'inTime'} direction={sortConfig.key === 'inTime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('inTime')}>In Time</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'outTime'} direction={sortConfig.key === 'outTime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('outTime')}>Out Time</TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                          <TableSortLabel active={sortConfig.key === 'assistedby'} direction={sortConfig.key === 'assistedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('assistedby')}>Assisted By</TableSortLabel>
                        </TableCell>   
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
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
                      {dataTab2.filter(item => item.verified === true).map((item, i) => (
                        <TableRow key={item.id} hover sx={{'&:hover': { backgroundColor: '#e3f2fd' },'&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' },}} >
                          {editRowId === item.id ? (
                            <>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '3%' }}>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                <input type="date" name="date" value={updatedRow.date|| ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}}/>
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
                                <input type="text" name="vendorName" value={updatedRow.vendorName || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="vendorPhone" value={updatedRow.vendorPhone || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="purpose" value={updatedRow.purpose || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <Select  name="accessType"  value={updatedRow.accessType || ''}  onChange={handleInputChange}  fullWidth 
                                  sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                  MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                  <MenuItem value="IDT">IDT</MenuItem>
                                  <MenuItem value="SERVER">SERVER</MenuItem>
                                  <MenuItem value="IDT&SERVER">IDT & SERVER</MenuItem>
                                </Select>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                <input type="time" name="inTime" value={updatedRow.inTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                <input type="time" name="outTime" value={updatedRow.outTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="assistedby" value={updatedRow.assistedby || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>
                                <input type="text" name="remarks" value={updatedRow.remarks || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button variant="contained" color="primary" onClick={handleSaveClick1}
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
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.store} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.storename}  </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorName}  </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorPhone} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.purpose} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.accessType} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.inTime} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.outTime} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.assistedby} </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.remarks}  </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.verifiedby}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button  variant="contained" color="primary" onClick={() => handleEditClick1(item.id)}
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
          <TabPanel value={3}>
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
            <Box sx={{ padding: 4, maxWidth: 1000, margin: "0 auto" , marginTop: "-5px"}}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c'  }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }}>
                    IDT Register
                  </Typography>
                  {isEditMode && (
                        <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                          sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                          Submit
                        </Button>
                      )}
                    <Snackbar
                      open={openSnackbar}
                      autoHideDuration={6000}
                      onClose={() => setOpenSnackbar(false)}
                    >
                      <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                      </Alert>
                    </Snackbar>
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
                            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',  // Adding shadow to the TextField
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
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Vendor Name"
                          name="vendorName"
                          value={formData.vendorName}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                        <TextField
                          label="Vendor Phone Number"
                          name="vendorPhone"
                          value={formData.vendorPhone}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="Purpose"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                        />
                        <FormControl
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                        >
                          <InputLabel
                            id="access-type-label"
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
                            Access Type
                          </InputLabel>
                          <Select
                            labelId="access-type-label"
                            name="accessType"
                            value={formData.accessType}
                            onChange={handleChange}
                            sx={{
                              fontSize: '0.9rem',
                              height: '56px',
                              '& .MuiInputBase-input': { textAlign: 'left' },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px' } },
                              },
                            }}
                          >
                            <MenuItem value="IDT">IDT</MenuItem>
                            <MenuItem value="SERVER">SERVER</MenuItem>
                            <MenuItem value="IDT&SERVER">IDT & SERVER</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <TextField
                          label="In Time"
                          name="inTime"
                          type="time"
                          value={formData.inTime}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  // Adding shadow
                        />
                        <TextField
                          label="Out Time"
                          name="outTime"
                          type="time"
                          value={formData.outTime}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  // Adding shadow
                        />
                        <TextField 
                          label="Assisted By" 
                          name="assistedby" 
                          value={formData.assistedby} 
                          onChange={handleChange} 
                          fullWidth 
                          sx={{ fontSize: '0.9rem' }} 
                        />
                      </Box>

                      <Box sx={{ marginBottom: 4 }}>
                        <TextField
                          label="Remarks"
                          fullWidth
                          multiline
                          rows={3}
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleChange}
                          sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                        />
                      </Box>
                    </form>
                  ):(
                    <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1000 }}>
                      <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                        <TableHead>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                              <TableCell colSpan={2} align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store Name</TableCell>
                              <TableCell colSpan={2} align="center">{submittedData?.storename}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                              <TableCell colSpan={2} align="center">{submittedData?.date}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Submitted By</TableCell>
                              <TableCell colSpan={2} align="center">{submittedData?.submittedby}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Vendor Name</TableCell>
                              <TableCell colSpan={5} align="center">{submittedData?.vendorName}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Vendor Phone Number</TableCell>
                              <TableCell colSpan={2} align="center">{submittedData?.vendorPhone}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Access Type</TableCell>
                              <TableCell colSpan={2} align="center">{submittedData?.accessType}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Purpose</TableCell>
                              <TableCell colSpan={5} align="center">{submittedData?.purpose}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>In Time</TableCell>
                              <TableCell align="center">{submittedData?.inTime}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Out Time</TableCell>
                              <TableCell align="center">{submittedData?.outTime}</TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Assisted By</TableCell>
                              <TableCell align="center">{submittedData?.assistedby}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Remarks</TableCell>
                              <TableCell colSpan={3} align="center">{submittedData?.remarks}</TableCell>
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
            </Box>
          </TabPanel>;
      case 'Management_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1000, margin: "0 auto" , marginTop: "-5px"}}>
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c'  }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }}>
                      IDT Register
                    </Typography>
                    {isEditMode && (
                          <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                            sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                            Submit
                          </Button>
                        )}
                      <Snackbar
                        open={openSnackbar}
                        autoHideDuration={6000}
                        onClose={() => setOpenSnackbar(false)}
                      >
                        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                          {snackbarMessage}
                        </Alert>
                      </Snackbar>
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
                              boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',  // Adding shadow to the TextField
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
                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                          <TextField
                            label="Vendor Name"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleChange}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                          />
                          <TextField
                            label="Vendor Phone Number"
                            name="vendorPhone"
                            value={formData.vendorPhone}
                            onChange={handleChange}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                          <TextField
                            label="Purpose"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                          />
                          <FormControl
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                          >
                            <InputLabel
                              id="access-type-label"
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
                              Access Type
                            </InputLabel>
                            <Select
                              labelId="access-type-label"
                              name="accessType"
                              value={formData.accessType}
                              onChange={handleChange}
                              sx={{
                                fontSize: '0.9rem',
                                height: '56px',
                                '& .MuiInputBase-input': { textAlign: 'left' },
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px' } },
                                },
                              }}
                            >
                              <MenuItem value="IDT">IDT</MenuItem>
                              <MenuItem value="SERVER">SERVER</MenuItem>
                              <MenuItem value="IDT&SERVER">IDT & SERVER</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                          <TextField
                            label="In Time"
                            name="inTime"
                            type="time"
                            value={formData.inTime}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  // Adding shadow
                          />
                          <TextField
                            label="Out Time"
                            name="outTime"
                            type="time"
                            value={formData.outTime}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  // Adding shadow
                          />
                          <TextField 
                            label="Assisted By" 
                            name="assistedby" 
                            value={formData.assistedby} 
                            onChange={handleChange} 
                            fullWidth 
                            sx={{ fontSize: '0.9rem' }} 
                          />
                        </Box>

                        <Box sx={{ marginBottom: 4 }}>
                          <TextField
                            label="Remarks"
                            fullWidth
                            multiline
                            rows={3}
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }} 
                          />
                        </Box>
                      </form>
                    ):(
                      <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1000 }}>
                        <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                        <TableContainer>
                          <Table>
                          <TableHead>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                                <TableCell colSpan={2} align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store Name</TableCell>
                                <TableCell colSpan={2} align="center">{submittedData?.storename}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                                <TableCell colSpan={2} align="center">{submittedData?.date}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Submitted By</TableCell>
                                <TableCell colSpan={2} align="center">{submittedData?.submittedby}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Vendor Name</TableCell>
                                <TableCell colSpan={5} align="center">{submittedData?.vendorName}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Vendor Phone Number</TableCell>
                                <TableCell colSpan={2} align="center">{submittedData?.vendorPhone}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Access Type</TableCell>
                                <TableCell colSpan={2} align="center">{submittedData?.accessType}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Purpose</TableCell>
                                <TableCell colSpan={5} align="center">{submittedData?.purpose}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>In Time</TableCell>
                                <TableCell align="center">{submittedData?.inTime}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Out Time</TableCell>
                                <TableCell align="center">{submittedData?.outTime}</TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Assisted By</TableCell>
                                <TableCell align="center">{submittedData?.assistedby}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Remarks</TableCell>
                                <TableCell colSpan={3} align="center">{submittedData?.remarks}</TableCell>
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
              </Box>
            </TabPanel>
            <TabPanel value={1}>
              <div>
                <h2>IDT Register</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, margintop: 2, marginLeft: 19, marginRight: 10 , marginTop:10 }}>
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
                  <Button
                    variant="contained"
                    onClick={() => fetchData(false)} 
                    sx={{
                      backgroundColor: '#113f6c',
                      '&:hover': { backgroundColor: '#0e2a47' },
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                    }}
                  >
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
                  <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1 , overflowY: 'auto' }}>
                  <div style={{ maxHeight: '589px', overflowY: 'auto' , border: '1px solid #113f6c'}}>
                    <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                      <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1000}}>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                             <TableSortLabel active={sortConfig1.key === 'date'} direction={sortConfig1.key === 'date' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('date')}>Date</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig1.key === 'submittedby'} direction={sortConfig1.key === 'submittedby' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('submittedby')}>Submitted By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig1.key === 'store'} direction={sortConfig1.key === 'store' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('store')}>Store</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig1.key === 'storename'} direction={sortConfig1.key === 'storename' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('storename')}>Store Name</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig1.key === 'vendorName'} direction={sortConfig1.key === 'vendorName' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('vendorName')}>Vendor Name</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig1.key === 'vendorPhone'} direction={sortConfig1.key === 'vendorPhone' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('vendorPhone')}>Vendor Phone Number</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '15%' }}>
                            <TableSortLabel active={sortConfig1.key === 'purpose'} direction={sortConfig1.key === 'purpose' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('purpose')}>Purpose</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig1.key === 'accessType'} direction={sortConfig1.key === 'accessType' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('accessType')}>Access Type</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig1.key === 'inTime'} direction={sortConfig1.key === 'inTime' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('inTime')}>In Time</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig1.key === 'outTime'} direction={sortConfig1.key === 'outTime' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('outTime')}>Out Time</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig1.key === 'assistedby'} direction={sortConfig1.key === 'assistedby' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('assistedby')}>Assisted By</TableSortLabel>
                          </TableCell>   
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
                            <TableSortLabel active={sortConfig1.key === 'remarks'} direction={sortConfig1.key === 'remarks' ? sortConfig1.direction : 'asc'} onClick={() => handleSort1('remarks')}>Remarks</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.filter(item => !item.verified).map((item, i) => (
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                  <input type="text" name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                                  <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="vendorName" value={updatedRow.vendorName || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="vendorPhone" value={updatedRow.vendorPhone || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="purpose" value={updatedRow.purpose || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <Select  name="accessType"  value={updatedRow.accessType || ''}  onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="IDT">IDT</MenuItem>
                                    <MenuItem value="SERVER">SERVER</MenuItem>
                                    <MenuItem value="IDT&SERVER">IDT & SERVER</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="time" name="inTime" value={updatedRow.inTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="time" name="outTime" value={updatedRow.outTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="assistedby" value={updatedRow.assistedby || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>
                                  <input type="text" name="remarks" value={updatedRow.remarks || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
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
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.store} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.storename}  </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorName}  </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorPhone} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.purpose} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.accessType} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.inTime} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.outTime} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.assistedby} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.remarks}  </TableCell>
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
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
              >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                  {snackbarMessage}
                </Alert>
              </Snackbar>
              <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerify}
                  disabled={!data.length} 
                  sx={{
                    backgroundColor: !data.length ? '#9e9e9e' : '#4caf50', 
                    '&:hover': { backgroundColor: data.length ? '#388e3c' : '#9e9e9e' },
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    width:"130vh",
                    marginTop:"6px",
                    marginLeft:"17px"
                  }}
                >
                  Verify
              </Button>
            </TabPanel>
            <TabPanel value={2}>
              <div>
                <h2>IDT Register</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, margintop: 2, marginLeft: 19, marginRight: 10 , marginTop:10 }}>
                  <TextField
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    value={startDateTab2}
                    onChange={(e) => setStartDateTab2(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    value={endDateTab2}
                    onChange={(e) => setEndDateTab2(e.target.value)}
                    sx={{ flex: 1 }}
                  />
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
                        value={storeTab2 || (profile?.designation === 'Admin' || profile?.designation === 'IT Manager' ? "None" : "")}
                        onChange={(e) => {
                          setStoreTab2(e.target.value);
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
                  <Button
                    variant="contained"
                    onClick={() => fetchDataTab2(true)} 
                    sx={{
                      backgroundColor: '#113f6c',
                      '&:hover': { backgroundColor: '#0e2a47' },
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                    }}
                  >
                    Fetch Data
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleDownloadCSV1} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                    <DownloadIcon />
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleDownloadPDF1} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#800000', '&:hover': { backgroundColor: '#660000' }}} >
                    <PictureAsPdfIcon />
                  </Button>
                </Box>
                <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                  <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1, overflowY: 'auto' }}>
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
                            <TableSortLabel active={sortConfig.key === 'submittedby'} direction={sortConfig.key === 'submittedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('submittedby')}>Submitted By</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                            <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'storename'} direction={sortConfig.key === 'storename' ? sortConfig.direction : 'asc'} onClick={() => handleSort('storename')}>Store Name</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'vendorName'} direction={sortConfig.key === 'vendorName' ? sortConfig.direction : 'asc'} onClick={() => handleSort('vendorName')}>Vendor Name</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '10%' }}>
                            <TableSortLabel active={sortConfig.key === 'vendorPhone'} direction={sortConfig.key === 'vendorPhone' ? sortConfig.direction : 'asc'} onClick={() => handleSort('vendorPhone')}>Vendor Phone Number</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '15%' }}>
                            <TableSortLabel active={sortConfig.key === 'purpose'} direction={sortConfig.key === 'purpose' ? sortConfig.direction : 'asc'} onClick={() => handleSort('purpose')}>Purpose</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'accessType'} direction={sortConfig.key === 'accessType' ? sortConfig.direction : 'asc'} onClick={() => handleSort('accessType')}>Access Type</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'inTime'} direction={sortConfig.key === 'inTime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('inTime')}>In Time</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'outTime'} direction={sortConfig.key === 'outTime' ? sortConfig.direction : 'asc'} onClick={() => handleSort('outTime')}>Out Time</TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                            <TableSortLabel active={sortConfig.key === 'assistedby'} direction={sortConfig.key === 'assistedby' ? sortConfig.direction : 'asc'} onClick={() => handleSort('assistedby')}>Assisted By</TableSortLabel>
                          </TableCell>   
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>
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
                        {dataTab2.filter(item => item.verified === true).map((item, i) => (
                          <TableRow key={item.id} hover sx={{'&:hover': { backgroundColor: '#e3f2fd' },'&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' },}} >
                            {editRowId === item.id ? (
                              <>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '3%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '9%' }}>
                                  <input type="date" name="date" value={updatedRow.date|| ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}}/>
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
                                  <input type="text" name="vendorName" value={updatedRow.vendorName || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="vendorPhone" value={updatedRow.vendorPhone || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="purpose" value={updatedRow.purpose || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <Select  name="accessType"  value={updatedRow.accessType || ''}  onChange={handleInputChange}  fullWidth 
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                    MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                    <MenuItem value="IDT">IDT</MenuItem>
                                    <MenuItem value="SERVER">SERVER</MenuItem>
                                    <MenuItem value="IDT&SERVER">IDT & SERVER</MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="time" name="inTime" value={updatedRow.inTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                  <input type="time" name="outTime" value={updatedRow.outTime || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <input type="text" name="assistedby" value={updatedRow.assistedby || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>
                                  <input type="text" name="remarks" value={updatedRow.remarks || ''} onChange={handleInputChange} style={{ width: '100%' , height: '40px'}} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" color="primary" onClick={handleSaveClick1}
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
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.submittedby}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.store} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.storename}  </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorName}  </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>{item.vendorPhone} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.purpose} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.accessType} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.inTime} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.outTime} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.assistedby} </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '15%' }}>{item.remarks}  </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.verifiedby}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.7rem' }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button  variant="contained" color="primary" onClick={() => handleEditClick1(item.id)}
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
            <TabPanel value={3}>
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

export default IdtRegister