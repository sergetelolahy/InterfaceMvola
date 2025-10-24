import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ServiceTable = ({ 
  services, 
  loading, 
  error, 
  onEdit, 
  onDelete,
  currentPage = 1,
  itemsPerPage = 5,
  onPageChange 
}) => {
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await onDelete(id);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  // Affichage du state de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Chargement des services...</span>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 font-medium">Erreur lors du chargement</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  // Calculs de pagination
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = services.slice(indexOfFirst, indexOfLast);

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajuster si on est près de la fin
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900 font-medium">{service.id}</div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="text-gray-900 font-medium">{service.nom}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-900 max-w-md truncate" title={service.description}>
                    {service.description}
                  </div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onEdit(service)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentItems.length === 0 && services.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">⚙️</div>
            <div className="text-gray-500 text-lg">Aucun service trouvé</div>
            <div className="text-gray-400 text-sm mt-2">
              Ajoutez votre premier service pour commencer
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination fonctionnelle */}
      {services.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{indexOfFirst + 1}</span> à{' '}
            <span className="font-medium">{Math.min(indexOfLast, services.length)}</span> sur{' '}
            <span className="font-medium">{services.length}</span> résultats
          </div>
          
          <div className="flex space-x-1">
            {/* Bouton Précédent */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            {/* Première page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50"
                >
                  1
                </button>
                {currentPage > 4 && (
                  <span className="px-2 py-1 text-gray-500">...</span>
                )}
              </>
            )}

            {/* Pages numérotées */}
            {getPageNumbers().map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-3 py-1 rounded border ${
                  currentPage === pageNumber
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            {/* Dernière page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="px-2 py-1 text-gray-500">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Bouton Suivant */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceTable;