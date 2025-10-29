
import HttpClient from "../HttpClient";
import axios from "axios";
import TypeChambreRepository from "../../domain/repositpries/TypeChambreRepository";
import TypeChambre from "../../domain/entities/TypeChambre";

class HttpTypeChambreRepository extends TypeChambreRepository {
    constructor(){
        super();
        this.httpClient = new HttpClient();
        this.baseUrl = 'http://127.0.0.1:8000/api';
    }

    async getAll(){
        try {
            console.log('🌐 Appel API GET:', `${this.baseUrl}/typechambre/`);
            const response = await axios.get(`${this.baseUrl}/typechambre/`);
            
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
              nom: chambreData.nom,
              nbrLit: parseFloat(chambreData.nbrLit), // Convertir en number
              maxPersonnes: parseFloat(chambreData.maxPersonnes), // Extraire l'id du type
              description: chambreData.description,
              image: chambreData.image// Valeur par défaut si absent
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
 

    async create(typeChambre) {
        const response = await this.httpClient.post(`${this.baseUrl}/typechambre`, typeChambre);
        return new TypeChambre(response.data);
    }

    async update(id ,typechambre) {
        const response = await this.httpClient.put(`${this.baseUrl}/typechambre/${id}`, typechambre);
        return new TypeChambre(response.data);
      }
    
      async delete(id) {
        await this.httpClient.delete(`${this.baseUrl}/typechambre/${id}`);
        return true;
      }
    }

    export default HttpTypeChambreRepository;