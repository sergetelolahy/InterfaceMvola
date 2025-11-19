import { useState, useEffect } from "react";

// Supposons que vous avez ces use cases et repository
import HttpClientRepository from "../../infrastructure/repositories/HttpClientRepository";
import CreateClient from "../../application/use_cases/reception/CreateClient";
import DeleteClient from "../../application/use_cases/reception/DeleteClient";
import UpdateClient from "../../application/use_cases/reception/UpdateClient";
import GetClient from "../../application/use_cases/reception/GetClient";
import Client from "../pages/reception/Client";

const clientRepository = new HttpClientRepository();
const getClientsUseCase = new GetClient(clientRepository);
const createClientUseCase = new CreateClient(clientRepository);
const updateClientUseCase = new UpdateClient(clientRepository);
const deleteClientUseCase = new DeleteClient(clientRepository);

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientsData = await getClientsUseCase.execute();

      let finalData = clientsData;
      
      // Extraction des données selon la structure de la réponse
      if (clientsData && !Array.isArray(clientsData)) {
        if (clientsData.data && Array.isArray(clientsData.data)) {
          finalData = clientsData.data;
        } else if (clientsData.clients && Array.isArray(clientsData.clients)) {
          finalData = clientsData.clients;
        } else if (clientsData.content && Array.isArray(clientsData.content)) {
          finalData = clientsData.content;
        } else {
          finalData = [];
        }
      }

      // Tri par date de création décroissante (les plus récents en premier)
      if (Array.isArray(finalData)) {
        finalData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.dateCreation || 0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.dateCreation || 0);
          return dateB - dateA; // Décroissant
        });
      }

      setClients(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur fetchClients:', err);
      setError(err.message || 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  // Dans useClients.js

const createClient = async (clientData) => {
  try {
    setError(null);
    // Utilisation du use case pour créer le client et RETOURNER la réponse
    const response = await createClientUseCase.execute(clientData);
    
    // Recharge la liste des clients après création
    await fetchClients();
    
    // RETOURNER la réponse pour pouvoir l'utiliser
    return response;
    
  } catch (err) {
    console.error('💥 Erreur détaillée création client:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      config: err.config?.data
    });
    const errorMessage = err.message || 'Erreur lors de la création du client';
    setError(errorMessage);
    throw err;
  }
};

  const updateClient = async (id, clientData) => {
    try {
      console.log("id".id);
      setError(null);
      await updateClientUseCase.execute(id, clientData);
      await fetchClients();
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour du client';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      setError(null);
      await deleteClientUseCase.execute(id);
      await fetchClients();
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la suppression du client';
      setError(errorMessage);
      throw err;
    }
  };

  // Recherche de clients
  const searchClients = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const clientsData = await getClientsUseCase.execute();
      
      let finalData = clientsData;
      if (clientsData && !Array.isArray(clientsData)) {
        if (clientsData.data && Array.isArray(clientsData.data)) {
          finalData = clientsData.data;
        } else if (clientsData.clients && Array.isArray(clientsData.clients)) {
          finalData = clientsData.clients;
        } else if (clientsData.content && Array.isArray(clientsData.content)) {
          finalData = clientsData.content;
        } else {
          finalData = [];
        }
      }

      // Filtrage côté client (ou côté serveur si votre API le supporte)
      if (Array.isArray(finalData) && searchTerm) {
        finalData = finalData.filter(client =>
          client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.cin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.tel.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Tri par date de création décroissante
      if (Array.isArray(finalData)) {
        finalData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.dateCreation || 0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.dateCreation || 0);
          return dateB - dateA;
        });
      }

      setClients(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur searchClients:', err);
      setError(err.message || 'Erreur lors de la recherche des clients');
    } finally {
      setLoading(false);
    }
  };

  // Version avec pagination côté serveur (si votre API le supporte)
  const fetchClientsPaginated = async (page = 0, size = 10, sort = 'createdAt,desc') => {
    setLoading(true);
    setError(null);
    try {
      const clientsData = await getClientsUseCase.execute({
        page,
        size,
        sort
      });

      let finalData = clientsData;
      let paginationInfo = {};

      if (clientsData && !Array.isArray(clientsData)) {
        // Extraction des données
        if (clientsData.data && Array.isArray(clientsData.data)) {
          finalData = clientsData.data;
        } else if (clientsData.clients && Array.isArray(clientsData.clients)) {
          finalData = clientsData.clients;
        } else if (clientsData.content && Array.isArray(clientsData.content)) {
          finalData = clientsData.content;
        } else {
          finalData = [];
        }

        // Extraction des informations de pagination
        paginationInfo = {
          page: clientsData.page || page,
          size: clientsData.size || size,
          totalPages: clientsData.totalPages || 0,
          totalElements: clientsData.totalElements || finalData.length
        };
      }

      setClients(Array.isArray(finalData) ? finalData : []);
      return paginationInfo;
    } catch (err) {
      console.error('🔴 Erreur fetchClientsPaginated:', err);
      setError(err.message || 'Erreur lors du chargement des clients');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    fetchClientsPaginated,
    refetch: fetchClients
  };
};