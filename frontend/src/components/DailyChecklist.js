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
import { Paper, Button, Box , TextField } from '@mui/material'; 
import Sheet from '@mui/joy/Sheet';
import 'jspdf-autotable'; 
import { Snackbar, Alert } from "@mui/material";
import { API_BASE_URL } from '../config';
import DownloadIcon from '@mui/icons-material/Download';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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
  width: 90vw; /* Responsive width */
  max-width: 1500px;
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

const DailyChecklist = () => {
  const [date, setDate] = useState("");
  const [userid, setUserid] = useState('');
  const [store, setStore] = useState("");
  const [data, setData] = useState([]);
  const [checklistData, setChecklistData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserid = localStorage.getItem('userid');
    const storedUserGroup = localStorage.getItem('userGroup');
  
    setUsername(storedUsername || '');
    setUserid(storedUserid || '');
    setUserGroup(storedUserGroup || '');
  }, []);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  
  const handleSnackbarClose = () => {
      setSnackbar({ open: false, message: "", severity: "" });
  };

  const fetchData = async () => {
    if (!date) {
        setSnackbar({
            open: true,
            message: "Please select a date",
            severity: "error",
        });
        return;
    }

    setLoading(true); 
    try {
        const response = await fetch(`${API_BASE_URL}/api/daily-checklist?date=${date}&userid=${userid}&userGroup=${userGroup}`);
        const data = await response.json();
        console.log("Fetched Data:", data);  
    
        if (response.ok) {
            if (data.checklist) {
                setChecklistData(data.checklist);  
                setSnackbar({
                    open: true,
                    message: "Data fetched successfully!",
                    severity: "success",
                });
            } else {
                setSnackbar({
                    open: true,
                    message: "No checklist data available",
                    severity: "warning",
                });
            }
        } else {
            setSnackbar({
                open: true,
                message: data.error || "Failed to fetch data",
                severity: "error",
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
            open: true,
            message: "An error occurred while fetching data",
            severity: "error",
        });
    } finally {
        setLoading(false); 
    }
};
   
const handleDownloadPDF = () => {
  const doc = new jsPDF("landscape");
  doc.setFontSize(16); 
  const pageWidth = doc.internal.pageSize.width;
  doc.text("Daily Checklist", pageWidth / 2, 15, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, pageWidth - 50, 15); 
  const tableColumn = ["Date", "Store Code", "Store Name", "Server Status", "POS Status", 
                       "Scale Status", "PDT Status", "Ind Store Backup", "Sales Status", 
                       "Acronics Backup", "UPS Status", "Remarks"];

  const tableRows = checklistData.map(item => [
    date,  
    item.store_code,
    item.store_name,
    item.server_status,
    item.pos_status,
    item.scale_status,
    item.pdt_status,
    item.ind_store_backup_status,
    item.sales_status_status,
    item.acronics_backup_status,
    item.ups_status,
    item.remarks ? item.remarks.replace(/<br\s*\/?>/g, "\n") : "No remarks" // Fix line breaks in remarks
  ]);

  // Generate table
  doc.autoTable({ head: [tableColumn], body: tableRows, startY: 25 });

  // Save PDF with a meaningful filename
  doc.save(`daily_checklist_${date}.pdf`);
};



  return (
    <div>
      <Tabs defaultValue={0}>
        <TabsList>
          <Tab value={0}>Daily Checklist</Tab>
        </TabsList>
        <TabPanel value={0}>
          <div>
            <h2>Daily Checklist</h2>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1, marginLeft: 19, marginRight: 10 , marginTop:5}}>
            <TextField type="date" label="date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} sx={{ flex: 1 }}/>
              <Button variant="contained" onClick={fetchData}
                sx={{ backgroundColor: '#113f6c', '&:hover': { backgroundColor: '#0e2a47' }, fontSize: '0.8rem', padding: '6px 12px', }}>
                Fetch Data
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
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '3%' }}></TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>Date</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '5%' }}>Store</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '8%' }}>Store Name</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%'}}>Server Status</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%' }}>POS Status</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%' }}>Scale Status</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%' }}>PDT Status</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%' }}>Ind-Store Backup</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%' }}>Sales Status</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%' }}>Acronics Backup</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '4%' }}>UPS Status</TableCell>
                      <TableCell sx={{ border: '1px solid #113f6c', fontWeight: 'bold', padding: '8px 16px', color: '#113f6c', fontSize: '0.9rem', width: '25%' }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(checklistData) && checklistData.map((item, index) => {
                        return (
                            <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: '#e3f2fd' }, '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#bbdefb' }}} >
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '3%', fontWeight: 'bold' }}>
                                {index + 1}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{date}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '5%' }}>{item.store_code}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '8%' }}>{item.store_name}</TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.server_status.includes('Not Ok') ? 'red' : 'black'  }}>
                                  {item.server_status}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.pos_status === 'Not Ok' ? 'red' : 'black' }}>
                                  {item.pos_status}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.scale_status === 'Not Ok' ? 'red' : 'black' }}>
                                  {item.scale_status}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.pdt_status === 'Not Ok' ? 'red' : 'black' }}>
                                  {item.pdt_status}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.ind_store_backup_status === 'Not Ok' ? 'red' : 'black' }}>
                                  {item.ind_store_backup_status}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.sales_status_status === 'Not Ok' ? 'red' : 'black' }}>
                                  {item.sales_status_status}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.acronics_backup_status === 'Not Ok' ? 'red' : 'black' }}>
                                  {item.acronics_backup_status}
                              </TableCell>
                              <TableCell sx={{ border: '1px solid #113f6c', padding: '9px 16px', fontSize: '0.85rem', width: '4%', color: item.ups_status === 'Not Ok' ? 'red' : 'black' }}>
                                  {item.ups_status}
                              </TableCell>
                              <TableCell
                                sx={{
                                  border: '1px solid #113f6c',
                                  padding: '9px 16px',
                                  fontSize: '0.85rem',
                                  width: '25%',
                                }}
                              >
                                {item.remarks
                                  ?.split('<br>')
                                  .filter((line) => line.trim() !== '')
                                  .map((line, idx) => (
                                    <div key={idx}>
                                      <span style={{ color: 'black', fontWeight: 'bold' }}>{idx + 1}.</span>{' '}
                                      <span style={{ color: 'red' }}>{line.trim()}</span>
                                    </div>
                                  ))}
                              </TableCell>
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
                  backgroundColor: snackbar.severity === "error" ? "red" : snackbar.severity === "success" ? "green" : "",
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

export default DailyChecklist