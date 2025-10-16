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
  width: 1450px;
  height: 120vh;
  padding: 20px 12px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  border-radius: 12px;
  opacity: 1;
  margin-left: 125px;
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

const InvoiceHandovering  = () => {
  const [formData, setFormData] = useState({
    date: "",
    invoiceType: "",
    vendorName: "",
    invoiceAmount: "",
    approvedBy: "",
    submittedBy: "",
    hdDate: "",
    reCollectingDate: "",
    finalStatus: "",
    finalUpdation: "",
  });
  const navigate = useNavigate();
  const [submittedBy, setSubmittedBy] = useState("");

  const [submittedData, setSubmittedData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [date, setDate] = useState('');
   const [site, setSite] = useState('');
  const [data, setData] = useState([]);
  const [invoiceType, setInvoiceType] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    debugger;
  
    // Validate required fields
    if (
      !formData.date ||
      !formData.invoiceType ||
      !formData.vendorName ||
      !formData.invoiceAmount ||
      !formData.approvedBy ||
      !formData.submittedBy
    ) {
      alert("Please fill all required fields.");
      return;
    }
    const dataToSubmit = {
     
      date: new Date().toISOString().split("T")[0], // Format the date as YYYY-MM-DD
      invoiceType: formData.invoiceType,
      vendorName: formData.vendorName,
      invoiceAmount: parseFloat(formData.invoiceAmount) || 0.0, // Ensure valid value
      approvedBy: formData.approvedBy,
      submittedBy: formData.submittedBy,
      hdDate: formData.hdDate ? new Date(formData.hdDate).toISOString().split("T")[0] : null,
      reCollectingDate: formData.reCollectingDate ? new Date(formData.reCollectingDate).toISOString().split("T")[0] : null,
      finalStatus: formData.finalStatus || "", // Default to empty string if not provided
      finalUpdation: formData.finalUpdation || "", // Default to empty string if not provided
    };
    
  
    try {
      // Check if the record already exists for the date and vendorName
      const checkResponse = await axios.get(`${API_BASE_URL}/api/invoice-status/`, {
        params: { date: formData.date, vendorName: formData.vendorName },
      });
  
      let response;
      if (checkResponse.data.length > 0) {
        const existingEntry = checkResponse.data[0];
        // Update the existing record
        response = await axios.put(`${API_BASE_URL}/api/invoice-status/${existingEntry.id}/`, dataToSubmit);
      } else {
        // Create a new record
        response = await axios.post(`${API_BASE_URL}/api/invoice-status/`, dataToSubmit);
      }
  
      // Handle success response
      if (response.status === 200 || response.status === 201) {
        alert("Invoice data successfully submitted!");
        setIsEditMode(false);
        setSubmittedData(dataToSubmit);
      } else {
        alert("Something went wrong!");
      }
    } catch (error) {
      console.error("Error submitting invoice:", error);
      alert("Failed to submit invoice data.");
    }
  };
  

  const fetchDataForEdit = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/invoice-status/${id}/`);
      setFormData(response.data);  
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
    if (!submittedBy) {  // Use submittedBy directly from state
      alert("Please enter the name of the person who submitted the claim.");
      return;
    }
  
    try {
      const params = { submittedBy };  // Use submittedBy directly
  
      // Add submittedDate and invoiceType if available
      if (formData.submittedDate) {
        params.submittedDate = formData.submittedDate;
      }
      if (formData.invoiceType) {
        params.invoiceType = formData.invoiceType;
      }
  
      const response = await axios.get(`${API_BASE_URL}/api/invoice-status/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data.");
    }
  };
  
  

  const handleDownloadCSV = () => {
    console.log("Submitted By:", submittedBy); // Debugging log
    if (!submittedBy.trim()) {
      alert("Please enter the submitter.");
      return;
    }
    const params = { submittedBy };
    if (site) params.site = site;
  
    axios
      .get(`${API_BASE_URL}/api/invoice-status/download/csv/`, {
        params,
        responseType: 'json',
      })
      .then((response) => {
        const jsonData = response.data;
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `invoice_status_submittedBy_${submittedBy}.csv`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading data:", error);
        alert("Failed to download data.");
      });
  };
  
  
  function convertToCSV(jsonData) {
    const header = ['Date', 'Invoice Type', 'Vendor Name', 'Invoice Amount', 'Approved By', 'Submitted By', 'HD Date','Recollecting Date','Final Status','Final Updation'];
    const rows = jsonData.map(item => [
      item.date,
      item.invoiceType,
      item.vendorName,
      item.invoiceAmount,
      item.approvedBy,
      item.submittedBy,
      item.hdDate,
      item.reCollectingDate,
      item.finalStatus,  
      item.finalUpdation

    ]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'mm', [400, 400]);
    const tableColumns = ['Date', 'Invoice Type', 'Vendor Name', 'Invoice Amount', 'Approved By', 'Submitted By', 'HD Date','Recollecting Date','Final Status','Final Updation'];
  
    const tableData = data.map(item => [
      item.date,
      item.invoiceType,
      item.vendorName,
      item.invoiceAmount,
      item.approvedBy,
      item.submittedBy,
      item.hdDate,
      item.reCollectingDate,
      item.finalStatus,  
      item.finalUpdation
    ]);
  
    doc.text("Invoice Status", 14, 10);
  
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 20,
      theme: 'striped', 
    });
  
    doc.save(`invoice_status_${date}.pdf`);
  };

  
  const [editRowId, setEditRowId] = useState(null);
  const [updatedRow, setUpdatedRow] = useState({});
  
  const handleEditClick = (id) => {
    debugger
    console.log("Edit Clicked for ID:", id); // Debugging
    const rowToEdit = data.find((item) => item.id === id);
    console.log("Row to Edit:", rowToEdit); // Debugging
    setEditRowId(id);
    setUpdatedRow(rowToEdit || {}); // Avoid null/undefined issues
  };
  
  const handleInputChange = (e) => {
    debugger
    const { name, value } = e.target;
    console.log("Input Changed:", name, value); // Debugging
    setUpdatedRow({
      ...updatedRow,
      [name]: value,
    });
  };
  
  
  const handleSaveClick = async () => {
    debugger
    try {
      const response = await axios.put(
       `${API_BASE_URL}/api/invoice-status/${editRowId}/`,  
        updatedRow
      );
      if (response.status === 200) {
        alert("Row updated successfully!");
        setData((prevData) =>
          prevData.map((item) =>
            item.id === editRowId ? updatedRow : item
          )
        );
        setEditRowId(null);
      } else {
        alert("Failed to update data.");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Error saving updates.");
    }
  };
  
  const handleCancelClick = () => {
    setEditRowId(null);
  };
  
  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (confirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/invoice-status/${id}/`);  // Adjusted endpoint for PLU2Checklist
        if (response.status === 200) {
          setData((prevData) => prevData.filter(item => item.id !== id));
          alert("Record deleted successfully!");
        } else {
          alert("Failed to delete the record.");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("Failed to delete the record.");
      }
    }
  };
  
  
  
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserGroup = localStorage.getItem('userGroup');
    setUsername(storedUsername || ''); 
    setUserGroup(storedUserGroup || ''); 
    if (storedUserGroup === 'Management_User') {
      setSelectedTab(1); 
    } else {
      setSelectedTab(0); 
    }
  }, []);

  const getTabsForUserGroup = () => {
    switch (userGroup) {
      case 'Admin_User':
        return (
          <>
            <Tab value={0}>Invoice Handover Form</Tab>
            <Tab value={1}>Invoice Handovering List</Tab>
          </>
        );
      case 'Front_Desk_User':
        return <Tab value={0}>Invoice Handover Form</Tab>;
      case 'Management_User':
        return <Tab value={1}>Invoice Handovering List</Tab>;
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
              <Box sx={{ padding: 4, maxWidth: 550, margin: '0 auto', minHeight: '1000px' }}> {/* Increased minHeight */}
                <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Invoice Handover Form
                    </Typography>
                    {isEditMode && (
                      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                        sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                        Submit
                      </Button> )}
                  </Box>
                  {isEditMode ? (
                    <form onSubmit={handleSubmit}>
                  
                  
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
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />

                  
                    <TextField
                      label="Invoice Type"
                      variant="outlined"
                      fullWidth
                      name="invoiceType"
                      value={formData.invoiceType}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Name of Vendor"
                      variant="outlined"
                      fullWidth
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Invoice Amount"
                      variant="outlined"
                      fullWidth
                      name="invoiceAmount"
                      value={formData.invoiceAmount}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Approved By"
                      variant="outlined"
                      fullWidth
                      name="approvedBy"
                      value={formData.approvedBy}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Submitted By"
                      variant="outlined"
                      fullWidth
                      name="submittedBy"
                      value={formData.submittedBy}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="H.D Date"
                      variant="outlined"
                      fullWidth
                      name="hdDate"
                      type="date"
                      value={formData.hdDate}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true, // Ensures the label doesn't overlap the input
                      }}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Re Collecting Date"
                      variant="outlined"
                      fullWidth
                      name="reCollectingDate"
                      type="date"
                      value={formData.reCollectingDate}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true, // Ensures the label doesn't overlap the input
                      }}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  <TextField
                                    label="Final Status"
                                    variant="outlined"
                                    fullWidth
                                    name="finalStatus"
                                    value={formData.finalStatus}
                                    onChange={handleChange}
                                    InputLabelProps={{
                                      shrink: true, // Ensures the label doesn't overlap the input
                                    }}
                                    sx={{
                                      marginBottom: 2, // Adds space below the input
                                      boxShadow: 2,    // Adds shadow for styling
                                      borderRadius: 1, // Rounded corners for the text field
                                    }}
                                  />
                  
                  <TextField
                                    label="Final Updation"
                                    variant="outlined"
                                    fullWidth
                                    name="finalUpdation"
                                    value={formData.finalUpdation}
                                    onChange={handleChange}
                                    InputLabelProps={{
                                      shrink: true, // Ensures the label doesn't overlap the input
                                    }}
                                    sx={{
                                      marginBottom: 2, // Adds space below the input
                                      boxShadow: 2,    // Adds shadow for styling
                                      borderRadius: 1, // Rounded corners for the text field
                                    }}
                                  />


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
                              </TableRow>
                              <TableRow>
                                <TableCell>invoiceType</TableCell>
                                <TableCell align="center">{submittedData?.invoiceType}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Name of vendor </TableCell>
                                <TableCell align="center">{submittedData?.vendorName}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Invoiuce Amount</TableCell>
                                <TableCell align="center">{submittedData?.invoiceAmount}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Approved By</TableCell>
                                <TableCell align="center">{submittedData?.approvedBy}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Submitted By</TableCell>
                                <TableCell align="center">{submittedData?.submittedBy}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>HD Date</TableCell>
                                <TableCell align="center">{submittedData?.hdDate}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Recollecting Date</TableCell>
                                <TableCell align="center">{submittedData?.reCollectingDate}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Final Status</TableCell>
                                <TableCell align="center">{submittedData?.finalStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Final Updation</TableCell>
                                <TableCell align="center">{submittedData?.finalUpdation}</TableCell>
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
                <h2>Invoice Handover Form</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 50 , marginRight: 40 }}>
                <TextField
                label="Submitted By"
                variant="outlined"
                fullWidth
                name="submittedBy"
                value={submittedBy} // Bind the value to submittedBy state
                onChange={(e) => setSubmittedBy(e.target.value)} // Update submittedBy state directly
                placeholder="Enter submitted by" // Optional placeholder for better UI
                sx={{ flex: 1 }}
              />

                  {/* <TextField type="Invoice Type" label="Invoice Type" InputLabelProps={{ shrink: true }} value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)} sx={{ flex: 1 }} /> */}
                  <FormControl sx={{ flex: 1 }}>
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
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '8%'}}>Date</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Invoice Type</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Name of Vendor </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Invoice Amount </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Approved By </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Submitted By </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>HD Date</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Recollecting Date</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Final Status </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Final Update</TableCell>
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                                  <input type="text" name="invoiceType" value={updatedRow.invoiceType || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="vendorName" value={updatedRow.vendorName || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="invoiceAmount" value={updatedRow.invoiceAmount || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="approvedBy" value={updatedRow.approvedBy || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="submittedBy" value={updatedRow.submittedBy || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="hdDate" value={updatedRow.hdDate || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="reCollectingDate" value={updatedRow.reCollectingDate || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <TextField
                                    name="finalStatus"
                                    value={updatedRow.finalStatus || ''}
                                    onChange={handleInputChange}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left', padding: '8px' } }}
                                  />
                                </TableCell>

                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                  <TextField
                                    name="finalUpdation"
                                    value={updatedRow.finalUpdation || ''}
                                    onChange={handleInputChange}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left', padding: '8px' } }}
                                  />
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.invoiceType}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.vendorName}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.invoiceAmount}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.approvedBy}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.submittedBy}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.hdDate}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.reCollectingDate}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.finalStatus}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.finalUpdation}</TableCell>
                              
                              
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
            </TabPanel>
          </>
        );
      case 'Front_Desk_User':
        return<TabPanel value={0}>
            <Box sx={{ padding: 4, maxWidth: 550, margin: '0 auto', minHeight: '1000px' }}> {/* Increased minHeight */}
              <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, border: '2px solid #113f6c' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Invoice Handover Form
                  </Typography>
                  {isEditMode && (
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}
                      sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47', }, }} >
                      Submit
                    </Button> )}
                </Box>
                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                
                
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
                  sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                />

                
                  <TextField
                    label="Invoice Type"
                    variant="outlined"
                    fullWidth
                    name="invoiceType"
                    value={formData.invoiceType}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Name of Vendor"
                    variant="outlined"
                    fullWidth
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Invoice Amount"
                    variant="outlined"
                    fullWidth
                    name="invoiceAmount"
                    value={formData.invoiceAmount}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Approved By"
                    variant="outlined"
                    fullWidth
                    name="approvedBy"
                    value={formData.approvedBy}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Submitted By"
                    variant="outlined"
                    fullWidth
                    name="submittedBy"
                    value={formData.submittedBy}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="H.D Date"
                    variant="outlined"
                    fullWidth
                    name="hdDate"
                    type="date"
                    value={formData.hdDate}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true, // Ensures the label doesn't overlap the input
                    }}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Re Collecting Date"
                    variant="outlined"
                    fullWidth
                    name="reCollectingDate"
                    type="date"
                    value={formData.reCollectingDate}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true, // Ensures the label doesn't overlap the input
                    }}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                <TextField
                                  label="Final Status"
                                  variant="outlined"
                                  fullWidth
                                  name="finalStatus"
                                  value={formData.finalStatus}
                                  onChange={handleChange}
                                  InputLabelProps={{
                                    shrink: true, // Ensures the label doesn't overlap the input
                                  }}
                                  sx={{
                                    marginBottom: 2, // Adds space below the input
                                    boxShadow: 2,    // Adds shadow for styling
                                    borderRadius: 1, // Rounded corners for the text field
                                  }}
                                />
                
                <TextField
                                  label="Final Updation"
                                  variant="outlined"
                                  fullWidth
                                  name="finalUpdation"
                                  value={formData.finalUpdation}
                                  onChange={handleChange}
                                  InputLabelProps={{
                                    shrink: true, // Ensures the label doesn't overlap the input
                                  }}
                                  sx={{
                                    marginBottom: 2, // Adds space below the input
                                    boxShadow: 2,    // Adds shadow for styling
                                    borderRadius: 1, // Rounded corners for the text field
                                  }}
                                />


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
                            </TableRow>
                            <TableRow>
                              <TableCell>invoiceType</TableCell>
                              <TableCell align="center">{submittedData?.invoiceType}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Name of vendor </TableCell>
                              <TableCell align="center">{submittedData?.vendorName}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Invoiuce Amount</TableCell>
                              <TableCell align="center">{submittedData?.invoiceAmount}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Approved By</TableCell>
                              <TableCell align="center">{submittedData?.approvedBy}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Submitted By</TableCell>
                              <TableCell align="center">{submittedData?.submittedBy}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>HD Date</TableCell>
                              <TableCell align="center">{submittedData?.hdDate}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Recollecting Date</TableCell>
                              <TableCell align="center">{submittedData?.reCollectingDate}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Final Status</TableCell>
                              <TableCell align="center">{submittedData?.finalStatus}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Final Updation</TableCell>
                              <TableCell align="center">{submittedData?.finalUpdation}</TableCell>
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
          </TabPanel>;
      case 'Management_User':
        return <TabPanel value={1}>
            <div>
              <h2>Invoice Handover Form</h2>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 50 , marginRight: 40 }}>
              <TextField
              label="Submitted By"
              variant="outlined"
              fullWidth
              name="submittedBy"
              value={submittedBy} // Bind the value to submittedBy state
              onChange={(e) => setSubmittedBy(e.target.value)} // Update submittedBy state directly
              placeholder="Enter submitted by" // Optional placeholder for better UI
              sx={{ flex: 1 }}
            />

                {/* <TextField type="Invoice Type" label="Invoice Type" InputLabelProps={{ shrink: true }} value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)} sx={{ flex: 1 }} /> */}
                <FormControl sx={{ flex: 1 }}>
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
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '8%'}}>Date</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Invoice Type</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Name of Vendor </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Invoice Amount </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Approved By </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Submitted By </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>HD Date</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Recollecting Date</TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Final Status </TableCell>
                        <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>Final Update</TableCell>
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
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '6%' }}>
                                <input type="text" name="invoiceType" value={updatedRow.invoiceType || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <input type="text" name="vendorName" value={updatedRow.vendorName || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <input type="text" name="invoiceAmount" value={updatedRow.invoiceAmount || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <input type="text" name="approvedBy" value={updatedRow.approvedBy || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <input type="text" name="submittedBy" value={updatedRow.submittedBy || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                              <input type="text" name="hdDate" value={updatedRow.hdDate || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                <input type="text" name="reCollectingDate" value={updatedRow.reCollectingDate || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <TextField
                                  name="finalStatus"
                                  value={updatedRow.finalStatus || ''}
                                  onChange={handleInputChange}
                                  fullWidth
                                  variant="outlined"
                                  sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left', padding: '8px' } }}
                                />
                              </TableCell>

                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <TextField
                                  name="finalUpdation"
                                  value={updatedRow.finalUpdation || ''}
                                  onChange={handleInputChange}
                                  fullWidth
                                  variant="outlined"
                                  sx={{ fontSize: '0.8rem', height: '40px', '& .MuiInputBase-input': { textAlign: 'left', padding: '8px' } }}
                                />
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
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.invoiceType}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.vendorName}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.invoiceAmount}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.approvedBy}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.submittedBy}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.hdDate}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.reCollectingDate}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.finalStatus}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.finalUpdation}</TableCell>
                            
                            
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
          </TabPanel>;
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

export default InvoiceHandovering ;


