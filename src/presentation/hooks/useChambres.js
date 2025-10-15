import { useState, useEffect } from "react";
import CreateChambre from "../../application/use_cases/CreateChambre";
import DeleteChambre from "../../application/use_cases/DeleteChambre";
import GetChambre from "../../application/use_cases/GetChambres";
import UpdateChambre from "../../application/use_cases/UpdateChambre";
import HttpChambreRepository from "../../infrastructure/repositories/HttpChambreRepository";

const chambreRepository = new HttpChambreRepository();
const getChambreUseCase = new GetChambre(chambreRepository);
const createChambreUseCase = new CreateChambre(chambreRepository);
const updateChambreUseCase = new UpdateChambre(chambreRepository);
const deleteChambreUseCase = new DeleteChambre(chambreRepository);

export const useChambres = () => {
  const [chambres, setChambres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour extraire le message d'erreur depuis AxiosError
  const getErrorMessage = (error) => {
    if (error.response && error.response.data) {
      // Si le backend retourne un message d'erreur spécifique
      return error.response.data.message || error.response.data.error || 'Erreur serveur';
    }
    if (error.message) {
      // Message d'erreur Axios
      if (error.message.includes('500')) {
        return 'Erreur interne du serveur. Veuillez réessayer.';
      }
      if (error.message.includes('404')) {
        return 'Ressource non trouvée.';
      }
      if (error.message.includes('409')) {
        return 'Le numéro de chambre existe déjà.';
      }
      if (error.message.includes('400')) {
        return 'Données invalides. Vérifiez les informations saisies.';
      }
      return error.message;
    }
    return 'Une erreur inconnue est survenue';
  };

  // Fonction pour extraire les données brutes d'une instance Chambre
  const extractChambreData = (chambreInstance) => {
    // Si c'est déjà un objet simple, le retourner tel quel
    if (typeof chambreInstance === 'object' && (!chambreInstance.constructor || chambreInstance.constructor.name === 'Object')) {
      return chambreInstance;
    }
    
    // Si c'est une instance de Chambre, extraire ses propriétés
    if (chambreInstance && typeof chambreInstance === 'object') {
      const data = {};
      
      // Extraire toutes les propriétés énumérables
      for (const key in chambreInstance) {
        if (chambreInstance.hasOwnProperty(key)) {
          data[key] = chambreInstance[key];
        }
      }
      
      // Essayer d'accéder aux propriétés via getters si elles existent
      if (chambreInstance.id !== undefined) data.id = chambreInstance.id;
      if (chambreInstance.numero !== undefined) data.numero = chambreInstance.numero;
      if (chambreInstance.prix !== undefined) data.prix = chambreInstance.prix;
      if (chambreInstance.typechambre_id !== undefined) data.typechambre_id = chambreInstance.typechambre_id;
      if (chambreInstance.estPrive !== undefined) data.estPrive = chambreInstance.estPrive;
      
      return data;
    }
    
    return chambreInstance;
  };

  // Fonction pour normaliser la structure d'une chambre
  const normalizeChambre = (chambreData) => {
    const chambre = extractChambreData(chambreData);
    
    console.log('🔵 Données chambre à normaliser:', chambre);

    // Si la chambre a un objet type, on extrait le nom
    if (chambre.type && chambre.type.nom) {
      return {
        ...chambre,
        typechambre_id: chambre.type.id,
        typeChambreNom: chambre.type.nom,
        estPrive: chambre.estPrive !== undefined ? chambre.estPrive : true
      };
    }
    
    // Si la structure est déjà normalisée
    if (chambre.typeChambreNom) {
      return {
        ...chambre,
        estPrive: chambre.estPrive !== undefined ? chambre.estPrive : true
      };
    }
    
    // Structure inconnue, retourner avec des valeurs par défaut
    return {
      ...chambre,
      typechambre_id: chambre.typechambre_id || '',
      typeChambreNom: 'Non défini',
      estPrive: chambre.estPrive !== undefined ? chambre.estPrive : true
    };
  };

  const fetchChambres = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🟡 Début fetchChambres...');
      const chambresData = await getChambreUseCase.execute();
      console.log('🟢 Données reçues:', chambresData);
      
      // Gestion sécurisée des données
      let finalData = chambresData;
      if (chambresData && !Array.isArray(chambresData)) {
        if (chambresData.data && Array.isArray(chambresData.data)) {
          finalData = chambresData.data;
        } else if (chambresData.chambres && Array.isArray(chambresData.chambres)) {
          finalData = chambresData.chambres;
        } else if (chambresData.content && Array.isArray(chambresData.content)) {
          finalData = chambresData.content;
        } else {
          finalData = [];
        }
      }
      
      // Normaliser toutes les chambres
      const chambresNormalisees = Array.isArray(finalData) 
        ? finalData.map(normalizeChambre)
        : [];
      
      console.log('🟢 Chambres normalisées:', chambresNormalisees);
      setChambres(chambresNormalisees);
    } catch (err) {
      console.error('🔴 Erreur fetchChambres:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createChambre = async (chambreData) => {
    setError(null);
    try {
      console.log('🟡 Création chambre:', chambreData);
      const newChambre = await createChambreUseCase.execute(chambreData);
      console.log('🟢 Chambre créée (brute):', newChambre);
      
      // DEBUG: Vérifier la structure complète
      console.log('🔵 Structure complète de la chambre:');
      console.log('- Type:', typeof newChambre);
      console.log('- Constructor:', newChambre?.constructor?.name);
      console.log('- Keys:', Object.keys(newChambre || {}));
      console.log('- JSON:', JSON.stringify(newChambre, null, 2));
      
      // Extraire et normaliser la nouvelle chambre
      const normalizedChambre = normalizeChambre(newChambre);
      console.log('🟢 Chambre normalisée:', normalizedChambre);
      
      setChambres(prev => [...prev, normalizedChambre]);
      return normalizedChambre;
    } catch (err) {
      console.error('🔴 Erreur création:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateChambre = async (id, chambreData) => {
    setError(null);
    try {
      console.log('🟡 Mise à jour chambre:', id, chambreData);
      const updatedChambre = await updateChambreUseCase.execute({ id, ...chambreData });
      console.log('🟢 Chambre mise à jour (brute):', updatedChambre);
      
      // Normaliser la chambre mise à jour
      const normalizedChambre = normalizeChambre(updatedChambre);
      
      setChambres(prev => prev.map(chambre => 
        chambre.id === id ? normalizedChambre : chambre
      ));
      return normalizedChambre;
    } catch (err) {
      console.error('🔴 Erreur mise à jour:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteChambre = async (id) => {
    setError(null);
    try {
      console.log('🟡 Suppression chambre:', id);
      await deleteChambreUseCase.execute(id);
      setChambres(prev => prev.filter(chambre => chambre.id !== id));
    } catch (err) {
      console.error('🔴 Erreur suppression:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchChambres();
  }, []);

  return {
    chambres,
    loading,
    error,
    createChambre,
    updateChambre,
    deleteChambre,
    refetch: fetchChambres,
    clearError
  };
};