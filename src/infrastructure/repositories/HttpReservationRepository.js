import Reservation from "../../domain/entities/Reservation";
import ReservationRepository from "../../domain/repositpries/ReservationRepository";
import HttpClient from "../HttpClient";
import axios from "axios";

class HttpReservationRepository extends ReservationRepository {
    constructor() {
        super();
        this.httpClient = new HttpClient();
        this.baseUrl = 'http://127.0.0.1:8000/api';
    }

    async getAll() {
        try {
            console.log('🌐 Appel API GET:', `${this.baseUrl}/reservation/`);
            const response = await axios.get(`${this.baseUrl}/reservation/`);
            
            console.log('📡 Réponse API:', response);
            console.log('📊 Response.data:', response.data);
            
            let reservationsData = response.data;

            console.log('Données réservations:', response.data);
            
            return reservationsData.map(reservationData => new Reservation({
                id: reservationData.id,
                id_client: reservationData.id_client,
                // SUPPRIMER: id_chambre car on utilise la table pivot maintenant
                date_debut: reservationData.date_debut,
                date_fin: reservationData.date_fin,
                statut: reservationData.statut,
                date_creation: reservationData.date_creation,
                check_in_time: reservationData.check_in_time,
                check_out_time: reservationData.check_out_time,
                client: reservationData.client,
                chambres: reservationData.chambres, // ← CHANGEMENT: maintenant un tableau
                chambre_reservation: reservationData.chambre_reservation // ← NOUVEAU: données pivot
            }));
            
        } catch (error) {
            console.error('💥 Erreur API:', {
                message: error.message,
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

   // Dans HttpReservationRepository.js
async create(reservationData) {
    try {
      console.log('🌐 Début création réservation:', reservationData);
      console.log('🔗 Base URL:', this.baseUrl);
      
      // ⚠️ CORRECTION : Construire les paramètres URL comme dans Postman
      const params = new URLSearchParams({
        id_client: reservationData.id_client,
        id_chambre: reservationData.id_chambre, // Format "1,2"
        date_debut: reservationData.date_debut,
        date_fin: reservationData.date_fin
      });
  
      // Ajouter les paramètres optionnels
      if (reservationData.statut) {
        params.append('statut', reservationData.statut);
      }
      if (reservationData.tarif_template) {
        params.append('tarif_template', reservationData.tarif_template);
      }
  
      const url = `${this.baseUrl}/reservation?${params.toString()}`;
      console.log('🔗 URL complète avec paramètres:', url);
      console.log('📤 Paramètres envoyés:', params.toString());
  
      // ⚠️ CORRECTION : Envoyer une requête POST sans body (tout est dans l'URL)
      const response = await this.httpClient.post(url, {});
      
      console.log('✅ Réservation créée avec succès:', response);
      return response;
    } catch (error) {
      console.error('💥 Erreur détaillée création réservation:', error);
      throw error;
    }
  }

    async update(id, reservationData) {
        try {
            console.log('🌐 Mise à jour réservation:', id, reservationData);
            
            const dataToSend = {
                id_client: reservationData.id_client,
                date_debut: reservationData.date_debut,
                date_fin: reservationData.date_fin,
                statut: reservationData.statut,
                tarif_template: reservationData.tarif_template,
                chambres: reservationData.chambres
            };
            
            const response = await this.httpClient.put(`${this.baseUrl}/reservations/${id}`, dataToSend);
            console.log('📡 Réponse mise à jour:', response);
            
            return new Reservation({
                ...response.data,
                chambres: response.data.chambres || []
            });
        } catch (error) {
            console.error('💥 Erreur mise à jour réservation:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('🌐 Suppression réservation:', id);
            await this.httpClient.delete(`${this.baseUrl}/reservation/${id}`);
            console.log('✅ Réservation supprimée');
            return true;
        } catch (error) {
            console.error('💥 Erreur suppression réservation:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            console.log('🌐 Récupération réservation par ID:', id);
            const response = await axios.get(`${this.baseUrl}/reservation/${id}`);
            const reservationData = response.data;
            console.log('📡 Données réservation:', reservationData);
            
            return new Reservation({
                id: reservationData.id,
                id_client: reservationData.id_client,
                date_debut: reservationData.date_debut,
                date_fin: reservationData.date_fin,
                statut: reservationData.statut,
                date_creation: reservationData.date_creation,
                check_in_time: reservationData.check_in_time,
                check_out_time: reservationData.check_out_time,
                client: reservationData.client,
                chambres: reservationData.chambres || [],
                chambre_reservation: reservationData.chambre_reservation
            });
        } catch (error) {
            console.error('💥 Erreur API getById:', error);
            throw error;
        }
    }

    async getByClientId(clientId) {
        try {
            console.log('🌐 Récupération réservations par client:', clientId);
            const response = await axios.get(`${this.baseUrl}/reservation/client/${clientId}`);
            const reservationsData = response.data;
            
            return reservationsData.map(reservationData => new Reservation({
                id: reservationData.id,
                id_client: reservationData.id_client,
                date_debut: reservationData.date_debut,
                date_fin: reservationData.date_fin,
                statut: reservationData.statut,
                date_creation: reservationData.date_creation,
                check_in_time: reservationData.check_in_time,
                check_out_time: reservationData.check_out_time,
                client: reservationData.client,
                chambres: reservationData.chambres || [],
                chambre_reservation: reservationData.chambre_reservation
            }));
        } catch (error) {
            console.error('💥 Erreur API getByClientId:', error);
            throw error;
        }
    }

    // NOUVELLE MÉTHODE: Récupérer les chambres disponibles
    async getChambresDisponibles(dateDebut, dateFin) {
        try {
            console.log('🌐 Récupération chambres disponibles:', { dateDebut, dateFin });
            const response = await axios.get(`${this.baseUrl}/chambres/disponibles`, {
                params: { date_debut: dateDebut, date_fin: dateFin }
            });
            return response.data;
        } catch (error) {
            console.error('💥 Erreur récupération chambres disponibles:', error);
            throw error;
        }
    }
}

export default HttpReservationRepository;