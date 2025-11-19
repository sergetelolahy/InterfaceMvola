export default class Chambre {
    constructor({id, numero, prix, typeChambreId, type, services, estPrive = null, status = 'libre'}) {
        this.id = id;
        this.numero = numero;
        this.typeChambreId = typeChambreId;
        this.prix = prix;
        this.services = services;
        this.type = type;
        this.estPrive = estPrive;
        this.status = status; // 'libre' ou 'occupée'
    }

    // Méthodes utilitaires pour vérifier le statut
    estDisponible() {
        return this.status === 'libre';
    }

    estOccupee() {
        return this.status === 'occupée';
    }

    // Méthode pour obtenir le badge de statut
    getBadgeStatut() {
        return this.estDisponible() ? {
            label: 'Libre',
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800'
        } : {
            label: 'Occupée',
            color: 'red',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800'
        };
    }

    // Méthode pour obtenir les informations du type de chambre de manière sécurisée
    getTypeNom() {
        return this.type?.nom || 'Standard';
    }

    getNombreLits() {
        return this.type?.nbrLit || 1;
    }

    getMaxPersonnes() {
        return this.type?.maxPersonnes || 2;
    }

    getImage() {
        return this.type?.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop';
    }
}