class UpdateChambre {
    constructor(chambreRepository) {
      this.chambreRepository = chambreRepository;
    }
  
    async execute(chambreData) {
      return this.chambreRepository.update(chambreData);
    }
  }
  
  export default UpdateChambre;