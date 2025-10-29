export default class Chambre {
    constructor({id,numero,prix,typeChambreId,type,services}) {
        this.id = id;
        this.numero = numero;
        this.typeChambreId = typeChambreId;
        this.prix = prix;
        // this.typeChambreNom = typeChambreNom;
        this.services = services;
        // this.typeChambrenbrLit = typeChambrenbrLit
        this.type = type;
    }
}