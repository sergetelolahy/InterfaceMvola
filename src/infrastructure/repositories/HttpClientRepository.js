import Client from "../../domain/entities/Client";
import ClientRepository from "../../domain/repositpries/ClientRepository";
import HttpClient from "../HttpClient";
import axios from "axios";

class HttpClientRepository extends ClientRepository {
    constructor(){
        super();
        this.httpClient = new HttpClient();
        this.baseUrl = 'http://127.0.0.1:8000/api';
    }

    async getAll(){
        try {
            console.log('🌐 Appel API GET:', `${this.baseUrl}/client/`);
            const response = await axios.get(`${this.baseUrl}/client/`);
            
            console.log('📡 Réponse API:', response);
            console.log('📊 Response.data:', response.data);
            
            let clientsData = response.data;

            console.log('Données clients:', response.data);
            
            return clientsData.map(clientData => new Client({
                id: clientData.id,
                nom: clientData.nom,
                prenom: clientData.prenom,
                email: clientData.email,
                tel: clientData.tel,
                cin: clientData.cin
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

    async create(client) {
        const response = await this.httpClient.post(`${this.baseUrl}/client`, client);
        return new Client(response.data);
    }

    async update(id ,client) {
        const response = await this.httpClient.put(`${this.baseUrl}/client/${id}`, client);
        return new Client(response.data);
      }

    async delete(id) {
        await this.httpClient.delete(`${this.baseUrl}/client/${id}`);
        return true;
    }

    // Méthode supplémentaire pour récupérer un client par son ID
    async getById(id) {
        try {
            const response = await axios.get(`${this.baseUrl}/client/${id}`);
            const clientData = response.data;
            return new Client({
                id: clientData.id,
                nom: clientData.nom,
                prenom: clientData.prenom,
                email: clientData.email,
                tel: clientData.tel,
                cin: clientData.cin
            });
        } catch (error) {
            console.error('💥 Erreur API getById:', error);
            throw error;
        }
    }
}

export default HttpClientRepository;