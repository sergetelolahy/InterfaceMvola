class Reservation {
    constructor({
        id,
        id_client,
        date_debut,
        date_fin,
        statut,
        tarif_template,
        date_creation,
        check_in_time,
        check_out_time,
        client,
        chambres = [], // ← CHANGEMENT: maintenant un tableau
        chambre_reservation = [] // ← NOUVEAU: données pivot
    }) {
        this.id = id;
        this.id_client = id_client;
        this.date_debut = date_debut;
        this.date_fin = date_fin;
        this.statut = statut;
        this.tarif_template = tarif_template;
        this.date_creation = date_creation;
        this.check_in_time = check_in_time;
        this.check_out_time = check_out_time;
        this.client = client;
        this.chambres = chambres; // Tableau de chambres
        this.chambre_reservation = chambre_reservation; // Données pivot
    }
}

export default Reservation;