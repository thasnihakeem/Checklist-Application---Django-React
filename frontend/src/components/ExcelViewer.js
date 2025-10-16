import React, { useState } from "react";
import { Modal, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { read, utils } from "xlsx";
import CloseIcon from "@mui/icons-material/Close";

const ExcelViewer = ({ open, fileUrl, onClose }) => {
  const [sheetData, setSheetData] = useState([]);

  React.useEffect(() => {
    if (fileUrl) {
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: "array" });
            const sheetNames = workbook.SheetNames;
            const sheet = utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
            setSheetData(sheet);
          };
          reader.readAsArrayBuffer(blob);
        });
    }
  }, [fileUrl]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxHeight: "80%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          overflow: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Excel Data Viewer
        </Typography>
        {/* Close button */}
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onClose} 
          sx={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            color: '#113f6c', 
            borderColor: '#113f6c', 
            '&:hover': { borderColor: '#113f6c' } 
          }}
        >
          <CloseIcon/>
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              {sheetData.length > 0 &&
                Object.keys(sheetData[0]).map((header, index) => (
                  <TableCell key={index} sx={{ fontWeight: "bold" }}>
                    {header}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sheetData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {Object.values(row).map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Modal>
  );
};

export default ExcelViewer;
