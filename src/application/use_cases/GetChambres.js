class GetChambre {
    constructor(chambreRepository) {
        this.chambreRepository = chambreRepository
    }

    async execute() {
        return this.chambreRepository.getAll();
    }
}

export default GetChambre;