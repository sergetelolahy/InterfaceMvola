class GetServices {
    constructor(serviceRepository) {
      this.serviceRepository = serviceRepository;
    }
  
    async execute() {
      return this.serviceRepository.getAll();
    }
  }
  
  export default GetServices;