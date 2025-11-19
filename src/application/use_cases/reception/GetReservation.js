class GetReservation {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    async execute() {
        return this.reservationRepository.getAll();
    }
}

export default GetReservation;