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
import 'bootstrap/dist/css/bootstrap.min.css';
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

const ExpenseClaim  = () => {
  const [formData, setFormData] = useState({
    date: "",
    nameOfRequester: "",
    designation: "",
    claimAmount: "",
    purpose: "",
    managerApproval: "",
    submittedBy: "",
    hdDateToSree: "",
    cioApproval: "",
    hdDateToRahul: "",
    reCollectingDateFrom7th: "",
    finalStatus: "",
  });
  const navigate = useNavigate();
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
      !formData.nameOfRequester ||
      !formData.designation ||
      !formData.claimAmount ||
      !formData.managerApproval ||
      !formData.submittedBy
    ) {
      alert("Please fill all required fields.");
      return;
    }
    const dataToSubmit = {
      date: formData.date,
      nameOfRequester: formData.nameOfRequester,
      designation: formData.designation,
      claimAmount: parseFloat(formData.claimAmount) || 0.0,
      purpose: formData.purpose || "",
      managerApproval: formData.managerApproval,
      submittedBy: formData.submittedBy,
      hdDateToSree: formData.hdDateToSree ? new Date(formData.hdDateToSree).toISOString().split("T")[0] : null,
      cioApproval: formData.cioApproval || "",
      hdDateToRahul: formData.hdDateToRahul ? new Date(formData.hdDateToRahul).toISOString().split("T")[0] : null,
      reCollectingDateFrom7th: formData.reCollectingDateFrom7th ? new Date(formData.reCollectingDateFrom7th).toISOString().split("T")[0] : null,
      finalStatus: formData.finalStatus || "",
    };
    
    
  
    try {
      const checkResponse = await axios.get(`${API_BASE_URL}/api/expense-status/`, {
        params: { date: formData.date, nameOfRequester: formData.nameOfRequester },
      });
  
      let response;
      if (checkResponse.data.length > 0) {
        const existingEntry = checkResponse.data[0];
        response = await axios.put(`${API_BASE_URL}/api/expense-status/${existingEntry.id}/`, dataToSubmit);
      } else {
        response = await axios.post(`${API_BASE_URL}/api/expense-status/`, dataToSubmit);
      }
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
      const response = await axios.get(`${API_BASE_URL}/api/expense-status/${id}/`);
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
    if (!formData.submittedBy) {
      alert("Please enter the name of the person who submitted the claim.");
      return;
    }
    try {
      const params = { submittedBy: formData.submittedBy };  // Use 'submittedBy' to filter

      const response = await axios.get(`${API_BASE_URL}/api/expense-status/`, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data.");
    }
};

const handleDownloadCSV = () => {
    if (!formData.submittedBy) {  // Ensure 'submittedBy' is provided
      alert("Please enter the name of the person who submitted the claim.");
      return;
    }
    const params = { submittedBy: formData.submittedBy };  // Add 'submittedBy' to the params
    axios
      .get(`${API_BASE_URL}/api/expense-status/download/csv/`, {
        params,
        responseType: 'json',
      })
      .then((response) => {
        const jsonData = response.data;
        const csv = convertToCSV(jsonData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `expense_claims_${formData.submittedBy}.csv`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error downloading data:", error);
        alert("Failed to download data.");
      });
};

function convertToCSV(jsonData) {
  const header = [
    'Date', 'Name of Requester', 'Designation', 'Claim Amount', 'Purpose', 
    'Manager Approval', 'Submitted By', 'HD Date to Sree', 
    'CIO Approval', 'HD Date to Rahul', 'Recollecting Date From 7th', 'Final Status'
  ];

  const rows = jsonData.map(item => [
    item.date || '', 
    item.nameOfRequester || '', 
    item.designation || '', 
    item.claimAmount || '', 
    item.purpose || '', 
    item.managerApproval || '', 
    item.submittedBy || '', 
    item.hdDateToSree || '', 
    item.cioApproval || '',  
    item.hdDateToRahul || '', 
    item.reCollectingDateFrom7th || '', 
    item.finalStatus || ''
  ]);

  const csv = [header, ...rows].map(row => row.join(',')).join('\n');
  return csv;
}

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'mm', [400, 400]);
    const tableColumns = ['Date', 'Name of Requester', 'Designation', 'Claim Amount', 'Purpose', 'Manager Approval',
      'Submitted By','HD Date to Sree','CIO Approval','HD Date to Rahul','Recollecting Date From 7th','Final Status'];
  
    const tableData = data.map(item => [
      item.date,
      item.nameOfRequester,
      item.designation,
      item.claimAmount,
      item.purpose,
      item.managerApproval,
      item.submittedBy,
      item.hdDateToSree,
      item.cioApproval,  
      item.hdDateToRahul,
      item.reCollectingDateFrom7th,
      item.finalStatus
    ]);
  
    doc.text("Invoice Status", 14, 10);
  
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 20,
      theme: 'striped', 
    });
  
    doc.save(`expense_status_${date}.pdf`);
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
       `${API_BASE_URL}/api/expense-status/${editRowId}/`,  
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
        const response = await axios.delete(`${API_BASE_URL}/api/expense-status/${id}/`);  // Adjusted endpoint for PLU2Checklist
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
            <Tab value={0}>Expense Claim Form</Tab>
            <Tab value={1}>Expense Claim List</Tab>
          </>
        );
      case 'Front_Desk_User':
        return <Tab value={0}>Expense Claim Form</Tab>;
      case 'Management_User':
        return <Tab value={1}>Expense Claim List</Tab>;
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
              <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: 550, margin: '0 auto', minHeight: '1000px'  }}> {/* Increased minHeight */}
                <Paper sx={{padding: { xs: 2, md: 4 },
                    borderRadius: 2,
                    boxShadow: 3,
                    border: '2px solid #113f6c', }}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', marginBottom: 2, flexWrap: 'wrap'}}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', md: '1.2rem' } }}>
                    Expense Claim Form
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
                      label="Name of Requester"
                      variant="outlined"
                      fullWidth
                      name="nameOfRequester"
                      value={formData.nameOfRequester}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Designation"
                      variant="outlined"
                      fullWidth
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Claim Amount"
                      variant="outlined"
                      fullWidth
                      name="claimAmount"
                      value={formData.claimAmount}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Purpose"
                      variant="outlined"
                      fullWidth
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                  
                    <TextField
                      label="Manager Approval"
                      variant="outlined"
                      fullWidth
                      name="managerApproval"
                      value={formData.managerApproval}
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
                      label="HD Date to Sree"
                      variant="outlined"
                      fullWidth
                      name="hdDateToSree"
                      type="date"
                      value={formData.hdDateToSree}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true, // Ensures the label doesn't overlap the input
                      }}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                    <TextField
                      label="CIO Approval"
                      variant="outlined"
                      fullWidth
                      name="cioApproval"
                      value={formData.cioApproval}
                      onChange={handleChange}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                    <TextField
                      label="HD Date to Rahul"
                      variant="outlined"
                      fullWidth
                      name="hdDateToRahul"
                      type="date"
                      value={formData.hdDateToRahul}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true, // Ensures the label doesn't overlap the input
                      }}
                      sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                    />
                    <TextField
                      label="Recollecting Date From 7th"
                      variant="outlined"
                      fullWidth
                      name="reCollectingDateFrom7th"
                      type="date"
                      value={formData.reCollectingDateFrom7th}
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
                                <TableCell>Name of Requester</TableCell>
                                <TableCell align="center">{submittedData?.nameOfRequester}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Designation </TableCell>
                                <TableCell align="center">{submittedData?.designation}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Claim Amount</TableCell>
                                <TableCell align="center">{submittedData?.claimAmount}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Purpose</TableCell>
                                <TableCell align="center">{submittedData?.purpose}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Manager Approval</TableCell>
                                <TableCell align="center">{submittedData?.managerApproval}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Submitted By</TableCell>
                                <TableCell align="center">{submittedData?.submittedBy}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>HD Date to Sree</TableCell>
                                <TableCell align="center">{submittedData?.hdDateToSree}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>CIO Approval</TableCell>
                                <TableCell align="center">{submittedData?.cioApproval}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>HD Date to Rahul</TableCell>
                                <TableCell align="center">{submittedData?.hdDateToRahul}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Recollecting Date From 7th</TableCell>
                                <TableCell align="center">{submittedData?.reCollectingDateFrom7th}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell> Final Status</TableCell>
                                <TableCell align="center">{submittedData?.finalStatus}</TableCell>
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
                <h2>Expense Claim Form</h2>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 50 , marginRight: 40 }}>
                <TextField
                label="Submitted By"
                variant="outlined"
                fullWidth
                name="submittedBy"
                value={formData.submittedBy} // Use formData.submittedBy instead of date
                onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })} // Update submittedBy in formData
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
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Name of Requester</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Designation </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Claim Amount </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Purpose </TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Manager Approval</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Submitted By</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>HD Date to Sree</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>CIO Approval</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>HD Date to Rahul</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Recollecting Date From 7th</TableCell>
                          <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Final Status </TableCell>
                          
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
                                  <input type="text" name="nameOfRequester" value={updatedRow.nameOfRequester || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="designation" value={updatedRow.designation || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="claimAmount" value={updatedRow.claimAmount || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="purpose" value={updatedRow.purpose || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="managerApproval" value={updatedRow.managerApproval || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                                <input type="text" name="submittedBy" value={updatedRow.submittedBy || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="hdDateToSree" value={updatedRow.hdDateToSree || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="cioApproval" value={updatedRow.cioApproval || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="hdDateToRahul" value={updatedRow.hdDateToRahul || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                                </TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                                  <input type="text" name="reCollectingDateFrom7th" value={updatedRow.reCollectingDateFrom7th || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.nameOfRequester}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.designation}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.claimAmount}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.purpose}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.managerApproval}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.submittedBy}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.hdDateToSree}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.cioApproval}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.hdDateToRahul}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.reCollectingDateFrom7th}</TableCell>
                                <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.finalStatus}</TableCell>
                                

                              
                              
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
        return <TabPanel value={0}>
            <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: 550, margin: '0 auto', minHeight: '1000px'  }}> {/* Increased minHeight */}
              <Paper sx={{padding: { xs: 2, md: 4 },
                  borderRadius: 2,
                  boxShadow: 3,
                  border: '2px solid #113f6c', }}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', marginBottom: 2, flexWrap: 'wrap'}}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', md: '1.2rem' } }}>
                  Expense Claim Form
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
                    label="Name of Requester"
                    variant="outlined"
                    fullWidth
                    name="nameOfRequester"
                    value={formData.nameOfRequester}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Designation"
                    variant="outlined"
                    fullWidth
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Claim Amount"
                    variant="outlined"
                    fullWidth
                    name="claimAmount"
                    value={formData.claimAmount}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Purpose"
                    variant="outlined"
                    fullWidth
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                
                  <TextField
                    label="Manager Approval"
                    variant="outlined"
                    fullWidth
                    name="managerApproval"
                    value={formData.managerApproval}
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
                    label="HD Date to Sree"
                    variant="outlined"
                    fullWidth
                    name="hdDateToSree"
                    type="date"
                    value={formData.hdDateToSree}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true, // Ensures the label doesn't overlap the input
                    }}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                  <TextField
                    label="CIO Approval"
                    variant="outlined"
                    fullWidth
                    name="cioApproval"
                    value={formData.cioApproval}
                    onChange={handleChange}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                  <TextField
                    label="HD Date to Rahul"
                    variant="outlined"
                    fullWidth
                    name="hdDateToRahul"
                    type="date"
                    value={formData.hdDateToRahul}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true, // Ensures the label doesn't overlap the input
                    }}
                    sx={{ marginBottom: 2, boxShadow: 2, borderRadius: 1 }}
                  />
                  <TextField
                    label="Recollecting Date From 7th"
                    variant="outlined"
                    fullWidth
                    name="reCollectingDateFrom7th"
                    type="date"
                    value={formData.reCollectingDateFrom7th}
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
                              <TableCell>Name of Requester</TableCell>
                              <TableCell align="center">{submittedData?.nameOfRequester}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Designation </TableCell>
                              <TableCell align="center">{submittedData?.designation}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Claim Amount</TableCell>
                              <TableCell align="center">{submittedData?.claimAmount}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Purpose</TableCell>
                              <TableCell align="center">{submittedData?.purpose}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Manager Approval</TableCell>
                              <TableCell align="center">{submittedData?.managerApproval}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Submitted By</TableCell>
                              <TableCell align="center">{submittedData?.submittedBy}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>HD Date to Sree</TableCell>
                              <TableCell align="center">{submittedData?.hdDateToSree}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>CIO Approval</TableCell>
                              <TableCell align="center">{submittedData?.cioApproval}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>HD Date to Rahul</TableCell>
                              <TableCell align="center">{submittedData?.hdDateToRahul}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Recollecting Date From 7th</TableCell>
                              <TableCell align="center">{submittedData?.reCollectingDateFrom7th}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell> Final Status</TableCell>
                              <TableCell align="center">{submittedData?.finalStatus}</TableCell>
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
            <h2>Expense Claim Form</h2>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 50 , marginRight: 40 }}>
            <TextField
            label="Submitted By"
            variant="outlined"
            fullWidth
            name="submittedBy"
            value={formData.submittedBy} // Use formData.submittedBy instead of date
            onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })} // Update submittedBy in formData
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
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '5%' }}>Name of Requester</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Designation </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Claim Amount </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Purpose </TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Manager Approval</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Submitted By</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>HD Date to Sree</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>CIO Approval</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '20%' }}>HD Date to Rahul</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Recollecting Date From 7th</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color : '#113f6c', fontSize: '0.9rem', width: '10%' }}>Final Status </TableCell>
                      
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
                              <input type="text" name="nameOfRequester" value={updatedRow.nameOfRequester || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                            <input type="text" name="designation" value={updatedRow.designation || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                            <input type="text" name="claimAmount" value={updatedRow.claimAmount || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                            <input type="text" name="purpose" value={updatedRow.purpose || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                            <input type="text" name="managerApproval" value={updatedRow.managerApproval || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%' }}>
                            <input type="text" name="submittedBy" value={updatedRow.submittedBy || ''} onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                              <input type="text" name="hdDateToSree" value={updatedRow.hdDateToSree || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                              <input type="text" name="cioApproval" value={updatedRow.cioApproval || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                              <input type="text" name="hdDateToRahul" value={updatedRow.hdDateToRahul || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>
                              <input type="text" name="reCollectingDateFrom7th" value={updatedRow.reCollectingDateFrom7th || ''}  onChange={handleInputChange} style={{ width: '100%', height: '40px' }} />
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
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.nameOfRequester}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.designation}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.claimAmount}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.purpose}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.managerApproval}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.submittedBy}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '20%' }}>{item.hdDateToSree}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.cioApproval}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.hdDateToRahul}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.reCollectingDateFrom7th}</TableCell>
                            <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '10%'}}>{item.finalStatus}</TableCell>
                            

                           
                           
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
  
export default ExpenseClaim ;


