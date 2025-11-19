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

    async getAll() {
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
            typeChambreId: chambreData.type?.id || chambreData.type_chambre_id,
            estPrive: chambreData.estPrive !== undefined ? chambreData.estPrive : true, // Utilise la valeur de l'API ou true par défaut
            type: chambreData.type,
            services: chambreData.services || [],
            status: chambreData.status || 'libre' // Ajout du statut avec valeur par défaut
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

      async getChambresDisponibles(dateDebut, dateFin) {
        try {
          console.log(`📅 Recherche chambres disponibles du ${dateDebut} au ${dateFin}`);
    
          const response = await axios.post(`${this.baseUrl}/chambre/disponibles`, null, {
            params: {
              date_debut: dateDebut,
              date_fin: dateFin
            }
          });
    
          const chambresData = response.data.chambres_disponibles || [];
    
          return chambresData.map(chambreData => new Chambre({
            id: chambreData.id,
            numero: chambreData.numero,
            prix: parseFloat(chambreData.prix),
            typeChambreId: chambreData.type?.id || chambreData.type_chambre_id,
            estPrive: chambreData.estPrive !== undefined ? chambreData.estPrive : true,
            type: chambreData.type,
            services: chambreData.services || [],
            status: chambreData.status || 'libre'
          }));
    
        } catch (error) {
          console.error('💥 Erreur lors de la récupération des chambres disponibles:', error);
          throw error;
        }
      }

    }

    export default HttpChambreRepository;