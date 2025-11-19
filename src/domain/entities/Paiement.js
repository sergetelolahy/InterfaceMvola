export default class Paiement {
    constructor({ id, id_reservation, montant, date_paiement, mode_paiement, status }) {
        this.id = id;
        this.id_reservation = id_reservation;
        this.montant = montant;
        this.date_paiement = date_paiement;
        this.mode_paiement = mode_paiement;
        this.status = status;
    }
}
