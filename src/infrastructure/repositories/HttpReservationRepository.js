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
            
            console.log('📡 Réponse API complète:', response);
            console.log('📊 Données réservations:', response.data);
            
            let reservationsData = response.data;

            // Vérifier si c'est un tableau ou un objet
            if (!Array.isArray(reservationsData)) {
                console.warn('⚠️ Les données ne sont pas un tableau:', reservationsData);
                reservationsData = [reservationsData];
            }
            
            return reservationsData.map(reservationData => {
                console.log('📋 Mapping réservation:', reservationData);
                
                // Calculer le montant total et acompte à partir des données disponibles
                const tarifTemplate = parseFloat(reservationData.tarif_template) || 0;
                const montantTotal = reservationData.montant_total || tarifTemplate;
                const acompte = reservationData.acompte || 0;
                const montantRestant = montantTotal - acompte;
                
                return new Reservation({
                    id: reservationData.id,
                    id_client: reservationData.id_client,
                    date_debut: reservationData.date_debut,
                    date_fin: reservationData.date_fin,
                    statut: reservationData.statut,
                    statut_paiement: reservationData.statut_paiement || 'non_payee',
                    montant_total: montantTotal,
                    acompte: acompte,
                    montant_restant: montantRestant,
                    tarif_template: tarifTemplate,
                    date_creation: reservationData.date_creation,
                    check_in_time: reservationData.check_in_time,
                    check_out_time: reservationData.check_out_time,
                    client: reservationData.client,
                    chambres: reservationData.chambres || [],
                    chambre_reservation: reservationData.chambre_reservation
                });
            });
            
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

    async create(reservationData) {
        try {
            console.log('🌐 Début création réservation avec statuts:', reservationData);
            console.log('🔗 Base URL:', this.baseUrl);
            
            // ⚠️ CORRECTION : Construire les paramètres URL avec les nouveaux champs
            const params = new URLSearchParams({
                id_client: reservationData.id_client,
                id_chambre: reservationData.id_chambre,
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
            // ⚠️ CORRECTION : Ajouter les nouveaux paramètres de statut de paiement
            if (reservationData.statut_paiement) {
                params.append('statut_paiement', reservationData.statut_paiement);
            }
            if (reservationData.montant_total) {
                params.append('montant_total', reservationData.montant_total);
            }
            if (reservationData.acompte) {
                params.append('acompte', reservationData.acompte);
            }
        
            const url = `${this.baseUrl}/reservation?${params.toString()}`;
            console.log('🔗 URL complète avec paramètres:', url);
            console.log('📤 Paramètres envoyés:', params.toString());
        
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
          console.log('🌐 Mise à jour réservation ID:', id, 'avec données:', reservationData);
          
          // CORRECTION : Construire les paramètres URL comme dans l'image
          const params = new URLSearchParams();
          
          // Ajouter les paramètres obligatoires
          params.append('id_client', reservationData.id_client);
          params.append('id_chambre', reservationData.id_chambre);
          params.append('date_debut', reservationData.date_debut);
          params.append('date_fin', reservationData.date_fin);
          params.append('statut', reservationData.statut);
          
          // Ajouter les paramètres optionnels
          if (reservationData.montant_total !== undefined && reservationData.montant_total !== null) {
            params.append('montant_total', reservationData.montant_total);
          }
          
          if (reservationData.acompte !== undefined && reservationData.acompte !== null) {
            params.append('acompte', reservationData.acompte);
          }
          
          if (reservationData.check_in_time) {
            // Convertir en format date seulement (sans l'heure)
            const checkInDate = reservationData.check_in_time.split('T')[0];
            params.append('check_in_time', checkInDate);
          }
          
          if (reservationData.check_out_time) {
            // Convertir en format date seulement (sans l'heure)
            const checkOutDate = reservationData.check_out_time.split('T')[0];
            params.append('check_out_time', checkOutDate);
          }
          
          // Construire l'URL complète avec les paramètres
          const queryString = params.toString();
          const url = `${this.baseUrl}/reservation/${id}?${queryString}`;
          
          console.log('🔗 URL de mise à jour:', url);
          console.log('📤 Paramètres envoyés:', queryString);
          
          // Envoyer la requête PUT avec les paramètres dans l'URL et un body vide
          const response = await this.httpClient.put(url, {});
          
          console.log('✅ Réponse mise à jour:', response);
          
          // Retourner la réservation mise à jour
          if (response.data) {
            return new Reservation({
              ...response.data,
              chambres: response.data.chambres || [],
              statut_paiement: response.data.statut_paiement || 'non_payee',
              montant_total: response.data.montant_total || 0,
              acompte: response.data.acompte || 0,
              check_in_time: response.data.check_in_time || null,
              check_out_time: response.data.check_out_time || null
            });
          }
          
          return response;
          
        } catch (error) {
          console.error('💥 Erreur détaillée mise à jour réservation:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
          });
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
                // ⚠️ CORRECTION : Ajout des nouveaux champs
                statut_paiement: reservationData.statut_paiement || 'non_payee',
                montant_total: reservationData.montant_total || 0,
                acompte: reservationData.acompte || 0,
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
                // ⚠️ CORRECTION : Ajout des nouveaux champs
                statut_paiement: reservationData.statut_paiement || 'non_payee',
                montant_total: reservationData.montant_total || 0,
                acompte: reservationData.acompte || 0,
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


}

export default HttpReservationRepository;