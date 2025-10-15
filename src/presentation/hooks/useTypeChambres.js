import { useState, useEffect } from "react";

import CreateTypeChambre from "../../application/use_cases/CreateTypeChambre";
import UpdateTypeChambre from "../../application/use_cases/UpdateTypeChambre";
import DeleteTypeChambre from "../../application/use_cases/DeleteTypeChambre";
import HttpTypeChambreRepository from "../../infrastructure/repositories/HttpTypeChambreRepository";
import GetTypeChambres from "../../application/use_cases/GetTypeChambres";

const typeChambreRepository = new HttpTypeChambreRepository();
const getTypeChambresUseCase = new GetTypeChambres(typeChambreRepository);
const createTypeChambreUseCase = new CreateTypeChambre(typeChambreRepository);
const updateTypeChambreUseCase = new UpdateTypeChambre(typeChambreRepository);
const deleteTypeChambreUseCase = new DeleteTypeChambre(typeChambreRepository);

export const useTypeChambres = () => {
  const [typeChambres, setTypeChambres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTypeChambres = async () => {
    setLoading(true);
    setError(null);
    try {
      const typeChambresData = await getTypeChambresUseCase.execute();

      let finalData = typeChambresData;
      if (typeChambresData && !Array.isArray(typeChambresData)) {
        if (typeChambresData.data && Array.isArray(typeChambresData.data)) {
          finalData = typeChambresData.data;
        } else if (typeChambresData.typeChambres && Array.isArray(typeChambresData.typeChambres)) {
          finalData = typeChambresData.typeChambres;
        } else if (typeChambresData.content && Array.isArray(typeChambresData.content)) {
          finalData = typeChambresData.content;
        } else {
          finalData = [];
        }
      }

      setTypeChambres(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error('🔴 Erreur fetchTypeChambres:', err);
      setError(err.message || 'Erreur lors du chargement des types de chambres');
    } finally {
      setLoading(false);
    }
  };

  const createTypeChambre = async (typeChambreData) => {
    try {
      await createTypeChambreUseCase.execute(typeChambreData);
      await fetchTypeChambres();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du type de chambre');
      throw err;
    }
  };

  const updateTypeChambre = async (id, typeChambreData) => {
    try {
      await updateTypeChambreUseCase.execute(id, typeChambreData);
      await fetchTypeChambres();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du type de chambre');
      throw err;
    }
  };

  const deleteTypeChambre = async (id) => {
    try {
      await deleteTypeChambreUseCase.execute(id);
      await fetchTypeChambres();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du type de chambre');
      throw err;
    }
  };

  useEffect(() => {
    fetchTypeChambres();
  }, []);

  return {
    typeChambres,
    loading,
    error,
    createTypeChambre,
    updateTypeChambre,
    deleteTypeChambre,
    refetch: fetchTypeChambres
  };
};
