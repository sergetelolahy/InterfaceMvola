class GetClient {
    constructor(clientRepository) {
        this.clientRepository = clientRepository
    }

    async execute() {
        return this.clientRepository.getAll();
    }
}

export default GetClient;