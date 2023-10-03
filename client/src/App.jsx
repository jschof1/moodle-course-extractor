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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  
  useEffect(() => {
    fetch('http://localhost:1001/user', { credentials: 'include' }) 
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setUser(data.user);
        setLoading(false); // Set loading to false after getting the response
      })
      .catch(error => {
        console.error(error);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, []); 


  const handleFilesUpload = (event) => {
    setFiles(event.target.files);
  
    const formData = new FormData();
    for (let i = 0; i < event.target.files.length; i++) {
      formData.append('file', event.target.files[i]);
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
          // Fetch the preview after successful conversion
          return fetch('http://localhost:1001/preview')
            .then(res => res.text())
            .then(text => {
              setPreview(text);
            })
            .catch(error => console.error(error));
        } else {
          throw new Error('Conversion failed');
        }
      })
      .catch(error => console.error(error));
  };
  
  const handleSubmit = () => {
    // When the Download button is pressed, simply redirect to the download endpoint
    window.location.href = 'http://localhost:1001/download';
  };
  // useEffect(() => {
  //   // Fetch preview after file conversion
  //   fetch('http://localhost:1001/preview')
  //     .then(res => res.text())
  //     .then(text => setPreview(text))
  //     .catch(error => console.error(error));
  // }, [files]);

  if (loading) {
    return <div>Loading...</div>;
  }
  const handleClear = () => {
    fetch('http://localhost:1001/clear', {
      method: 'POST',
    })
      .then(response => {
        if (response.ok) {
          console.log('Directories cleared successfully');
        } else {
          throw new Error('Clearing directories failed');
        }
      })
      .catch(error => console.error(error));
  };
  if (!user) {
    return (
      <Button variant="contained" color="primary" href="http://localhost:1001/auth/google">
        Sign in with Google
      </Button>
    );
  }
  else {

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
          <Button variant="contained" color="secondary" onClick={handleClear}>
  Clear Files
</Button>
        </Box>
      </Paper>
      {preview && (
        <div style={{ overflow: 'auto', height: '100vh', width: '100%', border: '1px solid #ccc', marginTop: '20px' }}>
          <iframe srcDoc={preview} title="Preview" style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </>
  );
      }
}

export default App;
