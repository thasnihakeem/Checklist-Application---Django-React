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
import { Snackbar, Alert } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
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
  width: 1500px;
  height: 100vh;
  padding: 20px 12px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  border-radius: 12px;
  opacity: 1;
  margin-left: 130px;
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
  left: 290px; 
  z-index: 1;
  padding: 10px;
  `,
);


const Manage_POS_PDT_SCALE = () => {
  const [formData, setFormData] = useState({
      action:"",
      store: "",
      section: "",
      files: [{ type: "", number : "", counternumber:"" }], 
    });

    const [stores, setStores] = useState([]);
    const [userid, setUserid] = useState('');
    const [username, setUsername] = useState('');
    const [userGroup, setUserGroup] = useState('');
    const [profile, setProfile] = useState(null);
    const [isRestricted, setIsRestricted] = useState(false);
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
  
    
    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    const handleFileChange = (index, field, value) => {
      const updatedFiles = [...formData.files];
      updatedFiles[index][field] = value;
      setFormData({ ...formData, files: updatedFiles });
    };
    
    const handleAddFile = () => {
      setFormData({
        ...formData,
        files: [...formData.files, { type: "", typenumber : "", counternumber:""  }],
      });
    };
    
    const handleRemoveFile = (index) => {
      const updatedFiles = formData.files.filter((_, i) => i !== index);
      setFormData({ ...formData, files: updatedFiles });
    };
    const [submittedData, setSubmittedData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(true);
    const [store, setStore] = useState("");
    const [section, setSection] = useState("");
    const [type, setType] = useState("");
    const [data, setData] = useState([]);
    
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  
    const handleSnackbarClose = () => {
      setSnackbar({ open: false, message: "", severity: "" });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const requiredFields = ['store', 'section'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      // Identify missing fields for each file
      const incompleteFiles = formData.files.map((file, index) => {
        const missingFileFields = [];
      
        if (!file.type) missingFileFields.push('Type');
        if (!file.typenumber) missingFileFields.push('Type Number');
      
        return missingFileFields.length > 0 ? { index: index + 1, missingFileFields } : null;
      }).filter(file => file !== null);
      
      let message = '';
      
      // Check for missing form fields
      if (missingFields.length > 0) {
        message += `Missing required fields: ${missingFields.join(', ')}. `;
      }
      
      // Check for missing file fields
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
        store: formData.store,
          section: formData.section,
          files: formData.files.map(file => ({
              type: file.type,
              typenumber: file.typenumber,
              counternumber: file.counternumber||"",
          })),
          submitted_time: `${currentDate}T${currentTime}`,
          formatted_time: currentTime,
      };
      
  
      try {
          const checkResponse = await axios.get(`${API_BASE_URL}/api/POS-PDT-SCALE/`, {
              params: { store: formData.store, section: formData.section },
          });
  
          const existingEntries = checkResponse.data;
          let response;
          const savedEntries = [];
  
          if (formData.action === "Add") {
              for (let file of formData.files) {
                  const existingEntry = existingEntries.find(entry =>
                      entry.type === file.type &&
                      entry.typenumber === file.typenumber &&
                      entry.store === formData.store &&
                      entry.section === formData.section
                  );
  
                  if (existingEntry) {
                      response = await axios.put(
                          `${API_BASE_URL}/api/update-POS-PDT-SCALE/${existingEntry.id}/`,
                          { ...existingEntry, ...file }
                      );
                      savedEntries.push(response.data);
                  } else {
                      response = await axios.post(`${API_BASE_URL}/api/submit-POS-PDT-SCALE/`, {
                          ...dataToPost,
                          files: [file],
                      });
                      savedEntries.push(response.data);
                  }
              }
          } else if (formData.action === "Delete") {
              for (let file of formData.files) {
                  const existingEntry = existingEntries.find(entry =>
                      entry.type === file.type &&
                      entry.store === formData.store &&
                      entry.section === formData.section &&
                      entry.typenumber === file.typenumber 
                  );
  
                  if (existingEntry) {
                      response = await axios.delete(
                          `${API_BASE_URL}/api/delete-POS-PDT-SCALE/${existingEntry.id}/`
                      );
                  }
              }
          }
  
          if (response && (response.status === 200 || response.status === 201)) {
              const successMessage = formData.action === "Add" ? "Data successfully added or updated!" : "Data successfully deleted!";
              setSnackbar({ open: true, message: successMessage, severity: "success" });
              setIsEditMode(false);
              setSubmittedData(dataToPost);
          } else {
              setSnackbar({ open: true, message: "Something went wrong!", severity: "error" });
          }
      } catch (error) {
          console.error("Error submitting data:", error);
          setSnackbar({ open: true, message: "Failed to process request.", severity: "error" });
      }
  };
  
    
    const fetchDataForEdit = async (id) => {
      if (!id) return;
  
      try {
        const response = await axios.get(`${API_BASE_URL}/api/POS-PDT-SCALE/${id}/`);
        setFormData(response.data);
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
      if (!store) {
          setSnackbar({ open: true, message: "Please enter a store.", severity: "warning" });
          return;
      }
  
      try {
          const params = { store };
          if (section) params.section = section;
          if (type) params.type = type; 
  
          const response = await axios.get(`${API_BASE_URL}/api/POS-PDT-SCALE/`, { params });
          setData(response.data);
      } catch (error) {
          console.error("Error fetching data:", error);
          setSnackbar({ open: true, message: "Failed to fetch data.", severity: "error" });
      }
  };
  
    const handleDownloadCSV = () => {
      if (!store) {
        setSnackbar({ open: true, message: "Please enter a store.", severity: "warning" });
        return;
      }
      const params = { store };
      if (section) params.section = section;
      if (type) params.type = type; 
  
      axios
        .get(`${API_BASE_URL}/api/POS-PDT-SCALE/download/`, {
          params,
          responseType: "json",
        })
        .then((response) => {
          const jsonData = response.data;
          const csv = convertToCSV(jsonData);
          const blob = new Blob([csv], { type: "text/csv" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", `POS-PDT-SCALE_${store}.csv`);
          document.body.appendChild(link);
          link.click();
        })
        .catch((error) => {
          console.error("Error downloading data:", error);
          setSnackbar({ open: true, message: "Failed to download data.", severity: "error" });
        });
    };
  
    const convertToCSV = (jsonData) => {
      const header = ["Store", "Section", "Type", "Number", "Counter Number"];
      const rows = jsonData.map((item) => [
        item.store,
        item.section,
        item.type,
        item.typenumber,
        item.counternumber||"",
      ]);
      const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
      return csv;
    };
  
    const handleDownloadPDF = () => {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [400, 230],
      });
      const tableColumns = ["Store", "Section", "Type", "Number", "Counter Number"];
  
      const tableData = data.map((item) => [
          item.store,
          item.section,
          item.type,
          item.typenumber,
          item.counternumber||"",
      ]);
  
      doc.text("Server Storage Status", 14, 10);
      doc.autoTable({
        head: [tableColumns],
        body: tableData,
        startY: 20,
        theme: "striped",
      });
  
      doc.save(`POS-PDT-SCALE_${store}.pdf`);
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
          `${API_BASE_URL}/api/update-POS-PDT-SCALE/${editRowId}/`,
          updatedRow
        );
        if (response.status === 200) {
          setSnackbar({ open: true, message: "Data updated successfully!", severity: "success" });
          setData((prevData) =>
            prevData.map((item) => (item.id === editRowId ? updatedRow : item))
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
          const response = await axios.delete(`${API_BASE_URL}/api/delete-POS-PDT-SCALE/${id}/`);
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

      
  return (
    <div style={{ display: 'flex' }}>
      <Tabs defaultValue={0}>
        <TabsList>
          <Tab value={0}>Manage POS/PDT/SCALE</Tab>
          <Tab value={1}>POS/PDT/SCALE Details</Tab>
        </TabsList>
        <TabPanel value={0}>
            <Box sx={{ padding: 4, maxWidth: 1100, margin: '0 auto', minHeight: '1000px'}}>
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 2 }}>
                    POS/PDT/SCALE Form
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
                      <FormControl fullWidth sx={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                        <InputLabel id="action-label"
                          sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)',
                             '&.Mui-focused, &.MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)', }, }}
                        >
                          Action
                        </InputLabel>
                        <Select labelId="action-label" id="action" name="action" value={formData.action} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '56px', '& .MuiInputBase-input': { textAlign: 'left'}}}
                          MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px'}} }}}
                        >
                          <MenuItem value="Add">Add</MenuItem>
                          <MenuItem value="Delete">Delete</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth sx={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
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
                      <FormControl fullWidth sx={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
                        <InputLabel id="section-label"
                          sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)',
                             '&.Mui-focused, &.MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)', }, }}
                        >
                          Section
                        </InputLabel>
                        <Select labelId="section-label" id="section" name="section" value={formData.section} onChange={handleChange}
                          sx={{ fontSize: '0.8rem', height: '56px', '& .MuiInputBase-input': { textAlign: 'left'}}}
                          MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem', padding: '4px 8px'}} }}}
                        >
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
                          <MenuItem value="Others">Others</MenuItem>
                          <MenuItem value="Fruits & Vegetables">Fruits & Vegetables</MenuItem>
                          <MenuItem value="Bakery">Bakery</MenuItem>
                          <MenuItem value="Roastery">Roastery</MenuItem>
                          <MenuItem value="Delicatessen">Delicatessen</MenuItem>
                          <MenuItem value="Hotfood">Hotfood</MenuItem>
                          <MenuItem value="Meat">Meat</MenuItem>
                          <MenuItem value="Fish">Fish</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    {formData.files.map((file, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <FormControl fullWidth>
                          <InputLabel id={`type-label-${index}`} sx={{
                            fontSize: '1rem',
                            backgroundColor: 'white',
                            px: 0.5,
                            transform: 'translate(14px, 14px) scale(1)',
                            '&.Mui-focused, &.MuiInputLabel-shrink': {
                              transform: 'translate(14px, -6px) scale(0.75)',
                            },
                          }}>
                            Type
                          </InputLabel>
                          <Select
                            labelId={`type-label-${index}`}
                            value={file.type}
                            onChange={(e) => handleFileChange(index, "type", e.target.value)}
                            sx={{
                              fontSize: '0.8rem',
                              height: '56px',
                              '& .MuiInputBase-input': {
                                textAlign: 'left',
                              },
                            }}
                          >
                            <MenuItem value="POS">POS</MenuItem>
                            <MenuItem value="PDT">PDT</MenuItem>
                            <MenuItem value="Scale">Scale</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField label="Number" type="text" fullWidth value={file.typenumber} onChange={(e) => handleFileChange(index, "typenumber", e.target.value)}
                          sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'}}
                        />
                        <TextField label="Counter" type="text" fullWidth value={file.counternumber} onChange={(e) => handleFileChange(index, "counternumber", e.target.value)}
                          sx={{ fontSize: '0.9rem', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'}}
                        />
                        <Button onClick={() => handleRemoveFile(index)}><RemoveIcon /></Button>
                        <Button onClick={handleAddFile}><AddIcon /></Button>
                      </Box>
                    ))}
                  </form>
                  ):(
                  <Box sx={{ padding: 4, boxShadow: 2, maxWidth: 1200 }}>
                    <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                    <TableContainer>
                      <Table>
                      <TableHead>
                          <TableRow>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap'}}><strong>Store</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData?.store || ''}</strong></TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Action</TableCell>
                            <TableCell align="center"><strong>{formData?.action}</strong></TableCell>
                            <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>section</TableCell>
                            <TableCell align="center"><strong>{submittedData?.section}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Array.isArray(submittedData?.files) && submittedData.files.length > 0 ? (
                            submittedData.files.map((file, index) => (
                              <React.Fragment key={index}>
                                <TableRow>
                                  <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Type</TableCell>
                                  <TableCell align="center"><strong>{file?.type}</strong></TableCell>
                                  <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Number</TableCell>
                                  <TableCell align="center"><strong>{file?.typenumber}</strong></TableCell>
                                  <TableCell style={{ borderBottom: '1px solid #ccc', padding: '10px 25px', whiteSpace: 'nowrap' }}>Counter</TableCell>
                                  <TableCell align="center"><strong>{file?.counternumber}</strong></TableCell>
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
            <h2>POS/PDT/SCALE Details</h2>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5 }}>
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
                <InputLabel id="section-label"
                    sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)',
                        '&.Mui-focused, &.MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)', }, }}
                >
                    Section
                </InputLabel>
                <Select labelId="section-label" value={section} onChange={(e) => setSection(e.target.value)} >
                    <MenuItem value="">All</MenuItem>
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
                    <MenuItem value="Others">Others</MenuItem>
                    <MenuItem value="Fruits & Vegetables">Fruits & Vegetables</MenuItem>
                    <MenuItem value="Bakery">Bakery</MenuItem>
                    <MenuItem value="Roastery">Roastery</MenuItem>
                    <MenuItem value="Delicatessen">Delicatessen</MenuItem>
                    <MenuItem value="Hotfood">Hotfood</MenuItem>
                    <MenuItem value="Meat">Meat</MenuItem>
                    <MenuItem value="Fish">Fish</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="type-label"
                    sx={{ fontSize: '1rem', backgroundColor: 'white', px: 0.5, transform: 'translate(14px, 14px) scale(1)',
                        '&.Mui-focused, &.MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)', }, }}
                >
                    Type
                </InputLabel>
                <Select labelId="type-label" value={type} onChange={(e) => setType(e.target.value)} >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="POS">POS</MenuItem>
                <MenuItem value="PDT">PDT</MenuItem>
                <MenuItem value="Scale">Scale</MenuItem>
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
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                        <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '12%' }}>
                        <TableSortLabel active={sortConfig.key === 'section'} direction={sortConfig.key === 'section' ? sortConfig.direction : 'asc'} onClick={() => handleSort('section')}>Section</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                        <TableSortLabel active={sortConfig.key === 'type'} direction={sortConfig.key === 'type' ? sortConfig.direction : 'asc'} onClick={() => handleSort('type')}>Type</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                        <TableSortLabel active={sortConfig.key === 'typenumber'} direction={sortConfig.key === 'typenumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('typenumber')}>Number</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                        <TableSortLabel active={sortConfig.key === 'counternumber'} direction={sortConfig.key === 'counternumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('counternumber')}>Counter</TableSortLabel>
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
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                              <input type="text" name="store" value={updatedRow.store || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1pxsolid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>
                            <Select  name="section"  value={updatedRow.section || ''}  onChange={handleInputChange}  fullWidth 
                                sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
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
                                    <MenuItem value="Others">Others</MenuItem>
                                    <MenuItem value="Fruits & Vegetables">Fruits & Vegetables</MenuItem>
                                    <MenuItem value="Bakery">Bakery</MenuItem>
                                    <MenuItem value="Roastery">Roastery</MenuItem>
                                    <MenuItem value="Delicatessen">Delicatessen</MenuItem>
                                    <MenuItem value="Hotfood">Hotfood</MenuItem>
                                    <MenuItem value="Meat">Meat</MenuItem>
                                    <MenuItem value="Fish">Fish</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <Select  name="type"  value={updatedRow.type || ''}  onChange={handleInputChange}  fullWidth 
                                sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left' } }} 
                                MenuProps={{ PaperProps: { sx: { '& .MuiMenuItem-root': { fontSize: '0.8rem',  padding: '4px 8px', }, }, }, }} >
                                <MenuItem value="POS">POS</MenuItem>
                                <MenuItem value="PDT">PDT</MenuItem>
                                <MenuItem value="Scale">Scale</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <input type="text" name="typenumber" value={updatedRow.typenumber|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <input type="text" name="counternumber" value={updatedRow.counternumber|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.store}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '12%' }}>{item.section}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.type}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%'}}>{item.typenumber}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%'}}>{item.counternumber}</TableCell>
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
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
              <Alert onClose={handleSnackbarClose} severity={snackbar.severity} 
                sx={{
                  width: "100%",
                  marginTop: "70px",
                  backgroundColor: snackbar.severity === "error" ? "#df7a7a" : snackbar.severity === "success" ? "green" : "",
                  color: "white",
                }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}

export default Manage_POS_PDT_SCALE