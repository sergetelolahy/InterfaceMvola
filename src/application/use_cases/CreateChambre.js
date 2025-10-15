class CreateChambre {
    constructor(chambreRepository) {
      this.chambreRepository = chambreRepository;
    }
  
    async execute(chambreData) {
      return this.chambreRepository.create(chambreData);
    }
  }
  
  export default CreateChambre;