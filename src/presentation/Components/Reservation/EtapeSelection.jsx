import React, { useState } from 'react';
import { 
  FaCheck, FaArrowLeft, FaUserFriends, FaRulerCombined,
  FaWifi, FaTv, FaSnowflake, FaConciergeBell,
  FaBed, FaDoorOpen, FaPlus, FaMinus,
  FaStar, FaClock, FaShoppingCart
} from 'react-icons/fa';
import { MdKingBed, MdAcUnit, MdLocalBar } from 'react-icons/md';

const EtapeSelection = ({ chambres, dates, onSelect, onBack, calculerNuits }) => {
  const [selectedChambres, setSelectedChambres] = useState([]);
  const [quantites, setQuantites] = useState({});

  // ✅ Fonction pour formater l'URL de l'image
  const getChambreImage = (chambre) => {
    if (chambre.type?.image) {
      return chambre.type.image.startsWith('http') 
        ? chambre.type.image 
        : `http://127.0.0.1:8000${chambre.type.image}`;
    }
    return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop';
  };

  const getServiceIcon = (serviceNom) => {
    const nom = serviceNom?.toLowerCase() || '';
    if (nom.includes('wifi')) return <FaWifi className="text-blue-500" />;
    if (nom.includes('tv')) return <FaTv className="text-purple-500" />;
    if (nom.includes('clim') || nom.includes('air')) return <MdAcUnit className="text-cyan-500" />;
    if (nom.includes('lit')) return <MdKingBed className="text-orange-500" />;
    if (nom.includes('mini-bar') || nom.includes('bar')) return <MdLocalBar className="text-amber-500" />;
    return <FaConciergeBell className="text-gray-500" />;
  };

  const getServiceLabel = (service) => {
    if (typeof service === 'object' && service.nom) return service.nom;
    if (typeof service === 'string') return service;
    return 'Service';
  };

  // ✅ Gestion de la sélection multiple
  const toggleChambreSelection = (chambre) => {
    if (chambre.status === 'occupée') return;

    const isSelected = selectedChambres.some(c => c.id === chambre.id);
    
    if (isSelected) {
      setSelectedChambres(prev => prev.filter(c => c.id !== chambre.id));
      setQuantites(prev => {
        const newQuantites = { ...prev };
        delete newQuantites[chambre.id];
        return newQuantites;
      });
    } else {
      setSelectedChambres(prev => [...prev, chambre]);
      setQuantites(prev => ({
        ...prev,
        [chambre.id]: 1
      }));
    }
  };

  const updateQuantite = (chambreId, nouvelleQuantite) => {
    if (nouvelleQuantite < 1) return;
    
    setQuantites(prev => ({
      ...prev,
      [chambreId]: nouvelleQuantite
    }));
  };

  // Dans EtapeSelection.jsx
  const handleSubmit = () => {
    const chambresAvecQuantites = selectedChambres.map(chambre => ({
      ...chambre,
      quantite: quantites[chambre.id] || 1
    }));
    
    onSelect(chambresAvecQuantites); // ⚠️ Important : envoyer un tableau
  };

  const nuits = calculerNuits(dates.dateDebut, dates.dateFin);

  const calculerTotalGeneral = () => {
    return selectedChambres.reduce((total, chambre) => {
      const quantite = quantites[chambre.id] || 1;
      return total + (chambre.prix * nuits * quantite);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header avec glassmorphism */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <FaShoppingCart className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Sélection des chambres
                </h1>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <FaClock className="text-blue-500" />
                  {chambres.length} chambres disponibles • {nuits} nuit(s)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedChambres.length > 0 && (
                <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-2xl border border-green-200/60">
                  <div className="text-center">
                    <div className="text-xs text-green-600 font-medium">Total</div>
                    <div className="text-lg font-bold text-green-700">{calculerTotalGeneral()}€</div>
                  </div>
                  <div className="w-px h-8 bg-green-200/60"></div>
                  <div className="text-center">
                    <div className="text-xs text-green-600 font-medium">Chambres</div>
                    <div className="text-lg font-bold text-green-700">{selectedChambres.length}</div>
                  </div>
                </div>
              )}
              
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300/80 rounded-xl hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <FaArrowLeft className="text-sm" />
                <span className="font-medium">Retour</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panier flottant pour mobile */}
      {selectedChambres.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/60 p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-gray-800">{selectedChambres.length} chambre(s)</div>
                <div className="text-lg font-bold text-green-600">{calculerTotalGeneral()}€</div>
              </div>
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <FaCheck className="text-sm" />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cartes des chambres - Design moderne */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {chambres.map((chambre) => {
            const isSelected = selectedChambres.some(c => c.id === chambre.id);
            const quantite = quantites[chambre.id] || 1;
            const total = chambre.prix * nuits * quantite;

            return (
              <div
                key={chambre.id}
                className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  isSelected 
                    ? 'ring-4 ring-green-400/30 shadow-2xl scale-[1.02]' 
                    : chambre.status === 'occupée'
                    ? 'opacity-70 cursor-not-allowed'
                    : 'shadow-lg hover:shadow-2xl hover:scale-[1.02]'
                }`}
                onClick={() => chambre.status !== 'occupée' && toggleChambreSelection(chambre)}
              >
                {/* Image avec overlay gradient */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getChambreImage(chambre)}
                    alt={`Chambre ${chambre.numero}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Badges en haut */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      chambre.estPrive 
                        ? 'bg-blue-500/90 text-white' 
                        : 'bg-purple-500/90 text-white'
                    }`}>
                      {chambre.estPrive ? 'Suite Privée' : 'Chambre Standard'}
                    </span>
                    {chambre.type?.nbrLit > 1 && (
                      <span className="px-2 py-1 bg-orange-500/90 text-white rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                        <MdKingBed className="text-xs" />
                        {chambre.type.nbrLit} lits
                      </span>
                    )}
                  </div>

                  {/* Badge statut en haut à droite */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 ${
                      chambre.status === 'occupée' 
                        ? 'bg-red-500/90 text-white' 
                        : isSelected
                        ? 'bg-green-500/90 text-white'
                        : 'bg-emerald-500/90 text-white'
                    }`}>
                      {chambre.status === 'occupée' ? (
                        <>
                          <FaBed className="text-xs" />
                          Occupée
                        </>
                      ) : isSelected ? (
                        <>
                          <FaCheck className="text-xs" />
                          Sélectionnée
                        </>
                      ) : (
                        <>
                          <FaDoorOpen className="text-xs" />
                          Disponible
                        </>
                      )}
                    </span>
                  </div>

                  {/* Prix en bas à droite sur l'image */}
                  <div className="absolute bottom-4 right-4 text-right">
                    <div className="text-2xl font-bold text-white drop-shadow-lg">{chambre.prix}€</div>
                    <div className="text-white/90 text-sm drop-shadow">par nuit</div>
                  </div>

                  {/* Nom de la chambre en bas à gauche */}
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">Chambre {chambre.numero}</h3>
                    <p className="text-white/90 text-sm drop-shadow capitalize">{chambre.type?.nom || 'Standard'}</p>
                  </div>

                  {/* Overlay pour chambre occupée */}
                  {chambre.status === 'occupée' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white/95 rounded-2xl p-6 text-center shadow-2xl transform -rotate-2">
                        <FaBed className="text-red-500 text-2xl mx-auto mb-3" />
                        <div className="text-red-600 font-bold text-sm mb-1">INDISPONIBLE</div>
                        <div className="text-gray-500 text-xs">Chambre occupée</div>
                      </div>
                    </div>
                  )}

                  {/* Indicateur de sélection */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-green-500/10 border-4 border-green-400/30 rounded-3xl pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-green-500 text-white rounded-full p-4 shadow-2xl animate-pulse">
                          <FaCheck className="text-xl" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contenu sous l'image */}
                <div className="p-6">
                  {/* Capacité et superficie */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <FaUserFriends className="text-blue-500" />
                        <span>{chambre.type?.maxPersonnes || 2} personnes</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-1.5">
                        <FaRulerCombined className="text-green-500" />
                        <span>{chambre.estPrive ? '35' : '20'}m²</span>
                      </div>
                    </div>
                    
                    {/* Évaluation simulée */}
                    <div className="flex items-center gap-1 text-amber-500">
                      <FaStar className="text-sm" />
                      <span className="text-xs font-semibold text-gray-700">4.8</span>
                    </div>
                  </div>

                  {/* Services avec icônes modernes */}
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Services inclus</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {chambre.services && chambre.services.length > 0 ? (
                        chambre.services.slice(0, 4).map((service, index) => (
                          <div
                            key={service.id || index}
                            className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/80 rounded-lg p-2"
                          >
                            {getServiceIcon(getServiceLabel(service))}
                            <span className="font-medium">{getServiceLabel(service)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-gray-400 text-xs text-center py-2">
                          Aucun service spécifique
                        </div>
                      )}
                      {chambre.services && chambre.services.length > 4 && (
                        <div className="col-span-2 text-center">
                          <span className="text-xs text-blue-500 font-medium">
                            +{chambre.services.length - 4} autres services
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div className="border-t border-gray-200/60 my-4"></div>

                  {/* Actions et prix total */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Total {nuits} nuit(s){isSelected && quantite > 1 && ` × ${quantite}`}
                      </div>
                      <div className="text-xl font-bold text-green-600">{total}€</div>
                    </div>
                    
                    {/* Contrôles de quantité ou bouton d'ajout */}
                    {isSelected ? (
                      <div className="flex items-center gap-3 bg-green-50 rounded-2xl p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantite(chambre.id, quantite - 1);
                          }}
                          className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 text-green-600 hover:bg-green-100"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="w-8 text-center font-bold text-green-700">{quantite}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantite(chambre.id, quantite + 1);
                          }}
                          className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 text-green-600 hover:bg-green-100"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChambreSelection(chambre);
                        }}
                        disabled={chambre.status === 'occupée'}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                          chambre.status === 'occupée'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        <FaPlus />
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* État vide */}
        {chambres.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBed className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">Aucune chambre disponible</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Malheureusement, aucune chambre ne correspond à vos critères de recherche pour ces dates.
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Modifier les dates
            </button>
          </div>
        )}
      </div>

      {/* Panier fixe pour desktop */}
      {selectedChambres.length > 0 && (
        <div className="hidden md:block fixed bottom-8 right-8 z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/60 p-6 min-w-[320px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                <FaShoppingCart className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Votre sélection</h3>
                <p className="text-sm text-gray-600">{selectedChambres.length} chambre(s)</p>
              </div>
            </div>

            {/* Liste des chambres sélectionnées */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {selectedChambres.map(chambre => (
                <div key={chambre.id} className="flex items-center justify-between bg-gray-50/80 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{chambre.numero}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-800">Chambre {chambre.numero}</div>
                      <div className="text-xs text-gray-600">{chambre.prix}€/nuit</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantite(chambre.id, (quantites[chambre.id] || 1) - 1)}
                      className="w-6 h-6 rounded-full bg-white shadow-sm hover:shadow flex items-center justify-center text-gray-600 hover:text-gray-800"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="w-6 text-center font-bold text-gray-800">{quantites[chambre.id] || 1}</span>
                    <button
                      onClick={() => updateQuantite(chambre.id, (quantites[chambre.id] || 1) + 1)}
                      className="w-6 h-6 rounded-full bg-white shadow-sm hover:shadow flex items-center justify-center text-gray-600 hover:text-gray-800"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total et bouton de confirmation */}
            <div className="border-t border-gray-200/60 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-800">Total général</span>
                <span className="text-2xl font-bold text-green-600">{calculerTotalGeneral()}€</span>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <FaCheck />
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtapeSelection;