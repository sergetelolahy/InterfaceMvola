class CreateTypeChambre {
    constructor(typeChambreRepository) {
      this.typeChambreRepository = typeChambreRepository;
    }
  
    async execute(typeChambreData) {
      return this.typeChambreRepository.create(typeChambreData);
    }
  }
  
  export default CreateTypeChambre;