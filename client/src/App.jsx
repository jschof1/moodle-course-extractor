import React, { useState, useEffect } from "react";

import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CheckCircle from "@mui/icons-material/CheckCircle";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import logo from "./assets/odi-logo.png";
import IconButton from "@mui/material/IconButton";

const theme = createTheme({
  typography: {
    fontFamily: "Helvetica, Arial, sans-serif",
  },
});

const FileInput = ({ accept, id, multiple, type, onChange }) => {
  return (
    <input
      accept={accept}
      id={id}
      multiple={multiple}
      type={type}
      onChange={onChange}
      style={{ display: "none" }}
    />
  );
};

function App() {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleOpenFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const navigateToHome = () => {
    setIsFullscreen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetch("/api/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data.user);
        setLoading(false); 
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleFilesUpload = (event) => {
    setFiles(event.target.files);

    const formData = new FormData();
    for (let i = 0; i < event.target.files.length; i++) {
      formData.append("file", event.target.files[i]);
    }

    setFileLoading(true);

    // First, call the /process-file endpoint
    fetch("api/process-file", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Files processed successfully");
          // Then convert the files
          return fetch("api/convert", {
            method: "POST",
          });
        } else {
          throw new Error("Processing failed");
        }
      })
      .then((response) => {
        if (response.ok) {
          console.log("Files converted successfully");

          // Fetch the preview after successful conversion
          return fetch("api/preview")
            .then((res) => res.text())
            .then((text) => {
              setPreview(text);
            });
        } else {
          throw new Error("Conversion failed");
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setFileLoading(false); // End the loading state
      });
  };

  const handleSubmit = () => {
    window.location.href = "api/download";
  };

  const handleClear = () => {
    setPreview(null); // Clear the preview immediately
    event.target.value = null;
    // Reset the file input value
    const fileInput = document.getElementById("contained-button-file");
    if (fileInput) {
      fileInput.value = null;
    }

    fetch("api/clear", {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Directories cleared successfully");
        } else {
          throw new Error("Clearing directories failed");
        }
      })
      .catch((error) => console.error(error));
  };
  if (!user) {
    return (
      <Button
        variant="contained"
        color="primary"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        href="/auth/google"
      >
        Sign in with Google
      </Button>
    );
  } else {
    return (
      <ThemeProvider theme={theme}>
        {/* wrap in nav bar with blue background */}
        <Box sx={{ flexGrow: 1, borderRadius: 0 }}>
          <Paper
            sx={{ p: 4, mb: 1, borderRadius: 0 }}
            elevation={0}
            style={{ backgroundColor: "#0B3D91" }}
          >
            {/* add my odi-logo.svg to left hand corner */}
            <img
              src={logo}
              alt="ODI Logo"
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                height: "30px",
                margin: "8px",
              }}
            />
            <Button
              size="small"
              onClick={handleClickOpen}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                padding: "10px",
                color: "white",
              }}
            >
              Instructions
            </Button>
          </Paper>
        </Box>
        <Dialog
          open={open}
          onClose={handleClose}
          // add padding to dialog
          PaperProps={{
            style: {
              padding: "20px",
              color: "#0B3D91",
            },
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"How to use the Moodle Course Extractor"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Typography variant="body1" gutterBottom>
                The Moodle Course Extractor streamlines the process of
                extracting content from your Moodle courses. By following these
                steps, you can easily extract course material for further use or
                analysis:
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Backup Your Moodle Course"
                    secondary="Start by accessing your Moodle platform. Navigate to the specific course you aim to extract and initiate a backup process. Once created, download this backup file onto your computer."
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Prepare the Backup for Extraction"
                    secondary="Once you have the backup file downloaded you may upload it to the Moodle Course Extractor. Click the 'Upload' button and select the backup file you downloaded from Moodle."
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="To Extract a Different Course"
                    secondary="Click the 'Clear Files' button."
                  />
                </ListItem>
              </List>
              <Typography variant="body1" gutterBottom>
                <b>Important Note:</b> The Moodle Course Extractor can only
                extract 'pages' and 'SCORM' activity text right now.
              </Typography>

              <Typography variant="body2" pt={3}>
                {" "}
                If you have any questions or feedback,{" "}
                <a href="mailto:training@theodi.org">please contact us</a>.
              </Typography>
            </DialogContentText>
          </DialogContent>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </Dialog>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          fontWeight={600}
          pt={3}
        >
          Moodle Course Extractor
        </Typography>
        <Paper elevation={0}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="10vh"
            flexDirection="row"
            padding={0}
            gap={2}
          >
            <label htmlFor="contained-button-file">
              <FileInput
                accept="*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleFilesUpload}
              />
              <Button variant="contained" component="span">
                Upload
              </Button>
            </label>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Download
            </Button>
            <Button variant="contained" color="secondary" onClick={handleClear}>
              Clear Files
            </Button>
          </Box>
        </Paper>

        {fileLoading ? (
          <Typography variant="h4" pt={4} align="center" gutterBottom>
            Loading...
          </Typography>
        ) : preview ? (
          // center paper
          <>
            <Grid container justifyContent="center">
              <Paper
                elevation={3}
                style={{
                  overflow: "none",
                  height: "100vh",
                  width: "60em",
                  marginTop: "40px",
                  position: "relative",
                }}
              >
                <iframe
                  srcDoc={preview}
                  title="Preview"
                  style={{ width: "100%", height: "90vh", border: "none" }}
                />
                <IconButton
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                  onClick={handleOpenFullscreen}
                >
                  <FullscreenIcon />
                </IconButton>
              </Paper>
            </Grid>
            <Dialog
              open={isFullscreen}
              onClose={handleCloseFullscreen}
              fullScreen
            >
              <IconButton
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 2000,
                }}
                onClick={navigateToHome}
              >
                <CloseIcon />
              </IconButton>
              <iframe
                srcDoc={preview}
                title="Preview Fullscreen"
                style={{ width: "100%", height: "100vh", border: "none" }}
              />
            </Dialog>
          </>
        ) : null}
      </ThemeProvider>
    );
  }
}

export default App;
