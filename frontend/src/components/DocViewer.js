import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, IconButton } from "@mui/material";
import mammoth from "mammoth";
import CloseIcon from "@mui/icons-material/Close";

const DocxViewer = ({ open, fileUrl, onClose }) => {
  const [docContent, setDocContent] = useState("");

  useEffect(() => {
    if (fileUrl && open) {
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            mammoth.extractRawText({ arrayBuffer })
              .then((result) => {
                setDocContent(result.value);  // This is the raw text from the DOCX
              })
              .catch((err) => {
                console.error("Error reading DOCX file", err);
                setDocContent("Error loading document.");
              });
          };
          reader.readAsArrayBuffer(blob);
        });
    }
  }, [fileUrl, open]);

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
          borderRadius: 2,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#113f6c" }}>
            Word Document Viewer
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#113f6c",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            overflowY: "auto",
            maxHeight: "70vh",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "1rem",
            lineHeight: "1.6",
            color: "#333",
            backgroundColor: "#f7f7f7",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: 1,
          }}
        >
          {docContent ? (
            <Typography variant="body1">{docContent}</Typography>
          ) : (
            <Typography variant="body2" sx={{ color: "#888" }}>
              Loading document...
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default DocxViewer;



