class CreateClient {
    constructor(clientRepository) {
      this.clientRepository = clientRepository;
    }
  
    async execute(clientData) {
      return this.clientRepository.create(clientData);
    }
  }
  
  export default CreateClient;