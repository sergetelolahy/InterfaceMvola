// presentation/Components/layout/SidebarReception.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHotel, 
  FaTachometerAlt, 
  FaCalendarCheck,
  FaUsers, 
  FaBed, 
  FaConciergeBell, 
  FaFileInvoice,
  FaSignOutAlt 
} from 'react-icons/fa';

const SidebarReception = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: <FaTachometerAlt />, label: 'Tableau de bord', path: '/reception', exact: true },
    { icon: <FaCalendarCheck />, label: 'Réservations', path: '/reception/reservations' },
    { icon: <FaUsers />, label: 'Clients', path: '/reception/clients' },
    { icon: <FaBed />, label: 'Chambres', path: '/reception/chambres' },
    { icon: <FaConciergeBell />, label: 'Services', path: '/reception/services' },
    { icon: <FaFileInvoice />, label: 'Facturation', path: '/reception/facturation' },
    { icon: <FaSignOutAlt />, label: 'Déconnexion', path: '/logout' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
      `}>
        <div className="p-4">
          <h1 className="text-2xl font-bold flex items-center">
            <FaHotel className="mr-2" /> Hôtel Luxe
          </h1>
          <p className="text-blue-200 text-sm mt-1">Interface Réceptionniste</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `block py-3 px-6 transition-colors flex items-center ${
                  isActive ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`
              }
            >
              {item.icon} <span className="ml-2">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SidebarReception;