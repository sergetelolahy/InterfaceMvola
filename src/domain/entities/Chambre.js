export default class Chambre {
    constructor({id,numero,prix,typeChambreId,typeChambreNom}) {
        this.id = id;
        this.numero = numero;
        this.typeChambreId = typeChambreId;
        this.prix = prix;
        this.typeChambreNom = typeChambreNom;
    }
}