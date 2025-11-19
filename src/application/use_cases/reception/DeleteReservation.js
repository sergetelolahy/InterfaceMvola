class DeleteReservation {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    async execute(id) {
        return this.reservationRepository.delete(id);
    }
}

export default DeleteReservation;