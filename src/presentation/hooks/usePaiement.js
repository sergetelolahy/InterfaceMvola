import { useState, useEffect } from "react";

// Importation des use cases et du repository
import HttpPaiementRepository from "../../infrastructure/repositories/HttpPaiementRepository";
import CreatePaiement from "../../application/use_cases/reception/CreatePaiement";
import DeletePaiement from "../../application/use_cases/reception/DeletePaiement";
import UpdatePaiement from "../../application/use_cases/reception/UpdatePaiement";
import GetPaiement from "../../application/use_cases/reception/GetPaiement";

const paiementRepository = new HttpPaiementRepository();
const getPaiementsUseCase = new GetPaiement(paiementRepository);
const createPaiementUseCase = new CreatePaiement(paiementRepository);
const updatePaiementUseCase = new UpdatePaiement(paiementRepository);
const deletePaiementUseCase = new DeletePaiement(paiementRepository);

export const usePaiement = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Charger tous les paiements
  const fetchPaiements = async () => {
    setLoading(true);
    setError(null);
    try {
      const paiementsData = await getPaiementsUseCase.execute();

      let finalData = Array.isArray(paiementsData) ? paiementsData : [];

      // Tri par date de paiement décroissante
      finalData.sort((a, b) => new Date(b.date_paiement) - new Date(a.date_paiement));

      setPaiements(finalData);
    } catch (err) {
      console.error("💥 Erreur fetchPaiements:", err);
      setError(err.message || "Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Créer un paiement
  const createPaiement = async (paiementData) => {
    try {
      setError(null);
      const response = await createPaiementUseCase.execute(paiementData);
      await fetchPaiements();
      return response;
    } catch (err) {
      console.error("💥 Erreur création paiement:", err);
      setError(err.message || "Erreur lors de la création du paiement");
      throw err;
    }
  };

  // 🔹 Mettre à jour un paiement
  const updatePaiement = async (id, paiementData) => {
    try {
      setError(null);
      await updatePaiementUseCase.execute(id, paiementData);
      await fetchPaiements();
    } catch (err) {
      console.error("💥 Erreur updatePaiement:", err);
      setError(err.message || "Erreur lors de la mise à jour du paiement");
      throw err;
    }
  };

  // 🔹 Supprimer un paiement
  const deletePaiement = async (id) => {
    try {
      setError(null);
      await deletePaiementUseCase.execute(id);
      await fetchPaiements();
    } catch (err) {
      console.error("💥 Erreur deletePaiement:", err);
      setError(err.message || "Erreur lors de la suppression du paiement");
      throw err;
    }
  };

  // 🔹 Rechercher un paiement (filtrage local ou distant)
  const searchPaiements = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const paiementsData = await getPaiementsUseCase.execute();

      let finalData = paiementsData;

      if (Array.isArray(finalData) && searchTerm) {
        finalData = finalData.filter(
          (p) =>
            p.mode_paiement.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.id_reservation).includes(searchTerm)
        );
      }

      finalData.sort((a, b) => new Date(b.date_paiement) - new Date(a.date_paiement));

      setPaiements(finalData);
    } catch (err) {
      console.error("💥 Erreur searchPaiements:", err);
      setError(err.message || "Erreur lors de la recherche des paiements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  return {
    paiements,
    loading,
    error,
    createPaiement,
    updatePaiement,
    deletePaiement,
    searchPaiements,
    refetch: fetchPaiements,
  };
};
