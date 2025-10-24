import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import ServiceTable from './ServicesTable';
import ServiceForm from './ServicesForm';
import { useServices } from '../../hooks/useServices';

const ServiceManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { services, loading, error, createService, updateService, deleteService } = useServices();

  // Filtrer les services selon la recherche
  const filteredServices = services.filter(service =>
    service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleSubmit = async (serviceData) => {
    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
      } else {
        await createService(serviceData);
        // Réinitialiser à la première page après création
        setCurrentPage(1);
      }
      setShowForm(false);
      setEditingService(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteService(id);
      
      // Ajuster la pagination après suppression si nécessaire
      const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
      if (filteredServices.length === 1 && currentPage > 1) {
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
      <ServiceForm
        service={editingService}
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
            placeholder="Rechercher un service..." 
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
          <FaPlus className="mr-2" /> Nouveau service
        </button>
      </div>
      
      {/* Tableau */}
      <ServiceTable
        services={filteredServices}
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

export default ServiceManagement;