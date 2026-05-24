import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import DatasetListPage from './pages/DatasetListPage';
import DatasetUploadPage from './pages/DatasetUploadPage';
import DatasetPanelPage from "./pages/DatasetPanelPage.tsx";

export default function App(): React.ReactElement {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DashboardPage/>}/>
                <Route path="/datasets" element={<DatasetListPage/>}/>
                <Route path="/datasets/upload" element={<DatasetUploadPage/>}/>
                <Route path="/datasets/:datasetId" element={<DatasetPanelPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}