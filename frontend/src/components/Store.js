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
import { useParams } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { API_BASE_URL } from '../config';
import Sheet from '@mui/joy/Sheet';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';
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
  flex-direction: column; // Stack tabs vertically
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


const Manage_store = () => {
  const [formData, setFormData] = useState({
    action: "",
    storecode: "",
    storename: "",
    itmanager: "",
    itincharge : "",
    assitincharge : "",
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [store, setStore] = useState("");
  const [data, setData] = useState([]);
  const [stores, setStores] = useState([]);
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
    console.log('Stores state:', stores);
  }, [stores]); 
  

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


  const handleStoreChange = (event) => {
    const selectedStoreCode = event.target.value;
    if (selectedStoreCode === "None") {
      setFormData({
        ...formData,
        store: "None",
        storename: "",
      });
    } else {
      const selectedStore = stores.find(
        (store) => store.storecode === selectedStoreCode
      );
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", 
  });
  const navigate = useNavigate();

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ['action', 'storename', 'storecode','itincharge','itmanager','assitincharge'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setSnackbar({
        open: true,
        message: `Please fill the following required fields: ${missingFields.join(', ')}.`,
        severity: "error",
      });
      return;
    }

  
    const currentDateTime = new Date();
    const options = { timeZone: "Asia/Kolkata", hour12: false };
    const currentDate = currentDateTime.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const currentTime = currentDateTime.toLocaleTimeString("en-GB", options);
  
    const dataToPost = {
      storecode: formData.storecode,
      storename: formData.storename,
      itmanager: formData.itmanager,
      itincharge : formData.itincharge,
      assitincharge : formData.assitincharge,
      submitted_time: `${currentDate}T${currentTime}`,
      formatted_time: currentTime,
    };
  
    try {
      const checkResponse = await axios.get(`${API_BASE_URL}/api/manage-store/`, {
        params: { site: formData.site, section: formData.section },
      });
  
      const existingEntries = checkResponse.data;
      let response;
  
      if (formData.action === "Add") {
        const existingEntry = existingEntries.find(
          (entry) => entry.storecode === formData.storecode
        );
  
        if (existingEntry) {
          response = await axios.put(
            `${API_BASE_URL}/api/update-store/${existingEntry.id}/`,
            dataToPost
          );
          setSnackbar({
            open: true,
            message: "Existing data updated successfully!",
            severity: "success",
          });
        } else {
          response = await axios.post(`${API_BASE_URL}/api/submit-store/`, dataToPost);
          setSnackbar({
            open: true,
            message: "New data added successfully!",
            severity: "success",
          });
        }
      } else if (formData.action === "Delete") {
        const existingEntry = existingEntries.find(
          (entry) => entry.storecode === formData.storecode
        );
  
        if (existingEntry) {
          response = await axios.delete(
            `${API_BASE_URL}/api/delete-store/${existingEntry.id}/`
          );
          if (response.status === 204) {
            setSnackbar({
              open: true,
              message: "Data deleted successfully!",
              severity: "success",
            });
          } else {
            setSnackbar({
              open: true,
              message: "Failed to delete the data.",
              severity: "error",
            });
          }
        } else {
          setSnackbar({
            open: true,
            message: "No matching entry found for deletion.",
            severity: "error",
          });
        }
      }
  
      if (response && (response.status === 200 || response.status === 201 || response.status === 204)) {
        setIsEditMode(false);
        setSubmittedData(dataToPost);
      } else {
        setSnackbar({
          open: true,
          message: "Something went wrong!",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setSnackbar({
        open: true,
        message: "Failed to process the request.",
        severity: "error",
      });
    }
  };
  

  const fetchDataForEdit = async (id) => {
    if (!id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/manage-store/${id}/`);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching data for edit:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch data for editing.",
        severity: "error",
      });
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
    try {
        let params = {};  
        if (store !== "None") {
          params = { store };  
      } else {
          params = { store: "None" };  
      }

        const response = await axios.get(`${API_BASE_URL}/api/fetch-store/`, { params });
        setData(response.data);
    } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({ open: true, message: "Failed to fetch data.", severity: "error" });
    }
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
        `${API_BASE_URL}/api/update-store/${editRowId}/`,
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
        const response = await axios.delete(`${API_BASE_URL}/api/delete-store/${id}/`);
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
          <Tab value={0}>Manage Store</Tab>
          <Tab value={1}>Store Details</Tab>
        </TabsList>
        <TabPanel value={0}>
          <Box sx={{ padding: 4, maxWidth: 900, margin: '0 auto', marginTop: '50px' }}> {/* Increased minHeight */}
            <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Store Adding Form
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
                    <TextField label="Store Code" type="text" name="storecode" fullWidth value={formData.storecode} onChange={handleChange} sx={{ fontSize: '0.9rem',}}/>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="Store Name"
                      type="text"
                      fullWidth
                      name="storename"
                      value={formData.storename}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/,/g, ''); // Remove commas
                        handleChange({ target: { name: "storename", value: newValue } });
                      }}
                      sx={{ fontSize: '0.9rem' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="ID of IT Manager"
                      type="number"
                      fullWidth
                      name="itmanager"
                      value={formData.itmanager}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/,/g, ''); // Remove commas
                        handleChange({ target: { name: "itmanager", value: newValue } });
                      }}
                      sx={{ fontSize: '0.9rem' }}
                    />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="ID of IT Incharge"
                      type="number"
                      fullWidth
                      name="itincharge"
                      value={formData.itincharge}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/,/g, ''); 
                        handleChange({ target: { name: "itincharge", value: newValue } });
                      }}
                      sx={{ fontSize: '0.9rem' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <TextField
                      label="ID of Assistant IT Incharge"
                      type="number"
                      fullWidth
                      name="assitincharge"
                      value={formData.assitincharge}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/,/g, ''); // Remove commas
                        handleChange({ target: { name: "assitincharge", value: newValue } });
                      }}
                      sx={{ fontSize: '0.9rem' }}
                    />
                  </Box>
                </form>
              ) : (
                <Box>
                  <Paper sx={{ overflow: 'auto', boxShadow: 3 }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Site</strong></TableCell>
                            <TableCell align="center"><strong>{submittedData?.storecode || ''}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Store Name</TableCell>
                            <TableCell align="center">{submittedData?.storename}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Action</TableCell>
                            <TableCell align="center">{formData?.action}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Name of IT Manager</TableCell>
                            <TableCell align="center">{formData?.itmanager}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Name of IT Incharge</TableCell>
                            <TableCell align="center">{formData?.itincharge}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Name of Assistant IT Incharge</TableCell>
                            <TableCell align="center">{formData?.assitincharge}</TableCell>
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
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbar.severity}
                sx={{
                  width: "100%",
                  marginTop: "70px",
                  backgroundColor: snackbar.severity === "error" ? "#df7a7a" : snackbar.severity === "success" ? "green" : "",
                  color: "black",
                }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </TabPanel>
        <TabPanel value={1}>
          <div>
            <h2>Store Details</h2>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5 }}>
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
            </Box>

            <Sheet sx={{ marginBottom: 1, marginLeft: 3, marginRight: 3 }}>
              <TableContainer component={Paper} sx={{ marginTop: 8, marginLeft: 1, marginRight: 1, overflowY: 'auto'}}>
              <div style={{ maxHeight: '589px', overflowY: 'auto' , border: '1px solid #113f6c'}}>
                <Table sx={{ borderCollapse: 'collapse', border: '2px solid #113f6c' }}>
                  <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1000}}>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>
                        <TableSortLabel active={sortConfig.key === 'store'} direction={sortConfig.key === 'store' ? sortConfig.direction : 'asc'} onClick={() => handleSort('store')}>Store</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '20%'}}>
                        <TableSortLabel active={sortConfig.key === 'storename'} direction={sortConfig.key === 'storename' ? sortConfig.direction : 'asc'} onClick={() => handleSort('storename')}>Store Name</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '18%' }}>
                        <TableSortLabel active={sortConfig.key === 'itmanager'} direction={sortConfig.key === 'itmanager' ? sortConfig.direction : 'asc'} onClick={() => handleSort('itmanager')}>Name of IT Manager</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '18%' }}>
                        <TableSortLabel active={sortConfig.key === 'itincharge'} direction={sortConfig.key === 'itincharge' ? sortConfig.direction : 'asc'} onClick={() => handleSort('itincharge')}>Name of IT Incharge</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '18%' }}>
                        <TableSortLabel active={sortConfig.key === 'assitincharge'} direction={sortConfig.key === 'assitincharge' ? sortConfig.direction : 'asc'} onClick={() => handleSort('assitincharge')}>Name of Assistant IT Incharge</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>
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
                              <input type="text" name="storecode" value={updatedRow.storecode || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                              <input type="text" name="storename" value={updatedRow.storename || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '18%' }}>
                              <input type="text" name="itmanager" value={updatedRow.itmanager || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '18%' }}>
                              <input type="text" name="itincharge" value={updatedRow.itincharge|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '18%' }}>
                              <input type="text" name="assitincharge" value={updatedRow.assitincharge|| ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.storecode}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.storename}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '18%' }}>{item.itmanager}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '18%'}}>{item.itincharge}</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '18%'}}>{item.assitincharge}</TableCell>
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
                  color: "black",
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

export default Manage_store