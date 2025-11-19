class CreatePaiement {
    constructor(paiementRepository) {
      this.paiementRepository = paiementRepository;
    }
  
    async execute(paiementData) {
      return this.paiementRepository.create(paiementData);
    }
  }
  
  export default CreatePaiement;