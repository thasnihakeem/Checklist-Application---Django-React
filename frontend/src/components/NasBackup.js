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
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Archive as ArchiveIcon } from '@mui/icons-material';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import IconButton from "@mui/material/IconButton";
import { API_BASE_URL } from '../config';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

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
  width: 1450px;
  height: 120vh;
  padding: 20px 12px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  border-radius: 12px;
  opacity: 1;
  margin-left: 160px;
  margin-top: -30px;
  `,
);

const TabsList = styled(BaseTabsList)(
  ({ theme }) => `
  display: flex;
  flex-direction: column; // Stack tabs vertically
  align-items: flex-start; 
  background-color: ${primaryColor};
  border-radius: 12px;
  margin-bottom: 16px;
  position: fixed; 
  top: 92px; 
  left: 285px; 
  z-index: 1;
  padding: 10px;
  `,
);


const NasBackup  = () => {
  const [formData, setFormData] = useState({
    reviewMonth:"",
    date: "", // Represents the date
    empid: "", // Employee ID
    fullname: "", // Full Name
    designation: "", // Designation
    verifierName: "", // Verifier Name
    verifierEmpid: "", // Verifier Employee ID
    verifierDesignation: "", // Verifier Designation
    verifierSignature: "", // Verifier Signature
    store: "", // Selected site
    dateCopied1: "", // Date Copied
    dateCopied2: "", // Date Copied
    fileName1: "", // Start with one empty file name
    fileName2: "", // Start with one empty file name
    serverName: "", // Server Name
    size1: "", // Size
    size2: "", // Size
    ipAddress: "", // IP Address
    frequency: "", // Frequency
    typeOfBackup: "", // Type of Backup
    failed_dates:"",
    days:"",
    year:""

  });
  const [formData1, setFormData1] = useState({
      store: '',
      reviewMonth1:'',
      file:null,
      year:''
  
    });
  const navigate = useNavigate();
  const [submittedData, setSubmittedData] = useState(null);
  const [submittedData1, setSubmittedData1] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isEditMode1, setIsEditMode1] = useState(true);
  const [date, setDate] = useState('');
  const [site, setSite] = useState('');
  const [fileName, setFileName] = useState('');
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(''); 
  const [snackbar, setSnackbar] = useState(null); // or default value as needed
  const [failed_dates, setFailedDates] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [store, setStore] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedRow, setUpdatedRow] = useState({});
  const [userid, setUserid] = useState('');
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [profile, setProfile] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [stores, setStores] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
  };
  const handleChange1 = (event) => {
    const { name, value } = event.target;
    setFormData1((prevData) => ({
      ...prevData,
      [name]: value, // Ensure it stores the value correctly
    }));
  };
  
  const handleFileChange1 = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData1((prevState) => ({ ...prevState, file: selectedFile }));
      console.log(selectedFile);
    }
  };
  
  const handleCancelFileUpload1 = () => {
    setFormData1((prevState) => ({ ...prevState, file: null }));
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = ""; 
    }
  };

  useEffect(() => {
    if (year) {  // Only update if year has a value
        setFormData((prev) => ({
            ...prev,
            year: year, // ✅ Ensure formData.year is updated
        }));
    }
  }, [year]);  

  // const addFailedDate = () => {
  //   setFailedDates([...failed_dates, ""]); 
  // };

  // const updateFailedDate = (index, value) => {
  //   const updatedDates = [...failed_dates];
  //   updatedDates[index] = value;
  //   setFailedDates(updatedDates);
  // };

  // const removeFailedDate = (index) => {
  //   const updatedDates = failed_dates.filter((_, i) => i !== index);
  //   setFailedDates(updatedDates);
  // };

  useEffect(() => {
    try {
      const parsedFailedDates = data.failed_dates ? JSON.parse(data.failed_dates) : [];
      setFailedDates(Array.isArray(parsedFailedDates) ? parsedFailedDates : []);
    } catch (error) {
      console.error("Error parsing failed_dates:", error);
      setFailedDates([]); 
    }
  }, [data]);


  const handleSubmit = async (e) => {
    e.preventDefault();
  
  const validateIPAddress = (ip) => {
      const customIpRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;
      return customIpRegex.test(ip);
  };

  if (
    !formData.empid || 
    !formData.designation || 
    !formData.serverName || 
    !formData.ipAddress
  ) {
    alert("Please fill all required fields.");
    return;
  }

  if (!validateIPAddress(formData.ipAddress)) {
    alert("Invalid IP address.");
    return;
  }

  const siteName = formData.store?.replace(/\s+/g, '_') || 'Unknown_Site';
  const selectedMonth = formData.reviewMonth?.replace(/\s+/g, '_') || 'Unknown_Month';
  const selectedYear = new Date().getFullYear().toString();  

  const generatedFileName = `${siteName}_NAS_Backup ${selectedMonth} ${selectedYear}.pdf`;
  const dataToSubmit = {
    ...formData,
    fileName: generatedFileName,  
    year: formData.year || "",
    site: formData.store, 
  };
  delete dataToSubmit.storename;
  delete dataToSubmit.store; 
  console.log("Failed Dates before submission:", formData.failed_dates||"null");
  console.log("Submitting Data:", JSON.stringify(dataToSubmit, null, 2));

  try {
      const checkResponse = await axios.get(`${API_BASE_URL}/api/backup-detail/`, {
          params: { store:formData.store,reviewMonth: formData.reviewMonth, year: formData.year },
      });

      let response;
      if (checkResponse.data.length > 0) {
          const existingEntry = checkResponse.data[0];
          response = await axios.put(`${API_BASE_URL}/api/backup-detail/${existingEntry.id}/`, dataToSubmit);
      } else {
          response = await axios.post(`${API_BASE_URL}/api/backup-detail/`, dataToSubmit);
      }

      if (response.status === 200 || response.status === 201) {
          alert("NasBackup data successfully submitted!");
          setIsEditMode(false);
          setSubmittedData({ ...dataToSubmit });
          
      } else {
          alert("Something went wrong!");
      }
  } catch (error) {
      console.error("Error submitting backup details:", error);
      alert("Failed to submit backup details.");
  }
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();

    console.log("Submitting Form Data:", formData1);
    if (!formData1.store.trim()) {
        alert("Please enter a store name.");
        return;
    }

    if (!formData1.file) {
        alert("Please select a file to upload.");
        return;
    }

    if (!formData1.reviewMonth1 || !formData1.year) {
        alert("Review month and year are required.");
        return;
    }

    const fileExtension = formData1.file.name.split('.').pop();
    const fileName = `${formData1.store}_POS_User_Status_${formData1.reviewMonth1}_${formData1.year}_Verified.${fileExtension}`;
    const data = new FormData();
    data.append("store", formData1.store.trim());
    data.append("reviewMonth1", formData1.reviewMonth1);
    data.append("year", formData1.year);
    data.append("file", formData1.file);
    data.append("fileName", fileName);
    console.log("Generated File Name:", fileName);
    try {
        // Check if a record exists for the given `reviewMonth1` & `year`
        const checkResponse = await axios.get(`${API_BASE_URL}/api/backup-detailVerified/`, {
            params: { store: formData1.store,reviewMonth1: formData1.reviewMonth1, year: formData1.year }
        });

        let response;
        if (checkResponse.data.length > 0) {
            //  Record exists -> Update (PUT)
            const existingEntry = checkResponse.data[0];
            response = await axios.put(`${API_BASE_URL}/api/backup-detailVerified/${existingEntry.id}/`, data);
        } else {
            // No existing record -> Create new (POST)
            response = await axios.post(`${API_BASE_URL}/api/backup-detailVerified/`, data);
        }

        // Handle API response
        if (response.status === 200 || response.status === 201) {
            alert("File uploaded successfully!");
            setSubmittedData1({
                ...formData1,
                fileName,
                fileUrl: response.data.file_url,
            });
            setIsEditMode1(false);
        } else {
            alert("Something went wrong during upload.");
        }
    } catch (error) {
        console.error("Error submitting file details:", error);
        alert("Failed to upload file.");
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

  const handleOpenFile = (file) => {
    if (!file || !(file instanceof File)) {
      console.error("Invalid file:", file);
      return;
    }
  
    const fileUrl = URL.createObjectURL(file); // Create a temporary URL
    const fileExtension = file.name.split('.').pop().toLowerCase();
  
    if (fileExtension === 'pdf') {
      window.open(fileUrl, '_blank');
    } else {
      console.warn("Unsupported file type:", fileExtension);
    }
  };
  
  const handleOpenFile1 = (filePath) => {
    if (!filePath) {
      console.error("File path is missing. Cannot open the file.");
      return;
    }
  
    // Construct the full file URL
    const baseURL = `${API_BASE_URL}`; // Update this if needed
    const fileUrl = `${baseURL}${filePath}`;
    const fileName = filePath.split("/").pop(); // Extract the file name
  
    // Determine file type
    const fileExtension = fileName.split(".").pop().toLowerCase();
  
    if (fileExtension === "pdf") {
      window.open(fileUrl, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const fetchDataForEdit = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/backup-detail/${id}/`);
      setFormData(response.data);  
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };

  const fetchDataForEdit1 = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/backup-detailVerified/${id}/`);
      setFormData1(response.data);  
    } catch (error) {
      console.error("Error fetching data for edit:", error);
    }
  };

  useEffect(() => {
    if (isEditMode && formData.id) {
      fetchDataForEdit(formData.id); 
    }
  }, [isEditMode, formData.id]);
  
  useEffect(() => {
    if (isEditMode1 && formData1.id) {
      fetchDataForEdit1(formData1.id); 
    }
  }, [isEditMode1, formData1.id]);
  
  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleEdit1 = () => {
    setIsEditMode1(true);
    // setOpenSnackbar(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete the file "${item.file?.split('/').pop()}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/backup-detailVerified/${item.id}/`);
      alert("File and backup entry deleted successfully.");

      // Refresh the data
      fetchData1();
    } catch (error) {
      console.error("Error deleting file and entry:", error);
      alert("Failed to delete file.");
    }
  };

  const fetchData = async () => {
    if (!formData.reviewMonth || !formData.year||!store) {
      alert("Please enter the required fields - Month, Store, Year.");
      return;
    }
  
    try {

      const params = {
        reviewMonth: formData.reviewMonth,
        year: formData.year,
        store: store,
      };
  
      console.log("Fetching data with params:", params);
  
      const response = await axios.get(`${API_BASE_URL}/api/backup-detail/`, { params });
      setData(response.data);
      console.log("Tabular data:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data.");
    }
  };

  const fetchData1 = async () => {
    if (!formData1.year) {
      alert("Please select the year.");
      return;
    }

    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/profile/${userid}/`);
      const profile = profileResponse.data;

      let storeParam = formData1.store;
      const isAdmin = profile.designation === "Admin" || profile.designation === "IT Manager";

      if (!isAdmin) {
        if (!storeParam || storeParam === "None") {
          alert("Store is required.");
          return;
        }
      }

      if (isAdmin) {
        if (storeParam === "All") {
          storeParam = stores.map(store => store.storecode).join(",");
        } else if (!storeParam || storeParam === "None") {
          storeParam = null; // Optional for Admin/IT Manager
        }
      }

      // Build query params conditionally
      const params = {
        year: formData1.year,
      };

      if (formData1.reviewMonth1) {
        params.reviewMonth1 = formData1.reviewMonth1;
      }

      if (storeParam) {
        params.store = storeParam;
      }

      console.log("Fetching data with params:", params);

      const response = await axios.get(`${API_BASE_URL}/api/backup-detailVerified/`, { params });
      setData(response.data);
      console.log("Tabular data:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data.");
    }
  };


  const handleDownloadZIP = async (data) => {
    const zip = new JSZip();
    const folder = zip.folder("backup-files");

    try {
      // Filter and fetch all files
      const filePromises = data
        .filter((item) => item.file)
        .map(async (item) => {
          const fileUrl = `${API_BASE_URL}${item.file}`;
          const fileName = item.file.split("/").pop();

          const response = await axios.get(fileUrl, {
            responseType: "blob",
          });

          folder.file(fileName, response.data);
        });

      await Promise.all(filePromises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "backup_files.zip");
    } catch (err) {
      console.error("Error downloading files as ZIP:", err);
      alert("Failed to download files.");
    }
  };
    

  useEffect(() => {
    if (data && data.length > 0) {
      console.log("Data loaded:", data);
    }
  }, [data]);
 
 
  const handleDownloadPDF = (item) => {
    const doc = new jsPDF('p', 'mm', [400, 400]);
    const logoBase64 = "data:image/jpeg;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k";
    
    const pageWidth = doc.internal.pageSize.width;
    const imageWidth = 50; // Adjust the image width as needed
    const imageHeight = 30; // Adjust the image height as needed
    
    // Position the image in the top-right corner
    const xPosition = pageWidth - imageWidth - 10; // 10 units from the right edge
    const yPosition = 10; // 10 units from the top edge
    
    // Add the image
    doc.addImage(logoBase64, "PNG", xPosition, yPosition, imageWidth, imageHeight);
    // Header Section
    doc.setFontSize(16);
    doc.setTextColor(0); // Black
    doc.text('Lulu Group India', 205, 10, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(0); // Black
    doc.text('TP Central DB Backup Details', 205, 20, { align: 'center' });
  
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB'); 
    doc.setFontSize(12);
    doc.setTextColor(0); // Black color for text
    doc.text('Date:', xPosition - 20, 20); // Position Date label to the left of the date value
    doc.text(formattedDate, xPosition-10, 20); // Position current date to the right of the label
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('User Access Privilege Review Conducted By:', 205, 30, { align: 'center' });
    const userDetails = [
      { label: 'Full Name', value: data[0]?.fullname || '' },
      { label: 'Designation', value: data[0]?.designation || '' },
      { label: 'Employee ID', value: data[0]?.empid || '' },
      { label: 'Site', value: data[0]?.site || '' },];
    const userTableData = userDetails.map((detail) => [detail.label, detail.value]);
    autoTable(doc, {
      head: [['Field', 'Value']],
      body: userTableData,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: [0, 0, 0],       // Black text
        lineColor: [0, 0, 0],       // Black borders
        lineWidth: 0.1              // Optional: controls border thickness
      },
      headStyles: {
        fillColor: [200, 200, 200], // Light grey background
        textColor: [0, 0, 0],       // Black text
        lineColor: [0, 0, 0],       // Black border
      },
      bodyStyles: {
        textColor: [0, 0, 0],       // Black text
        lineColor: [0, 0, 0],       // Black border
      },
     
    });
  
    // Backup Details Section
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Backup Details:', 205, doc.lastAutoTable.finalY + 10, { align: 'center' });
    const backupTableColumn = ['Site', 'File Name', 'Size', 'Date Copied'];
    const backupTableRows = data.flatMap((item) => [
      // First row for the item
      [item.site, item.fileName1, item.size1, item.dateCopied1],
      // Second row (additional details for the same item)
      [item.site, item.fileName2, item.size2, item.dateCopied2],
    ]);
    autoTable(doc, {
      head: [backupTableColumn],
      body: backupTableRows,
      startY: doc.lastAutoTable.finalY + 15,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: [0, 0, 0],       // Black text
        lineColor: [0, 0, 0],       // Black borders
        lineWidth: 0.1              // Optional: controls border thickness
      },
      headStyles: {
        fillColor: [200, 200, 200], // Light grey background
        textColor: [0, 0, 0],       // Black text
        lineColor: [0, 0, 0],       // Black border
      },
      bodyStyles: {
        textColor: [0, 0, 0],       // Black text
        lineColor: [0, 0, 0],       // Black border
      },
    });

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text('Note:', 14, doc.lastAutoTable.finalY + 20);
    const notes = [
      'Frequency: End of Every Month',
      'Review submitted with MM/YYYY',
      'Should be validated by Store IT, Regional Team',
    ];
    doc.setFontSize(11);
    notes.forEach((note, index) => {
      doc.text(`• ${note}`, 15, doc.lastAutoTable.finalY + 25 + index * 6);
    });

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Verified By:', 14, doc.lastAutoTable.finalY + 50);
    doc.text(`Name: ${data[0]?.verifierName || ''}`, 14, doc.lastAutoTable.finalY + 60);
    doc.text(`Position: ${data[0]?.verifierDesignation || ''}`, 14, doc.lastAutoTable.finalY + 70);
    doc.text(`Employee ID: ${data[0]?.verifierEmpid || ''}`, 105, doc.lastAutoTable.finalY + 60);
    doc.text(`Signature:`, 105, doc.lastAutoTable.finalY + 70);
    console.log("review month",data[0].reviewMonth)
    const getMonthNumber = (monthName) => {
    const months = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const monthIndex = months.indexOf(monthName);
    return monthIndex !== -1 ? (monthIndex + 1).toString().padStart(2, "0") : null;
    };
    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate(); // Get days in selected month
    };
    const extractMonthYearFromReviewMonth = (reviewMonth) => {
        console.log("Raw reviewMonth input:", reviewMonth); // Debug log
        if (!reviewMonth || typeof reviewMonth !== "string") {
            console.error("Error: reviewMonth is undefined or invalid.");
            return { month: "01", year: new Date().getFullYear(), days: 31 }; // Default to Jan of current year
        }
        const month = getMonthNumber(reviewMonth); // Convert "February" → "02"
        const year = new Date().getFullYear();
        const days = month ? getDaysInMonth(month, year) : 31; // Get actual number of days in the mont
        return { month, year, days };
    };
  
    // Extract month, year, and number of days in month
    const { month, year, days: daysInSelectedMonth } = extractMonthYearFromReviewMonth(data[0].reviewMonth);
    console.log("Extracted Month:", month, "Year:", year, "Days in Month:", daysInSelectedMonth);
    // 🏗️ Corrected Table Column Definition
    const tableColumns = [
        'Sl No',
        'Server',
        'IP Address',
        'Frequency',
        'Type Of Backup',
        ...Array.from({ length: daysInSelectedMonth }, (_, i) => (i + 1).toString()), // Dynamically set days
    ];
    console.log("Generated Table Columns:", tableColumns);
    // ✅ Ensure 'days' array exists before using it
    const tableRows = data.map((item, index) => [
        index + 1,
        item.serverName,
        item.ipAddress,
        item.frequency,
        item.typeOfBackup,
        ...(Array.isArray(item.days) ? item.days : Array(daysInSelectedMonth).fill("")), // Ensure valid data
      ]);
    
    console.log("Generated Table Rows:", tableRows);
    //const selectedDate = formData.date ? new Date(formData.date) : null;
    const parseDate = (dateString) => {
      if (!dateString || dateString === "null") return new Date(); // Use current date if null
      
      if (dateString.includes('-')) {
          return new Date(dateString); // YYYY-MM-DD format (before logout)
      } else if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/').map(Number);
          return new Date(year, month - 1, day); // DD/MM/YYYY format (after login)
      }
      return new Date();
    };
    const selectedDate = parseDate(formData.date);
    console.log(formData.date);
    const selectedMonthYear = selectedDate
      ? selectedDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
      : ' ';
    
    console.log(selectedMonthYear);
    console.log(selectedDate);
  // Title Row
    const titleRow = [{
      content: `NAS BACKUP REVIEW ${formData.reviewMonth.toUpperCase()} ${formData.year}`,
      colSpan: tableColumns.length,
      styles: { 
          halign: 'center', 
          fontStyle: 'bold', 
          fillColor: [150, 150, 150], // Gray color for title row
          textColor: [0, 0, 0], 
          fontSize: 12
          }
      }];

    autoTable(doc, {
      head: [titleRow, tableColumns], // Title row first, then column headers
      body: tableRows,
      startY: doc.lastAutoTable.finalY + 80,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255],  // White background
        textColor: [0, 0, 0],        // Black text
        lineColor: [0, 0, 0],        // Black borders
        lineWidth: 0.1,
        fontSize: 8,
        fontStyle: 'bold',         // No bold
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],  // No shading
      },
      columnStyles: {
        0: { cellWidth: 10 },  // Sl No
        1: { cellWidth: 17 },  // Server
        2: { cellWidth: 20 },  // IP Address
        3: { cellWidth: 20 },  // Frequency
        4: { cellWidth: 20 },  // Type Of Backup
        ...Object.fromEntries(
          Array.from({ length: 31 }, (_, i) => [i + 5, { cellWidth: 9.6 }])
        )
      },

      // Ensure full borders on title row (if needed)
      didDrawCell: function (data) {
        if (data.row.index === 0 && data.section === 'head') {
          const doc = data.doc;
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(0);
          doc.setLineWidth(0.1);
          doc.rect(x, y, width, height);
        }
      },

      // Reinforce styling for second row if needed
      didParseCell: function (data) {
        if (data.row.index === 0 && data.section === 'body') {
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.lineColor = [0, 0, 0];
          data.cell.styles.lineWidth = 0.1;
        }
      }
    });
    // Legend Section
    doc.setFontSize(10); // Font size for legend title
    doc.setFontSize(8); // Smaller font for legend items
    const legendItems = [
      { key: 'ND', description: 'No Data' },
      { key: 'S', description: 'Success' },
      { key: 'F', description: 'Failed' },
    ];
    let startY = doc.lastAutoTable.finalY + 10;
    legendItems.forEach((item, index) => {
      doc.text(`${item.key}`, 14, startY + index * 5); // Key
      doc.text(`${item.description}`, 20, startY + index * 5); // Description
    });
  // Verified By and Date at the bottom-left
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Verified By:', 14, doc.lastAutoTable.finalY + 32); // Adjust the Y position based on the page size
    doc.text('Sreejith CS', 300, doc.lastAutoTable.finalY + 42);
    doc.text('(Manager - IT Operations)', 300, doc.lastAutoTable.finalY + 50);
    // doc.text('Date:', 14, doc.lastAutoTable.finalY + 64); // Add a placeholder for the date
    // doc.text(new Date().toLocaleDateString(), 30, doc.lastAutoTable.finalY + 64);
    doc.text(`Name: ${data[0]?.verifierName || ''}`, 14, doc.lastAutoTable.finalY + 42);
    doc.text(`Position: ${data[0]?.verifierDesignation || ''}`, 14, doc.lastAutoTable.finalY + 50);
    // doc.text(`Signature:`, 14, doc.lastAutoTable.finalY + 56);

    doc.text('Date:',  105, doc.lastAutoTable.finalY + 42); // Add a placeholder for the date
    doc.text(new Date().toLocaleDateString(),  120, doc.lastAutoTable.finalY + 42);
    doc.text(`Signature:`,  105, doc.lastAutoTable.finalY + 50);
    // Current date
    // Signature at the bottom-right
    // Save PDF
    // Extract site name from the data array
    const siteName = data[0]?.site ? data[0].site.replace(/\s+/g, '_') : 'Unknown_Site';
    // Format the filename as "Sitename_NAS_Backup_Month_Year.pdf"
    const filename = `${siteName}_NAS Backup ${formData.reviewMonth.toUpperCase()} ${formData.year}.pdf`;
  //   console.log(filename);
  //   const pdfBlob = doc.output('blob'); // Convert to Blob
  //   const pdfUrl = URL.createObjectURL(pdfBlob); // Create downloadable URL
  //   setFileName(filename);
  //   setFileUrl(pdfUrl);
  //   console.log(pdfUrl);
  //   // Save the PDF with the formatted filename
  //   const link = document.createElement('a');
  //   link.href = pdfUrl;
  //   link.download = filename;
  //   link.click();
  //   doc.save(filename);
  // };
    console.log("Generating PDF for:", item);

  // Generate your content here...
  doc.text(`Backup Details for ${item.site}`, 20, 20); // example content

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = filename;
  link.click();

  // Optional: Save via jsPDF if you still need it
  // doc.save(filename);
  };

//   const handleDownloadPDF1 = () => {
//     const doc = new jsPDF('p', 'mm', [400, 400]);
//     const logoBase64 = "data:image/jpeg;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k";
    
//     const pageWidth = doc.internal.pageSize.width;
//     const imageWidth = 50; // Adjust the image width as needed
//     const imageHeight = 30; // Adjust the image height as needed
    
//     // Position the image in the top-right corner
//     const xPosition = pageWidth - imageWidth - 10; // 10 units from the right edge
//     const yPosition = 10; // 10 units from the top edge
    
//     // Add the image
//     doc.addImage(logoBase64, "PNG", xPosition, yPosition, imageWidth, imageHeight);
//     // Header Section
//     doc.setFontSize(16);
//     doc.setTextColor(100); // Grey
//     doc.text('Lulu Group India', 205, 10, { align: 'center' });
  
//     doc.setFontSize(14);
//     doc.setTextColor(100); // Grey
//     doc.text('TP Central DB Backup Details', 205, 20, { align: 'center' });
  
//     // Date Table Section
// // Date Table Section
// // Get the current date
// const currentDate = new Date();
// const formattedDate = currentDate.toLocaleDateString('en-GB'); // 'en-GB' ensures dd/mm/yyyy format

// //console.log(formattedDate);


// // Add the "Date:" label and current date as text
// doc.setFontSize(12);
// doc.setTextColor(0); // Black color for text
// doc.text('Date:', xPosition - 20, 20); // Position Date label to the left of the date value
// doc.text(formattedDate, xPosition-10, 20); // Position current date to the right of the label



//     // User Info Section
//     doc.setFontSize(12);
//     doc.setTextColor(0);
//     doc.text('User Access Privilege Review Conducted By:', 205, 30, { align: 'center' });
  
//     const userDetails = [
//       { label: 'Full Name', value: submittedData?.fullname || '' },
//       { label: 'Designation', value: submittedData?.designation || '' },
//       { label: 'Employee ID', value: submittedData?.empid || '' },
//       { label: 'Site', value: submittedData?.site || '' },
//     ];
//     const userTableData = userDetails.map((detail) => [detail.label, detail.value]);
  
//     autoTable(doc, {
//       head: [['Field', 'Value']],
//       body: userTableData,
//       startY: 35,
//       theme: 'grid',
//       styles: {
//         fontSize: 10,
//         cellPadding: 3,
//       },
//       headStyles: {
//         fillColor: [200, 200, 200], // Light grey
//         textColor: [0, 0, 0],
//       },
//       alternateRowStyles: {
//         fillColor: [245, 245, 245], // Very light grey
//       },
//     });
  
//     // Backup Details Section
//     doc.setFontSize(12);
//     doc.setTextColor(0);
//     doc.text('Backup Details:', 205, doc.lastAutoTable.finalY + 10, { align: 'center' });
  
//     const backupTableColumn = ['Site', 'File Name', 'Size', 'Date Copied'];

//     const backupTableRows = data.flatMap((item) => [
//       // First row for the item
//       [submittedData.site, submittedData.fileName1, submittedData.size1, submittedData.dateCopied1],
//       // Second row (additional details for the same item)
//       [submittedData.site, submittedData.fileName2, submittedData.size2, submittedData.dateCopied2],
//     ]);

//     autoTable(doc, {
//       head: [backupTableColumn],
//       body: backupTableRows,
//       startY: doc.lastAutoTable.finalY + 15,
//       theme: 'grid',
//       styles: {
//         fontSize: 10,
//         cellPadding: 3,
//       },
//       headStyles: {
//         fillColor: [200, 200, 200], // Light grey
//         textColor: [0, 0, 0],
//       },
//       alternateRowStyles: {
//         fillColor: [245, 245, 245], // Very light grey
//       },
//     });

  
//     // Notes Section
//     doc.setFontSize(13);
//     doc.setTextColor(0);
//     doc.text('Note:', 14, doc.lastAutoTable.finalY + 20);
  
//     const notes = [
//       'Frequency: End of Every Month',
//       'Review submitted with MM/YYYY',
//       'Should be validated by Store IT, Regional Team',
//     ];
//     doc.setFontSize(11);
//     notes.forEach((note, index) => {
//       doc.text(`• ${note}`, 15, doc.lastAutoTable.finalY + 25 + index * 6);
//     });
  
//     // Verified By Section
//     doc.setFontSize(12);
//     doc.setTextColor(0);
//     doc.text('Verified By:', 14, doc.lastAutoTable.finalY + 50);
//     doc.text(`Name: ${submittedData.verifierName || ''}`, 14, doc.lastAutoTable.finalY + 60);
//     doc.text(`Position: ${submittedData?.verifierDesignation || ''}`, 14, doc.lastAutoTable.finalY + 70);
//     doc.text(`Employee ID: ${submittedData?.verifierEmpid || ''}`, 105, doc.lastAutoTable.finalY + 60);
//     doc.text(`Signature:`, 105, doc.lastAutoTable.finalY + 70);
     
//      console.log("review month",submittedData.reviewMonth)
//      const getMonthNumber = (monthName) => {
//       const months = [
//           "January", "February", "March", "April", "May", "June",
//           "July", "August", "September", "October", "November", "December"
//       ];
//       const monthIndex = months.indexOf(monthName);
//       return monthIndex !== -1 ? (monthIndex + 1).toString().padStart(2, "0") : null;
//   };
  
//   const getDaysInMonth = (month, year) => {
//       return new Date(year, month, 0).getDate(); // Get days in selected month
//   };
  
//   const extractMonthYearFromReviewMonth = (reviewMonth) => {
//       console.log("Raw reviewMonth input:", reviewMonth); // Debug log
  
//       if (!reviewMonth || typeof reviewMonth !== "string") {
//           console.error("Error: reviewMonth is undefined or invalid.");
//           return { month: "01", year: new Date().getFullYear(), days: 31 }; // Default to Jan of current year
//       }
  
//       const month = getMonthNumber(reviewMonth); // Convert "February" → "02"
//       const year = new Date().getFullYear();
//       const days = month ? getDaysInMonth(month, year) : 31; // Get actual number of days in the month
  
//       return { month, year, days };
//   };
  
//   // Extract month, year, and number of days in month
//   const { month, year, days: daysInSelectedMonth } = extractMonthYearFromReviewMonth(submittedData?.reviewMonth);
//   console.log("Extracted Month:", month, "Year:", year, "Days in Month:", daysInSelectedMonth);
  
//   // 🏗️ Corrected Table Column Definition
//   const tableColumns = [
//       'Sl No',
//       'Server',
//       'IP Address',
//       'Frequency',
//       'Type Of Backup',
//       ...Array.from({ length: daysInSelectedMonth }, (_, i) => (i + 1).toString()), // Dynamically set days
//   ];
  
//   console.log("Generated Table Columns:", tableColumns);
  
//   // ✅ Ensure 'days' array exists before using it
//   const tableRows = data.map((item, index) => [
//       index + 1,
//       item.serverName,
//       item.ipAddress,
//       item.frequency,
//       item.typeOfBackup,
//       ...(Array.isArray(item.days) ? item.days : Array(daysInSelectedMonth).fill("")), // Ensure valid data
//   ]);
  
//   console.log("Generated Table Rows:", tableRows);
  
    
//   //const selectedDate = formData.date ? new Date(formData.date) : null;
//   const parseDate = (dateString) => {
//     if (!dateString || dateString === "null") return new Date(); // Use current date if null
    
//     if (dateString.includes('-')) {
//         return new Date(dateString); // YYYY-MM-DD format (before logout)
//     } else if (dateString.includes('/')) {
//         const [day, month, year] = dateString.split('/').map(Number);
//         return new Date(year, month - 1, day); // DD/MM/YYYY format (after login)
//     }
//     return new Date();
// };

// const selectedDate = parseDate(formData.date);

//   console.log(formData.date);
//   const selectedMonthYear = selectedDate
//     ? selectedDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
//     : ' ';
  
//   console.log(selectedMonthYear);
//   console.log(selectedDate);
// // Title Row
// const titleRow = [{
//     content: `NAS BACKUP REVIEW ${selectedMonthYear}`,
//     colSpan: tableColumns.length,
//     styles: { 
//         halign: 'center', 
//         fontStyle: 'bold', 
//         fillColor: [150, 150, 150], // Gray color for title row
//         textColor: [0, 0, 0], 
//         fontSize: 12
//     }
// }];

// autoTable(doc, {
//   head: [titleRow, tableColumns], // Title row first, then column headers
//   body: tableRows,
//   startY: doc.lastAutoTable.finalY + 80,
//   theme: 'grid',
//   styles: {
//     fontSize: 8,
//     cellPadding: 2,
//     halign: 'center',
//     valign: 'middle',
//   },
//   headStyles: {
//     fillColor: [110, 110, 110], // Black color for column headers
//     textColor: [255, 255, 255], // White text for better visibility
//     fontSize: 9,
//   },
//   alternateRowStyles: {
//     fillColor: [245, 245, 245], // Very light grey
//   },
//   columnStyles: {
//     0: { cellWidth: 10 }, // Sl No
//     1: { cellWidth: 17 }, // Server
//     2: { cellWidth: 20 }, // IP Address
//     3: { cellWidth: 20 }, // Frequency
//     4: { cellWidth: 20 }, // Type Of Backup
//   },
// });

//     // Legend Section
//     doc.setFontSize(10); // Font size for legend title
   
  
//     doc.setFontSize(8); // Smaller font for legend items
//     const legendItems = [
//       { key: 'P', description: 'Partial Successful' },
//       { key: 'S', description: 'Success' },
//       { key: 'F', description: 'Failed' },
//     ];
//     let startY = doc.lastAutoTable.finalY + 10;
//     legendItems.forEach((item, index) => {
//       doc.text(`${item.key}`, 14, startY + index * 5); // Key
//       doc.text(`${item.description}`, 20, startY + index * 5); // Description
//     });
//   // Verified By and Date at the bottom-left
//     doc.setFontSize(12);
//     doc.setTextColor(0);
//     doc.text('Verified By:', 14, doc.lastAutoTable.finalY + 30); // Adjust the Y position based on the page size
//     doc.text('Sreejith CS', 300, doc.lastAutoTable.finalY + 30);
//     doc.text('(Manager - IT Operations)', 300, doc.lastAutoTable.finalY + 38);
//     doc.text('Date:', 14, doc.lastAutoTable.finalY + 38); // Add a placeholder for the date
//     doc.text(new Date().toLocaleDateString(), 30, doc.lastAutoTable.finalY + 38); // Current date

//     // Signature at the bottom-right


//     // Save PDF
//     // Extract site name from the data array
//     const siteName = submittedData?.site ? submittedData.site.replace(/\s+/g, '_') : '';

//     // Format the filename as "Sitename_NAS_Backup_Month_Year.pdf"
//     const filename = `${siteName}_NAS Backup ${selectedMonthYear.replace(/\s+/g, ' ')}.pdf`;
//     console.log(filename);
//     const pdfBlob = doc.output('blob'); // Convert to Blob
//     const pdfUrl = URL.createObjectURL(pdfBlob); // Create downloadable URL
//     setFileName(filename);
//     setFileUrl(pdfUrl);
//     console.log(pdfUrl);
//     // Save the PDF with the formatted filename
//     const link = document.createElement('a');
//     link.href = pdfUrl;
//     link.download = filename;
//     link.click();
//     doc.save(filename);
//   };
  
//   if (!submittedData?.site || !submittedData?.date || !submittedData?.reviewMonth) {
//     alert("Site, Date, and Review Month are required to generate the PDF.");
//     return;
//   }

//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/api/backup-detail/?site=${submittedData.site}&date=${submittedData.date}&reviewMonth=${submittedData.reviewMonth}&format=pdf`,
//       {
//         method: "GET",
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch PDF.");
//     }

//     // Convert response to Blob
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);

