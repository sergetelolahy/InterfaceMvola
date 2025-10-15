import Chambre from "../../domain/entities/Chambre";
import ChambreRepository from "../../domain/repositpries/ChambreRepository";
import HttpClient from "../HttpClient";
import axios from "axios";

class HttpChambreRepository extends ChambreRepository {
    constructor(){
        super();
        this.httpClient = new HttpClient();
        this.baseUrl = 'http://127.0.0.1:8000/api';
    }

    async getAll(){
        try {
            console.log('🌐 Appel API GET:', `${this.baseUrl}/chambre/`);
            const response = await axios.get(`${this.baseUrl}/chambre/`);
            
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
            
            return chambresData.map(chambreData => new Chambre({
              id: chambreData.id, // Assurez-vous que l'API renvoie un id
              numero: chambreData.numero,
              prix: parseFloat(chambreData.prix), // Convertir en number
              typeChambreId: chambreData.type.id, // Extraire l'id du type
              estPrive: chambreData.estPrive || true ,
              typeChambreNom: chambreData.type.nom// Valeur par défaut si absent
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
 

    async create(chambre) {
        const response = await this.httpClient.post(`${this.baseUrl}/chambre`, chambre);
        return new Chambre(response.data);
    }

    async update(chambre) {
        const response = await this.httpClient.put(`${this.baseUrl}/chambre/${chambre.id}`, chambre);
        return new Chambre(response.data);
      }
    
      async delete(id) {
        await this.httpClient.delete(`${this.baseUrl}/chambre/${id}`);
        return true;
      }
    }

    export default HttpChambreRepository;