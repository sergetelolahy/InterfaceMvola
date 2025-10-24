class DeleteServices {
    constructor(serviceRepository) {
      this.serviceRepository = serviceRepository;
    }
  
    async execute(id) {
      return this.serviceRepository.delete(id);
    }
  }
  
  export default DeleteServices;