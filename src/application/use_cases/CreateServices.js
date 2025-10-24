class CreateServices {
    constructor(serviceRepository){
     this.serviceRepository = serviceRepository
    }

    execute(servicesData){
       return this.serviceRepository.create(servicesData);
    }
}

export default CreateServices