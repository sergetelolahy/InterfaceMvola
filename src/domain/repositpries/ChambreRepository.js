import Chambre from "../entities/Chambre";

export default class ChambreRepository {
    getAll() {
        throw new Error ('Method not implemented.');
    }

    create(chambre) {
        throw new Error ('Method not implemented');
    }

    update(chambre) {
        throw new Error('Method not implemented.');
      }
    
      delete(id) {
        throw new Error('Method not implemented.');
      }

      // 🆕 Méthode pour les chambres disponibles entre deux dates
      getChambresDisponibles(dateDebut, dateFin) {
        throw new Error('Method not implemented.');
      }

          // Nouvelles méthodes pour la disponibilité
      getChambresAvecStatutAujourdhui() {
        throw new Error('Method not implemented.');
      }

      getChambresDisponiblesAujourdhui() {
        throw new Error('Method not implemented.');
      }

      getChambresFiltrees(filtre) {
        throw new Error('Method not implemented.');
      }
}