class UpdateClient {
    constructor(clientRepository) {
      this.clientRepository = clientRepository;
    }
  
    async execute(id,clientData) {
      return this.clientRepository.update(id,clientData);
    }
  }
  
  export default UpdateClient;