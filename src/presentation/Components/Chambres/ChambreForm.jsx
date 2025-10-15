import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useTypeChambres } from '../../hooks/useTypeChambres';

const ChambreForm = ({ chambre, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    numero: '',
    estPrive: true,
    typechambre_id: '',
    prix: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { typeChambres, loading: loadingTypes, error: errorTypes } = useTypeChambres();

  useEffect(() => {
    if (chambre) {
      setFormData({
        numero: chambre.numero || '',
        estPrive: chambre.estPrive !== undefined ? chambre.estPrive : true,
        typechambre_id: chambre.typechambre_id || chambre.typeChambreId || '',
        prix: chambre.prix || ''
      });
    }
  }, [chambre]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (name === 'numero' && error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validation basique
    if (!formData.numero || !formData.typechambre_id || !formData.prix) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    // Validation du prix
    if (parseFloat(formData.prix) <= 0) {
      setError('Le prix doit être supérieur à 0');
      setLoading(false);
      return;
    }

    try {
      // Conversion du prix en nombre
      const chambreData = {
        ...formData,
        prix: parseFloat(formData.prix)
      };

      await onSubmit(chambreData);
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      // Vérifier si c'est une erreur de numéro déjà utilisé
      if (err.message && err.message.includes('déjà utilisé')) {
        setError(err.message);
      } else {
        setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingTypes) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-3 text-gray-600">Chargement des types de chambre...</p>
        </div>
      </div>
    );
  }

  if (errorTypes) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-red-600">Erreur lors du chargement des types de chambre: {errorTypes}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {chambre ? 'Modifier la chambre' : 'Nouvelle chambre'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          disabled={loading}
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Numéro de chambre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de chambre *
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                error && error.includes('numéro') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: 101"
              required
              disabled={loading}
            />
            {error && error.includes('numéro') && (
              <p className="text-red-500 text-sm mt-1">Ce numéro est déjà utilisé</p>
            )}
          </div>

          {/* Type de chambre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de chambre *
            </label>
            <select
              name="typechambre_id"
              value={formData.typechambre_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
              disabled={loading || typeChambres.length === 0}
            >
              <option value="">Sélectionnez un type</option>
              {typeChambres.map(type => (
                <option key={type.id} value={type.id}>
                  {type.nom}
                </option>
              ))}
            </select>
            {typeChambres.length === 0 && !loadingTypes && (
              <p className="text-sm text-amber-600 mt-1">
                Aucun type de chambre disponible
              </p>
            )}
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix par nuit (€) *
            </label>
            <input
              type="number"
              name="prix"
              value={formData.prix}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                error && error.includes('prix') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: 120"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          {/* Statut privé/partagé */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="estPrive"
              checked={formData.estPrive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              id="estPrive"
              disabled={loading}
            />
            <label htmlFor="estPrive" className="ml-2 block text-sm text-gray-700">
              Chambre privée
            </label>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading || typeChambres.length === 0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {chambre ? 'Modification...' : 'Création...'}
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {chambre ? 'Modifier' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChambreForm;