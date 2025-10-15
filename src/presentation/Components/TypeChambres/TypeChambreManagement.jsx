import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import TypeChambreTable from './TypeChambreTable';
import TypeChambreForm from './TypeChambreForm';
import { useTypeChambres } from '../../hooks/useTypeChambres';

const TypeChambreManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTypeChambre, setEditingTypeChambre] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { typeChambres, loading, error, createTypeChambre, updateTypeChambre, deleteTypeChambre } = useTypeChambres();

  // Filtrer les types de chambres selon la recherche
  const filteredTypeChambres = typeChambres.filter(type =>
    type.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Réinitialiser à la page 1 quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreate = () => {
    setEditingTypeChambre(null);
    setShowForm(true);
  };

  const handleEdit = (typeChambre) => {
    setEditingTypeChambre(typeChambre);
    setShowForm(true);
  };

  const handleSubmit = async (typeChambreData) => {
    try {
      if (editingTypeChambre) {
        await updateTypeChambre(editingTypeChambre.id, typeChambreData);
      } else {
        await createTypeChambre(typeChambreData);
        // Réinitialiser à la première page après création
        setCurrentPage(1);
      }
      setShowForm(false);
      setEditingTypeChambre(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTypeChambre(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTypeChambre(id);
      
      // Si on supprime le dernier élément de la page, reculer d'une page
      const totalPages = Math.ceil(filteredTypeChambres.length / itemsPerPage);
      const currentItemsCount = filteredTypeChambres.length;
      
      if (currentItemsCount === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (showForm) {
    return (
      <TypeChambreForm
        typeChambre={editingTypeChambre}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow">
      {/* Barre du haut (recherche + bouton) */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Rechercher un type de chambre..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button 
          onClick={handleCreate}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg flex items-center w-full sm:w-auto justify-center"
        >
          <FaPlus className="mr-2" /> Nouveau type
        </button>
      </div>
      
      {/* Tableau */}
      <TypeChambreTable
        typeChambres={filteredTypeChambres}
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

export default TypeChambreManagement;