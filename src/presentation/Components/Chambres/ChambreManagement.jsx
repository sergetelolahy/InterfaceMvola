import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import ChambreTable from './ChambreTable';
import ChambreForm from './ChambreForm';
import { useChambres } from '../../hooks/useChambres';

const ChambreManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingChambre, setEditingChambre] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { chambres, loading, error, createChambre, updateChambre, deleteChambre } = useChambres();

  // Filtrer les chambres selon la recherche
  const filteredChambres = chambres.filter(chambre =>
    chambre.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chambre.typeChambre?.nom && chambre.typeChambre.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = () => {
    setEditingChambre(null);
    setShowForm(true);
  };

  const handleEdit = (chambre) => {
    setEditingChambre(chambre);
    setShowForm(true);
  };

  const handleSubmit = async (chambreData) => {
    try {
      if (editingChambre) {
        await updateChambre(editingChambre.id, chambreData);
      } else {
        await createChambre(chambreData);
        // Réinitialiser à la première page après création
        setCurrentPage(1);
      }
      setShowForm(false);
      setEditingChambre(null);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingChambre(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteChambre(id);
      
      // Ajuster la pagination après suppression si nécessaire
      const totalPages = Math.ceil(filteredChambres.length / itemsPerPage);
      if (filteredChambres.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (showForm) {
    return (
      <ChambreForm
        chambre={editingChambre}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow">
      {/* Table Header */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Retour à la page 1 lors de la recherche
            }}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button 
          onClick={handleCreate}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg flex items-center w-full sm:w-auto justify-center"
        >
          <FaPlus className="mr-2" /> Nouvelle chambre
        </button>
      </div>
      
      {/* Table */}
      <ChambreTable
        chambres={filteredChambres}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ChambreManagement;