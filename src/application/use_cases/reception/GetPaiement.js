class GetPaiement {
    constructor(paiementRepository) {
        this.paiementRepository = paiementRepository
    }

    async execute() {
        return this.paiementRepository.getAll();
    }
}

export default GetPaiement;