//     // Create a download link
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "backup_details.pdf";
//     document.body.appendChild(link);
//     link.click();

//     // Cleanup
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(link);
//   } catch (error) {
//     console.error("Error downloading PDF:", error);
//     alert("Failed to download PDF. Please try again.");
//   }
// };


  // const handleEditClick = (id) => {
  //   debugger
  //   console.log("Edit Clicked for ID:", id); // Debugging
  //   const rowToEdit = data.find((item) => item.id === id);
  //   console.log("Row to Edit:", rowToEdit); // Debugging
  //   setEditRowId(id);
  //   setUpdatedRow(rowToEdit || {}); // Avoid null/undefined issues
  // };
  
  // const handleInputChange = (e) => {
  //   debugger
  //   const { name, value } = e.target;
  //   console.log("Input Changed:", name, value); // Debugging
  //   setUpdatedRow({
  //     ...updatedRow,
  //     [name]: value,
  //   });
  // };
  
  // const handleSaveClick = async () => {
  //   debugger
  //   try {
  //     const response = await axios.put(
  //      `${API_BASE_URL}/api/backup-detail/${editRowId}/`,  
  //       updatedRow
  //     );
  //     if (response.status === 200) {
  //       alert("Row updated successfully!");
  //       setData((prevData) =>
  //         prevData.map((item) =>
  //           item.id === editRowId ? updatedRow : item
  //         )
  //       );
  //       setEditRowId(null);
  //     } else {
  //       alert("Failed to update data.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating data:", error);
  //     alert("Error saving updates.");
  //   }
  // };
  
  // const handleCancelClick = () => {
  //   setEditRowId(null);
  // };
  
  // const handleDeleteClick = async (id) => {
  //   const confirmed = window.confirm("Are you sure you want to delete this item?");
  //   if (confirmed) {
  //     try {
  //       const response = await axios.delete(`${API_BASE_URL}/api/backup-detail/${id}/`);  // Adjusted endpoint for PLU2Checklist
  //       if (response.status === 200) {
  //         setData((prevData) => prevData.filter(item => item.id !== id));
  //         alert("Record deleted successfully!");
  //       } else {
  //         alert("Failed to delete the record.");
  //       }
  //     } catch (error) {
  //       console.error("Error deleting data:", error);
  //       alert("Failed to delete the record.");
  //     }
  //   }
  // };
  
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
    
    console.log("Selected Store Code:", selectedStoreCode);
  
    setFormData((prevData) => {
      if (selectedStoreCode === "None") {
        return { ...prevData, store: "", storename: "" };
      }
  
      const selectedStore = stores.find(store => store.storecode === selectedStoreCode);
  
      return {
        ...prevData,
        store: selectedStore?.storecode || "",
        storename: selectedStore?.storename || "",
      };
    });
  };

  // const handleStoreChange = (event) => {
  //   const selectedStoreCode = event.target.value;
  //   if (selectedStoreCode === "None") {
  //     setFormData({ ...formData, store: "", storename: "" });
  //   } else {
  //     const selectedStore = stores.find(store => store.storecode === selectedStoreCode);
  //     if (selectedStore) {
  //       setFormData({
  //         ...formData,
  //         store: selectedStore.storecode,
  //         storename: selectedStore.storename,
  //       });
  //     }
  //   }
  // };
  
  const handleStoreChange1 = (event) => {
    const selectedStoreCode = event.target.value;
    if (selectedStoreCode === "None") {
      setFormData1({ ...formData1, store: "", storename: "" });
    } else {
      const selectedStore = stores.find(store => store.storecode === selectedStoreCode);
      if (selectedStore) {
        setFormData1({
          ...formData1,
          store: selectedStore.storecode,
          storename: selectedStore.storename,
        });
      }
    }
  };

  // const handleStoreChange2 = (event) => {
  //   const selectedStoreCode = event.target.value;
    
  //   console.log("Selected Store Code:", selectedStoreCode);
  
  //   setFormData1((prevData) => {
  //     if (selectedStoreCode === "None") {
  //       return { ...prevData, store: "", storename: "" };
  //     }
  
  //     const selectedStore = stores.find(store => store.storecode === selectedStoreCode);
  
  //     return {
  //       ...prevData,
  //       store: selectedStore?.storecode || "",
  //       storename: selectedStore?.storename || "",
  //     };
  //   });
  // };
  
  useEffect(() => {
    if (snackbarOpen) {
      const timeout = setTimeout(() => {
        setSnackbarOpen(false);
      }, 3000); 
      return () => clearTimeout(timeout);
    }
  }, [snackbarOpen]);

  const getTabsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
          <Tab value={0}>NAS Backup Form</Tab>
          <Tab value={1}>NAS Backup Unverified</Tab>
          <Tab value={2}>NAS Backup Upload</Tab>
          <Tab value={3}>NAS Backup Verified</Tab>
          </>
        );
      case 'End_User':
        return( 
        <>
        <Tab value={0}>NAS Backup Form</Tab>
          <Tab value={1}>NAS Backup Unverified</Tab>
          <Tab value={2}>NAS Backup Upload</Tab>
        </>
        )
      case 'Management_User':
        return (
          <>
          <Tab value={0}>NAS Backup Form</Tab>
          <Tab value={1}>NAS Backup Unverified</Tab>
          <Tab value={2}>NAS Backup Upload</Tab>
          <Tab value={3}>NAS Backup Verified</Tab>
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
            <Box sx={{ padding: 4, maxWidth: 1300, margin: '0 auto', minHeight: '1000px'}}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                    NAS Backup Form
                  </Typography>

                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c',
                        '&:hover': { backgroundColor: '#0e2a47' },
                        fontSize: { xs: '0.8rem', md: '1rem' },
                        padding: { xs: '6px 12px', md: '8px 16px' },}} >
                      Submit
                    </Button> )}
                </Box>
                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="final-updation-label"
                        sx={{
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                          },
                        }}
                      >
                        Review Of Month
                      </InputLabel>
                      <Select
                        labelId="final-updation-label"
                        id="reviewMonth"
                        name="reviewMonth"
                        value={formData.reviewMonth}
                        onChange={handleChange}
                        sx={{
                          fontSize: '0.8rem',
                          '& .MuiInputBase-input': {
                            textAlign: 'left',
                          },
                        }}
                      >
                          <MenuItem value="January">January</MenuItem>
                          <MenuItem value="February">February</MenuItem>
                          <MenuItem value="March">March</MenuItem>
                          <MenuItem value="April">April</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="June">June</MenuItem>
                          <MenuItem value="July">July</MenuItem>
                          <MenuItem value="August">August</MenuItem>
                          <MenuItem value="September">September</MenuItem>
                          <MenuItem value="October">October</MenuItem>
                          <MenuItem value="November">November</MenuItem>
                          <MenuItem value="December">December</MenuItem>
  
                      </Select>
                    </FormControl>
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
                    <FormControl fullWidth >
                    <InputLabel
                        id="final-updation-label"
                        sx={{
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                          },
                        }}
                      > Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ fontSize: '0.9rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                  >
                    {getYearOptions().map((yearOption) => (
                      <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                    <TextField
                      label="Employee ID "
                      name="empid"
                      value={formData.empid}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                    <TextField
                      label="Full Name"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                    <TextField
                      label="Designaiton"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="Verifier Name "
                      name="verifierName"
                      value={formData.verifierName}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} />
                    <TextField
                      label="Verifier Employee ID "
                      name="verifierEmpid"
                      value={formData.verifierEmpid}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} />
                    <TextField
                      label="Verifier Designation "
                      name="verifierDesignation"
                      value={formData.verifierDesignation}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
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
                        Site</InputLabel>
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
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="File Name 1"
                      name="fileName1"
                      type="text"
                      fullWidth
                      value={formData.fileName1}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                      <TextField
                      label="Size 1(in GB)"
                      name="size1"
                      type="text"
                      fullWidth
                      value={formData.size1}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <TextField
                      label="File Name 2"
                      name="fileName2"
                      type="text"
                      fullWidth
                      value={formData.fileName2}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                      <TextField
                      label="Size 2(in GB)"
                      name="size2"
                      type="text"
                      fullWidth
                      value={formData.size2}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      />
                    <TextField
                      label="Server Name"
                      name="serverName"
                      type="text"
                      fullWidth
                      value={formData.serverName}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                    
                    
                    <TextField
                      label="IP Address"
                      name="ipAddress"
                      type="text"
                      fullWidth
                      value={formData.ipAddress}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />

                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                    label="Date Copied 1"
                    name="dateCopied1"
                    type="date"
                    fullWidth
                    value={formData.dateCopied1}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />

                  <TextField
                    label="Date Copied 2"
                    name="dateCopied2"
                    type="date"
                    fullWidth
                    value={formData.dateCopied2}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <TextField
                    label="Frequency"
                    name="frequency"
                    type="text"
                    fullWidth
                    value={formData.frequency}
                    onChange={handleChange}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }} />
                  <TextField
                    label="Type of Backup"
                    name="typeOfBackup"
                    type="text"
                    fullWidth
                    value={formData.typeOfBackup}
                    onChange={handleChange}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }} />

                  </Box>
                </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            {/* <TableRow>
                              <TableCell><strong>Site</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.site || 'Site'}</strong></TableCell>
                            </TableRow> */}
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell align="center">{submittedData?.date}</TableCell>
                              <TableCell>Employee ID</TableCell>
                              <TableCell align="center">{submittedData?.empid}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>Full Name</TableCell>
                            <TableCell align="center">{submittedData?.fullname}</TableCell>
                            <TableCell>Designation </TableCell>
                              <TableCell align="center">{submittedData?.designation}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>Verifier Name</TableCell>
                            <TableCell align="center">{submittedData?.verifierName}</TableCell>
                            <TableCell>Verifier Employee ID</TableCell>
                              <TableCell align="center">{submittedData?.verifierEmpid}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell> Verifier Designation</TableCell>
                            <TableCell align="center">{submittedData?.verifierDesignation}</TableCell>
                            <TableCell> Site </TableCell>
                              <TableCell align="center">{submittedData?.site}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>File Name1</TableCell>
                            <TableCell align="center">{submittedData?.fileName1}</TableCell>
                            <TableCell>Size1(in GB)</TableCell>
                            <TableCell align="center">{submittedData?.size1}</TableCell>
                            
                            </TableRow>
                            <TableRow>
                            <TableCell>File Name2</TableCell>
                            <TableCell align="center">{submittedData?.fileName2}</TableCell>
                            <TableCell>Size2(in GB)</TableCell>
                            <TableCell align="center">{submittedData?.size2}</TableCell>
                              </TableRow>
                              <TableRow>
                              <TableCell>Server Name</TableCell>
                            <TableCell align="center">{submittedData?.serverName}</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell align="center">{submittedData?.ipAddress}</TableCell>
                            </TableRow>
                            <TableRow>
                          
                            <TableCell>Date Copied1</TableCell>
                            <TableCell align="center">{submittedData?.dateCopied1}</TableCell>
                            <TableCell>Date Copied2</TableCell>
                            <TableCell align="center">{submittedData?.dateCopied2}</TableCell>
                            
                            </TableRow>
                            <TableRow>
                            <TableCell>Frequency</TableCell>
                            <TableCell align="center">{submittedData?.frequency}</TableCell>
                            <TableCell>Failed Dates</TableCell>
                              <TableCell align="center">
                              {submittedData?.failed_dates?.length > 0 
                                ? submittedData.failed_dates.join(", ") 
                                : "No Failed Dates"}
                            </TableCell>
                              </TableRow>
                              <TableRow>
                              <TableCell>Type Of Backup</TableCell>
                            <TableCell align="center">{submittedData?.typeOfBackup}</TableCell>
                              <TableCell>Review Month</TableCell>
                                                      <TableCell align="center">{submittedData?.reviewMonth}</TableCell>
                              </TableRow>
                           <TableRow>
                           {/* <Button variant="contained" color="primary" onClick={handleDownloadPDF1}>
        Download PDF
      </Button> */}
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
          </Box>
          </TabPanel>
          <TabPanel value={1}>
            <div>
            <h3 style={{ marginBottom: '3rem' }}> NAS Backup List</h3>
              <Box sx={{ display: 'flex', 
              justifyContent: 'center',  
              alignItems: 'center',  
              gap: 1.5,  
              marginBottom: 3, 
              width: '100%'  }}>
                <FormControl fullWidth sx={{  minWidth: 150, maxWidth: 200, boxShadow: 3, borderRadius: '4px' }}>
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
                <FormControl sx={{ 
                  minWidth: 200,  // Set minimum width
                  maxWidth: 350,  // Keep it compact
                }} 
                size="medium"  // Makes the dropdown smaller
                >
                <InputLabel
                  id="final-updation-label"
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
                  Review of Month
                  </InputLabel>
                            <Select
                  labelId="final-updation-label"
                  id="reviewMonth"
                  name="reviewMonth"
                  value={formData.reviewMonth}
                  onChange={handleChange}
                  sx={{
                    fontSize: '1rem',
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                    },
                  }}
                >
                    <MenuItem value="January">January</MenuItem>
                    <MenuItem value="February">February</MenuItem>
                    <MenuItem value="March">March</MenuItem>
                    <MenuItem value="April">April</MenuItem>
                    <MenuItem value="May">May</MenuItem>
                    <MenuItem value="June">June</MenuItem>
                    <MenuItem value="July">July</MenuItem>
                    <MenuItem value="August">August</MenuItem>
                    <MenuItem value="September">September</MenuItem>
                    <MenuItem value="October">October</MenuItem>
                    <MenuItem value="November">November</MenuItem>
                    <MenuItem value="December">December</MenuItem>
                </Select>
                </FormControl>
                <FormControl fullWidth sx={{minWidth: 90, maxWidth: 150, boxShadow: 3, borderRadius: '4px'}}>
                  <InputLabel id="year-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={formData.year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ fontSize: '1rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                  >
                    {getYearOptions().map((yearOption) => (
                      <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={fetchData}
                  sx={{ backgroundColor: '#113f6c',  justifyContent: "center",'&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px',}}>
                  Fetch Data
                </Button>
                {/* <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDownloadZIP(data)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#800000',
                    '&:hover': { backgroundColor: '#660000' }
                  }}
                >
                  <ArchiveIcon sx={{ marginRight: 1 }} />
                  Download All
                </Button> */}
              </Box>
              <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 20, marginLeft: 1, marginRight: 1 }}>
                <div style={{ maxHeight: '589px', overflowY: 'auto'  }}>
                  <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Review Month</TableCell>
                        {/* <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Date</TableCell> */}
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%'}}>Year</TableCell>

                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Employee ID</TableCell>
                       
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}> Store</TableCell>
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
                        {/* Displaying the store value */}
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                                {item.reviewMonth}
                            </TableCell>
                            {/* <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.date}
                            </TableCell> */}
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.year}
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.empid}
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.site}
                            </TableCell>
                            <TableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={() => handleDownloadPDF(item)} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                              <DownloadIcon />
                            </Button>
                            </Box>
                            </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                  </Table>
                  </div>
                </TableContainer>
              </Sheet>
            </div>
          </TabPanel>
          <TabPanel value={2}>
            <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', minHeight: '1000px' , marginTop: '40px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      Verified NAS Backup Form
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
                      <Box>
                     <FormControl fullWidth >
    <InputLabel id="year-label"
        sx={{
            fontSize: '1rem',
            backgroundColor: 'white',
            px: 0.5,
            transform: 'translate(14px, 14px) scale(1)',
            '&.Mui-focused, &.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
            },
        }}>
        Year
    </InputLabel>
    <Select
        labelId="year-label"
        id="year"
        value={formData1.year || ""}
        onChange={(e) => setFormData1({ ...formData1, year: e.target.value })}
        sx={{ 
            fontSize: '1rem', 
            height: '56px',  // ✅ Matches other fields
            width: '100%',  // ✅ Ensures full width like Store & Review Month
            '& .MuiInputBase-input': { textAlign: 'left' } 
        }}
    >
        {getYearOptions().map((yearOption) => (
            <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
        ))}
    </Select>
