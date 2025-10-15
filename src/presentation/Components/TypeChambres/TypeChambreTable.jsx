import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TypeChambreTable = ({ 
  typeChambres, 
  loading, 
  error, 
  onEdit, 
  onDelete,
  currentPage,
  itemsPerPage,
  onPageChange 
}) => {
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type de chambre ?')) {
      try {
        await onDelete(id);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  // Pagination basée sur les props
  const totalPages = Math.ceil(typeChambres.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = typeChambres.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personnes max</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de lits</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((typeChambre) => (
              <tr key={typeChambre.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap text-gray-900 font-medium">
                  {typeChambre.nom}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-gray-900">{typeChambre.maxPersonnes}</td>
                <td className="py-4 px-4 whitespace-nowrap text-gray-900">{typeChambre.nbrLit}</td>
                <td className="py-4 px-4">
                  <div className="text-gray-900 max-w-xs truncate" title={typeChambre.description}>
                    {typeChambre.description}
                  </div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onEdit(typeChambre)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(typeChambre.id)} className="text-red-600 hover:text-red-900">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-700">
          Affichage de <span className="font-medium">{indexOfFirst + 1}</span> à{' '}
          <span className="font-medium">{Math.min(indexOfLast, typeChambres.length)}</span> sur{' '}
          <span className="font-medium">{typeChambres.length}</span> résultats
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </>
  );
};

export default TypeChambreTable;