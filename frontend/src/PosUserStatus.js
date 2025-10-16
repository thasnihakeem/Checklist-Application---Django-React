import React,  { useState,useEffect } from 'react';
import { styled } from '@mui/system';
import { Tabs } from '@mui/base/Tabs';
import { TabsList as BaseTabsList } from '@mui/base/TabsList';
import { TabPanel as BaseTabPanel } from '@mui/base/TabPanel';
import { buttonClasses } from '@mui/base/Button';
import { Tab as BaseTab, tabClasses } from '@mui/base/Tab';
import { Box, Alert, TextField, Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import {Card, CardContent, Stack } from '@mui/material';
import ExcelViewer from "./ExcelViewer";
import DocxViewer from "./DocViewer";
import axios from "axios";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { API_BASE_URL } from '../config';


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
  width: 1500px;
  height: 89vh;
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
  position: fixed;
  top: 92px;
  left: 290px;
  z-index: 1;
  padding: 10px;
  `,
);

const PosUserStatus = () => {
  const [formData, setFormData] = useState({
    date:"",
    store: "",
    storename: "",
    name:"",
    designation:"",
    employeeid:"",
    reviewmonth:"",
    posusers: '',
    activeusers: '',
    inactiveusers:'',
    year: '',
    userlist: '',
    validatordesignation1:"",
    validatordesignation2:"",
    validatordesignation3: '',
    validatedby1: '',
    validatedby2: '',
    validatedby3: '',
    files: [],
  });

  const [formData1, setFormData1] = useState({
    store: '',
    storename: '',
    month: '',
    files: [],  // Changed to array to support multiple files
  });

  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setFormData1({ ...formData1, [name]: value });
  };

  const handleFileChange1 = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormData1({ ...formData1, files: [...formData1.files, ...selectedFiles] });
  };

  const handleCancelFileUpload1 = (index) => {
    setFormData1({
      ...formData1,
      files: formData1.files.filter((_, i) => i !== index)
    });
  };

  const handleSubmit1 = async () => {
    const requiredFields = ["store", "month"];
    const missingFields = requiredFields.filter(field => !formData1[field]);

    if (missingFields.length > 0) {
      setSnackbarMessage(`Missing required fields: ${missingFields.join(", ")}.`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (formData1.files.length === 0) {
      setSnackbarMessage("Please select at least one file to upload.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const firstFile = formData1.files[0];
    const fileExtension = firstFile.name.split('.').pop();
    const fileName = `${formData1.store}_POS_User_Status_${formData1.month}_${new Date().getFullYear()}_Varified.pdf`;
    
    const data = new FormData();
    const currentYear = new Date().getFullYear();
    data.append("store", formData1.store);
    data.append("month", formData1.month);
    data.append("year", currentYear);

    formData1.files.forEach((file) => {
      data.append("file", file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-posuserstatus-varified/`, {
        method: "POST",
        body: data,
      });

          if (response.ok) {
              const result = await response.json();
              setSubmittedData1({ ...formData1, fileName, fileUrl: result.file_urls });
              setSnackbarMessage("Other form submitted successfully.");
              setSnackbarSeverity("success");
              setSnackbarOpen(true);
              setIsEditMode1(false);
          } else {
              const result = await response.json();
              if (result.message === "File already exists!") {
                setSnackbarMessage("File already exists! Please check before uploading.");
                setSnackbarSeverity("warning"); // Use 'warning' to differentiate
              } else {
                setSnackbarMessage(result.error || "Error uploading files for second form.");
                setSnackbarSeverity("error");
              }
              setSnackbarOpen(true);
          }
      } catch (error) {
          setSnackbarMessage("Error uploading files for second form.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
      }
  };

  const handleStoreChange1 = (event) => {
    const selectedStoreCode = event.target.value;
    if (selectedStoreCode === "None") {
      setFormData1({
        ...formData1,
        store: "",
        storename: "",
      });
    } else {
      const selectedStore = stores.find(
        (store) => store.storecode === selectedStoreCode
      );
      if (selectedStore) {
        setFormData1({
          ...formData1,
          store: selectedStore.storecode,
          storename: selectedStore.storename,
        });
      }
    }
  };

  const [submittedData, setSubmittedData] = useState(null);
  const [submittedData1, setSubmittedData1] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isEditMode1, setIsEditMode1] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [stores, setStores] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [store, setStore] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
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

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async () => {
    const requiredFields = ["store", "date", "reviewmonth"];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setSnackbarMessage(`Missing required fields: ${missingFields.join(", ")}.`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    if (!formData.files || formData.files.length === 0) {
      setSnackbarMessage("Please upload a file before submitting.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    const data = new FormData();
    const currentYear = new Date().getFullYear();
    data.append('date', formData.date);
    data.append('store', formData.store);
    data.append('storename', formData.storename);
    data.append('month', formData.reviewmonth);
    data.append('designation', formData.designation);
    data.append('name', formData.name);
    data.append('employeeid', formData.employeeid);
    data.append('posusers', formData.posusers);
    data.append('activeusers', formData.activeusers);
    data.append('inactiveusers', formData.inactiveusers);
    data.append('year', currentYear);
    data.append('userlist', formData.userlist);
    data.append('validatedby1', formData.validatedby1);
    data.append('validatedby2', formData.validatedby2);
    data.append('validatedby3', formData.validatedby3);
    data.append('validatordesignation1', formData.validatordesignation1);
    data.append('validatordesignation2', formData.validatordesignation2);
    data.append('validatordesignation3', formData.validatordesignation3);
  
    formData.files.forEach((fileObj, index) => {
      if (fileObj.file) {
        data.append('files', fileObj.file);  
      }
    });
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-posuserstatus/`, {
        method: 'POST',
        body: data, 
      });
  
      if (response.ok) {
        const result = await response.json();
        const lastFileUrl = result.file_urls[0].split('\\').pop(); 
        setSubmittedData({ ...formData, fileName: lastFileUrl }); 
        setSnackbarMessage("Files uploaded and combined successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsEditMode(false);
      } else {
        console.error('Error uploading files');
        setSnackbarMessage("Error uploading files in form 1.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage("Error uploading files in form 1.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  const handleEdit = () => {
    setIsEditMode(true);
    setOpenSnackbar(false);
  };

  const handleEdit1 = () => {
    setIsEditMode1(true);
    setOpenSnackbar(false);
  };

  const handleAddFile = () => {
    setFormData({
      ...formData,
      files: [
        ...formData.files,
        {
          file: null,
        },
      ],
    });
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = formData.files.filter((_, i) => i !== index);
    setFormData({ ...formData, files: updatedFiles });
  };

  const handleCancelFileUpload = (index) => {
    const updatedFiles = [...formData.files];
    updatedFiles[index].file = null;
    setFormData({ ...formData, files: updatedFiles });
    const fileInput = document.querySelectorAll('input[type="file"]')[index];
    if (fileInput) {
      fileInput.value = ""; // Reset file input value
    }
  };
  
  const handleOpenFile = () => {
    const fileUrl = `${submittedData?.fileName}`;
    const fileExtension = submittedData?.fileName.split('.').pop().toLowerCase();
  
    if (fileExtension === 'pdf') {
      window.open(`${API_BASE_URL}/${fileUrl}`, '_blank');
    } else if (fileExtension === 'xlsx') {
      setExcelFileUrl(`${API_BASE_URL}/${fileUrl}`);
      setIsExcelViewerOpen(true);
    } else if (['doc', 'docx'].includes(fileExtension)) {
      setDocxFileUrl(`${API_BASE_URL}/${fileUrl}`);
      setIsDocxViewerOpen(true);
    } else {
      setSnackbarMessage("Unsupported file type.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  const handleOpenFile1 = () => {
    const fileUrl = `${API_BASE_URL}/${submittedData1?.fileUrl}`;
    const fileExtension = submittedData1?.fileName.split('.').pop().toLowerCase();

  
    if (fileExtension === 'pdf') {
      window.open(fileUrl, '_blank');
    } else if (fileExtension === 'xlsx') {
      setExcelFileUrl(fileUrl);
      setIsExcelViewerOpen(true);
    } else if (['doc', 'docx'].includes(fileExtension)) {
      setDocxFileUrl(fileUrl); 
      setIsDocxViewerOpen(true);
    } else {
      setSnackbarMessage("Unsupported file type.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  };

  const monthOrder = {
    'Jan': 1,
    'Feb': 2,
    'Mar': 3,
    'Apr': 4,
    'May': 5,
    'Jun': 6,
    'Jul': 7,
    'Aug': 8,
    'Sep': 9,
    'Oct': 10,
    'Nov': 11,
    'Dec': 12,
  };
  
  const normalizedFiles = files.map((file) => {
    if (typeof file === 'string') {
      const fileParts = file.split('\\');
      const fileName = fileParts[fileParts.length - 1];
      return {
        file_name: fileName,
        file_url: file,
      };
    }
    return file; 
  });
  
  const removeDuplicates = (files) => {
    const seen = new Set();
    return files.filter(file => {
      if (seen.has(file.file_name)) {
        return false; 
      }
      seen.add(file.file_name);
      return true;
    });
  };
  
  const sortFilesByMonth = (files) => {
    return files.sort((a, b) => {
      const monthA = a.file_name.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)[0];
      const monthB = b.file_name.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)[0];
      const yearA = parseInt(a.file_name.match(/\d{4}/)[0], 10);
      const yearB = parseInt(b.file_name.match(/\d{4}/)[0], 10);
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      return monthOrder[monthA] - monthOrder[monthB];
    });
  };
  
  const handleDelete = (file) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this file?');
    if (confirmDelete) {
        console.log(`Deleting file: ${file.file_name}`);
        
        fetch(`${API_BASE_URL}/api/delete-posuserstatus/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({
                file_url: file.file_url, 
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'File deleted successfully') {
                setFiles(prevFiles => prevFiles.filter(f => f.file_name !== file.file_name));
                setSnackbarMessage("File deleted successfully.");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage("Failed to delete the file.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        })
        .catch(error => {
            console.error('Error deleting file:', error);
            setSnackbarMessage("An error occurred while deleting the file.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        });
    }
};

  useEffect(() => {
    if (files.length > 0) {
      const sortedFiles = sortFilesByMonth(normalizedFiles);
      setFiles(sortedFiles);
    }
  }, [files]);
  

  const [isExcelViewerOpen, setIsExcelViewerOpen] = useState(false);
  const [excelFileUrl, setExcelFileUrl] = useState("");
  const [isDocxViewerOpen, setIsDocxViewerOpen] = useState(false);
  const [docxFileUrl, setDocxFileUrl] = useState("");

  const handleFileView = (file) => {
    const fileExtension = file.file_name.split(".").pop().toLowerCase();
    const fileUrl = `${API_BASE_URL}/${file.file_url}`;

    if (fileExtension === "pdf") {
      window.open(fileUrl, "_blank");
    } else if (fileExtension === "xlsx") {
      setExcelFileUrl(fileUrl);
      setIsExcelViewerOpen(true);
    } else if (["doc", "docx"].includes(fileExtension)) {
      setDocxFileUrl(fileUrl); 
      setIsDocxViewerOpen(true);
    } else {
      setSnackbarMessage("Unsupported file type.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDownloadFile = (file) => {
    const fileUrl = `${API_BASE_URL}${file.file_url}`;
    
    if (file.file_name.endsWith('.pdf')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.file_name; 
      link.target = '_blank'; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadZip = async () => {
    if (!year) {
      setSnackbarMessage("Year is required.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    const query = new URLSearchParams({
      store: store || '',
      month: month || '',
      year,
      download_zip: 'true', 
    }).toString();
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/fetch-posuserstatus/?${query}`);
      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "POS_User_Status_Reports.zip"; 
        link.click();
        setSnackbarMessage("Reports downloaded successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        console.error('Error fetching reports');
        setSnackbarMessage("Error fetching reports.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage("Error downloading reports.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  const fetchReports = async () => {
    if (!year) {
      setSnackbarMessage("Year is required.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/${userid}/`);
      const profile = profileResponse.data;
  
      let queryParams = { month: month || '', year, download_zip: 'false' };
  
      // If the user is an Admin or IT Manager, store selection is optional
      if (profile.designation === 'Admin' || profile.designation === 'IT Manager') {
        if (store && store !== "None") {
          queryParams.store = store;
        }
      } else {
        // For other designations, store selection is mandatory
        if (!store || store === "None") {
          setSnackbarMessage("Store is required.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        queryParams.store = store;
      }
  
      const query = new URLSearchParams(queryParams).toString();
      const response = await fetch(`${API_BASE_URL}/api/fetch-posuserstatus/?${query}`);
      if (response.ok) {
        const result = await response.json();
        const normalized = result.map((file) => {
          if (typeof file === 'string') {
            const fileParts = file.split('\\');
            const fileName = fileParts[fileParts.length - 1];
            return {
              file_name: fileName,
              file_url: file,
            };
          }
          return file;
        });
  
        const uniqueFiles = removeDuplicates(normalized);
        const sortedFiles = sortFilesByMonth(uniqueFiles);
        setFiles(sortedFiles);
      } else {
        console.error('Error fetching reports');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const FileChange = (index, field, value) => {
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

  const getTabsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <Tab value={0}>Pos User Status Form</Tab>
            <Tab value={1}>Pos User Status Uploading</Tab>
            <Tab value={2}>Pos User Status</Tab>
          </>
        );
      case 'End_User':
        return (
          <>
            <Tab value={0}>Pos User Status Form</Tab>
            <Tab value={1}>Pos User Status Uploading</Tab>
          </>
        );
      case 'Management_User':
        return (
          <>
            <Tab value={0}>Pos User Status Form</Tab>
            <Tab value={1}>Pos User Status Uploading</Tab>
            <Tab value={2}>Pos User Status</Tab>
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
              <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto', minHeight: '1000px' , marginTop: '-10px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Pos User Status Form
                  </Typography>
                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, }}>
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
                          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',  // Adding shadow to the TextField
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
                      <TextField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Employee ID"
                        name="employeeid"
                        value={formData.employeeid}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel id="reviewmonth-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Review of Month </InputLabel>
                        <Select labelId="reviewmonth-label" id="reviewmonth" name="reviewmonth" value={formData.reviewmonth} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Jan">Jan</MenuItem>
                          <MenuItem value="Feb">Feb</MenuItem>
                          <MenuItem value="Mar">Mar</MenuItem>
                          <MenuItem value="Apr">Apr</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="Jun">Jun</MenuItem>
                          <MenuItem value="Jul">Jul</MenuItem>
                          <MenuItem value="Aug">Aug</MenuItem>
                          <MenuItem value="Sep">Sep</MenuItem>
                          <MenuItem value="Oct">Oct</MenuItem>
                          <MenuItem value="Nov">Nov</MenuItem>
                          <MenuItem value="Dec">Dec</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Count of Total Users"
                        name="posusers"
                        value={formData.posusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Count of Active Users"
                        name="activeusers"
                        value={formData.activeusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Count of Inactive Users"
                        name="inactiveusers"
                        value={formData.inactiveusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <FormControl fullWidth>
                        <InputLabel id="userlist-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>User List Saved</InputLabel>
                        <Select labelId="userlist-label" id="userlist" name="userlist" value={formData.userlist} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <TextField
                        label="Validated By"
                        name="validatedby1"
                        value={formData.validatedby1}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Validated By"
                        name="validatedby2"
                        value={formData.validatedby2}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Validated By"
                        name="validatedby3"
                        value={formData.validatedby3}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation1-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation1-label" id="validatordesignation1" name="validatordesignation1" value={formData.validatordesignation1} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation2-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation2-label" id="validatordesignation2" name="validatordesignation2" value={formData.validatordesignation2} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation3-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation3-label" id="validatordesignation3" name="validatordesignation3" value={formData.validatordesignation3} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3}}>
                      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>Upload Files</Typography>
                      {formData.files.map((fileObj, index) => (
                        <Box key={index}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',  marginBottom: 2, border: '2px dashed #113f6c',
                            borderRadius: 1, padding: 2, backgroundColor: '#ffffff', '&:hover': { backgroundColor: '#f0f4fa' }}} >
                          <input type="file" accept=".pdf, .png, .jpeg" style={{ display: 'none' }} id={`file-upload-${index}`}
                            onChange={(e) => FileChange(index, 'file', e.target.files[0])} />
                          <label htmlFor={`file-upload-${index}`} style={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }} >
                              {fileObj.file ? fileObj.file.name : 'Drag & drop a file here or click to browse [pdf or png]'}
                            </Typography>
                          </label>
                          {fileObj.file && (
                            <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}> {fileObj.file.name} </Typography>
                              <Button variant="outlined" color="error" size="small"  onClick={() => handleCancelFileUpload(index)}
                                sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' } }} >
                                Cancel
                              </Button>
                            </Box>
                          )}
                        </Box>
                      ))}
                      <Button onClick={handleAddFile}> <AddIcon /></Button>
                      <Button onClick={() => handleRemoveFile(formData.files.length - 1)}><RemoveIcon /></Button>
                    </Box>
                  </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 , maxWidth: 1200}}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                                <TableCell align="center"><strong>{submittedData?.date}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store</TableCell>
                                <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              </TableRow>
                              <TableRow>    
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store Name</TableCell>
                                <TableCell align="center"><strong>{submittedData?.storename}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Employee ID</TableCell>
                                <TableCell align="center"><strong>{submittedData?.employeeid ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Name</TableCell>
                              <TableCell align="center"><strong>{submittedData?.name ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.designation ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Review of Month</TableCell>
                              <TableCell align="center"><strong>{submittedData?.reviewmonth ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Total Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.posusers ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Active Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.activeusers ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Inctive Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.inactiveusers ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>1. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby1 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation1 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>2. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby2 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation2 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>3. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby3 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation3 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>User List Saved</TableCell>
                              <TableCell align="center"><strong>{submittedData?.userlist ||''}</strong></TableCell>
                              <TableCell>File Name</TableCell>
                              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                {submittedData?.fileName && (
                                  <Button onClick={handleOpenFile} sx={{whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                    {submittedData.fileName}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                            <ExcelViewer
                              open={isExcelViewerOpen}
                              fileUrl={excelFileUrl}
                              onClose={() => setIsExcelViewerOpen(false)}
                            />
                            <DocxViewer
                              open={isDocxViewerOpen}
                              fileUrl={docxFileUrl}
                              onClose={() => setIsDocxViewerOpen(false)}
                            />
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
                <Snackbar
                  open={openSnackbar}
                  onClose={() => setOpenSnackbar(false)}
                  message={snackbarMessage} 
                  autoHideDuration={3000}   
                  severity={snackbarSeverity} 
                />
              </Paper>
            </Box>
            <Snackbar
              open={openSnackbar}
              onClose={() => setOpenSnackbar(false)}
              message="Successfully uploaded!"
              autoHideDuration={3000}
            />
            </TabPanel>
            <TabPanel value={1}>
            <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', minHeight: '1000px' , marginTop: '40px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      Varified Pos User Status Form
                  </Typography>
                  {isEditMode1 && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit1}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, }}>
                      Submit
                    </Button>
                  )}
                </Box>

                {isEditMode1 ? (
                  <form1 onSubmit={handleSubmit1}>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1,  marginTop: 5 }}>
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
                          value={formData1.store}
                          onChange={(e) => {
                            console.log('Store selected:', e.target.value);
                            handleStoreChange1(e);
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
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <TextField
                          label="Store Name"
                          name="storename"
                          value={formData1.storename}
                          onChange={handleChange1}
                          fullWidth
                          sx={{ fontSize: '0.35rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="month-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Review of Month</InputLabel>
                        <Select labelId="month-label" id="month" name="month" value={formData1.month} onChange={handleChange1}
                          sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Jan">Jan</MenuItem>
                          <MenuItem value="Feb">Feb</MenuItem>
                          <MenuItem value="Mar">Mar</MenuItem>
                          <MenuItem value="Apr">Apr</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="Jun">Jun</MenuItem>
                          <MenuItem value="Jul">Jul</MenuItem>
                          <MenuItem value="Aug">Aug</MenuItem>
                          <MenuItem value="Sep">Sep</MenuItem>
                          <MenuItem value="Oct">Oct</MenuItem>
                          <MenuItem value="Nov">Nov</MenuItem>
                          <MenuItem value="Dec">Dec</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3 }}>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>Upload File</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2, border: '2px dashed #113f6c', borderRadius: 1, backgroundColor: '#ffffff', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f4fa' } }}>
                          <input type="file" accept=".pdf, .jpg, .jpeg, .png" multiple style={{ display: 'none' }} id="file-upload" onChange={handleFileChange1} />
                          <label htmlFor="file-upload" style={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }}>Drag & drop files here or click to browse</Typography>
                          </label>
                        </Box>
                        {formData1.files.length > 0 && formData1.files.map((file, index) => (
                          <Box key={index} sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}>{file.name}</Typography>
                            <Button variant="outlined" color="error" size="small" onClick={() => handleCancelFileUpload1(index)}
                              sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' } }}>
                              Cancel
                            </Button>
                          </Box>
                        ))}
                      </Box>
                  </form1>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData1?.store || ''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ whiteSpace: 'nowrap'}}>Store Name</TableCell>
                              <TableCell align="center">{submittedData1?.storename ||''}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Review of Month</TableCell>
                              <TableCell align="center">{submittedData1?.month}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>File Name</TableCell>
                              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                {submittedData1?.fileName && (
                                  <Button onClick={handleOpenFile1} sx={{whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                    {submittedData1.fileName}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                    <Button variant="contained"  color="primary" onClick={handleEdit1}
                        sx={{ marginTop: 2, backgroundColor: '#113f6c',  '&:hover': { backgroundColor: '#0f3555',  }, }} fullWidth >
                        Edit
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                        sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e',  },}} fullWidth>
                        Home
                      </Button>
                  </Box>
                )}
                <Snackbar
                  open={openSnackbar}
                  onClose={() => setOpenSnackbar(false)}
                  message={snackbarMessage} 
                  autoHideDuration={3000}   
                  severity={snackbarSeverity} 
                />
              </Paper>
            </Box>
            <Snackbar
              open={openSnackbar}
              onClose={() => setOpenSnackbar(false)}
              message="Successfully uploaded!"
              autoHideDuration={3000}
            />
            </TabPanel>
            <TabPanel value={2}>
              <div>
                <h2 style={{ marginTop: '20px' }}>POS User Status</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2, marginLeft:22, marginRight: 10 , marginTop:8}}>
                  <FormControl fullWidth sx={{ boxShadow: 3,  borderRadius: '4px' }}>
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
                    <FormControl fullWidth sx={{ boxShadow: 3,  borderRadius: '4px' }}>
                      <InputLabel id="month-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5 }}>Review of Month </InputLabel>
                      <Select
                        labelId="month-label"
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' }, height: '55px', }}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Jan">Jan</MenuItem>
                        <MenuItem value="Feb">Feb</MenuItem>
                        <MenuItem value="Mar">Mar</MenuItem>
                        <MenuItem value="Apr">Apr</MenuItem>
                        <MenuItem value="May">May</MenuItem>
                        <MenuItem value="Jun">Jun</MenuItem>
                        <MenuItem value="Jul">Jul</MenuItem>
                        <MenuItem value="Aug">Aug</MenuItem>
                        <MenuItem value="Sep">Sep</MenuItem>
                        <MenuItem value="Oct">Oct</MenuItem>
                        <MenuItem value="Nov">Nov</MenuItem>
                        <MenuItem value="Dec">Dec</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ boxShadow: 3,  borderRadius: '4px' }}>
                      <InputLabel id="year-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Year </InputLabel>
                      <Select
                        labelId="year-label"
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                      >
                        {getYearOptions().map((yearOption) => (
                          <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                  <Button variant="contained" onClick={fetchReports}
                    sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px', boxShadow: 3}}>
                    submit
                  </Button>

                  <Button variant="contained"  color="primary"
                    onClick={handleDownloadZip}
                    sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70', boxShadow: 3, } }}
                  >
                    <DownloadIcon />
                  </Button>
                </Box>

                <Box sx={{ marginTop: '70px', marginLeft: '30px', maxHeight: '610px', maxWidth: '1410px', overflowY: 'auto', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: 3 }}>
                  {normalizedFiles.length > 0 ? (
                      <Stack spacing={2}>
                        {normalizedFiles.map((file) => (
                          <Card  
                            key={file.file_name}  
                            elevation={3} 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '16px',
                              '&:hover': { 
                                boxShadow: 6, 
                              }, 
                            }}
                          >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography  
                              variant="body2" 
                              fontWeight="bold"  
                              noWrap  
                              sx={{ 
                                maxWidth: '500px', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                marginLeft: '0px', 
                                fontSize: '0.875rem' 
                              }}
                            >
                              {file.file_name}
                            </Typography>
                          </CardContent>
                          <Box sx={{ display: 'flex', gap: '10px' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleFileView(file)}
                            sx={{
                              color: "#113f6c",
                              fontSize: "0.6rem",
                              padding: "6px 12px",
                              boxShadow: 3,
                              borderColor: "#113f6c",
                              "&:hover": { borderColor: "#113f6c" },
                            }}
                          >
                            View
                          </Button>
                          <ExcelViewer
                              open={isExcelViewerOpen}
                              fileUrl={excelFileUrl}
                              onClose={() => setIsExcelViewerOpen(false)}
                            />

                          <DocxViewer
                                  open={isDocxViewerOpen}
                                  fileUrl={docxFileUrl}
                                  onClose={() => setIsDocxViewerOpen(false)}
                                />
                            <Button   variant="contained"  size="small"  onClick={() => handleDownloadFile(file)} sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.6rem', padding: '6px 12px', boxShadow: 3}} >
                              Download
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleDelete(file)}
                              sx={{
                                color: '#f44336', 
                                fontSize: '0.6rem',
                                padding: '6px 12px',
                                boxShadow: 3,
                                borderColor: '#f44336',
                                '&:hover': { borderColor: '#f44336', backgroundColor: '#ffebee' },
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1" color="textSecondary" textAlign="center">
                      No reports found
                    </Typography>
                  )}
                </Box>
              </div>
            </TabPanel>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </>
        );
      case 'End_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto', minHeight: '1000px' , marginTop: '-10px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Pos User Status Form
                  </Typography>
                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, }}>
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
                          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',  // Adding shadow to the TextField
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
                      <TextField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Employee ID"
                        name="employeeid"
                        value={formData.employeeid}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel id="reviewmonth-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Review of Month</InputLabel>
                        <Select labelId="reviewmonth-label" id="reviewmonth" name="reviewmonth" value={formData.reviewmonth} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Jan">Jan</MenuItem>
                          <MenuItem value="Feb">Feb</MenuItem>
                          <MenuItem value="Mar">Mar</MenuItem>
                          <MenuItem value="Apr">Apr</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="Jun">Jun</MenuItem>
                          <MenuItem value="Jul">Jul</MenuItem>
                          <MenuItem value="Aug">Aug</MenuItem>
                          <MenuItem value="Sep">Sep</MenuItem>
                          <MenuItem value="Oct">Oct</MenuItem>
                          <MenuItem value="Nov">Nov</MenuItem>
                          <MenuItem value="Dec">Dec</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Count of Total Users"
                        name="posusers"
                        value={formData.posusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Count of Active Users"
                        name="activeusers"
                        value={formData.activeusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Count of Inactive Users"
                        name="inactiveusers"
                        value={formData.inactiveusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <FormControl fullWidth>
                        <InputLabel id="userlist-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>User List Saved</InputLabel>
                        <Select labelId="userlist-label" id="userlist" name="userlist" value={formData.userlist} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <TextField
                        label="Validated By"
                        name="validatedby1"
                        value={formData.validatedby1}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Validated By"
                        name="validatedby2"
                        value={formData.validatedby2}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Validated By"
                        name="validatedby3"
                        value={formData.validatedby3}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation1-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation1-label" id="validatordesignation1" name="validatordesignation1" value={formData.validatordesignation1} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation2-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation2-label" id="validatordesignation2" name="validatordesignation2" value={formData.validatordesignation2} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation3-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation3-label" id="validatordesignation3" name="validatordesignation3" value={formData.validatordesignation3} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3}}>
                      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>Upload Files</Typography>
                      {formData.files.map((fileObj, index) => (
                        <Box key={index}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',  marginBottom: 2, border: '2px dashed #113f6c',
                            borderRadius: 1, padding: 2, backgroundColor: '#ffffff', '&:hover': { backgroundColor: '#f0f4fa' }}} >
                          <input type="file" accept=".pdf, .png, .jpeg" style={{ display: 'none' }} id={`file-upload-${index}`}
                            onChange={(e) => FileChange(index, 'file', e.target.files[0])} />
                          <label htmlFor={`file-upload-${index}`} style={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }} >
                              {fileObj.file ? fileObj.file.name : 'Drag & drop a file here or click to browse [pdf or png]'}
                            </Typography>
                          </label>
                          {fileObj.file && (
                            <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}> {fileObj.file.name} </Typography>
                              <Button variant="outlined" color="error" size="small"  onClick={() => handleCancelFileUpload(index)}
                                sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' } }} >
                                Cancel
                              </Button>
                            </Box>
                          )}
                        </Box>
                      ))}
                      <Button onClick={handleAddFile}> <AddIcon /></Button>
                      <Button onClick={() => handleRemoveFile(formData.files.length - 1)}><RemoveIcon /></Button>
                    </Box>
                  </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 , maxWidth: 1200}}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                                <TableCell align="center"><strong>{submittedData?.date}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store</TableCell>
                                <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              </TableRow>
                              <TableRow>    
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store Name</TableCell>
                                <TableCell align="center"><strong>{submittedData?.storename}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Employee ID</TableCell>
                                <TableCell align="center"><strong>{submittedData?.employeeid ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Name</TableCell>
                              <TableCell align="center"><strong>{submittedData?.name ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.designation ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Review of Month</TableCell>
                              <TableCell align="center"><strong>{submittedData?.reviewmonth ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Total Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.posusers ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Active Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.activeusers ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Inactive Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.inactiveusers ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>1. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby1 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation1 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>2. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby2 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation2 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>3. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby3 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation3 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>User List Saved</TableCell>
                            <TableCell align="center"><strong>{submittedData?.userlist ||''}</strong></TableCell>
                              <TableCell>File Name</TableCell>
                              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                {submittedData?.fileName && (
                                  <Button onClick={handleOpenFile} sx={{whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                    {submittedData.fileName}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                            <ExcelViewer
                              open={isExcelViewerOpen}
                              fileUrl={excelFileUrl}
                              onClose={() => setIsExcelViewerOpen(false)}
                            />
                            <DocxViewer
                              open={isDocxViewerOpen}
                              fileUrl={docxFileUrl}
                              onClose={() => setIsDocxViewerOpen(false)}
                            />
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
                <Snackbar
                  open={openSnackbar}
                  onClose={() => setOpenSnackbar(false)}
                  message={snackbarMessage} 
                  autoHideDuration={3000}   
                  severity={snackbarSeverity} 
                />
              </Paper>
            </Box>
            <Snackbar
              open={openSnackbar}
              onClose={() => setOpenSnackbar(false)}
              message="Successfully uploaded!"
              autoHideDuration={3000}
            />
            </TabPanel>
            <TabPanel value={1}>
            <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', minHeight: '1000px' , marginTop: '40px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      Varified Pos User Status Form
                  </Typography>
                  {isEditMode1 && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit1}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, }}>
                      Submit
                    </Button>
                  )}
                </Box>

                {isEditMode1 ? (
                  <form1 onSubmit={handleSubmit1}>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1,  marginTop: 5 }}>
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
                          value={formData1.store}
                          onChange={(e) => {
                            console.log('Store selected:', e.target.value);
                            handleStoreChange1(e);
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
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <TextField
                          label="Store Name"
                          name="storename"
                          value={formData1.storename}
                          onChange={handleChange1}
                          fullWidth
                          sx={{ fontSize: '0.35rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel id="month-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Review of Month</InputLabel>
                        <Select labelId="month-label" id="month" name="month" value={formData1.month} onChange={handleChange1}
                          sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Jan">Jan</MenuItem>
                          <MenuItem value="Feb">Feb</MenuItem>
                          <MenuItem value="Mar">Mar</MenuItem>
                          <MenuItem value="Apr">Apr</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="Jun">Jun</MenuItem>
                          <MenuItem value="Jul">Jul</MenuItem>
                          <MenuItem value="Aug">Aug</MenuItem>
                          <MenuItem value="Sep">Sep</MenuItem>
                          <MenuItem value="Oct">Oct</MenuItem>
                          <MenuItem value="Nov">Nov</MenuItem>
                          <MenuItem value="Dec">Dec</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3 }}>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>Upload File</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2, border: '2px dashed #113f6c', borderRadius: 1, backgroundColor: '#ffffff', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f4fa' } }}>
                          <input type="file" accept=".pdf, .jpg, .jpeg, .png" multiple style={{ display: 'none' }} id="file-upload" onChange={handleFileChange1} />
                          <label htmlFor="file-upload" style={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }}>Drag & drop files here or click to browse</Typography>
                          </label>
                        </Box>
                        {formData1.files.length > 0 && formData1.files.map((file, index) => (
                          <Box key={index} sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}>{file.name}</Typography>
                            <Button variant="outlined" color="error" size="small" onClick={() => handleCancelFileUpload1(index)}
                              sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' } }}>
                              Cancel
                            </Button>
                          </Box>
                        ))}
                      </Box>
                  </form1>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Store</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData1?.store || ''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ whiteSpace: 'nowrap'}}>Store Name</TableCell>
                              <TableCell align="center">{submittedData1?.storename ||''}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Review of Month</TableCell>
                              <TableCell align="center">{submittedData1?.month}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>File Name</TableCell>
                              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                {submittedData1?.fileName && (
                                  <Button onClick={handleOpenFile1} sx={{whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                    {submittedData1.fileName}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                    <Button variant="contained"  color="primary" onClick={handleEdit1}
                        sx={{ marginTop: 2, backgroundColor: '#113f6c',  '&:hover': { backgroundColor: '#0f3555',  }, }} fullWidth >
                        Edit
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                        sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e',  },}} fullWidth>
                        Home
                      </Button>
                  </Box>
                )}
                <Snackbar
                  open={openSnackbar}
                  onClose={() => setOpenSnackbar(false)}
                  message={snackbarMessage} 
                  autoHideDuration={3000}   
                  severity={snackbarSeverity} 
                />
              </Paper>
            </Box>
            <Snackbar
              open={openSnackbar}
              onClose={() => setOpenSnackbar(false)}
              message="Successfully uploaded!"
              autoHideDuration={3000}
            />
            </TabPanel>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </>
        );
      case 'Management_User':
        return (
          <>
            <TabPanel value={0}>
              <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto', minHeight: '1000px' , marginTop: '-10px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Pos User Status Form
                  </Typography>
                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, }}>
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
                          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',  // Adding shadow to the TextField
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
                      <TextField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Employee ID"
                        name="employeeid"
                        value={formData.employeeid}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel id="reviewmonth-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Review of Month </InputLabel>
                        <Select labelId="reviewmonth-label" id="reviewmonth" name="reviewmonth" value={formData.reviewmonth} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Jan">Jan</MenuItem>
                          <MenuItem value="Feb">Feb</MenuItem>
                          <MenuItem value="Mar">Mar</MenuItem>
                          <MenuItem value="Apr">Apr</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="Jun">Jun</MenuItem>
                          <MenuItem value="Jul">Jul</MenuItem>
                          <MenuItem value="Aug">Aug</MenuItem>
                          <MenuItem value="Sep">Sep</MenuItem>
                          <MenuItem value="Oct">Oct</MenuItem>
                          <MenuItem value="Nov">Nov</MenuItem>
                          <MenuItem value="Dec">Dec</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Count of Total Users"
                        name="posusers"
                        value={formData.posusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Count of Active Users"
                        name="activeusers"
                        value={formData.activeusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Count of Inactive Users"
                        name="inactiveusers"
                        value={formData.inactiveusers}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <FormControl fullWidth>
                        <InputLabel id="userlist-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>User List Saved</InputLabel>
                        <Select labelId="userlist-label" id="userlist" name="userlist" value={formData.userlist} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <TextField
                        label="Validated By"
                        name="validatedby1"
                        value={formData.validatedby1}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Validated By"
                        name="validatedby2"
                        value={formData.validatedby2}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                      <TextField
                        label="Validated By"
                        name="validatedby3"
                        value={formData.validatedby3}
                        onChange={handleChange}
                        fullWidth
                        sx={{ boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}  
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation1-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation1-label" id="validatordesignation1" name="validatordesignation1" value={formData.validatordesignation1} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation2-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation2-label" id="validatordesignation2" name="validatordesignation2" value={formData.validatordesignation2} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="validatordesignation3-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}>Designation</InputLabel>
                        <Select labelId="validatordesignation3-label" id="validatordesignation3" name="validatordesignation3" value={formData.validatordesignation3} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '55px', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                          <MenuItem value="IT Manager">IT Manager</MenuItem>
                          <MenuItem value="Chief Accountant">Chief Accountant</MenuItem>
                          <MenuItem value="IT Incharge">IT Incharge</MenuItem>
                          <MenuItem value="Cash Office Incharge">Cash Office Incharge</MenuItem>
                          <MenuItem value="Store HR Manager">Store HR Manager</MenuItem>
                          <MenuItem value="Store HR Incharge">Store HR Incharge</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3}}>
                      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>Upload Files</Typography>
                      {formData.files.map((fileObj, index) => (
                        <Box key={index}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',  marginBottom: 2, border: '2px dashed #113f6c',
                            borderRadius: 1, padding: 2, backgroundColor: '#ffffff', '&:hover': { backgroundColor: '#f0f4fa' }}} >
                          <input type="file" accept=".pdf, .png, .jpeg" style={{ display: 'none' }} id={`file-upload-${index}`}
                            onChange={(e) => FileChange(index, 'file', e.target.files[0])} />
                          <label htmlFor={`file-upload-${index}`} style={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }} >
                              {fileObj.file ? fileObj.file.name : 'Drag & drop a file here or click to browse [pdf or png]'}
                            </Typography>
                          </label>
                          {fileObj.file && (
                            <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}> {fileObj.file.name} </Typography>
                              <Button variant="outlined" color="error" size="small"  onClick={() => handleCancelFileUpload(index)}
                                sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' } }} >
                                Cancel
                              </Button>
                            </Box>
                          )}
                        </Box>
                      ))}
                      <Button onClick={handleAddFile}> <AddIcon /></Button>
                      <Button onClick={() => handleRemoveFile(formData.files.length - 1)}><RemoveIcon /></Button>
                    </Box>
                  </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 , maxWidth: 1200}}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Date</TableCell>
                                <TableCell align="center"><strong>{submittedData?.date}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store</TableCell>
                                <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                              </TableRow>
                              <TableRow>    
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Store Name</TableCell>
                                <TableCell align="center"><strong>{submittedData?.storename}</strong></TableCell>
                                <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Employee ID</TableCell>
                                <TableCell align="center"><strong>{submittedData?.employeeid ||''}</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Name</TableCell>
                              <TableCell align="center"><strong>{submittedData?.name ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.designation ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Review of Month</TableCell>
                              <TableCell align="center"><strong>{submittedData?.reviewmonth ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Total Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.posusers ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Active Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.activeusers ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Count of Inactive Users</TableCell>
                              <TableCell align="center"><strong>{submittedData?.inactiveusers ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>1. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby1 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation1 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>2. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby2 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation2 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>    
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>3. Validator</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatedby3 ||''}</strong></TableCell>
                              <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>Designation</TableCell>
                              <TableCell align="center"><strong>{submittedData?.validatordesignation3 ||''}</strong></TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}>User List Saved</TableCell>
                            <TableCell align="center"><strong>{submittedData?.userlist ||''}</strong></TableCell>
                              <TableCell>File Name</TableCell>
                              <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                {submittedData?.fileName && (
                                  <Button onClick={handleOpenFile} sx={{whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                    {submittedData.fileName}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                            <ExcelViewer
                              open={isExcelViewerOpen}
                              fileUrl={excelFileUrl}
                              onClose={() => setIsExcelViewerOpen(false)}
                            />
                            <DocxViewer
                              open={isDocxViewerOpen}
                              fileUrl={docxFileUrl}
                              onClose={() => setIsDocxViewerOpen(false)}
                            />
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
                <Snackbar
                  open={openSnackbar}
                  onClose={() => setOpenSnackbar(false)}
                  message={snackbarMessage} 
                  autoHideDuration={3000}   
                  severity={snackbarSeverity} 
                />
              </Paper>
            </Box>
            <Snackbar
              open={openSnackbar}
              onClose={() => setOpenSnackbar(false)}
              message="Successfully uploaded!"
              autoHideDuration={3000}
            />
            </TabPanel>
            <TabPanel value={1}>
              <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', minHeight: '1000px' , marginTop: '40px' }}>
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        Varified Pos User Status Form
                    </Typography>
                    {isEditMode1 && (
                      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit1}
                        sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, }}>
                        Submit
                      </Button>
                    )}
                  </Box>

                  {isEditMode1 ? (
                    <form1 onSubmit={handleSubmit1}>
                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1,  marginTop: 5 }}>
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
                            value={formData1.store}
                            onChange={(e) => {
                              console.log('Store selected:', e.target.value);
                              handleStoreChange1(e);
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
                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                          <TextField
                            label="Store Name"
                            name="storename"
                            value={formData1.storename}
                            onChange={handleChange1}
                            fullWidth
                            sx={{ fontSize: '0.35rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                          />
                      </Box>
                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel id="month-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Review of Month </InputLabel>
                          <Select labelId="month-label" id="month" name="month" value={formData1.month} onChange={handleChange1}
                            sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' } }}>
                            <MenuItem value="Jan">Jan</MenuItem>
                            <MenuItem value="Feb">Feb</MenuItem>
                            <MenuItem value="Mar">Mar</MenuItem>
                            <MenuItem value="Apr">Apr</MenuItem>
                            <MenuItem value="May">May</MenuItem>
                            <MenuItem value="Jun">Jun</MenuItem>
                            <MenuItem value="Jul">Jul</MenuItem>
                            <MenuItem value="Aug">Aug</MenuItem>
                            <MenuItem value="Sep">Sep</MenuItem>
                            <MenuItem value="Oct">Oct</MenuItem>
                            <MenuItem value="Nov">Nov</MenuItem>
                            <MenuItem value="Dec">Dec</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3 }}>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>Upload File</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2, border: '2px dashed #113f6c', borderRadius: 1, backgroundColor: '#ffffff', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f4fa' } }}>
                          <input type="file" accept=".pdf, .jpg, .jpeg, .png" multiple style={{ display: 'none' }} id="file-upload" onChange={handleFileChange1} />
                          <label htmlFor="file-upload" style={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }}>Drag & drop files here or click to browse</Typography>
                          </label>
                        </Box>
                        {formData1.files.length > 0 && formData1.files.map((file, index) => (
                          <Box key={index} sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}>{file.name}</Typography>
                            <Button variant="outlined" color="error" size="small" onClick={() => handleCancelFileUpload1(index)}
                              sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' } }}>
                              Cancel
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </form1>
                  ) : (
                    <Box>
                      <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Store</strong></TableCell>
                                <TableCell align="center"><strong>{submittedData1?.store || ''}</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell style={{ whiteSpace: 'nowrap'}}>Store Name</TableCell>
                                <TableCell align="center">{submittedData1?.storename ||''}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Review of Month</TableCell>
                                <TableCell align="center">{submittedData1?.month}</TableCell>
                              </TableRow>
                                <TableRow>
                                  <TableCell>File Name</TableCell>
                                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                    {submittedData1?.fileName && (
                                      <Button onClick={handleOpenFile1} sx={{whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                        {submittedData1.fileName}
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                      <Button variant="contained"  color="primary" onClick={handleEdit1}
                          sx={{ marginTop: 2, backgroundColor: '#113f6c',  '&:hover': { backgroundColor: '#0f3555',  }, }} fullWidth >
                          Edit
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => navigate('/')}
                        sx={{ marginTop: 2, backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#3e755e',  },}} fullWidth>
                        Home
                      </Button>
                    </Box>
                  )}
                  <Snackbar
                    open={openSnackbar}
                    onClose={() => setOpenSnackbar(false)}
                    message={snackbarMessage} 
                    autoHideDuration={3000}   
                    severity={snackbarSeverity} 
                  />
                </Paper>
              </Box>
              <Snackbar
                open={openSnackbar}
                onClose={() => setOpenSnackbar(false)}
                message="Successfully uploaded!"
                autoHideDuration={3000}
              />
            </TabPanel>
            <TabPanel value={2}>
              <div>
                <h2 style={{ marginTop: '20px' }}>POS User Status</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2, marginLeft:22, marginRight: 10 , marginTop:8}}>
                    <FormControl fullWidth sx={{ boxShadow: 3,  borderRadius: '4px' }}>
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
                      value={store || (userGroup === 'Admin_User' || profile?.designation === 'IT Manager' ? "None" : "")}
                      onChange={(e) => {
                        setStore(e.target.value);
                        handleStoreChange(e);
                      }}
                      name="store"
                    >
                      {(userGroup === 'Admin_User' || profile?.designation === 'IT Manager') && (
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
                    <FormControl fullWidth sx={{ boxShadow: 3,  borderRadius: '4px' }}>
                      <InputLabel id="month-label" sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5 }}> Review of Month </InputLabel>
                      <Select
                        labelId="month-label"
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' }, height: '55px', }}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Jan">Jan</MenuItem>
                        <MenuItem value="Feb">Feb</MenuItem>
                        <MenuItem value="Mar">Mar</MenuItem>
                        <MenuItem value="Apr">Apr</MenuItem>
                        <MenuItem value="May">May</MenuItem>
                        <MenuItem value="Jun">Jun</MenuItem>
                        <MenuItem value="Jul">Jul</MenuItem>
                        <MenuItem value="Aug">Aug</MenuItem>
                        <MenuItem value="Sep">Sep</MenuItem>
                        <MenuItem value="Oct">Oct</MenuItem>
                        <MenuItem value="Nov">Nov</MenuItem>
                        <MenuItem value="Dec">Dec</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ boxShadow: 3,  borderRadius: '4px' }}>
                      <InputLabel id="year-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Year </InputLabel>
                      <Select
                        labelId="year-label"
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        sx={{ fontSize: '0.8rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                      >
                        {getYearOptions().map((yearOption) => (
                          <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                  <Button variant="contained" onClick={fetchReports}
                    sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px', boxShadow: 3}}>
                    submit
                  </Button>

                  <Button variant="contained"  color="primary"
                    onClick={handleDownloadZip}
                    sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70', boxShadow: 3, } }}
                  >
                    <DownloadIcon />
                  </Button>
                </Box>

                <Box sx={{ marginTop: '70px', marginLeft: '30px', maxHeight: '610px', maxWidth: '1410px', overflowY: 'auto', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: 3 }}>
                  {normalizedFiles.length > 0 ? (
                      <Stack spacing={2}>
                        {normalizedFiles.map((file) => (
                          <Card  
                            key={file.file_name}  
                            elevation={3} 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '16px',
                              '&:hover': { 
                                boxShadow: 6, 
                              }, 
                            }}
                          >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography  
                              variant="body2" 
                              fontWeight="bold"  
                              noWrap  
                              sx={{ 
                                maxWidth: '500px', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                marginLeft: '0px', 
                                fontSize: '0.875rem' 
                              }}
                            >
                              {file.file_name}
                            </Typography>
                          </CardContent>
                          <Box sx={{ display: 'flex', gap: '10px' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleFileView(file)}
                            sx={{
                              color: "#113f6c",
                              fontSize: "0.6rem",
                              padding: "6px 12px",
                              boxShadow: 3,
                              borderColor: "#113f6c",
                              "&:hover": { borderColor: "#113f6c" },
                            }}
                          >
                            View
                          </Button>
                          <ExcelViewer
                              open={isExcelViewerOpen}
                              fileUrl={excelFileUrl}
                              onClose={() => setIsExcelViewerOpen(false)}
                            />

                          <DocxViewer
                                  open={isDocxViewerOpen}
                                  fileUrl={docxFileUrl}
                                  onClose={() => setIsDocxViewerOpen(false)}
                                />
                            <Button   variant="contained"  size="small"  onClick={() => handleDownloadFile(file)} sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.6rem', padding: '6px 12px', boxShadow: 3}} >
                              Download
                            </Button>
                          </Box>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1" color="textSecondary" textAlign="center">
                      No reports found
                    </Typography>
                  )}
                </Box>
              </div>
            </TabPanel>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
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
  

export default PosUserStatus
