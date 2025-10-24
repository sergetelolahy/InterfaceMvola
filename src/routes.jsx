
// import Login from './pages/Login';
// import TestMvola from './pages/TestMvola';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './presentation/Components/layout/Layout.jsx';
import Dashboard from './presentation/pages/Dashboard.jsx';
 import Chambres from './presentation/pages/Chambres.jsx';
 import Services from './presentation/pages/Services.jsx';
 import TypeChambres from './presentation/pages/TypeChambres.jsx';

const AppRoute = () =>{
    return(
     <Routes >
        <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="chambres" element={<Chambres />} />
        <Route path="services" element={<Services />} />
        <Route path="types-chambres" element={<TypeChambres />} />
        </Route>
     </Routes>
    )
};

export default AppRoute;