class UpdatePaiement {
    constructor(paiementRepository) {
      this.paiementRepository = paiementRepository;
    }
  
    async execute(id,paiementData) {
      return this.paiementRepository.update(id,paiementData);
    }
  }
  
  export default UpdatePaiement;