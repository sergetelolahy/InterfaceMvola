class CreateReservation {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    async execute(reservationData) {
        try {
            console.log('🔄 CreateReservation - Début');
            const reservation = await this.reservationRepository.create(reservationData);
            console.log('✅ CreateReservation - Réservation créée:', reservation);
            return reservation;
        } catch (error) {
            console.error('❌ CreateReservation - Erreur:', error);
            throw error;
        }
    }
}

export default CreateReservation;