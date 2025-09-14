import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TestMvola from './pages/TestMvola';

const AppRoute = () =>{
    return(
     <Routes >
        <Route path='/' element={<Login/>} />
        <Route path='/Mvola' element={< TestMvola />} />
     </Routes>
    )
};

export default AppRoute;