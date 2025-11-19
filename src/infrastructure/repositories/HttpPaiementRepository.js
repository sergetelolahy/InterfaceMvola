import Paiement from "../../domain/entities/Paiement";
import PaiementRepository from "../../domain/repositpries/PaiementRepository";
import HttpClient from "../HttpClient";
import axios from "axios";

class HttpPaiementRepository extends PaiementRepository {
    constructor() {
        super();
        this.httpClient = new HttpClient();
        this.baseUrl = 'http://127.0.0.1:8000/api';
    }

    // 🔹 Récupérer tous les paiements
    async getAll() {
        try {
            console.log('🌐 Appel API GET:', `${this.baseUrl}/paiement/`);
            const response = await axios.get(`${this.baseUrl}/paiement/`);

            console.log('📡 Réponse API:', response.data);

            return response.data.map(paiementData => new Paiement({
                id: paiementData.id,
                id_reservation: paiementData.id_reservation,
                montant: paiementData.montant,
                date_paiement: paiementData.date_paiement,
                mode_paiement: paiementData.mode_paiement,
                status: paiementData.status
            }));

        } catch (error) {
            console.error('💥 Erreur API Paiement getAll:', {
                message: error.message,
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

    async create(paiementData) {
        try {
            console.log('🌐 HttpPaiementRepository - Création paiement:', paiementData);
            
            const url = `${this.baseUrl}/paiement`;
            console.log('🔗 URL de paiemnet:', url);
            
            const response = await this.httpClient.post(url, paiementData);
            console.log('✅ HttpPaiementRepository - Paiement créé:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('💥 Erreur API Paiement create:', error);
            
            // Log détaillé de l'erreur
            if (error.response) {
                console.error('📊 Statut erreur:', error.response.status);
                console.error('📄 Données erreur:', error.response.data);
                console.error('🔤 Headers erreur:', error.response.headers);
            } else if (error.request) {
                console.error('❌ Aucune réponse reçue:', error.request);
            } else {
                console.error('❌ Erreur configuration:', error.message);
            }
            
            throw error;
        }
    }

    // 🔹 Mettre à jour un paiement
    async update(id, paiement) {
        try {
            const response = await this.httpClient.put(`${this.baseUrl}/paiements/${id}`, paiement);
            return new Paiement(response.data);
        } catch (error) {
            console.error('💥 Erreur API Paiement update:', error);
            throw error;
        }
    }

    // 🔹 Supprimer un paiement
    async delete(id) {
        try {
            await this.httpClient.delete(`${this.baseUrl}/paiements/${id}`);
            return true;
        } catch (error) {
            console.error('💥 Erreur API Paiement delete:', error);
            throw error;
        }
    }

    // 🔹 Récupérer un paiement par ID
    async getById(id) {
        try {
            const response = await axios.get(`${this.baseUrl}/paiements/${id}`);
            const paiementData = response.data;
            return new Paiement({
                id: paiementData.id,
                id_reservation: paiementData.id_reservation,
                montant: paiementData.montant,
                date_paiement: paiementData.date_paiement,
                mode_paiement: paiementData.mode_paiement,
                status: paiementData.status
            });
        } catch (error) {
            console.error('💥 Erreur API Paiement getById:', error);
            throw error;
        }
    }
}

export default HttpPaiementRepository;
