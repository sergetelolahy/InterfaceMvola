class DeleteTypeChambre {
    constructor(typeChambreRepository) {
      this.typeChambreRepository = typeChambreRepository;
    }
  
    async execute(id) {
      return this.typeChambreRepository.delete(id);
    }
  }
  
  export default DeleteTypeChambre;