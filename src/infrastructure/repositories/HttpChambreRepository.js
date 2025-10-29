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
  
          console.log('Données chambres:', response.data);
          
          return chambresData.map(chambreData => new Chambre({
              id: chambreData.id,
              numero: chambreData.numero,
              prix: parseFloat(chambreData.prix),
              // Utilisez le champ qui existe dans la réponse de l'API
              typeChambreId: chambreData.type?.id || chambreData.type_chambre_id,
              estPrive: chambreData.estPrive || true,
              type: chambreData.type, // Si vous voulez garder l'objet type complet
              services: chambreData.services || []
          }));
          
      } catch (error) {
          console.error('💥 Erreur API:', error);
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