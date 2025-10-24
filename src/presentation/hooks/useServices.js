import { useState, useEffect } from "react";

// Supposons que vous avez ces use cases et repository
import HttpServiceRepository from "../../infrastructure/repositories/HttpServiceRepository";
import GetServices from "../../application/use_cases/GetServices";
import CreateServices from "../../application/use_cases/CreateServices";
import DeleteServices from "../../application/use_cases/DeleteServices";
import UpdateServices from "../../application/use_cases/UpdateServices";

const serviceRepository = new HttpServiceRepository();
const getServicesUseCase = new GetServices(serviceRepository);
const createServiceUseCase = new CreateServices(serviceRepository);
const updateServiceUseCase = new UpdateServices(serviceRepository);
const deleteServiceUseCase = new DeleteServices(serviceRepository);


export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const servicesData = await getServicesUseCase.execute();

      let finalData = servicesData;
      
      // Extraction des données selon la structure de la réponse
      if (servicesData && !Array.isArray(servicesData)) {
        if (servicesData.data && Array.isArray(servicesData.data)) {
          finalData = servicesData.data;
        } else if (servicesData.services && Array.isArray(servicesData.services)) {
          finalData = servicesData.services;
        } else if (servicesData.content && Array.isArray(servicesData.content)) {
          finalData = servicesData.content;
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

      setServices(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur fetchServices:', err);
      setError(err.message || 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData) => {
    try {
      setError(null);
      await createServiceUseCase.execute(serviceData);
      await fetchServices(); // Recharge la liste avec le tri appliqué
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la création du service';
      setError(errorMessage);
      throw err;
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      setError(null);
      await updateServiceUseCase.execute(id, serviceData);
      await fetchServices();
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour du service';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteService = async (id) => {
    try {
      setError(null);
      await deleteServiceUseCase.execute(id);
      await fetchServices();
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la suppression du service';
      setError(errorMessage);
      throw err;
    }
  };

  // Recherche de services
  const searchServices = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const servicesData = await getServicesUseCase.execute();
      
      let finalData = servicesData;
      if (servicesData && !Array.isArray(servicesData)) {
        if (servicesData.data && Array.isArray(servicesData.data)) {
          finalData = servicesData.data;
        } else if (servicesData.services && Array.isArray(servicesData.services)) {
          finalData = servicesData.services;
        } else if (servicesData.content && Array.isArray(servicesData.content)) {
          finalData = servicesData.content;
        } else {
          finalData = [];
        }
      }

      // Filtrage côté client (ou côté serveur si votre API le supporte)
      if (Array.isArray(finalData) && searchTerm) {
        finalData = finalData.filter(service =>
          service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

      setServices(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur searchServices:', err);
      setError(err.message || 'Erreur lors de la recherche des services');
    } finally {
      setLoading(false);
    }
  };

  // Version avec pagination côté serveur (si votre API le supporte)
  const fetchServicesPaginated = async (page = 0, size = 10, sort = 'createdAt,desc') => {
    setLoading(true);
    setError(null);
    try {
      const servicesData = await getServicesUseCase.execute({
        page,
        size,
        sort
      });

      let finalData = servicesData;
      let paginationInfo = {};

      if (servicesData && !Array.isArray(servicesData)) {
        // Extraction des données
        if (servicesData.data && Array.isArray(servicesData.data)) {
          finalData = servicesData.data;
        } else if (servicesData.services && Array.isArray(servicesData.services)) {
          finalData = servicesData.services;
        } else if (servicesData.content && Array.isArray(servicesData.content)) {
          finalData = servicesData.content;
        } else {
          finalData = [];
        }

        // Extraction des informations de pagination
        paginationInfo = {
          page: servicesData.page || page,
          size: servicesData.size || size,
          totalPages: servicesData.totalPages || 0,
          totalElements: servicesData.totalElements || finalData.length
        };
      }

      setServices(Array.isArray(finalData) ? finalData : []);
      return paginationInfo;
    } catch (err) {
      console.error('🔴 Erreur fetchServicesPaginated:', err);
      setError(err.message || 'Erreur lors du chargement des services');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    searchServices,
    fetchServicesPaginated,
    refetch: fetchServices
  };
};