export default class Chambre {
    constructor({id,numero,prix,typeChambreId,typeChambreNom,services,typeChambrenbrLit}) {
        this.id = id;
        this.numero = numero;
        this.typeChambreId = typeChambreId;
        this.prix = prix;
        this.typeChambreNom = typeChambreNom;
        this.services = services;
        this.typeChambrenbrLit = typeChambrenbrLit
    }
}