class UpdateServices {
    constructor(serviceRepository) {
      this.serviceRepository = serviceRepository;
    }
  
    async execute(id, servicesData) {
      return this.serviceRepository.update(id,servicesData);
    }
  }
  
  export default UpdateServices;