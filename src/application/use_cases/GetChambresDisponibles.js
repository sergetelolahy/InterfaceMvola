export default class GetChambresDisponibles {
    constructor(chambreRepository) {
      this.chambreRepository = chambreRepository;
    }
  
    async execute(dateDebut, dateFin) {
      if (!dateDebut || !dateFin) {
        throw new Error("Les deux dates (début et fin) sont requises.");
      }
  
      // Appel du repository pour récupérer les chambres disponibles
      const chambres = await this.chambreRepository.getChambresDisponibles(dateDebut, dateFin);
  
      return chambres;
    }
  }
  