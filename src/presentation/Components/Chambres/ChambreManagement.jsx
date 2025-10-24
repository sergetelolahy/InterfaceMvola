import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaPlus, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';
import ChambreGrid from './ChambreGrid';
import ChambreForm from './ChambreForm';
import { useChambres } from '../../hooks/useChambres';

/**
 * Composant principal de gestion des chambres
 * Gère l'affichage, la création, la modification et la suppression des chambres
 * 
 * @returns {JSX.Element} Composant de gestion des chambres
 */
const ChambreManagement = () => {
  // États pour la gestion de l'interface
  const [showForm, setShowForm] = useState(false);
  const [editingChambre, setEditingChambre] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isTypesOpen, setIsTypesOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Configuration de la pagination
  const itemsPerPage = 4;

  // Récupération des données et fonctions via le hook personnalisé
  const { chambres, loading, error, createChambre, updateChambre, deleteChambre } = useChambres();

  // Debug: Afficher la structure des données
  useEffect(() => {
    if (chambres.length > 0) {
      console.log('Première chambre:', chambres[0]);
      console.log('Structure type:', chambres[0]?.type);
      console.log('Toutes les chambres:', chambres);
    }
  }, [chambres]);

  /**
   * Extrait les types de chambre uniques pour le filtre
   */
  const typesChambre = useMemo(() => {
    console.log('Extraction des types...'); // Debug
    
    const types = chambres
      .map(chambre => {
        // Plusieurs possibilités pour le nom du type
        const typeName = chambre.typeChambreNom 
        console.log(`Chambre ${chambre.numero}:`, { 
          
          
          typeChambreNom: chambre.typeChambreNom,
          extracted: typeName
        }); // Debug
        return typeName;
      })
      .filter(Boolean)
      .filter((nom, index, array) => array.indexOf(nom) === index);
    
    console.log('Types extraits:', types); // Debug
    return types.sort();
  }, [chambres]);

  /**
   * Filtre les chambres selon le terme de recherche et les types sélectionnés
   */
  const filteredChambres = chambres.filter(chambre => {
    // Essayer différentes propriétés possibles pour le nom du type
    const typeName = chambre.type?.nom || 
                    chambre.typeChambre?.nom || 
                    chambre.typeChambreNom ||
                    chambre.type_nom;
    
    const matchesSearch = 
      chambre.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeName && typeName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      selectedTypes.length === 0 || 
      (typeName && selectedTypes.includes(typeName));
    
    return matchesSearch && matchesType;
  });

  /**
   * Gère la sélection/déselection d'un type
   */
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1);
  };

  /**
   * Sélectionne tous les types
   */
  const selectAllTypes = () => {
    setSelectedTypes([...typesChambre]);
    setCurrentPage(1);
  };

  /**
   * Désélectionne tous les types
   */
  const clearAllTypes = () => {
    setSelectedTypes([]);
    setCurrentPage(1);
  };

  /**
   * Gère la création d'une nouvelle chambre
   */
  const handleCreate = () => {
    setEditingChambre(null);
    setShowForm(true);
  };

  /**
   * Gère l'édition d'une chambre existante
   */
  const handleEdit = (chambre) => {
    setEditingChambre(chambre);
    setShowForm(true);
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (chambreData) => {
    try {
      if (editingChambre) {
        await updateChambre(editingChambre.id, chambreData);
      } else {
        await createChambre(chambreData);
        setCurrentPage(1);
      }
      setShowForm(false);
      setEditingChambre(null);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
    }
  };

  /**
   * Annule l'édition/création
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingChambre(null);
  };

  /**
   * Gère la suppression d'une chambre
   */
  const handleDelete = async (id) => {
    try {
      await deleteChambre(id);
      
      const totalPages = Math.ceil(filteredChambres.length / itemsPerPage);
      if (filteredChambres.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  /**
   * Gère le changement de page
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  /**
   * Réinitialise tous les filtres
   */
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setCurrentPage(1);
  };

  // Affichage du formulaire
  if (showForm) {
    return (
      <ChambreForm
        chambre={editingChambre}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* ========== EN-TÊTE AVEC RECHERCHE ET FILTRES ========== */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Titre et informations */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 text-lg">
                <span className="font-semibold text-blue-600">{filteredChambres.length}</span> chambre(s) trouvée(s)
                {chambres.length > 0 && (
                  <span className="text-gray-400 ml-2">
                    (sur {chambres.length} au total)
                  </span>
                )}
              </p>
              {(searchTerm || selectedTypes.length > 0) && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  Filtres actifs
                </span>
              )}
            </div>
          </div>
          
          {/* Bouton de création */}
          <button 
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaPlus className="mr-3" /> 
            <span className="font-semibold">Nouvelle chambre</span>
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Barre de recherche */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher par numéro ou type..." 
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm group-hover:shadow-md"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Multiselect des types */}
          <div className="relative">
            <button
              onClick={() => setIsTypesOpen(!isTypesOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-gray-700">
                  {selectedTypes.length === 0 
                    ? "Tous les types" 
                    : `${selectedTypes.length} type(s) sélectionné(s)`
                  }
                </span>
              </div>
              <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isTypesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown des types */}
            {isTypesOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                {/* En-tête du dropdown */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Types de chambres ({typesChambre.length})
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={selectAllTypes}
                        disabled={typesChambre.length === 0}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Tout
                      </button>
                      <button 
                        onClick={clearAllTypes}
                        disabled={selectedTypes.length === 0}
                        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Aucun
                      </button>
                    </div>
                  </div>
                </div>

                {/* Liste des types */}
                <div className="max-h-60 overflow-y-auto">
                  {typesChambre.length > 0 ? (
                    typesChambre.map((type) => (
                      <label 
                        key={type}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 flex-1">{type}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          selectedTypes.includes(type) ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </label>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {chambres.length === 0 ? 
                        "Aucune chambre chargée" : 
                        "Aucun type de chambre trouvé dans les données"
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton réinitialiser */}
          {(searchTerm || selectedTypes.length > 0) && (
            <button 
              onClick={handleResetFilters}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FaTimes className="mr-2" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Badges des filtres actifs */}
        {(searchTerm || selectedTypes.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-fade-in">
                🔍 "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-blue-600 rounded-full p-1 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTypes.map(type => (
              <span 
                key={type}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-fade-in"
              >
                🏨 {type}
                <button 
                  onClick={() => toggleType(type)}
                  className="hover:bg-green-600 rounded-full p-1 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* ========== GRILLE DES CHAMBRES ========== */}
      <ChambreGrid
        chambres={filteredChambres}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ChambreManagement;