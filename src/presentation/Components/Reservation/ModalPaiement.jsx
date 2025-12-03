import React, { useState, useEffect } from 'react';

const ModalPaiement = ({ 
  show, 
  onClose, 
  reservation, 
  typePaiement, 
  onPaiement, 
  loading 
}) => {

  const [montant, setMontant] = useState(0);
  const [methodePaiement, setMethodePaiement] = useState('espèces');
  const [erreur, setErreur] = useState('');

  // Calcul sécurisé du montant restant
  const montantRestant = reservation
    ? (
        parseFloat(reservation.montant_restant) ||
        (
          parseFloat(reservation.montant_total || 0) - 
          parseFloat(reservation.acompte || 0)
        )
      )
    : 0;

  useEffect(() => {
    if (show && reservation) {

      if (typePaiement === 'complet') {
        setMontant(montantRestant);
      } else if (typePaiement === 'partiel') {
        setMontant(Math.max(0, montantRestant / 2));
      }

      setErreur('');
    }
  }, [show, reservation, typePaiement]);


  // Soumission formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (montant <= 0) {
      setErreur('Le montant doit être positif');
      return;
    }

    if (montant > montantRestant) {
      setErreur(`Le montant ne peut pas dépasser ${montantRestant.toFixed(2)} AR`);
      return;
    }

    onPaiement({
      montant: parseFloat(montant),
      typePaiement: methodePaiement
    });
  };

  if (!show || !reservation) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">

        {/* Titre */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Paiement {typePaiement === 'complet' ? 'Complet' : 'Partiel'}
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            ✖
          </button>
        </div>

        {/* Infos réservation */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-800">
            <div className="font-semibold text-base mb-1">
              {reservation.client?.prenom} {reservation.client?.nom}
            </div>

            <div className="text-blue-600 mb-2">Réservation #{reservation.id}</div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              
              <div>
                <span className="font-medium">Total: </span>
                {parseFloat(reservation.montant_total || reservation.tarif_template || 0).toFixed(2)} AR
              </div>

              <div>
                <span className="font-medium">Déjà payé: </span>
                {parseFloat(reservation.acompte || 0).toFixed(2)} AR
              </div>

              <div className="col-span-2 font-bold text-blue-900 pt-2 border-t">
                <span className="font-medium">Reste à payer: </span>
                {montantRestant.toFixed(2)} AR
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          
          {/* Montant */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à payer
            </label>

            <input
              type="number"
              min="0"
              max={montantRestant}
              value={montant}
              onChange={(e) => setMontant(parseFloat(e.target.value) || 0)}
              disabled={typePaiement === 'complet'}
              className="w-full px-3 py-2 border rounded-lg"
            />

            {typePaiement === 'complet' && (
              <p className="text-sm text-gray-500 mt-1">
                Montant automatique : {montantRestant.toFixed(2)} AR
              </p>
            )}
          </div>

          {/* Méthode paiement */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Méthode de paiement
            </label>
            <select
              value={methodePaiement}
              onChange={(e) => setMethodePaiement(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="espèces">Espèces</option>
            </select>
          </div>

          {/* Erreur */}
          {erreur && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{erreur}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border rounded-lg"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading || montant <= 0}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white"
            >
              {loading ? "Traitement..." : `Payer ${montant.toFixed(2)} AR`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ModalPaiement;
