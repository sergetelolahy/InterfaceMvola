class UpdateReservation {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    async execute(id, reservationData) {
        return this.reservationRepository.update(id, reservationData);
    }
}

export default UpdateReservation;