class DeleteClient {
    constructor(clientRepository) {
      this.clientRepository = clientRepository;
    }
  
    async execute(id) {
      return this.clientRepository.delete(id);
    }
  }
  
  export default DeleteClient;