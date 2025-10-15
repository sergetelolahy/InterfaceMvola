import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

const TypeChambreForm = ({ typeChambre, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    maxPersonnes: '',
    nbrLit: '',
    description: ''
  });

  useEffect(() => {
    if (typeChambre) {
      setFormData({
        nom: typeChambre.nom || '',
        maxPersonnes: typeChambre.maxPersonnes || '',
        nbrLit: typeChambre.nbrLit || '',
        description: typeChambre.description || ''
      });
    }
  }, [typeChambre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.nom || !formData.maxPersonnes || !formData.nbrLit) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Conversion en nombres
    const typeChambreData = {
      ...formData,
      maxPersonnes: parseInt(formData.maxPersonnes),
      nbrLit: parseInt(formData.nbrLit)
    };

    onSubmit(typeChambreData);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {typeChambre ? 'Modifier le type de chambre' : 'Nouveau type de chambre'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom du type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du type *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ex: Standard"
              required
            />
          </div>

          {/* Personnes maximum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personnes maximum *
            </label>
            <input
              type="number"
              name="maxPersonnes"
              value={formData.maxPersonnes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ex: 2"
              min="1"
              required
            />
          </div>

          {/* Nombre de lits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de lits *
            </label>
            <input
              type="number"
              name="nbrLit"
              value={formData.nbrLit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Ex: 1"
              min="1"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Description du type de chambre..."
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 flex items-center"
          >
            <FaSave className="mr-2" />
            {typeChambre ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TypeChambreForm;