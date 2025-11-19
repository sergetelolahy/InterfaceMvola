import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCheck, FaArrowLeft, FaCreditCard, FaIdCard, FaSearch, FaPlus, FaBed } from 'react-icons/fa';
import { useClients } from '../../hooks/useClients';

const EtapeConfirmation = ({ selection, onConfirm, onBack, loading, calculerNuits }) => {
  const { clients, loading: clientsLoading, searchClients, createClient } = useClients();
  
  const [mode, setMode] = useState('recherche');
  const [recherche, setRecherche] = useState('');
  const [resultatsRecherche, setResultatsRecherche] = useState([]);
  const [rechercheEffectuee, setRechercheEffectuee] = useState(false);
  const [creationClientLoading, setCreationClientLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cin: ''
  });

  const [errors, setErrors] = useState({});

  // CORRECTION : Utiliser selection.chambre (singulier) au lieu de selection.chambres
  const chambres = selection?.chambre || selection?.chambres || selection?.selectedRooms || selection?.rooms || [];
  const dateDebut = selection?.dateDebut || selection?.startDate || selection?.dates?.dateDebut || '';
  const dateFin = selection?.dateFin || selection?.endDate || selection?.dates?.dateFin || '';
  
  console.log('🔍 DEBUG - chambres après extraction:', chambres);
  console.log('🔍 DEBUG - dates après extraction:', dateDebut, dateFin);
  
  const nuits = calculerNuits(dateDebut, dateFin);
  
  const total = chambres.reduce((acc, chambre) => {
    const quantite = chambre.quantite || chambre.quantity || 1;
    const prix = chambre.prix || chambre.price || 0;
    return acc + (prix * nuits * quantite);
  }, 0);

  useEffect(() => {
    if (recherche.length >= 2) {
      const timer = setTimeout(() => {
        effectuerRecherche(recherche);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setResultatsRecherche([]);
      setRechercheEffectuee(false);
    }
  }, [recherche]);

  const effectuerRecherche = async (term) => {
    try {
      setRechercheEffectuee(true);
      await searchClients(term);
      setResultatsRecherche(clients);
    } catch (err) {
      console.error('Erreur recherche clients:', err);
      setResultatsRecherche([]);
    }
  };

  const selectionnerClient = (client) => {
    console.log('Client sélectionné:', client);
    setFormData({
      id: client.id,
      nom: client.nom || '',
      prenom: client.prenom || '',
      email: client.email || '',
      telephone: client.tel || client.telephone || '',
      cin: client.cin || ''
    });
    setMode('formulaire');
  };

  const passerEnModeNouveauClient = () => {
    setFormData({
      id: null,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      cin: ''
    });
    setMode('formulaire');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email est invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (!formData.cin.trim()) {
      newErrors.cin = 'Le CIN est requis';
    } else if (formData.cin.length < 6) {
      newErrors.cin = 'Le CIN doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!formData.id) {
      setCreationClientLoading(true);
      try {
        console.log('Création nouveau client:', formData);
        const nouveauClient = await createClient({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          tel: formData.telephone,
          cin: formData.cin
        });

        console.log('Nouveau client créé:', nouveauClient);
        
        const clientId = nouveauClient.id || nouveauClient.data?.id;
        
        if (clientId) {
          setFormData(prev => ({ ...prev, id: clientId }));
          onConfirm({ ...formData, id: clientId });
        } else {
          console.error('ID client non reçu après création');
          onConfirm(formData);
        }
      } catch (error) {
        console.error('Erreur création client:', error);
      } finally {
        setCreationClientLoading(false);
      }
    } else {
      console.log('Utilisation client existant:', formData);
      onConfirm(formData);
    }
  };

  const isFormValid = formData.nom && formData.prenom && formData.email && 
                     formData.telephone && formData.cin && formData.cin.length >= 6;

  const isLoading = loading || creationClientLoading;

  // Mode RECHERCHE
  if (mode === 'recherche') {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaSearch className="text-blue-500" />
              Rechercher un client
            </h2>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={clientsLoading}
            >
              <FaArrowLeft />
              Retour
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            {/* Afficher les informations de débogage en développement */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                <h4 className="font-bold text-yellow-800">Debug Info:</h4>
                <p className="text-yellow-700 text-sm">
                  Chambres: {chambres.length} | Dates: {dateDebut} - {dateFin}
                </p>
              </div>
            )}

            {/* Champ de recherche */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2 text-blue-500" />
                Rechercher un client existant
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                  placeholder="Nom, prénom, email, téléphone ou CIN..."
                  disabled={clientsLoading}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {clientsLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Tapez au moins 2 caractères pour rechercher dans la base de clients
              </p>
            </div>

            {/* Résultats de recherche */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Résultats de recherche {resultatsRecherche.length > 0 && `(${resultatsRecherche.length})`}
              </h3>
              
              {clientsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Recherche en cours...</p>
                </div>
              ) : recherche.length >= 2 && resultatsRecherche.length === 0 && rechercheEffectuee ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <FaUser className="text-gray-400 text-3xl mx-auto mb-2" />
                  <p className="text-gray-500">Aucun client trouvé</p>
                  <p className="text-gray-400 text-sm">Vérifiez les termes de recherche ou créez un nouveau client</p>
                </div>
              ) : recherche.length < 2 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <FaSearch className="text-gray-400 text-3xl mx-auto mb-2" />
                  <p className="text-gray-500">Commencez à taper pour rechercher un client</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {resultatsRecherche.map(client => (
                    <div
                      key={client.id}
                      onClick={() => selectionnerClient(client)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {client.prenom} {client.nom}
                          </h4>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-gray-400 text-xs" />
                              <span className="text-xs">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaPhone className="text-gray-400 text-xs" />
                              <span className="text-xs">{client.tel || client.telephone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaIdCard className="text-gray-400 text-xs" />
                              <span className="text-xs">CIN: {client.cin}</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors whitespace-nowrap">
                          Sélectionner
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Séparateur */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-gray-500 text-sm">OU</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Bouton Nouveau Client */}
            <div className="text-center">
              <button
                onClick={passerEnModeNouveauClient}
                className="flex items-center gap-3 px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold mx-auto"
                disabled={clientsLoading}
              >
                <FaPlus />
                Créer un nouveau client
              </button>
              <p className="text-gray-500 text-sm mt-2">
                Ajouter un client qui n'existe pas encore dans la base
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode FORMULAIRE
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaCreditCard className="text-green-500" />
              Finaliser la réservation
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formData.id ? `Client existant: ${formData.prenom} ${formData.nom}` : 'Nouveau client'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode('recherche')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <FaArrowLeft />
              Changer de client
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <FaArrowLeft />
              Retour
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Récapitulatif</h3>
              
              <div className="space-y-4 mb-4">
                <div className="pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Chambres sélectionnées</div>
                  {chambres.length > 0 ? (
                    <div className="space-y-3">
                      {chambres.map((chambre, index) => {
                        // Extraction robuste des propriétés de la chambre
                        const numero = chambre.numero || chambre.number || chambre.roomNumber || `CH${index + 1}`;
                        const typeNom = chambre.type?.nom || chambre.roomType?.name || chambre.category || 'Standard';
                        const prix = chambre.prix || chambre.price || 0;
                        const quantite = chambre.quantite || chambre.quantity || 1;
                        
                        return (
                          <div key={chambre.id || index} className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-gray-800 flex items-center gap-2">
                                <FaBed className="text-blue-500 text-sm" />
                                Chambre {numero}
                              </div>
                              <div className="text-sm text-gray-600 capitalize">
                                {typeNom}
                              </div>
                              {quantite > 1 && (
                                <div className="text-xs text-gray-500">
                                  Quantité: {quantite}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-800">{prix}€/nuit</div>
                              <div className="text-sm text-gray-600">
                                {prix * nuits * quantite}€
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <FaBed className="text-2xl mx-auto mb-2 opacity-50" />
                      <p>Aucune chambre sélectionnée</p>
                      <p className="text-xs mt-1">Veuillez retourner à l'étape précédente</p>
                    </div>
                  )}
                </div>

                <div className="pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Période</div>
                  <div className="font-semibold text-gray-800">
                    {dateDebut || 'Non définie'} au {dateFin || 'Non définie'}
                  </div>
                  <div className="text-sm text-gray-600">{nuits} nuit(s)</div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-gray-800">Total</div>
                    <div className="text-2xl font-bold text-green-600">{total}€</div>
                  </div>
                </div>
              </div>

              {/* Informations importantes */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">📋 Informations</h4>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Présentez votre CIN à l'arrivée</li>
                  <li>• Check-in: 14h00</li>
                  <li>• Check-out: 12h00</li>
                  <li>• {chambres.length} chambre(s) réservée(s)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Formulaire client */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
                  <FaUser className="text-blue-500" />
                  Informations du client
                </h3>
                {formData.id && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    ✓ Client existant
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Champ Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-gray-500" />
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.prenom 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    required
                    placeholder="Jean"
                    disabled={isLoading}
                  />
                  {errors.prenom && (
                    <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>
                  )}
                </div>

                {/* Champ Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-gray-500" />
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.nom 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    required
                    placeholder="Dupont"
                    disabled={isLoading}
                  />
                  {errors.nom && (
                    <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
                  )}
                </div>
                
                {/* Champ Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-gray-500" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    required
                    placeholder="jean.dupont@email.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                {/* Champ Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-gray-500" />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.telephone 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    required
                    placeholder="+33 6 12 34 56 78"
                    disabled={isLoading}
                  />
                  {errors.telephone && (
                    <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>
                  )}
                </div>

                {/* Champ CIN */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaIdCard className="inline mr-2 text-orange-500" />
                    CIN (Carte d'Identité Nationale) *
                  </label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.cin 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                    required
                    placeholder="AB123456"
                    maxLength="20"
                    disabled={isLoading}
                  />
                  {errors.cin && (
                    <p className="text-red-500 text-sm mt-1">{errors.cin}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Numéro de votre Carte d'Identité Nationale (minimum 6 caractères)
                  </p>
                </div>
              </div>

              {/* Aide validation */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 text-sm mb-2">⚠️ Informations requises</h4>
                <ul className="text-yellow-700 text-xs space-y-1">
                  <li>• Tous les champs marqués d'un * sont obligatoires</li>
                  <li>• Le CIN sera demandé à l'arrivée à l'hôtel</li>
                  <li>• Un email de confirmation sera envoyé à l'adresse fournie</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMode('recherche')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    Changer de client
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    Retour
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid || chambres.length === 0}
                  className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {creationClientLoading ? 'Création client...' : 'Confirmation...'}
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Confirmer la réservation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtapeConfirmation;