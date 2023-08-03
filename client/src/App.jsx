import React, { useState, useEffect } from 'react';
import { Button, Box, Paper, Typography } from '@mui/material';

const FileInput = ({ accept, id, multiple, type, onChange }) => {
  return (
    <input
      accept={accept}
      id={id}
      multiple={multiple}
      type={type}
      onChange={onChange}
      style={{ display: 'none' }}
    />
  );
};

function App() {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);

  const handleFilesUpload = (event) => {
    setFiles(event.target.files);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    fetch('http://localhost:1001/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (response.ok) {
        console.log('Files uploaded successfully');
        return fetch('http://localhost:1001/convert', {
          method: 'POST',
        });
      } else {
        throw new Error('Upload failed');
      }
    })
    .then(response => {
      if (response.ok) {
        console.log('Files converted successfully');
        window.location.href = 'http://localhost:1001/download';
      } else {
        throw new Error('Conversion failed');
      }
    })
    .catch(error => console.error(error));
  };

  useEffect(() => {
    // Fetch preview after file conversion
    fetch('http://localhost:1001/preview')
      .then(res => res.text())
      .then(text => setPreview(text));
  }, [files]);

  return (
    <>
    <Typography variant="h4" align="center" gutterBottom>
      Extract Moodle pages 
    </Typography>
    <Paper elevation={3}>
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
    </Box>
    </Paper>
    {preview && 
      <div style={{ overflow: "auto", height: "100vh", width: "100%", border: "1px solid #ccc", marginTop: "20px" }}>
        <iframe srcDoc={preview} title="Preview" style={{ width: "100%", height: "100%" }} />
      </div>
    }
    </>
  );
}

export default App;
