// presentation/components/reception/QuickActions.jsx
import { FaSignInAlt, FaSignOutAlt, FaClock } from 'react-icons/fa';

function QuickActions() {
  const quickCheckins = [
    { id: "RES-2024-005", client: "Dupuis Marc", room: "Ch. 208" },
    { id: "RES-2024-006", client: "Leroy Claire", room: "Suite 305" }
  ];

  const quickCheckouts = [
    { room: "Ch. 105", client: "Thomas Robert", time: "Départ 12:00" },
    { room: "Suite 201", client: "Petit Julie", time: "Départ 11:00" }
  ];

  const pendingReservations = [
    { id: "RES-2024-007", client: "Garcia Carlos", details: "2 chambres" },
    { id: "RES-2024-008", client: "Sanchez Maria", details: "Suite 405" }
  ];

  const handleAction = (type, item) => {
    switch (type) {
      case 'checkin':
        alert(`Check-in pour ${item.id}`);
        break;
      case 'checkout':
        alert(`Check-out pour ${item.room}`);
        break;
      case 'confirm':
        alert(`Confirmer ${item.id}`);
        break;
      case 'cancel':
        alert(`Annuler ${item.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Check-in rapide */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaSignInAlt className="text-green-500 mr-2" /> Check-in Rapide
        </h3>
        <div className="space-y-3">
          {quickCheckins.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">{item.id}</div>
                <div className="text-sm text-gray-600">{item.client} - {item.room}</div>
              </div>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={() => handleAction('checkin', item)}
              >
                Check-in
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Check-out rapide */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaSignOutAlt className="text-red-500 mr-2" /> Check-out Rapide
        </h3>
        <div className="space-y-3">
          {quickCheckouts.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium">{item.room}</div>
                <div className="text-sm text-gray-600">{item.client} - {item.time}</div>
              </div>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={() => handleAction('checkout', item)}
              >
                Check-out
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Réservations en attente */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaClock className="text-yellow-500 mr-2" /> En Attente
        </h3>
        <div className="space-y-3">
          {pendingReservations.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">{item.id}</div>
                <div className="text-sm text-gray-600">{item.client} - {item.details}</div>
              </div>
              <div className="flex space-x-1">
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => handleAction('confirm', item)}
                >
                  ✓
                </button>
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => handleAction('cancel', item)}
                >
                  ✗
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;