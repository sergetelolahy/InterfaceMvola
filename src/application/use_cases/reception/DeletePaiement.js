class DeletePaiement {
    constructor(paiementRepository ) {
      this.paiementRepository = paiementRepository;
    }
  
    async execute(id) {
      return this.paiementRepository.delete(id);
    }
  }
  
  export default DeletePaiement;