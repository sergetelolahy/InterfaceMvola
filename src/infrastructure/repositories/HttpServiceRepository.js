



import HttpClient from "../HttpClient";
import axios from "axios";
import TypeChambre from "../../domain/entities/TypeChambre";
import ServiceRepository from "../../domain/repositpries/ServiceRepository";
import Services from "../../domain/entities/Services";

class HttpServiceRepository extends ServiceRepository {
    constructor(){
        super();
        this.httpClient = new HttpClient();
        this.baseUrl = 'http://127.0.0.1:8000/api';
    }

    async getAll(){
        try {
            console.log('🌐 Appel API GET:', `${this.baseUrl}/services/`);
            const response = await axios.get(`${this.baseUrl}/services/`);
            
            console.log('📡 Réponse API:', response);
            console.log('📊 Response.data:', response.data);
            
            let chambresData = response.data;

            console.log('ici'+ response.data);
            
            // Ajustez le mapping selon la structure de votre API
            // D'après votre capture, les données ont cette structure :
            // {
            //   "numero": "966",
            //   "prix": "309090.00", 
            //   "type": { ... }
            // }
            
            return chambresData.map(chambreData => new TypeChambre({
              id: chambreData.id, // Assurez-vous que l'API renvoie un id
              nom: chambreData.nom, // Extraire l'id du type
              description: chambreData.description// Valeur par défaut si absent
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
 

    async create(service) {
        const response = await this.httpClient.post(`${this.baseUrl}/services`, service);
        return new Services(response.data);
    }

    async update(id ,service) {
        const response = await this.httpClient.put(`${this.baseUrl}/services/${id}`, service);
        return new Services(response.data);
      }
    
      async delete(id) {
        await this.httpClient.delete(`${this.baseUrl}/services/${id}`);
        return true;
      }
    }

    export default HttpServiceRepository;