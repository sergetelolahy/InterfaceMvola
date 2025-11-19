import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const EtapeRecherche = ({ onRecherche, onCancel, loading }) => {
  const [dates, setDates] = useState({
    dateDebut: '',
    dateFin: ''
  });

  const [errors, setErrors] = useState({
    dateDebut: '',
    dateFin: ''
  });

  // Calculer la date minimale pour le départ (arrivée + 1 jour)
  const getMinDateFin = () => {
    if (!dates.dateDebut) return today;
    
    const dateDebut = new Date(dates.dateDebut);
    const minDate = new Date(dateDebut);
    minDate.setDate(dateDebut.getDate() + 1);
    
    return minDate.toISOString().split('T')[0];
  };

  // Réinitialiser la date de fin si elle devient invalide
  useEffect(() => {
    if (dates.dateDebut && dates.dateFin) {
      const minDateFin = getMinDateFin();
      if (dates.dateFin <= dates.dateDebut) {
        setDates(prev => ({ ...prev, dateFin: '' }));
        setErrors(prev => ({ 
          ...prev, 
          dateFin: 'La date de départ doit être après la date d\'arrivée' 
        }));
      } else {
        setErrors(prev => ({ ...prev, dateFin: '' }));
      }
    }
  }, [dates.dateDebut, dates.dateFin]);

  // Date minimale = aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!dates.dateDebut) {
      newErrors.dateDebut = 'La date d\'arrivée est requise';
    }
    
    if (!dates.dateFin) {
      newErrors.dateFin = 'La date de départ est requise';
    } else if (dates.dateFin <= dates.dateDebut) {
      newErrors.dateFin = 'La date de départ doit être après la date d\'arrivée';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onRecherche(dates.dateDebut, dates.dateFin);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDates(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const minDateFin = getMinDateFin();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaSearch className="text-blue-500" />
            Rechercher des chambres disponibles
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2 text-blue-500" />
                Date d'arrivée *
              </label>
              <input
                type="date"
                name="dateDebut"
                value={dates.dateDebut}
                onChange={handleChange}
                min={today}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.dateDebut 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              />
              {errors.dateDebut && (
                <p className="text-red-500 text-sm mt-1">{errors.dateDebut}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2 text-blue-500" />
                Date de départ *
              </label>
              <input
                type="date"
                name="dateFin"
                value={dates.dateFin}
                onChange={handleChange}
                min={minDateFin}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.dateFin 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
                disabled={!dates.dateDebut}
              />
              {errors.dateFin && (
                <p className="text-red-500 text-sm mt-1">{errors.dateFin}</p>
              )}
              {!dates.dateDebut && (
                <p className="text-gray-500 text-sm mt-1">
                  Sélectionnez d'abord une date d'arrivée
                </p>
              )}
            </div>
          </div>

          {/* Informations sur la durée */}
          {dates.dateDebut && dates.dateFin && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                <strong>Durée du séjour :</strong>{' '}
                {(() => {
                  const start = new Date(dates.dateDebut);
                  const end = new Date(dates.dateFin);
                  const diffTime = Math.abs(end - start);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return `${diffDays} nuit${diffDays > 1 ? 's' : ''}`;
                })()}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !dates.dateDebut || !dates.dateFin || dates.dateFin <= dates.dateDebut}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Recherche...
                </>
              ) : (
                <>
                  <FaSearch />
                  Rechercher les chambres
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EtapeRecherche;