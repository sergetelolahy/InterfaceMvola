import React from 'react';
import { FaBed, FaChartLine, FaEuroSign, FaArrowUp } from 'react-icons/fa';

const Dashboard = () => {
  const stats = [
    { label: 'Chambres totales', value: '42', icon: <FaBed />, color: 'blue', trend: '5%' },
    { label: 'Taux d\'occupation', value: '78%', icon: <FaChartLine />, color: 'green', trend: '12%' },
    { label: 'Revenu du mois', value: '24,560€', icon: <FaEuroSign />, color: 'purple', trend: '8%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                <div className={`text-${stat.color}-500 text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-green-500">
              <FaArrowUp className="inline mr-1" /> {stat.trend} depuis le mois dernier
            </div>
          </div>
        ))}
      </div>

      {/* Additional dashboard content */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Aperçu Récent</h2>
        <p className="text-gray-600">
          Bienvenue dans votre tableau de bord de gestion hôtelière. 
          Utilisez le menu de navigation pour accéder aux différentes sections.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;