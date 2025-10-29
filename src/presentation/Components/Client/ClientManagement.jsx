import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import ClientTable from './ClientTable';
import ClientForm from './ClientForm';
import { useClients } from '../../hooks/useClients';

const ClientManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { clients, loading, error, createClient, updateClient, deleteClient } = useClients();

  // Filtrer les clients selon la recherche
  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleSubmit = async (clientData) => {
    try {
      if (editingClient) {
        console.log(editingClient.id);
        await updateClient(editingClient.id, clientData);
      } else {
        await createClient(clientData);
        // Réinitialiser à la première page après création
        setCurrentPage(1);
      }
      setShowForm(false);
      setEditingClient(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteClient(id);
      
      // Ajuster la pagination après suppression si nécessaire
      const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
      if (filteredClients.length === 1 && currentPage > 1) {
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
      <ClientForm
        client={editingClient}
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
            placeholder="Rechercher un client..." 
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
          <FaPlus className="mr-2" /> Nouveau client
        </button>
      </div>
      
      {/* Tableau */}
      <ClientTable
        clients={filteredClients}
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

export default ClientManagement;