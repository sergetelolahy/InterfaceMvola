import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHotel, 
  FaTachometerAlt, 
  FaBed, 
  FaConciergeBell, 
  FaTags, 
  FaUsers, 
  FaCog 
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: <FaTachometerAlt />, label: 'Tableau de bord', path: '/admin' },
    { icon: <FaBed />, label: 'Chambres', path: '/admin/chambres' },
    { icon: <FaConciergeBell />, label: 'Services', path: '/admin/services' },
    { icon: <FaTags />, label: 'Types de chambres', path: '/admin/types-chambres' },
    // { icon: <FaUsers />, label: 'Clients', path: '/admin/clients' },
    // { icon: <FaCog />, label: 'Paramètres', path: '/admin/parametres' },
  ];

  return (
    <>
      {/* Overlay pour mobile - IMPORTANT */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-indigo-800 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
      `}>
        <div className="p-4">
          <h1 className="text-2xl font-bold flex items-center">
            <FaHotel className="mr-2" /> Hôtel Serge
          </h1>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item, index) => (
          <NavLink
            to={item.path}
            end  // Uniquement pour le tableau de bord
            onClick={onClose}
            className={({ isActive }) =>
              `block py-3 px-6 transition-colors flex items-center ${
                isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'
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

export default Sidebar;