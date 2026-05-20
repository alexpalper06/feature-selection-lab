// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import DatasetListPage from './pages/DatasetListPage';
import DatasetUploadPage from './pages/DatasetUploadPage';

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/datasets" element={<DatasetListPage />} />
        <Route path="/datasets/upload" element={<DatasetUploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}