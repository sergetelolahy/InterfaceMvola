import { useState, useEffect } from "react";

// Import des use cases et repository pour les réservations
import HttpReservationRepository from "../../infrastructure/repositories/HttpReservationRepository";
import CreateReservation from "../../application/use_cases/reception/CreateReservation";
import DeleteReservation from "../../application/use_cases/reception/DeleteReservation";
import UpdateReservation from "../../application/use_cases/reception/UpdateReservation";
import GetReservation from "../../application/use_cases/reception/GetReservation";

const reservationRepository = new HttpReservationRepository();
const getReservationsUseCase = new GetReservation(reservationRepository);
const createReservationUseCase = new CreateReservation(reservationRepository);
const updateReservationUseCase = new UpdateReservation(reservationRepository);
const deleteReservationUseCase = new DeleteReservation(reservationRepository);

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData = await getReservationsUseCase.execute();

      let finalData = reservationsData;
      
      // Extraction des données selon la structure de la réponse
      if (reservationsData && !Array.isArray(reservationsData)) {
        if (reservationsData.data && Array.isArray(reservationsData.data)) {
          finalData = reservationsData.data;
        } else if (reservationsData.reservations && Array.isArray(reservationsData.reservations)) {
          finalData = reservationsData.reservations;
        } else if (reservationsData.content && Array.isArray(reservationsData.content)) {
          finalData = reservationsData.content;
        } else {
          finalData = [];
        }
      }

      // Tri par date de création décroissante (les plus récents en premier)
      if (Array.isArray(finalData)) {
        finalData.sort((a, b) => {
          // ⚠️ CORRECTION : Utiliser date_creation au lieu de date
          const dateA = a.date_creation ? new Date(a.date_creation) : new Date(a.createdAt || 0);
          const dateB = b.date_creation ? new Date(b.date_creation) : new Date(b.createdAt || 0);
          return dateB - dateA; // Décroissant
        });
      }

      setReservations(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur fetchReservations:', err);
      setError(err.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData) => {
    try {
      setError(null);
      
      console.log('🔄 useReservations - Données reçues:', reservationData);
      
      // Vérification des données obligatoires
      if (!reservationData.id_client || !reservationData.id_chambre) {
        throw new Error('Données manquantes: id_client ou id_chambre requis');
      }
  
      console.log('🔍 useReservations - Vérification des données:', {
        id_client: reservationData.id_client,
        id_chambre: reservationData.id_chambre,
        date_debut: reservationData.date_debut,
        date_fin: reservationData.date_fin
      });
  
      // Utiliser le use case existant au lieu d'axios directement
      const nouvelleReservation = await createReservationUseCase.execute(reservationData);
      
      console.log('✅ useReservations - Réservation créée:', nouvelleReservation);
      
      // Recharge la liste des réservations après création
      await fetchReservations();
      
      return nouvelleReservation;
    } catch (err) {
      console.error('💥 Erreur détaillée création réservation:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config?.data
      });
      const errorMessage = err.message || 'Erreur lors de la création de la réservation';
      setError(errorMessage);
      throw err;
    }
  };
  
  const updateReservation = async (id, reservationData) => {
    try {
      console.log("🔄 Mise à jour réservation ID:", id, reservationData);
      setError(null);
      
      // ⚠️ CORRECTION : Préparer les données pour la relation n-n
      const reservationWithChambres = {
        ...reservationData,
        chambres: reservationData.chambres ? reservationData.chambres.map(chambre => ({
          id: chambre.id,
          date_debut: reservationData.date_debut,
          date_fin: reservationData.date_fin,
          prix: chambre.prix
        })) : []
      };
      
      await updateReservationUseCase.execute(id, reservationWithChambres);
      await fetchReservations();
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour de la réservation';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteReservation = async (id) => {
    try {
      setError(null);
      await deleteReservationUseCase.execute(id);
      await fetchReservations();
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la suppression de la réservation';
      setError(errorMessage);
      throw err;
    }
  };

  // Recherche de réservations
  const searchReservations = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData = await getReservationsUseCase.execute();
      
      let finalData = reservationsData;
      if (reservationsData && !Array.isArray(reservationsData)) {
        if (reservationsData.data && Array.isArray(reservationsData.data)) {
          finalData = reservationsData.data;
        } else if (reservationsData.reservations && Array.isArray(reservationsData.reservations)) {
          finalData = reservationsData.reservations;
        } else if (reservationsData.content && Array.isArray(reservationsData.content)) {
          finalData = reservationsData.content;
        } else {
          finalData = [];
        }
      }

      // ⚠️ CORRECTION : Filtrage avec la nouvelle structure
      if (Array.isArray(finalData) && searchTerm) {
        finalData = finalData.filter(reservation => {
          const searchLower = searchTerm.toLowerCase();
          
          // Recherche dans les données client
          const clientNom = reservation.client?.nom || '';
          const clientPrenom = reservation.client?.prenom || '';
          const clientEmail = reservation.client?.email || '';
          
          // Recherche dans les données chambres
          const chambreNumero = reservation.chambres?.[0]?.numero || '';
          const chambreType = reservation.chambres?.[0]?.type || '';
          
          return (
            clientNom.toLowerCase().includes(searchLower) ||
            clientPrenom.toLowerCase().includes(searchLower) ||
            clientEmail.toLowerCase().includes(searchLower) ||
            chambreNumero.toLowerCase().includes(searchLower) ||
            chambreType.toLowerCase().includes(searchLower) ||
            (reservation.statut && reservation.statut.toLowerCase().includes(searchLower)) ||
            (reservation.date_debut && reservation.date_debut.includes(searchTerm)) ||
            (reservation.date_fin && reservation.date_fin.includes(searchTerm))
          );
        });
      }

      // Tri par date de création décroissante
      if (Array.isArray(finalData)) {
        finalData.sort((a, b) => {
          // ⚠️ CORRECTION : Utiliser date_creation
          const dateA = a.date_creation ? new Date(a.date_creation) : new Date(a.createdAt || 0);
          const dateB = b.date_creation ? new Date(b.date_creation) : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      }

      setReservations(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur searchReservations:', err);
      setError(err.message || 'Erreur lors de la recherche des réservations');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les réservations par client
  const getReservationsByClientId = async (clientId) => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData = await reservationRepository.getByClientId(clientId);
      
      let finalData = reservationsData;
      if (reservationsData && !Array.isArray(reservationsData)) {
        if (reservationsData.data && Array.isArray(reservationsData.data)) {
          finalData = reservationsData.data;
        } else if (reservationsData.reservations && Array.isArray(reservationsData.reservations)) {
          finalData = reservationsData.reservations;
        } else {
          finalData = [];
        }
      }

      // Tri par date décroissante
      if (Array.isArray(finalData)) {
        finalData.sort((a, b) => {
          // ⚠️ CORRECTION : Utiliser date_creation
          const dateA = a.date_creation ? new Date(a.date_creation) : new Date(a.createdAt || 0);
          const dateB = b.date_creation ? new Date(b.date_creation) : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      }

      setReservations(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur getReservationsByClientId:', err);
      setError(err.message || 'Erreur lors du chargement des réservations du client');
    } finally {
      setLoading(false);
    }
  };

  // Version avec pagination côté serveur
  const fetchReservationsPaginated = async (page = 0, size = 10, sort = 'date_creation,desc') => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData = await getReservationsUseCase.execute({
        page,
        size,
        sort
      });

      let finalData = reservationsData;
      let paginationInfo = {};

      if (reservationsData && !Array.isArray(reservationsData)) {
        // Extraction des données
        if (reservationsData.data && Array.isArray(reservationsData.data)) {
          finalData = reservationsData.data;
        } else if (reservationsData.reservations && Array.isArray(reservationsData.reservations)) {
          finalData = reservationsData.reservations;
        } else if (reservationsData.content && Array.isArray(reservationsData.content)) {
          finalData = reservationsData.content;
        } else {
          finalData = [];
        }

        // Extraction des informations de pagination
        paginationInfo = {
          page: reservationsData.page || page,
          size: reservationsData.size || size,
          totalPages: reservationsData.totalPages || 0,
          totalElements: reservationsData.totalElements || finalData.length
        };
      }

      setReservations(Array.isArray(finalData) ? finalData : []);
      return paginationInfo;
    } catch (err) {
      console.error('🔴 Erreur fetchReservationsPaginated:', err);
      setError(err.message || 'Erreur lors du chargement des réservations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // NOUVELLE MÉTHODE : Récupérer les chambres disponibles
  const getChambresDisponibles = async (dateDebut, dateFin) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🌐 Récupération chambres disponibles:', { dateDebut, dateFin });
      const chambresDisponibles = await reservationRepository.getChambresDisponibles(dateDebut, dateFin);
      return chambresDisponibles;
    } catch (err) {
      console.error('🔴 Erreur getChambresDisponibles:', err);
      setError(err.message || 'Erreur lors de la récupération des chambres disponibles');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    createReservation,
    updateReservation,
    deleteReservation,
    searchReservations,
    getReservationsByClientId,
    fetchReservationsPaginated,
    getChambresDisponibles, // ← NOUVEAU
    refetch: fetchReservations
  };
};