import React from 'react';
import { 
  FaEdit, FaTrash, FaUser, FaUserFriends, FaRulerCombined, 
  FaWifi, FaTv, FaSnowflake, FaUtensils, FaShower, FaCoffee, 
  FaCar, FaUmbrellaBeach, FaDumbbell, FaPaw, FaConciergeBell 
} from 'react-icons/fa';

const ChambreGrid = ({ 
  chambres, 
  loading, 
  error, 
  onEdit, 
  onDelete,
  currentPage = 1,
  itemsPerPage = 4,
  onPageChange 
}) => {
  const getChambreImage = (chambre) => {
    const images = {
      deluxe: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
      standard: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop',
      suite: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=250&fit=crop',
      familiale: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop'
    };
    
    const type = chambre.typeChambreNom?.toLowerCase() || 'standard';
    if (type.includes('deluxe')) return images.deluxe;
    if (type.includes('suite')) return images.suite;
    if (type.includes('familial')) return images.familiale;
    return images.standard;
  };

  const getServiceIcon = (serviceNom) => {
    const nom = serviceNom?.toLowerCase() || '';
    if (nom.includes('wifi')) return <FaWifi className="mr-1" />;
    if (nom.includes('tv')) return <FaTv className="mr-1" />;
    if (nom.includes('clim')) return <FaSnowflake className="mr-1" />;
    if (nom.includes('cuisine')) return <FaUtensils className="mr-1" />;
    if (nom.includes('douche')) return <FaShower className="mr-1" />;
    if (nom.includes('café')) return <FaCoffee className="mr-1" />;
    if (nom.includes('parking')) return <FaCar className="mr-1" />;
    if (nom.includes('plage')) return <FaUmbrellaBeach className="mr-1" />;
    if (nom.includes('gym')) return <FaDumbbell className="mr-1" />;
    if (nom.includes('animaux')) return <FaPaw className="mr-1" />;
    return <FaConciergeBell className="mr-1" />;
  };

  const getServiceLabel = (service) => {
    if (typeof service === 'object' && service.nom) return service.nom;
    if (typeof service === 'string') return service;
    return 'Service';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      try {
        await onDelete(id);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(chambres.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = chambres.slice(indexOfFirst, indexOfLast);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Chargement des chambres...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 font-medium">Erreur lors du chargement</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <div className="text-gray-500 text-lg">Aucune chambre trouvée</div>
            <div className="text-gray-400 text-sm mt-2">
              Essayez de modifier vos critères ou ajoutez une nouvelle chambre
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentItems.map((chambre) => (
              <div 
                key={chambre.id} 
                className="relative group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                {/* Image et badges */}
                <div className="relative">
                  <img 
                    src={getChambreImage(chambre)} 
                    alt={`Chambre ${chambre.numero}`}
                    className="w-full h-48 object-cover"
                  />

                  {/* Tooltip - nombre de lits */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    🛏️  <span>{chambre.typeChambrenbrLit} lit{chambre.typeChambrenbrLit > 1 ? 's' : ''}</span>
                  </div>

                  {/* Badge de disponibilité */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Disponible
                    </span>
                  </div>

                  {/* Badge privé / partagé */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      chambre.estPrive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {chambre.estPrive ? 'Privée' : 'Partagée'}
                    </span>
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Chambre {chambre.numero}
                    </h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {chambre.prix}€
                      </div>
                      <div className="text-gray-500 text-sm">par nuit</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 capitalize">
                    {chambre.typeChambreNom}
                  </p>

                  <div className="flex items-center text-gray-500 mb-4">
                    {chambre.estPrive ? (
                      <>
                        <FaUserFriends className="text-sm mr-1" />
                        <span className="text-sm">
                          {chambre.maxPersonnes || 2} personne{chambre.maxPersonnes > 1 ? 's' : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaUser className="text-sm mr-1" />
                        <span className="text-sm">1 personne</span>
                      </>
                    )}
                    <FaRulerCombined className="ml-4 text-sm mr-1" />
                    <span className="text-sm">{chambre.estPrive ? '35' : '20'}m²</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {chambre.services && chambre.services.length > 0 ? (
                      chambre.services.map((service, index) => (
                        <span 
                          key={service.id || index} 
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center"
                        >
                          {getServiceIcon(getServiceLabel(service))}
                          {getServiceLabel(service)}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Aucun service disponible</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Voir détails
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onEdit(chambre)}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button 
                        onClick={() => handleDelete(chambre.id)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {chambres.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{indexOfFirst + 1}</span> à{' '}
            <span className="font-medium">{Math.min(indexOfLast, chambres.length)}</span> sur{' '}
            <span className="font-medium">{chambres.length}</span> résultats
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            {getPageNumbers().map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`w-10 h-10 rounded-lg border ${
                  currentPage === pageNumber
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChambreGrid;
