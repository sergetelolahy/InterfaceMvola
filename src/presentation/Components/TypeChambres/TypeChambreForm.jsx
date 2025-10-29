import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaImage, FaUpload } from 'react-icons/fa';

const TypeChambreForm = ({ typeChambre, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    maxPersonnes: '',
    nbrLit: '',
    description: '',
    image: '' // URL de l'image enregistrée
  });

  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (typeChambre) {
      setFormData({
        nom: typeChambre.nom || '',
        maxPersonnes: typeChambre.maxPersonnes || '',
        nbrLit: typeChambre.nbrLit || '',
        description: typeChambre.description || '',
        image: typeChambre.image || ''
      });

      if (typeChambre.image) {
        // Formater correctement l'URL pour l'affichage
        const formattedImageUrl = typeChambre.image.startsWith('http') 
          ? typeChambre.image 
          : `http://127.0.0.1:8000${typeChambre.image}`;
        setImagePreview(formattedImageUrl);
      }
    }
  }, [typeChambre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type et la taille
    if (!file.type.match('image.*')) {
      alert('Veuillez sélectionner un fichier image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5MB).');
      return;
    }

    // Aperçu immédiat de l'image sélectionnée
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    const form = new FormData();
    form.append('image', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload-image', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const data = await response.json();

      // Formater l'URL retournée par l'API
      const formattedUrl = data.url.startsWith('http') 
        ? data.url 
        : `http://127.0.0.1:8000${data.url}`;

      setFormData(prev => ({
        ...prev,
        image: data.url // Garder l'URL originale pour l'envoi au backend
      }));
      
      // Mettre à jour l'aperçu avec l'URL formatée
      setImagePreview(formattedUrl);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image.');
      // En cas d'erreur, réinitialiser l'aperçu
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleImageClear = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setImagePreview('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nom || !formData.maxPersonnes || !formData.nbrLit) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

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
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
              placeholder="Ex: 1"
              min="1"
              required
            />
          </div>

          {/* Upload d'image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex items-center space-x-2">
              <label className="flex-1 cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  disabled={uploading}
                />
                <div className={`px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center ${
                  uploading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'
                }`}>
                  <FaUpload className="mr-2" />
                  {uploading ? 'Upload en cours...' : 'Choisir une image'}
                </div>
              </label>
              {formData.image && (
                <button
                  type="button"
                  onClick={handleImageClear}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-200"
                  disabled={uploading}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés: JPEG, PNG, GIF. Taille max: 5MB.
            </p>
          </div>

          {/* Aperçu de l'image CORRIGÉ */}
          {imagePreview && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aperçu de l'image
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="max-w-full h-48 object-cover rounded mx-auto"
                  onError={(e) => {
                    console.error('Erreur de chargement de l\'image:', imagePreview);
                    e.target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop';
                  }}
                />
                <p className="text-xs text-gray-500 text-center mt-2 break-all">
                  {formData.image}
                </p>
              </div>
            </div>
          )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200"
              placeholder="Description du type de chambre..."
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={uploading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Upload...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {typeChambre ? 'Modifier' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TypeChambreForm;