import React, { useState, useEffect } from 'react';
import { FaCheck, FaArrowLeft, FaHotel, FaCreditCard } from 'react-icons/fa';
import EtapeRecherche from './EtapeRecherche';
import EtapeSelection from './EtapeSelection';
import EtapeConfirmation from './EtapeConfirmation';
import EtapeFinale from './EtapeFinale';
import ListeReservations from './ListeReservations';
import { useChambres } from '../../hooks/useChambres';
import { useReservations } from '../../hooks/useReservation';
import { useClients } from '../../hooks/useClients';
import { usePaiement } from '../../hooks/usePaiement';

// Constantes pour les statuts
const STATUTS_PAIEMENT = {
  COMPLET: 'complete',
  PARTIEL: 'partielle',
  ANNULE: 'annule'
};

const STATUTS_RESERVATION = {
  CONFIRMEE: 'confirmée',
  EN_ATTENTE: 'en_attente',
  ANNULEE: 'annulée'
};

const STATUTS_FINANCIERS = {
  PAYEE: 'payee',
  PARTIELLEMENT_PAYEE: 'partiellement_payee',
  NON_PAYEE: 'non_payee'
};

const ReservationManagement = () => {
  const { chambres, loading: chambresLoading, getChambresDisponibles } = useChambres();
  const { reservations, loading: reservationsLoading, createReservation, updateReservation } = useReservations();
  const { createClient } = useClients();
  const { createPaiement, loading: paiementLoading } = usePaiement();

  const [etapeActuelle, setEtapeActuelle] = useState('liste');
  const [selection, setSelection] = useState({
    chambre: [],
    dateDebut: '',
    dateFin: '',
    client: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calcul du nombre de nuits
  const calculerNuits = (dateDebut, dateFin) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Déterminer le statut financier basé sur le paiement
  const determinerStatutFinancier = (montantPaye, montantTotal) => {
    if (montantPaye >= montantTotal) {
      return STATUTS_FINANCIERS.PAYEE;
    } else if (montantPaye > 0) {
      return STATUTS_FINANCIERS.PARTIELLEMENT_PAYEE;
    } else {
      return STATUTS_FINANCIERS.NON_PAYEE;
    }
  };

  // Déterminer le statut de réservation basé sur le statut financier
  const determinerStatutReservation = (statutFinancier) => {
    switch (statutFinancier) {
      case STATUTS_FINANCIERS.PAYEE:
        return STATUTS_RESERVATION.CONFIRMEE;
      case STATUTS_FINANCIERS.PARTIELLEMENT_PAYEE:
        return STATUTS_RESERVATION.EN_ATTENTE; // En attente du solde
      case STATUTS_FINANCIERS.NON_PAYEE:
        return STATUTS_RESERVATION.EN_ATTENTE;
      default:
        return STATUTS_RESERVATION.EN_ATTENTE;
    }
  };

  // Navigation étapes
  const demarrerNouvelleReservation = () => {
    setSelection({
      chambre: [],
      dateDebut: '',
      dateFin: '',
      client: null
    });
    setEtapeActuelle('recherche');
  };
  
  const annulerRecherche = () => setEtapeActuelle('liste');
  const retourEtapeRecherche = () => setEtapeActuelle('recherche');
  const retourEtapeSelection = () => setEtapeActuelle('selection');

  // Recherche chambres disponibles
  const rechercherChambresDisponibles = async (dateDebut, dateFin) => {
    setSelection(prev => ({ ...prev, dateDebut, dateFin }));
    await getChambresDisponibles(dateDebut, dateFin);
    setEtapeActuelle('selection');
  };

  // Sélection de plusieurs chambres
  const selectionnerChambres = (chambresSelectionnees) => {
    console.log('🔍 Chambres sélectionnées:', chambresSelectionnees);
    setSelection(prev => ({ ...prev, chambre: chambresSelectionnees }));
    setEtapeActuelle('confirmation');
  };

  // Confirmer le client (sans créer la réservation)
  const confirmerClient = async (donneesClient) => {
    setLoading(true);
    setError(null);
    
    try {
      let clientId = donneesClient.id;

      // Si le client n'a pas d'ID, c'est un nouveau client
      if (!clientId) {
        const nouveauClient = await createClient({
          nom: donneesClient.nom,
          prenom: donneesClient.prenom,
          email: donneesClient.email,
          tel: donneesClient.telephone,
          cin: donneesClient.cin
        });
        
        clientId = nouveauClient.id || nouveauClient.data?.id;
      }

      // Mettre à jour la sélection avec le client
      setSelection(prev => ({
        ...prev,
        client: { ...donneesClient, id: clientId }
      }));

      // Passer à l'étape finale pour créer réservation + paiement
      setEtapeActuelle('finale');
      
    } catch (error) {
      console.error('❌ Erreur création client:', error);
      setError(error.message || 'Erreur lors de la création du client');
    } finally {
      setLoading(false);
    }
  };

  // Créer la réservation avec plusieurs chambres
  const creerReservationEtPaiement = async (donneesPaiement) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 DEBUG - selection:', selection);
      console.log('🔍 DEBUG - chambres:', selection.chambre);
  
      if (!selection.client || !selection.chambre || selection.chambre.length === 0) {
        throw new Error('Données de réservation incomplètes: client ou chambres manquants');
      }
  
      // Formater les IDs des chambres
      const idChambres = selection.chambre.map(chambre => chambre.id).join(',');
      console.log('🔍 IDs chambres formatés:', idChambres);
  
      // Calculer le total pour toutes les chambres
      const nuits = calculerNuits(selection.dateDebut, selection.dateFin);
      const totalChambres = selection.chambre.reduce((total, chambre) => {
        const quantite = chambre.quantite || 1;
        return total + (chambre.prix * nuits * quantite);
      }, 0);

      // Déterminer les statuts CORRECTEMENT
      const statutFinancier = determinerStatutFinancier(donneesPaiement.montant, totalChambres);
      const statutReservation = determinerStatutReservation(statutFinancier);
  
      // 1. Créer la réservation
      const reservationData = {
        id_client: selection.client.id,
        id_chambre: idChambres,
        date_debut: selection.dateDebut,
        date_fin: selection.dateFin,
        statut: statutReservation, // Statut de workflow (confirmée, en_attente)
        statut_paiement: statutFinancier, // Statut financier (payee, partiellement_payee, non_payee)
        montant_total: Math.round(totalChambres),
        acompte: donneesPaiement.montant,
        tarif_template: Math.round(totalChambres)
      };
  
      console.log('📤 Création réservation:', reservationData);
  
      const nouvelleReservation = await createReservation(reservationData);
      
      console.log('✅ Réservation créée:', nouvelleReservation);
  
      // Récupérer l'ID de la réservation
      let reservationId;
      
      if (nouvelleReservation && nouvelleReservation.id) {
        reservationId = nouvelleReservation.id;
      } else if (nouvelleReservation && nouvelleReservation.data && nouvelleReservation.data.id) {
        reservationId = nouvelleReservation.data.id;
      } else if (nouvelleReservation && nouvelleReservation.reservation && nouvelleReservation.reservation.id) {
        reservationId = nouvelleReservation.reservation.id;
      } else {
        console.error('❌ Structure de réponse inattendue:', nouvelleReservation);
        throw new Error('Impossible de récupérer l\'ID de la réservation créée');
      }
  
      console.log('🔑 ID réservation récupéré:', reservationId);

      // 2. Créer le paiement seulement si le montant est > 0
      let resultatPaiement = null;
      if (donneesPaiement.montant > 0) {
        // Déterminer le statut du paiement
        const statutPaiement = donneesPaiement.montant >= totalChambres 
          ? STATUTS_PAIEMENT.COMPLET 
          : STATUTS_PAIEMENT.PARTIEL;

        const paiementData = {
          id_reservation: reservationId,
          montant: donneesPaiement.montant,
          date_paiement: donneesPaiement.date_paiement,
          mode_paiement: donneesPaiement.mode_paiement,
          status: statutPaiement
        };
  
        console.log('💳 Création paiement:', paiementData);
        resultatPaiement = await createPaiement(paiementData);
      }
  
      console.log('✅ Réservation et paiement confirmés avec succès');
      
      // Retourner les données complètes
      return {
        id: resultatPaiement?.id,
        montant: donneesPaiement.montant,
        date_paiement: donneesPaiement.date_paiement,
        mode_paiement: donneesPaiement.mode_paiement,
        status: resultatPaiement?.status || STATUTS_PAIEMENT.COMPLET,
        reservation: {
          id: reservationId,
          date_debut: selection.dateDebut,
          date_fin: selection.dateFin,
          statut: statutReservation,
          statut_paiement: statutFinancier,
          client: selection.client,
          chambres: selection.chambre,
          montant_total: totalChambres,
          acompte: donneesPaiement.montant
        },
        client: selection.client,
        chambres: selection.chambre,
        dates: {
          dateDebut: selection.dateDebut,
          dateFin: selection.dateFin
        },
        nuits: nuits,
        total: totalChambres,
        statut_paiement: statutFinancier
      };
      
    } catch (error) {
      console.error('❌ Erreur création réservation/paiement:', error);
      setError(error.response?.data?.message || error.message || 'Erreur lors de la création de la réservation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le statut d'une réservation après paiement
  const mettreAJourStatutReservation = async (reservationId, montantPaye, montantTotal) => {
    try {
      const statutFinancier = determinerStatutFinancier(montantPaye, montantTotal);
      const statutReservation = determinerStatutReservation(statutFinancier);
      
      await updateReservation(reservationId, {
        statut: statutReservation,
        statut_paiement: statutFinancier,
        acompte: montantPaye
      });
      
      return { statutFinancier, statutReservation };
    } catch (error) {
      console.error('❌ Erreur mise à jour statut réservation:', error);
      throw error;
    }
  };

  const annulerReservation = () => {
    setSelection({ 
      chambre: [],
      dateDebut: '', 
      dateFin: '', 
      client: null 
    });
    setEtapeActuelle('liste');
  };

  // Affichage étapes
  const renderEtape = () => {
    switch (etapeActuelle) {
      case 'recherche':
        return (
          <EtapeRecherche 
            onRecherche={rechercherChambresDisponibles} 
            onCancel={annulerRecherche} 
            loading={chambresLoading} 
          />
        );
      case 'selection':
        return (
          <EtapeSelection 
            chambres={chambres} 
            dates={selection} 
            onSelect={selectionnerChambres}
            onBack={retourEtapeRecherche} 
            calculerNuits={calculerNuits} 
          />
        );
      case 'confirmation':
        return (
          <EtapeConfirmation 
            selection={selection} 
            onConfirm={confirmerClient} 
            onBack={retourEtapeSelection} 
            loading={loading} 
            calculerNuits={calculerNuits}
            error={error}
          />
        );
      case 'finale':
        return (
          <EtapeFinale 
            selection={selection}
            onCreerReservationEtPaiement={creerReservationEtPaiement}
            onNouvelleReservation={demarrerNouvelleReservation}
            onVoirReservations={() => setEtapeActuelle('liste')}
            loading={loading || paiementLoading}
            error={error}
            calculerNuits={calculerNuits}
            determinerStatutFinancier={determinerStatutFinancier}
          />
        );
      default:
        return (
          <ListeReservations 
            reservations={reservations} 
            onNouvelleReservation={demarrerNouvelleReservation} 
            loading={reservationsLoading}
            onPaiementReservation={mettreAJourStatutReservation}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header etapeActuelle={etapeActuelle} />
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="fade-in">{renderEtape()}</div>
      </div>
    </div>
  );
};

// Navbar et Header
const Navbar = () => (
  <nav className="bg-white shadow-lg py-3 px-6 mb-6">
    <div className="flex items-center gap-2">
      <FaHotel className="text-blue-500 text-xl" />
      <span className="font-bold text-lg">Gestion des Réservations</span>
    </div>
  </nav>
);

const Header = ({ etapeActuelle }) => {
  const titres = {
    recherche: 'Nouvelle Réservation',
    selection: 'Sélection de Chambre',
    confirmation: 'Finalisation',
    finale: 'Création Réservation & Paiement',
    liste: 'Liste des Réservations'
  };
  const sousTitres = {
    recherche: 'Recherchez les chambres disponibles',
    selection: 'Choisissez une ou plusieurs chambres',
    confirmation: 'Recherchez ou créez un client',
    finale: 'Créez la réservation et enregistrez le paiement',
    liste: 'Gérez les réservations et consultez les chambres disponibles'
  };
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">{titres[etapeActuelle]}</h1>
      <p className="text-gray-600 mt-2">{sousTitres[etapeActuelle]}</p>
    </div>
  );
};

export default ReservationManagement;