</FormControl>

                       
                    </Box> 
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1,  marginTop: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel
                          id="final-updation-label"
                          sx={{
                            fontSize: '0.9rem',
                            backgroundColor: 'white',
                            px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)',
                            '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',
                            },
                          }}
                        >
                        Review of Month
                        </InputLabel>
                        <Select
                          labelId="final-updation-label"
                          id="reviewMonth1"
                          name="reviewMonth1"
                          value={formData1.reviewMonth1}
                          onChange={handleChange1}
                          sx={{
                            fontSize: '0.8rem',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                        >
                          <MenuItem value="January">January</MenuItem>
                          <MenuItem value="February">February</MenuItem>
                          <MenuItem value="March">March</MenuItem>
                          <MenuItem value="April">April</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="June">June</MenuItem>
                          <MenuItem value="July">July</MenuItem>
                          <MenuItem value="August">August</MenuItem>
                          <MenuItem value="September">September</MenuItem>
                          <MenuItem value="October">October</MenuItem>
                          <MenuItem value="November">November</MenuItem>
                          <MenuItem value="December">December</MenuItem>

                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3 }}>
                      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>
                        Upload File
                      </Typography>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2, border: '2px dashed #113f6c',
                          borderRadius: 1, backgroundColor: '#ffffff', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f4fa' }, }}
                      >
                        <input type="file" accept=".pdf" style={{ display: 'none' }} id="file-upload" onChange={handleFileChange1} />
                        <label htmlFor="file-upload" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                          <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }} >
                            Drag & drop a file here or click to browse
                          </Typography>
                        </label>
                      </Box>

                        {formData1.file && (
                          <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}>
                              {formData1.file.name}
                            </Typography>
                            <Button variant="outlined" color="error" size="small" onClick={handleCancelFileUpload1}
                              sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' }, }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
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
                          <TableRow>
                            <TableCell><strong>Review of Month</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData1?.reviewMonth1 || ''}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        <TableRow>
                            <TableCell><strong>Year</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData1?.year || ''}</strong></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>File Name</strong></TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                              {submittedData1?.file?.name ? (
                                <Button 
                                  onClick={() => handleOpenFile(submittedData1.file)}
                                  sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#1976d2', textTransform: 'none' }}
                                >
                                  {submittedData1.file.name}
                                </Button>
                              ) : "No File Uploaded"}
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
              </Paper>
            </Box>    
          </TabPanel>
          <TabPanel value={3}>
            <div>
            <h3 style={{ marginBottom: '3rem' }}> NAS Backup List</h3>
              <Box sx={{ display: 'flex', 
              justifyContent: 'center',  
              alignItems: 'center',  
              gap: 1.5,  
              marginBottom: 2, 
              width: '100%'  }}>
                <FormControl fullWidth sx={{  minWidth: 150, maxWidth: 200, boxShadow: 3, borderRadius: '4px' }}>
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
                    value={formData1.store || ""}  // Ensure a default value
                    onChange={(e) => 
                        setFormData1({ ...formData1, store: e.target.value })  // Update formData1.store
                    }
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
                <FormControl sx={{ 
                  minWidth: 200,  // Set minimum width
                  maxWidth: 350,  // Keep it compact
                }} 
                size="medium"  // Makes the dropdown smaller
                >
                <InputLabel
                  id="final-updation-label"
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
                  Review of Month
                  </InputLabel>
                            <Select
                  labelId="final-updation-label"
                  id="reviewMonth1"
                  name="reviewMonth1"
                  value={formData1.reviewMonth1}
                  onChange={handleChange1}
                  sx={{
                    fontSize: '1rem',
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                    },
                  }}
                >
                    <MenuItem value="January">January</MenuItem>
                    <MenuItem value="February">February</MenuItem>
                    <MenuItem value="March">March</MenuItem>
                    <MenuItem value="April">April</MenuItem>
                    <MenuItem value="May">May</MenuItem>
                    <MenuItem value="June">June</MenuItem>
                    <MenuItem value="July">July</MenuItem>
                    <MenuItem value="August">August</MenuItem>
                    <MenuItem value="September">September</MenuItem>
                    <MenuItem value="October">October</MenuItem>
                    <MenuItem value="November">November</MenuItem>
                    <MenuItem value="December">December</MenuItem>
                </Select>
                </FormControl>
                <FormControl fullWidth sx={{minWidth: 90, maxWidth: 150, boxShadow: 3, borderRadius: '4px'}}>
                  <InputLabel id="year-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={formData1.year || ""}  // Ensure a default value
                    onChange={(e) => setFormData1({ ...formData1, year: e.target.value })}  // Update formData1.year
                    sx={{ fontSize: '1rem', '& .MuiInputBase-input': { textAlign: 'left' }, height: '55px' }}
                >
                    {getYearOptions().map((yearOption) => (
                        <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                </Select>

                </FormControl>
                <Button variant="contained" onClick={fetchData1}
                  sx={{ backgroundColor: '#113f6c',  justifyContent: "center",'&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px',}}>
                  Fetch Data
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDownloadZIP(data)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#800000',
                    '&:hover': { backgroundColor: '#660000' }
                  }}
                >
                  <ArchiveIcon sx={{ marginRight: 1 }} />
                  Download All
                </Button>
              </Box>
              <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 20, marginLeft: 1, marginRight: 1 }}>
                <div style={{ maxHeight: '589px', overflowY: 'auto'  }}>
                  <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '8%'}}>Store</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Review of Month</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>File Name </TableCell>
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
                          {/* Displaying the store value */}
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                            {item.store}
                          </TableCell>
                          {/* Displaying the review month */}
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                            {item.reviewMonth1}
                          </TableCell>
                          {/* Extracting and displaying only the file name */}
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                            {item.file ? (
                              <Box display="flex" flexDirection="column">
                                <Button
                                  onClick={() => handleOpenFile1(item.file)}
                                  sx={{ whiteSpace: "nowrap", fontSize: "0.75rem", color: "#1976d2", textTransform: "none" }}
                                >
                                  {item.file.split("/").pop()}
                                </Button>
                              </Box>
                            ) : (
                              "No File"
                            )}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                            <Button 
                              variant="outlined"
                              size="small"
                              onClick={() => handleDelete(item)}  // Pass whole item, not just file
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </TableContainer>
              </Sheet>
            </div>
          </TabPanel>
          </>
        );
      case 'End_User':
        return (
        <>
          <TabPanel value={0}>
            <Box sx={{ padding: 4, maxWidth: 1300, margin: '0 auto', minHeight: '1000px'}}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                    NAS Backup Form
                  </Typography>

                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c',
                        '&:hover': { backgroundColor: '#0e2a47' },
                        fontSize: { xs: '0.8rem', md: '1rem' },
                        padding: { xs: '6px 12px', md: '8px 16px' },}} >
                      Submit
                    </Button> )}
                </Box>
                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="final-updation-label"
                        sx={{
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                          },
                        }}
                      >
                        Review Of Month
                      </InputLabel>
                      <Select
                        labelId="final-updation-label"
                        id="reviewMonth"
                        name="reviewMonth"
                        value={formData.reviewMonth}
                        onChange={handleChange}
                        sx={{
                          fontSize: '0.8rem',
                          '& .MuiInputBase-input': {
                            textAlign: 'left',
                          },
                        }}
                      >
                          <MenuItem value="January">January</MenuItem>
                          <MenuItem value="February">February</MenuItem>
                          <MenuItem value="March">March</MenuItem>
                          <MenuItem value="April">April</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="June">June</MenuItem>
                          <MenuItem value="July">July</MenuItem>
                          <MenuItem value="August">August</MenuItem>
                          <MenuItem value="September">September</MenuItem>
                          <MenuItem value="October">October</MenuItem>
                          <MenuItem value="November">November</MenuItem>
                          <MenuItem value="December">December</MenuItem>
  
                      </Select>
                    </FormControl>
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
                    <FormControl fullWidth >
                    <InputLabel
                        id="final-updation-label"
                        sx={{
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                          },
                        }}
                      > Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ fontSize: '0.9rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                  >
                    {getYearOptions().map((yearOption) => (
                      <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                    <TextField
                      label="Employee ID "
                      name="empid"
                      value={formData.empid}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                    <TextField
                      label="Full Name"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                    <TextField
                      label="Designaiton"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="Verifier Name "
                      name="verifierName"
                      value={formData.verifierName}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} />
                    <TextField
                      label="Verifier Employee ID "
                      name="verifierEmpid"
                      value={formData.verifierEmpid}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} />
                    <TextField
                      label="Verifier Designation "
                      name="verifierDesignation"
                      value={formData.verifierDesignation}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
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
                        Site</InputLabel>
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
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="File Name 1"
                      name="fileName1"
                      type="text"
                      fullWidth
                      value={formData.fileName1}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                      <TextField
                      label="Size 1(in GB)"
                      name="size1"
                      type="text"
                      fullWidth
                      value={formData.size1}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <TextField
                      label="File Name 2"
                      name="fileName2"
                      type="text"
                      fullWidth
                      value={formData.fileName2}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                      <TextField
                      label="Size 2(in GB)"
                      name="size2"
                      type="text"
                      fullWidth
                      value={formData.size2}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      />
                    <TextField
                      label="Server Name"
                      name="serverName"
                      type="text"
                      fullWidth
                      value={formData.serverName}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                    
                    
                    <TextField
                      label="IP Address"
                      name="ipAddress"
                      type="text"
                      fullWidth
                      value={formData.ipAddress}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />

                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                    label="Date Copied 1"
                    name="dateCopied1"
                    type="date"
                    fullWidth
                    value={formData.dateCopied1}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />

                  <TextField
                    label="Date Copied 2"
                    name="dateCopied2"
                    type="date"
                    fullWidth
                    value={formData.dateCopied2}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <TextField
                    label="Frequency"
                    name="frequency"
                    type="text"
                    fullWidth
                    value={formData.frequency}
                    onChange={handleChange}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }} />
                  <TextField
                    label="Type of Backup"
                    name="typeOfBackup"
                    type="text"
                    fullWidth
                    value={formData.typeOfBackup}
                    onChange={handleChange}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }} />

                  </Box>
                </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            {/* <TableRow>
                              <TableCell><strong>Site</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.site || 'Site'}</strong></TableCell>
                            </TableRow> */}
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell align="center">{submittedData?.date}</TableCell>
                              <TableCell>Employee ID</TableCell>
                              <TableCell align="center">{submittedData?.empid}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>Full Name</TableCell>
                            <TableCell align="center">{submittedData?.fullname}</TableCell>
                            <TableCell>Designation </TableCell>
                              <TableCell align="center">{submittedData?.designation}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>Verifier Name</TableCell>
                            <TableCell align="center">{submittedData?.verifierName}</TableCell>
                            <TableCell>Verifier Employee ID</TableCell>
                              <TableCell align="center">{submittedData?.verifierEmpid}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell> Verifier Designation</TableCell>
                            <TableCell align="center">{submittedData?.verifierDesignation}</TableCell>
                            <TableCell> Site </TableCell>
                              <TableCell align="center">{submittedData?.site}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>File Name1</TableCell>
                            <TableCell align="center">{submittedData?.fileName1}</TableCell>
                            <TableCell>Size1(in GB)</TableCell>
                            <TableCell align="center">{submittedData?.size1}</TableCell>
                            
                            </TableRow>
                            <TableRow>
                            <TableCell>File Name2</TableCell>
                            <TableCell align="center">{submittedData?.fileName2}</TableCell>
                            <TableCell>Size2(in GB)</TableCell>
                            <TableCell align="center">{submittedData?.size2}</TableCell>
                              </TableRow>
                              <TableRow>
                              <TableCell>Server Name</TableCell>
                            <TableCell align="center">{submittedData?.serverName}</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell align="center">{submittedData?.ipAddress}</TableCell>
                            </TableRow>
                            <TableRow>
                          
                            <TableCell>Date Copied1</TableCell>
                            <TableCell align="center">{submittedData?.dateCopied1}</TableCell>
                            <TableCell>Date Copied2</TableCell>
                            <TableCell align="center">{submittedData?.dateCopied2}</TableCell>
                            
                            </TableRow>
                            <TableRow>
                            <TableCell>Frequency</TableCell>
                            <TableCell align="center">{submittedData?.frequency}</TableCell>
                            <TableCell>Failed Dates</TableCell>
                              <TableCell align="center">
                              {submittedData?.failed_dates?.length > 0 
                                ? submittedData.failed_dates.join(", ") 
                                : "No Failed Dates"}
                            </TableCell>
                              </TableRow>
                              <TableRow>
                              <TableCell>Type Of Backup</TableCell>
                            <TableCell align="center">{submittedData?.typeOfBackup}</TableCell>
                              <TableCell>Review Month</TableCell>
                                                      <TableCell align="center">{submittedData?.reviewMonth}</TableCell>
                              </TableRow>
                           <TableRow>
                           {/* <Button variant="contained" color="primary" onClick={handleDownloadPDF1}>
        Download PDF
      </Button> */}
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
          </Box>
          </TabPanel>
          <TabPanel value={1}>
            <div>
            <h3 style={{ marginBottom: '3rem' }}> NAS Backup List</h3>
              <Box sx={{ display: 'flex', 
              justifyContent: 'center',  
              alignItems: 'center',  
              gap: 1.5,  
              marginBottom: 3, 
              width: '100%'  }}>
                <FormControl fullWidth sx={{  minWidth: 150, maxWidth: 200, boxShadow: 3, borderRadius: '4px' }}>
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
                <FormControl sx={{ 
                  minWidth: 200,  // Set minimum width
                  maxWidth: 350,  // Keep it compact
                }} 
                size="medium"  // Makes the dropdown smaller
                >
                <InputLabel
                  id="final-updation-label"
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
                  Review of Month
                  </InputLabel>
                            <Select
                  labelId="final-updation-label"
                  id="reviewMonth"
                  name="reviewMonth"
                  value={formData.reviewMonth}
                  onChange={handleChange}
                  sx={{
                    fontSize: '1rem',
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                    },
                  }}
                >
                    <MenuItem value="January">January</MenuItem>
                    <MenuItem value="February">February</MenuItem>
                    <MenuItem value="March">March</MenuItem>
                    <MenuItem value="April">April</MenuItem>
                    <MenuItem value="May">May</MenuItem>
                    <MenuItem value="June">June</MenuItem>
                    <MenuItem value="July">July</MenuItem>
                    <MenuItem value="August">August</MenuItem>
                    <MenuItem value="September">September</MenuItem>
                    <MenuItem value="October">October</MenuItem>
                    <MenuItem value="November">November</MenuItem>
                    <MenuItem value="December">December</MenuItem>
                </Select>
                </FormControl>
                <FormControl fullWidth sx={{minWidth: 90, maxWidth: 150, boxShadow: 3, borderRadius: '4px'}}>
                  <InputLabel id="year-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={formData.year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ fontSize: '1rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                  >
                    {getYearOptions().map((yearOption) => (
                      <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={fetchData}
                  sx={{ backgroundColor: '#113f6c',  justifyContent: "center",'&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px',}}>
                  Fetch Data
                </Button>
                {/* <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDownloadZIP(data)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#800000',
                    '&:hover': { backgroundColor: '#660000' }
                  }}
                >
                  <ArchiveIcon sx={{ marginRight: 1 }} />
                  Download All
                </Button> */}
              </Box>
              <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 20, marginLeft: 1, marginRight: 1 }}>
                <div style={{ maxHeight: '589px', overflowY: 'auto'  }}>
                  <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Review Month</TableCell>
                        {/* <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Date</TableCell> */}
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%'}}>Year</TableCell>

                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Employee ID</TableCell>
                       
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}> Store</TableCell>
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
                        {/* Displaying the store value */}
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                                {item.reviewMonth}
                            </TableCell>
                            {/* <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.date}
                            </TableCell> */}
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.year}
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.empid}
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.site}
                            </TableCell>
                            <TableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={() => handleDownloadPDF(item)} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                              <DownloadIcon />
                            </Button>
                            </Box>
                            </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                  </Table>
                  </div>
                </TableContainer>
              </Sheet>
            </div>
          </TabPanel>
          <TabPanel value={2}>
            <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', minHeight: '1000px' , marginTop: '40px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      Verified NAS Backup Form
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
                      <Box>
                     <FormControl fullWidth >
                      <InputLabel id="year-label"
                          sx={{
                              fontSize: '1rem',
                              backgroundColor: 'white',
                              px: 0.5,
                              transform: 'translate(14px, 14px) scale(1)',
                              '&.Mui-focused, &.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -6px) scale(0.75)',
                              },
                          }}>
                          Year
                      </InputLabel>
                      <Select
                          labelId="year-label"
                          id="year"
                          value={formData1.year || ""}
                          onChange={(e) => setFormData1({ ...formData1, year: e.target.value })}
                          sx={{ 
                              fontSize: '1rem', 
                              height: '56px',  // ✅ Matches other fields
                              width: '100%',  // ✅ Ensures full width like Store & Review Month
                              '& .MuiInputBase-input': { textAlign: 'left' } 
                          }}
                      >
                          {getYearOptions().map((yearOption) => (
                              <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                          ))}
                      </Select>
                  </FormControl>

                       
                    </Box> 
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1,  marginTop: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel
                          id="final-updation-label"
                          sx={{
                            fontSize: '0.9rem',
                            backgroundColor: 'white',
                            px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)',
                            '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',
                            },
                          }}
                        >
                        Review of Month
                        </InputLabel>
                        <Select
                          labelId="final-updation-label"
                          id="reviewMonth1"
                          name="reviewMonth1"
                          value={formData1.reviewMonth1}
                          onChange={handleChange1}
                          sx={{
                            fontSize: '0.8rem',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                        >
                          <MenuItem value="January">January</MenuItem>
                          <MenuItem value="February">February</MenuItem>
                          <MenuItem value="March">March</MenuItem>
                          <MenuItem value="April">April</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="June">June</MenuItem>
                          <MenuItem value="July">July</MenuItem>
                          <MenuItem value="August">August</MenuItem>
                          <MenuItem value="September">September</MenuItem>
                          <MenuItem value="October">October</MenuItem>
                          <MenuItem value="November">November</MenuItem>
                          <MenuItem value="December">December</MenuItem>

                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3 }}>
                      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>
                        Upload File
                      </Typography>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2, border: '2px dashed #113f6c',
                          borderRadius: 1, backgroundColor: '#ffffff', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f4fa' }, }}
                      >
                        <input type="file" accept=".pdf" style={{ display: 'none' }} id="file-upload" onChange={handleFileChange1} />
                        <label htmlFor="file-upload" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                          <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }} >
                            Drag & drop a file here or click to browse
                          </Typography>
                        </label>
                      </Box>

                        {formData1.file && (
                          <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}>
                              {formData1.file.name}
                            </Typography>
                            <Button variant="outlined" color="error" size="small" onClick={handleCancelFileUpload1}
                              sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' }, }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
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
                          <TableRow>
                            <TableCell><strong>Review of Month</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData1?.reviewMonth1 || ''}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        <TableRow>
                            <TableCell><strong>Review of Month</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData1?.reviewMonth1 || ''}</strong></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>File Name</strong></TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                              {submittedData1?.file?.name ? (
                                <Button 
                                  onClick={() => handleOpenFile(submittedData1.file)}
                                  sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#1976d2', textTransform: 'none' }}
                                >
                                  {submittedData1.file.name}
                                </Button>
                              ) : "No File Uploaded"}
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
              </Paper>
            </Box>    
          </TabPanel>
          </>
        )
      case 'Management_User':
        return (
          <>
          <TabPanel value={0}>
            <Box sx={{ padding: 4, maxWidth: 1300, margin: '0 auto', minHeight: '1000px'}}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                    NAS Backup Form
                  </Typography>

                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c',
                        '&:hover': { backgroundColor: '#0e2a47' },
                        fontSize: { xs: '0.8rem', md: '1rem' },
                        padding: { xs: '6px 12px', md: '8px 16px' },}} >
                      Submit
                    </Button> )}
                </Box>
                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="final-updation-label"
                        sx={{
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                          },
                        }}
                      >
                        Review Of Month
                      </InputLabel>
                      <Select
                        labelId="final-updation-label"
                        id="reviewMonth"
                        name="reviewMonth"
                        value={formData.reviewMonth}
                        onChange={handleChange}
                        sx={{
                          fontSize: '0.8rem',
                          '& .MuiInputBase-input': {
                            textAlign: 'left',
                          },
                        }}
                      >
                          <MenuItem value="January">January</MenuItem>
                          <MenuItem value="February">February</MenuItem>
                          <MenuItem value="March">March</MenuItem>
                          <MenuItem value="April">April</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="June">June</MenuItem>
                          <MenuItem value="July">July</MenuItem>
                          <MenuItem value="August">August</MenuItem>
                          <MenuItem value="September">September</MenuItem>
                          <MenuItem value="October">October</MenuItem>
                          <MenuItem value="November">November</MenuItem>
                          <MenuItem value="December">December</MenuItem>
  
                      </Select>
                    </FormControl>
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
                    <FormControl fullWidth >
                    <InputLabel
                        id="final-updation-label"
                        sx={{
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          px: 0.5,
                          transform: 'translate(14px, 14px) scale(1)',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                          },
                        }}
                      > Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ fontSize: '0.9rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                  >
                    {getYearOptions().map((yearOption) => (
                      <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                    <TextField
                      label="Employee ID "
                      name="empid"
                      value={formData.empid}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                    <TextField
                      label="Full Name"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                    <TextField
                      label="Designaiton"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="Verifier Name "
                      name="verifierName"
                      value={formData.verifierName}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} />
                    <TextField
                      label="Verifier Employee ID "
                      name="verifierEmpid"
                      value={formData.verifierEmpid}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} />
                    <TextField
                      label="Verifier Designation "
                      name="verifierDesignation"
                      value={formData.verifierDesignation}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: '0.75rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
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
                        Site</InputLabel>
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
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="File Name 1"
                      name="fileName1"
                      type="text"
                      fullWidth
                      value={formData.fileName1}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                      <TextField
                      label="Size 1(in GB)"
                      name="size1"
                      type="text"
                      fullWidth
                      value={formData.size1}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <TextField
                      label="File Name 2"
                      name="fileName2"
                      type="text"
                      fullWidth
                      value={formData.fileName2}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                      <TextField
                      label="Size 2(in GB)"
                      name="size2"
                      type="text"
                      fullWidth
                      value={formData.size2}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      />
                    <TextField
                      label="Server Name"
                      name="serverName"
                      type="text"
                      fullWidth
                      value={formData.serverName}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />
                    
                    
                    <TextField
                      label="IP Address"
                      name="ipAddress"
                      type="text"
                      fullWidth
                      value={formData.ipAddress}
                      onChange={handleChange}
                      sx={{
                        fontSize: '0.9rem',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                      }} />

                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                    label="Date Copied 1"
                    name="dateCopied1"
                    type="date"
                    fullWidth
                    value={formData.dateCopied1}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />

                  <TextField
                    label="Date Copied 2"
                    name="dateCopied2"
                    type="date"
                    fullWidth
                    value={formData.dateCopied2}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <TextField
                    label="Frequency"
                    name="frequency"
                    type="text"
                    fullWidth
                    value={formData.frequency}
                    onChange={handleChange}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }} />
                  <TextField
                    label="Type of Backup"
                    name="typeOfBackup"
                    type="text"
                    fullWidth
                    value={formData.typeOfBackup}
                    onChange={handleChange}
                    sx={{
                      fontSize: '0.9rem',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }} />

                  </Box>
                </form>
                ) : (
                  <Box>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            {/* <TableRow>
                              <TableCell><strong>Site</strong></TableCell>
                              <TableCell align="center"><strong>{submittedData?.site || 'Site'}</strong></TableCell>
                            </TableRow> */}
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell align="center">{submittedData?.date}</TableCell>
                              <TableCell>Employee ID</TableCell>
                              <TableCell align="center">{submittedData?.empid}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>Full Name</TableCell>
                            <TableCell align="center">{submittedData?.fullname}</TableCell>
                            <TableCell>Designation </TableCell>
                              <TableCell align="center">{submittedData?.designation}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>Verifier Name</TableCell>
                            <TableCell align="center">{submittedData?.verifierName}</TableCell>
                            <TableCell>Verifier Employee ID</TableCell>
                              <TableCell align="center">{submittedData?.verifierEmpid}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell> Verifier Designation</TableCell>
                            <TableCell align="center">{submittedData?.verifierDesignation}</TableCell>
                            <TableCell> Site </TableCell>
                              <TableCell align="center">{submittedData?.site}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>File Name1</TableCell>
                            <TableCell align="center">{submittedData?.fileName1}</TableCell>
                            <TableCell>Size1(in GB)</TableCell>
                            <TableCell align="center">{submittedData?.size1}</TableCell>
                            
                            </TableRow>
                            <TableRow>
                            <TableCell>File Name2</TableCell>
                            <TableCell align="center">{submittedData?.fileName2}</TableCell>
                            <TableCell>Size2(in GB)</TableCell>
                            <TableCell align="center">{submittedData?.size2}</TableCell>
                              </TableRow>
                              <TableRow>
                              <TableCell>Server Name</TableCell>
                            <TableCell align="center">{submittedData?.serverName}</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell align="center">{submittedData?.ipAddress}</TableCell>
                            </TableRow>
                            <TableRow>
                          
                            <TableCell>Date Copied1</TableCell>
                            <TableCell align="center">{submittedData?.dateCopied1}</TableCell>
                            <TableCell>Date Copied2</TableCell>
                            <TableCell align="center">{submittedData?.dateCopied2}</TableCell>
                            
                            </TableRow>
                            <TableRow>
                            <TableCell>Frequency</TableCell>
                            <TableCell align="center">{submittedData?.frequency}</TableCell>
                            <TableCell>Failed Dates</TableCell>
                              <TableCell align="center">
                              {submittedData?.failed_dates?.length > 0 
                                ? submittedData.failed_dates.join(", ") 
                                : "No Failed Dates"}
                            </TableCell>
                              </TableRow>
                              <TableRow>
                              <TableCell>Type Of Backup</TableCell>
                            <TableCell align="center">{submittedData?.typeOfBackup}</TableCell>
                              <TableCell>Review Month</TableCell>
                                                      <TableCell align="center">{submittedData?.reviewMonth}</TableCell>
                              </TableRow>
                           <TableRow>
                           {/* <Button variant="contained" color="primary" onClick={handleDownloadPDF1}>
        Download PDF
      </Button> */}
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
          </Box>
          </TabPanel>
          <TabPanel value={1}>
            <div>
            <h3 style={{ marginBottom: '3rem' }}> NAS Backup List</h3>
              <Box sx={{ display: 'flex', 
              justifyContent: 'center',  
              alignItems: 'center',  
              gap: 1.5,  
              marginBottom: 3, 
              width: '100%'  }}>
                <FormControl fullWidth sx={{  minWidth: 150, maxWidth: 200, boxShadow: 3, borderRadius: '4px' }}>
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
                <FormControl sx={{ 
                  minWidth: 200,  // Set minimum width
                  maxWidth: 350,  // Keep it compact
                }} 
                size="medium"  // Makes the dropdown smaller
                >
                <InputLabel
                  id="final-updation-label"
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
                  Review of Month
                  </InputLabel>
                            <Select
                  labelId="final-updation-label"
                  id="reviewMonth"
                  name="reviewMonth"
                  value={formData.reviewMonth}
                  onChange={handleChange}
                  sx={{
                    fontSize: '1rem',
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                    },
                  }}
                >
                    <MenuItem value="January">January</MenuItem>
                    <MenuItem value="February">February</MenuItem>
                    <MenuItem value="March">March</MenuItem>
                    <MenuItem value="April">April</MenuItem>
                    <MenuItem value="May">May</MenuItem>
                    <MenuItem value="June">June</MenuItem>
                    <MenuItem value="July">July</MenuItem>
                    <MenuItem value="August">August</MenuItem>
                    <MenuItem value="September">September</MenuItem>
                    <MenuItem value="October">October</MenuItem>
                    <MenuItem value="November">November</MenuItem>
                    <MenuItem value="December">December</MenuItem>
                </Select>
                </FormControl>
                <FormControl fullWidth sx={{minWidth: 90, maxWidth: 150, boxShadow: 3, borderRadius: '4px'}}>
                  <InputLabel id="year-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={formData.year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ fontSize: '1rem', '& .MuiInputBase-input': { textAlign: 'left' } , height: '55px', }}
                  >
                    {getYearOptions().map((yearOption) => (
                      <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={fetchData}
                  sx={{ backgroundColor: '#113f6c',  justifyContent: "center",'&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px',}}>
                  Fetch Data
                </Button>
                {/* <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDownloadZIP(data)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#800000',
                    '&:hover': { backgroundColor: '#660000' }
                  }}
                >
                  <ArchiveIcon sx={{ marginRight: 1 }} />
                  Download All
                </Button> */}
              </Box>
              <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 20, marginLeft: 1, marginRight: 1 }}>
                <div style={{ maxHeight: '589px', overflowY: 'auto'  }}>
                  <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Review Month</TableCell>
                        {/* <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Date</TableCell> */}
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%'}}>Year</TableCell>

                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Employee ID</TableCell>
                       
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}> Store</TableCell>
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
                        {/* Displaying the store value */}
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                                {item.reviewMonth}
                            </TableCell>
                            {/* <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.date}
                            </TableCell> */}
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.year}
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.empid}
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #113f6c", padding: "9px 16px", fontSize: "0.85rem" }}>
                              {item.site}
                            </TableCell>
                            <TableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={() => handleDownloadPDF(item)} sx={{ display: 'flex', alignItems: 'center',  backgroundColor: '#5a9a82', '&:hover': { backgroundColor: '#4a7f70' }, }} >
                              <DownloadIcon />
                            </Button>
                            </Box>
                            </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                  </Table>
                  </div>
                </TableContainer>
              </Sheet>
            </div>
          </TabPanel>
          <TabPanel value={2}>
            <Box sx={{ padding: 4, maxWidth: 650, margin: '0 auto', minHeight: '1000px' , marginTop: '40px' }}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      Verified NAS Backup Form
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
                      <Box>
                     <FormControl fullWidth >
    <InputLabel id="year-label"
        sx={{
            fontSize: '1rem',
            backgroundColor: 'white',
            px: 0.5,
            transform: 'translate(14px, 14px) scale(1)',
            '&.Mui-focused, &.MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)',
            },
        }}>
        Year
    </InputLabel>
    <Select
        labelId="year-label"
        id="year"
        value={formData1.year || ""}
        onChange={(e) => setFormData1({ ...formData1, year: e.target.value })}
        sx={{ 
            fontSize: '1rem', 
            height: '56px',  // ✅ Matches other fields
            width: '100%',  // ✅ Ensures full width like Store & Review Month
            '& .MuiInputBase-input': { textAlign: 'left' } 
        }}
    >
        {getYearOptions().map((yearOption) => (
            <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
        ))}
    </Select>
