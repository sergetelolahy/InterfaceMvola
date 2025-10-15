class DeleteChambre {
  constructor(chambreRepository) {
    this.chambreRepository = chambreRepository;
  }

  async execute(id) {
    return this.chambreRepository.delete(id);
  }
}

export default DeleteChambre;