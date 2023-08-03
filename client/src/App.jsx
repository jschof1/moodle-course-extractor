import React, { useState } from 'react';

function App() {
  const [files, setFiles] = useState([]);

  const handleFilesUpload = (event) => {
    setFiles(event.target.files);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    // Submit the file
    fetch('http://localhost:1001/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (response.ok) {
        console.log('Files uploaded successfully');
        // Convert the file
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
        // Download the file
        window.location.href = 'http://localhost:1001/download';
      } else {
        throw new Error('Conversion failed');
      }
    })
    .catch(error => console.error(error));
  };
  

  return (
    <div>
      <input type="file" onChange={handleFilesUpload} multiple />
      <button onClick={handleSubmit}>Download</button>
    </div>
  );
}

export default App;