</FormControl>

                       
                    </Box> 
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1,  marginTop: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel
                          id="final-updation-label"
                          sx={{
                            fontSize: '0.9rem',
                            backgroundColor: 'white',
                            px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)',
                            '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',
                            },
                          }}
                        >
                        Review of Month
                        </InputLabel>
                        <Select
                          labelId="final-updation-label"
                          id="reviewMonth1"
                          name="reviewMonth1"
                          value={formData1.reviewMonth1}
                          onChange={handleChange1}
                          sx={{
                            fontSize: '0.8rem',
                            '& .MuiInputBase-input': {
                              textAlign: 'left',
                            },
                          }}
                        >
                          <MenuItem value="January">January</MenuItem>
                          <MenuItem value="February">February</MenuItem>
                          <MenuItem value="March">March</MenuItem>
                          <MenuItem value="April">April</MenuItem>
                          <MenuItem value="May">May</MenuItem>
                          <MenuItem value="June">June</MenuItem>
                          <MenuItem value="July">July</MenuItem>
                          <MenuItem value="August">August</MenuItem>
                          <MenuItem value="September">September</MenuItem>
                          <MenuItem value="October">October</MenuItem>
                          <MenuItem value="November">November</MenuItem>
                          <MenuItem value="December">December</MenuItem>

                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 2, padding: 2, border: '1px solid #113f6c', backgroundColor: '#f7f9fc', marginTop: 3 }}>
                      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#113f6c' }}>
                        Upload File
                      </Typography>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 2, border: '2px dashed #113f6c',
                          borderRadius: 1, backgroundColor: '#ffffff', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f4fa' }, }}
                      >
                        <input type="file" accept=".pdf" style={{ display: 'none' }} id="file-upload" onChange={handleFileChange1} />
                        <label htmlFor="file-upload" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                          <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center', fontStyle: 'italic' }} >
                            Drag & drop a file here or click to browse
                          </Typography>
                        </label>
                      </Box>

                        {formData1.file && (
                          <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#113f6c' }}>
                              {formData1.file.name}
                            </Typography>
                            <Button variant="outlined" color="error" size="small" onClick={handleCancelFileUpload1}
                              sx={{ textTransform: 'none', fontWeight: 'bold', borderColor: '#ff6b6b', '&:hover': { backgroundColor: '#ffe5e5', borderColor: '#ff6b6b' }, }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
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
                          <TableRow>
                            <TableCell><strong>Review of Month</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData1?.reviewMonth1 || ''}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        <TableRow>
                            <TableCell><strong>Review of Month</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData1?.reviewMonth1 || ''}</strong></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>File Name</strong></TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                              {submittedData1?.file?.name ? (
                                <Button 
                                  onClick={() => handleOpenFile(submittedData1.file)}
                                  sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#1976d2', textTransform: 'none' }}
                                >
                                  {submittedData1.file.name}
                                </Button>
                              ) : "No File Uploaded"}
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
              </Paper>
            </Box>    
          </TabPanel>
          <TabPanel value={3}>
            <div>
            <h3 style={{ marginBottom: '3rem' }}> NAS Backup List</h3>
              <Box sx={{ display: 'flex', 
              justifyContent: 'center',  
              alignItems: 'center',  
              gap: 1.5,  
              marginBottom: 2, 
              width: '100%'  }}>
                <FormControl fullWidth sx={{  minWidth: 150, maxWidth: 200, boxShadow: 3, borderRadius: '4px' }}>
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
                    value={formData1.store || ""}  // Ensure a default value
                    onChange={(e) => 
                        setFormData1({ ...formData1, store: e.target.value })  // Update formData1.store
                    }
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
                <FormControl sx={{ 
                  minWidth: 200,  // Set minimum width
                  maxWidth: 350,  // Keep it compact
                }} 
                size="medium"  // Makes the dropdown smaller
                >
                <InputLabel
                  id="final-updation-label"
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
                  Review of Month
                  </InputLabel>
                            <Select
                  labelId="final-updation-label"
                  id="reviewMonth1"
                  name="reviewMonth1"
                  value={formData1.reviewMonth1}
                  onChange={handleChange1}
                  sx={{
                    fontSize: '1rem',
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                    },
                  }}
                >
                    <MenuItem value="January">January</MenuItem>
                    <MenuItem value="February">February</MenuItem>
                    <MenuItem value="March">March</MenuItem>
                    <MenuItem value="April">April</MenuItem>
                    <MenuItem value="May">May</MenuItem>
                    <MenuItem value="June">June</MenuItem>
                    <MenuItem value="July">July</MenuItem>
                    <MenuItem value="August">August</MenuItem>
                    <MenuItem value="September">September</MenuItem>
                    <MenuItem value="October">October</MenuItem>
                    <MenuItem value="November">November</MenuItem>
                    <MenuItem value="December">December</MenuItem>
                </Select>
                </FormControl>
                <FormControl fullWidth sx={{minWidth: 90, maxWidth: 150, boxShadow: 3, borderRadius: '4px'}}>
                  <InputLabel id="year-label" sx={{ fontSize: '0.9rem', backgroundColor: 'white', px: 0.5 }}> Year </InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={formData1.year || ""}  // Ensure a default value
                    onChange={(e) => setFormData1({ ...formData1, year: e.target.value })}  // Update formData1.year
                    sx={{ fontSize: '1rem', '& .MuiInputBase-input': { textAlign: 'left' }, height: '55px' }}
                >
                    {getYearOptions().map((yearOption) => (
                        <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
                    ))}
                </Select>

                </FormControl>
                <Button variant="contained" onClick={fetchData1}
                  sx={{ backgroundColor: '#113f6c',  justifyContent: "center",'&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px',}}>
                  Fetch Data
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDownloadZIP(data)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#800000',
                    '&:hover': { backgroundColor: '#660000' }
                  }}
                >
                  <ArchiveIcon sx={{ marginRight: 1 }} />
                  Download All
                </Button>
              </Box>
              <Sheet sx={{marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
                <TableContainer component={Paper} sx={{ marginTop: 20, marginLeft: 1, marginRight: 1 }}>
                <div style={{ maxHeight: '589px', overflowY: 'auto'  }}>
                  <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '8%'}}>Store</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Review of Month</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>File Name </TableCell>
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
                          {/* Displaying the store value */}
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>
                            {item.store}
                          </TableCell>
                          {/* Displaying the review month */}
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                            {item.reviewMonth1}
                          </TableCell>
                          {/* Extracting and displaying only the file name */}
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                            {item.file ? (
                              <Box display="flex" flexDirection="column">
                                <Button
                                  onClick={() => handleOpenFile1(item.file)}
                                  sx={{ whiteSpace: "nowrap", fontSize: "0.75rem", color: "#1976d2", textTransform: "none" }}
                                >
                                  {item.file.split("/").pop()}
                                </Button>
                              </Box>
                            ) : (
                              "No File"
                            )}
                          </TableCell>
                          {/* <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                            <Button 
                              variant="outlined"
                              size="small"
                              onClick={() => handleDelete(item)}  // Pass whole item, not just file
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
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </TableContainer>
              </Sheet>
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
  
export default NasBackup;