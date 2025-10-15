class GetTypeChambres {
    constructor(typeChambreRepository){
        this.typeChambreRepository = typeChambreRepository
    }

    async execute(){
      return this.typeChambreRepository.getAll();
    }
}

export default GetTypeChambres