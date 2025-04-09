// src/components/GestionMotifs.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";

function GestionMotifs() {
  const [motifs, setMotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentMotif, setCurrentMotif] = useState(null);
  const [formData, setFormData] = useState({
    libelle: "",
    description: "",
    requiert_justificatif: false,
    est_valide_par_defaut: false
  });

  // Récupérer les motifs existants
  useEffect(() => {
    fetchMotifs();
  }, []);

  const fetchMotifs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/motifs');
      const data = await response.json();
      
      if (data.success) {
        setMotifs(data.motifs);
      } else {
        setError(data.message || "Erreur lors de la récupération des motifs");
      }
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des motifs:", error);
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      libelle: "",
      description: "",
      requiert_justificatif: false,
      est_valide_par_defaut: false
    });
    setCurrentMotif(null);
    setShowForm(false);
  };

  const handleEditMotif = (motif) => {
    setCurrentMotif(motif);
    setFormData({
      libelle: motif.libelle,
      description: motif.description || "",
      requiert_justificatif: !!motif.requiert_justificatif,
      est_valide_par_defaut: !!motif.est_valide_par_defaut
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = currentMotif 
        ? `http://localhost:5001/api/motifs/${currentMotif.id}` 
        : 'http://localhost:5001/api/motifs';
      
      const method = currentMotif ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Rafraîchir la liste des motifs
        await fetchMotifs();
        
        // Réinitialiser le formulaire
        resetForm();
        
        // Message de confirmation
        alert(currentMotif ? "Motif mis à jour avec succès" : "Motif créé avec succès");
      } else {
        setError(data.message || "Erreur lors de l'enregistrement du motif");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du motif:", error);
      setError("Erreur de connexion au serveur");
    }
  };

  const handleDeleteMotif = async (motifId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce motif d'absence ?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/motifs/${motifId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Rafraîchir la liste des motifs
        await fetchMotifs();
        
        // Message de confirmation
        alert("Motif supprimé avec succès");
      } else {
        setError(data.message || "Erreur lors de la suppression du motif");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du motif:", error);
      setError("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Gestion des Motifs d'Absences
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm bg-primary-600 hover:bg-primary-500"
          >
            <FiPlus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nouveau Motif
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white shadow sm:rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {currentMotif ? "Modifier un motif" : "Ajouter un motif"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="libelle" className="block text-sm font-medium text-gray-700">
                Libellé <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="libelle"
                name="libelle"
                value={formData.libelle}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiert_justificatif"
                name="requiert_justificatif"
                checked={formData.requiert_justificatif}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="requiert_justificatif" className="ml-2 block text-sm text-gray-900">
                Nécessite un justificatif
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="est_valide_par_defaut"
                name="est_valide_par_defaut"
                checked={formData.est_valide_par_defaut}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="est_valide_par_defaut" className="ml-2 block text-sm text-gray-900">
                Validé par défaut
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {currentMotif ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des motifs */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-10">
                <div className="spinner"></div>
                <p className="mt-2 text-sm text-gray-500">Chargement des motifs...</p>
              </div>
            ) : motifs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">Aucun motif d'absence défini</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Libellé
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Justificatif requis
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Validé par défaut
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {motifs.map((motif) => (
                    <tr key={motif.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {motif.libelle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {motif.description || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {motif.requiert_justificatif ? (
                          <FiCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <FiX className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {motif.est_valide_par_defaut ? (
                          <FiCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <FiX className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          type="button"
                          onClick={() => handleEditMotif(motif)}
                          className="inline-flex items-center text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <FiEdit className="h-4 w-4 mr-1" />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMotif(motif.id)}
                          className="inline-flex items-center text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionMotifs;
