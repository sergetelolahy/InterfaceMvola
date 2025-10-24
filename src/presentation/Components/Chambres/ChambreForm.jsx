import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';
import { useTypeChambres } from '../../hooks/useTypeChambres';
import { useServices } from '../../hooks/useServices';

const ChambreForm = ({ chambre, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    numero: '',
    estPrive: true,
    typechambre_id: '',
    prix: '',
    maxPersonnes: 2,
    services: []
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [servicesSearch, setServicesSearch] = useState('');

  const { typeChambres, loading: loadingTypes, error: errorTypes } = useTypeChambres();
  const { services, loading: loadingServices } = useServices();

  useEffect(() => {
    if (chambre) {
      setFormData({
        numero: chambre.numero || '',
        estPrive: chambre.estPrive !== undefined ? chambre.estPrive : true,
        typechambre_id: chambre.typechambre_id || chambre.typeChambreId || '',
        prix: chambre.prix || '',
        maxPersonnes: chambre.maxPersonnes || 2,
        services: chambre.services
      });

      // Initialiser les services sélectionnés si en mode édition
      if (chambre.services) {
        const initialServiceIds = chambre.services.map(service => 
          typeof service === 'object' ? service.id : service
        );
        setSelectedServiceIds(initialServiceIds);
      }
    }
  }, [chambre]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'numero' && error) {
      setError('');
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.numero || !formData.typechambre_id || !formData.prix) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.prix) <= 0) {
      setError('Le prix doit être supérieur à 0');
      setLoading(false);
      return;
    }

    try {
      const chambreData = {
        ...formData,
        prix: parseFloat(formData.prix),
        maxPersonnes: parseInt(formData.maxPersonnes),
        services: selectedServiceIds
      };

      await onSubmit(chambreData);
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      if (err.message && err.message.includes('déjà utilisé')) {
        setError(err.message);
      } else {
        setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceName) => {
    const nom = serviceName.toLowerCase();
    
    if (nom.includes('wifi')) return '📶';
    if (nom.includes('tv') || nom.includes('télévision')) return '📺';
    if (nom.includes('climatisation') || nom.includes('air conditionné')) return '❄️';
    if (nom.includes('cuisine')) return '🍳';
    if (nom.includes('douche')) return '🚿';
    if (nom.includes('café')) return '☕';
    if (nom.includes('parking')) return '🚗';
    if (nom.includes('plage')) return '🏖️';
    if (nom.includes('gym') || nom.includes('fitness')) return '💪';
    if (nom.includes('animaux')) return '🐾';
    if (nom.includes('service') || nom.includes('concierge')) return '🛎️';
    if (nom.includes('bar') || nom.includes('mini-bar')) return '🍸';
    if (nom.includes('jacuzzi') || nom.includes('spa')) return '🛁';
    if (nom.includes('piscine')) return '🏊';
    
    return '🔧';
  };

  const filteredServices = services.filter(service =>
    service.nom.toLowerCase().includes(servicesSearch.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(servicesSearch.toLowerCase()))
  );

  const selectedServices = services.filter(service => 
    selectedServiceIds.includes(service.id)
  );

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

          {/* Nombre maximum de personnes */}

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

        {/* Sélection des services */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services inclus
          </label>
          
          {/* Input pour la sélection des services */}
          <div className="relative">
            <div
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer bg-white"
              onClick={() => setShowServicesDropdown(!showServicesDropdown)}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {selectedServices.length > 0 
                    ? `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} sélectionné${selectedServices.length > 1 ? 's' : ''}`
                    : 'Sélectionnez les services'
                  }
                </span>
                {showServicesDropdown ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {/* Dropdown des services */}
            {showServicesDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* Barre de recherche */}
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Rechercher un service..."
                    value={servicesSearch}
                    onChange={(e) => setServicesSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Liste des services */}
                <div className="p-2 space-y-1">
                  {loadingServices ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : filteredServices.length > 0 ? (
                    filteredServices.map(service => (
                      <div
                        key={service.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                          selectedServiceIds.includes(service.id) ? 'bg-indigo-50 border border-indigo-200' : ''
                        }`}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <div className={`w-5 h-5 border rounded-md flex items-center justify-center mr-3 ${
                          selectedServiceIds.includes(service.id) 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-gray-300'
                        }`}>
                          {selectedServiceIds.includes(service.id) && <FaCheck className="text-xs" />}
                        </div>
                        <span className="text-lg mr-2">{getServiceIcon(service.nom)}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{service.nom}</div>
                          {service.description && (
                            <div className="text-sm text-gray-500">{service.description}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucun service trouvé
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Services sélectionnés affichés */}
          {selectedServices.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {selectedServices.map(service => (
                  <span
                    key={service.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    <span className="mr-1">{getServiceIcon(service.nom)}</span>
                    {service.nom}
                    <button
                      type="button"
                      onClick={() => handleServiceToggle(service.id)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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

      {/* Overlay pour fermer le dropdown */}
      {showServicesDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowServicesDropdown(false)}
        />
      )}
    </div>
  );
};

export default ChambreForm;