import React, { useState } from "react";
import { Modal, Box, Button, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const ImageViewer = ({
  open,
  onClose,
  fileUrl,
  handleNext,
  handlePrev,
  isFirstFile,
  isLastFile,
}) => {
  const [zoom, setZoom] = useState(1);
  const fileExtension = fileUrl?.split(".").pop().toLowerCase();

  const isImage = ["jpg", "jpeg", "png"].includes(fileExtension);
  const isPDF = fileExtension === "pdf";
  const fileName = fileUrl?.split("\\").pop();
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxHeight: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2,
          overflow: "auto",
        }}
      >
        {/* Close Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: "10px",
            right: "10px",
            color: "#113f6c",
            borderColor: "#113f6c",
            '&:hover': { borderColor: "#113f6c" },
          }}
        >
          <CloseIcon />
        </Button>
        <Box
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              mb: 2,
              color: "#113f6c"
            }}
          >
            {fileName}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: "center" }}>
          <Button variant="outlined" onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOutIcon />
          </Button>
          <Button variant="outlined" onClick={handleZoomIn} disabled={zoom >= 3}>
            <ZoomInIcon />
          </Button>
          <Button variant="outlined" onClick={handlePrev} disabled={isFirstFile}>
            Previous
          </Button>
          <Button variant="outlined" onClick={handleNext} disabled={isLastFile}>
            Next
          </Button>
        </Stack>

        {/* File Display */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            overflow: "auto",
          }}
        >
          {isImage && (
            <img
              src={fileUrl}
              alt="Uploaded File"
              style={{
                transform: `scale(${zoom})`,
                transition: "transform 0.2s ease-in-out",
                transformOrigin: "center",
                maxWidth: "100%",
                maxHeight: "81vh",
              }}
            />
          )}

          {isPDF && (
            <iframe
              title="PDF Viewer"
              src={fileUrl}
              style={{
                width: `${zoom * 100}%`,
                height: "81vh",
                border: "none",
              }}
            />
          )}
          {isPDF && (
            <Box>
              <Button
                variant="outlined"
                onClick={() => window.open(fileUrl, '_blank')}
                sx={{ mb: 2 }}
              >
                Open PDF in new tab
              </Button>
              <Box>Preview unavailable due to security restrictions.</Box>
              <Box>Open PDF in new tab</Box>
            </Box>
          )}

        </Box>
      </Box>
    </Modal>
  );
};

export default ImageViewer;

