import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Button } from '@mui/material';
import { useState } from 'react';
// import { ipcRenderer } from 'electron';

function Hello() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const newFile = e.target.files?.[0];
          if (newFile) {
            setFile(newFile);
          }
        }}
      />
      <Button
        onClick={() => {
          console.log(file);
          window.electron.ipcRenderer.sendMessage('search-image', {
            file: {
              path: file?.path,
              name: file?.name,
            },
          });
        }}
      >
        test
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
