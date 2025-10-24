import React, { useState, useEffect } from 'react';

const ServicesForm = ({ service, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });

  useEffect(() => {
    if (service) {
      setFormData({
        nom: service.nom || '',
        description: service.description || ''
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        {service ? 'Modifier le service' : 'Nouveau service'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nom *
          </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600"
          >
            {service ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicesForm;