// presentation/Components/layout/HeaderReception.jsx
import { FaBars, FaBell } from 'react-icons/fa';

function HeaderReception({ onMenuToggle }) {
  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center p-4">
        <button 
          className="md:hidden text-gray-500"
          onClick={onMenuToggle}
        >
          <FaBars className="text-xl" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-800">
          Tableau de Bord Réception
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaBell className="text-gray-500" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
              3
            </span>
          </div>
          
          <div className="flex items-center">
            <img 
              src="https://ui-avatars.com/api/?name=Réceptionniste&background=0D8ABC&color=fff" 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
            <span className="ml-2 text-gray-700">Réceptionniste</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderReception;