import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemIcon, ListItemText, Button, Box, Paper, Typography, Dialog, DialogContent, DialogTitle, DialogContentText, Icon } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CheckCircle from '@mui/icons-material/CheckCircle';

const theme = createTheme({
  typography: {
    fontFamily: 'Helvetica, Arial, sans-serif',
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetch("http://localhost:1001/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data.user);
        setLoading(false); // Set loading to false after getting the response
      })
      .catch((error) => {
        console.error(error);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, []);

  const handleFilesUpload = (event) => {
    setFiles(event.target.files);

    const formData = new FormData();
    for (let i = 0; i < event.target.files.length; i++) {
      formData.append("file", event.target.files[i]);
    }
    setFileLoading(true);
    fetch("http://localhost:1001/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Files uploaded successfully");
          return fetch("http://localhost:1001/convert", {
            method: "POST",
          });
        } else {
          throw new Error("Upload failed");
        }
      })
      .then((response) => {
        if (response.ok) {
          console.log("Files converted successfully");
          // Fetch the preview after successful conversion
          return fetch("http://localhost:1001/preview")
            .then((res) => res.text())
            .then((text) => {
              setPreview(text);
            })
            .catch((error) => console.error(error));
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
    window.location.href = "http://localhost:1001/download";
  };
  // useEffect(() => {
  //   // Fetch preview after file conversion
  //   fetch('http://localhost:1001/preview')
  //     .then(res => res.text())
  //     .then(text => setPreview(text))
  //     .catch(error => console.error(error));
  // }, [files]);


  const handleClear = () => {
    setPreview(null); // Clear the preview immediately
    event.target.value = null;

    // Reset the file input value
    const fileInput = document.getElementById("contained-button-file");
    if (fileInput) {
      fileInput.value = null;
    }
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
        href="http://localhost:1001/auth/google"
      >
        Sign in with Google
      </Button>
    );
  } else {
    return (
      <ThemeProvider theme={theme}>
        {/* create a small button with a model which explains how it works */}
        <Button
        size="small"
        color="primary"
        onClick={handleClickOpen}
        style={{ position: 'absolute', top: '10px', right: '10px' }}
      >
        How it works?
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"How to use the Moodle Course Extractor"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          <Typography variant="body1" gutterBottom>
  The Moodle Course Extractor streamlines the process of extracting content from your Moodle courses. By following these steps, you can easily extract course material for further use or analysis:
</Typography>

<List>
  <ListItem>
    <ListItemIcon>
        <CheckCircle />
    </ListItemIcon>
    <ListItemText primary="Backup Your Moodle Course" secondary="Start by accessing your Moodle platform. Navigate to the specific course you aim to extract and initiate a backup process. Once created, download this backup file onto your computer." />
  </ListItem>

  <ListItem>
    <ListItemIcon>
        <CheckCircle />
    </ListItemIcon>
    <ListItemText primary="Prepare the Backup for Extraction" secondary="Once you have the backup file, change its file extension from `.mbz` to `.zip`. With the file extension modified, proceed to unzip this file to access its contents." />
  </ListItem>

  <ListItem>
    <ListItemIcon>
        <CheckCircle />
    </ListItemIcon>
    <ListItemText primary="Repackage the Relevant Content" secondary="Inside the unzipped folder, rezip its entire contents" />
  </ListItem>

  <ListItem>
    <ListItemIcon>
        <CheckCircle />
    </ListItemIcon>
    <ListItemText primary="To Extract a Different Course" secondary="Click the 'Clear Files' button." />
  </ListItem>
</List>
          </DialogContentText>
        </DialogContent>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </Dialog>
      <Typography variant="h4" align="center" gutterBottom fontWeight={600} pt={3}>
        Extract Moodle pages
      </Typography>
      <Paper>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="10vh"
          flexDirection="row"
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
        <Paper elevation={3} style={{ overflow: 'auto', height: '100vh', marginTop: '20px', padding: '20px' }}>
        <iframe srcDoc={preview} title="Preview" style={{ width: '100%', height: '90vh', border: 'none' }} />
    </Paper>
      ) : null}
      </ThemeProvider>
    )
  }
}

export default App;
