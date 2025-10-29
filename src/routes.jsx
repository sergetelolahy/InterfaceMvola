
// import Login from './pages/Login';
// import TestMvola from './pages/TestMvola';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './presentation/Components/layout/Layout.jsx';
import Dashboard from './presentation/pages/Dashboard.jsx';
 import Chambres from './presentation/pages/Chambres.jsx';
 import Services from './presentation/pages/Services.jsx';
 import TypeChambres from './presentation/pages/TypeChambres.jsx';
import LayoutReception from './presentation/Components/LayouteReceptionniste/LayouteReception.jsx';
import DashboardReception from './presentation/pages/reception/DashboardReception.jsx';
import Reservation from './presentation/pages/reception/Reservation.jsx';
import Client from './presentation/pages/reception/Client.jsx';

const AppRoute = () =>{
    return(
     <Routes >
        <Route path="/admin" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="chambres" element={<Chambres />} />
        <Route path="services" element={<Services />} />
        <Route path="types-chambres" element={<TypeChambres />} />
        </Route>

         {/* Routes Réceptionniste */}
      <Route 
        path="/reception/" 
        element={
            <LayoutReception />}
      >
        <Route index element={<DashboardReception />} />
        <Route path="reservations" element={<Reservation />} />
        <Route path="clients" element={<Client />} />
        {/* <Route path="chambres" element={<ChambresReception />} />
        <Route path="services" element={<ServicesReception />} />
        <Route path="facturation" element={<FacturationReception />} /> */}
      </Route>
     </Routes>
    )
};

export default AppRoute;