class UpdateTypeChambre {
    constructor(typeChambreRepository) {
      this.typeChambreRepository = typeChambreRepository;
    }
  
    async execute(id, typeChambreData) {
      return this.typeChambreRepository.update(id,typeChambreData);
    }
  }
  
  export default UpdateTypeChambre;