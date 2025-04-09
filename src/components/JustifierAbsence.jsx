// src/components/JustifierAbsence.jsx
import React, { useState, useEffect } from "react";
import { FiCheck, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";

function JustifierAbsence({ absenceId, onClose, onSuccess }) {
  const [motifs, setMotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    motif_id: "",
    justification_reason: "",
    justified: true
  });
  const [selectedMotif, setSelectedMotif] = useState(null);

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
    
    if (name === "motif_id" && value) {
      const motif = motifs.find(m => m.id === parseInt(value));
      setSelectedMotif(motif);
    }
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.motif_id) {
      setError("Veuillez sélectionner un motif d'absence");
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:5001/api/motifs/absence/${absenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        setError(data.message || "Erreur lors de la justification de l'absence");
      }
      setSubmitting(false);
    } catch (error) {
      console.error("Erreur lors de la justification de l'absence:", error);
      setError("Erreur de connexion au serveur");
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Justifier une absence
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Fermer</span>
          <FiX className="h-6 w-6" />
        </button>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Message de succès */}
      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheck className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                L'absence a été justifiée avec succès
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des motifs...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="motif_id" className="block text-sm font-medium text-gray-700">
              Motif de l'absence <span className="text-red-500">*</span>
            </label>
            <select
              id="motif_id"
              name="motif_id"
              value={formData.motif_id}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Sélectionnez un motif</option>
              {motifs.map((motif) => (
                <option key={motif.id} value={motif.id}>
                  {motif.libelle}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="justification_reason" className="block text-sm font-medium text-gray-700">
              Commentaire
              {selectedMotif && selectedMotif.requiert_justificatif && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <textarea
              id="justification_reason"
              name="justification_reason"
              value={formData.justification_reason}
              onChange={handleInputChange}
              required={selectedMotif && selectedMotif.requiert_justificatif}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Précisez les détails de la justification..."
            />
          </div>
          
          {selectedMotif && selectedMotif.requiert_justificatif && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiInfo className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex">
                  <p className="text-sm text-blue-700">
                    Ce motif nécessite un justificatif. Veuillez fournir des informations détaillées dans le commentaire.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="justified"
              name="justified"
              checked={formData.justified}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="justified" className="ml-2 block text-sm text-gray-900">
              Marquer comme justifiée
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default JustifierAbsence;
