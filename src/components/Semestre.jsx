// src/components/Semestre.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiFilter, FiDownload, FiTrash2, FiEdit, FiCalendar, FiCheck, FiX, FiUsers, FiArchive, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function Semestre() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("actif"); // 'actif' ou 'archives'
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    academicYear: "",
    isActive: false,
    description: ""
  });
  const [semesterClasses, setSemesterClasses] = useState({});

  // Charger les données des semestres
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/semestres');
        const data = await response.json();
        
        if (data.success) {
          setSemesters(data.semestres);
          
          // Récupérer les classes pour chaque semestre
          await fetchClassesForSemesters(data.semestres);
        } else {
          console.error("Erreur lors du chargement des semestres:", data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des semestres:", error);
        setLoading(false);
      }
    };

    fetchSemesters();
  }, []);

  // Récupérer les classes pour tous les semestres
  const fetchClassesForSemesters = async (semestres) => {
    try {
      // Récupérer toutes les classes
      const response = await fetch('http://localhost:5001/api/classes');
      const data = await response.json();
      
      if (data.success) {
        // Initialiser l'objet pour compter les classes par semestre
        const classesObj = {};
        semestres.forEach(sem => {
          classesObj[sem.id] = [];
        });
        
        // Regrouper les classes par semestre
        data.classes.forEach(cls => {
          if (cls.semestre_id && classesObj[cls.semestre_id]) {
            classesObj[cls.semestre_id].push(cls);
          }
        });
        
        setSemesterClasses(classesObj);
      } else {
        console.error("Erreur lors du chargement des classes:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5001/api/semestres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Ajouter le nouveau semestre à la liste
        setSemesters(prevSemesters => [data.semestre, ...prevSemesters]);
        
        // Initialiser un tableau vide pour les classes du nouveau semestre
        setSemesterClasses(prev => ({
          ...prev,
          [data.semestre.id]: []
        }));
        
        // Réinitialiser le formulaire
        setFormData({
          name: "",
          startDate: "",
          endDate: "",
          academicYear: "",
          isActive: false,
          description: ""
        });
        
        // Cacher le formulaire
        setShowForm(false);
        
        // Feedback utilisateur (optionnel)
        alert("Semestre créé avec succès !");
      } else {
        console.error("Erreur lors de l'ajout du semestre:", data.message);
        alert("Erreur lors de la création du semestre: " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du semestre:", error);
      alert("Erreur lors de la création du semestre. Veuillez réessayer.");
    }
  };

  // Activer un semestre (et désactiver les autres)
  const handleActivateSemester = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/semestres/${id}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour l'état local
        const updatedSemesters = semesters.map(semester => ({
          ...semester,
          isActive: semester.id === id
        }));
        
        setSemesters(updatedSemesters);
        alert("Semestre activé avec succès !");
      } else {
        console.error("Erreur lors de l'activation du semestre:", data.message);
        alert("Erreur lors de l'activation du semestre: " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'activation du semestre:", error);
      alert("Erreur lors de l'activation du semestre. Veuillez réessayer.");
    }
  };

  // Archiver un semestre actif
  const handleArchiveSemester = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir archiver ce semestre ? Cette action ne peut pas être annulée.")) {
      try {
        const response = await fetch(`http://localhost:5001/api/semestres/${id}/archive`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Mettre à jour l'état local
          const updatedSemesters = semesters.map(semester => {
            if (semester.id === id) {
              return { ...semester, isActive: false, isArchived: true };
            }
            return semester;
          });
          
          setSemesters(updatedSemesters);
          alert("Semestre archivé avec succès !");
        } else {
          console.error("Erreur lors de l'archivage du semestre:", data.message);
          alert("Erreur lors de l'archivage du semestre: " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de l'archivage du semestre:", error);
        alert("Erreur lors de l'archivage du semestre. Veuillez réessayer.");
      }
    }
  };
  
  // Supprimer définitivement un semestre
  const handleDeleteSemester = async (id) => {
    if (window.confirm("Supprimer ce semestre ?")) {
      try {
        const response = await fetch(`http://localhost:5001/api/semestres/${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Supprimer le semestre de la liste
          setSemesters(semesters.filter(semester => semester.id !== id));
          alert("Semestre supprimé avec succès !");
        } else {
          console.error("Erreur lors de la suppression du semestre:", data.message);
          alert("Erreur lors de la suppression : " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du semestre:", error);
        alert("Erreur lors de la suppression. Veuillez réessayer.");
      }
    }
  };

  // Accéder à la gestion des classes pour le semestre actif
  const handleManageClasses = (semestreId) => {
    // Dans une application réelle, nous passerions cet ID à la page des classes
    navigate(`/semestre/${semestreId}/classes`);
  };

  // Filter semesters based on search term and active/archived status
  const filteredSemesters = semesters.filter(semester => 
    (activeTab === "actif" ? !semester.isArchived : semester.isArchived) &&
    (semester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     semester.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
     semester.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date to local format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Vérifier s'il existe un semestre actif
  const hasActiveSemester = semesters.some(semester => semester.isActive && !semester.isArchived);

  // Obtenir le nombre de classes par semestre
  const getClassCount = (semesterId) => {
    return semesterClasses[semesterId]?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Gestion des Semestres
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            disabled={showForm || (hasActiveSemester && !formData.id)}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
              hasActiveSemester && !formData.id 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-500'
            }`}
          >
            <FiPlus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nouveau Semestre
          </button>
        </div>
      </div>

      {/* Message d'information si un semestre est actif */}
      {hasActiveSemester && !showForm && activeTab === "actif" && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Un semestre est actuellement actif. Pour créer un nouveau semestre, vous devez d'abord archiver le semestre actif.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Active and Archived semesters */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("actif")}
            className={`${
              activeTab === "actif"
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Semestres Actifs
          </button>
          <button
            onClick={() => setActiveTab("archives")}
            className={`${
              activeTab === "archives"
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Semestres Archivés
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Rechercher par nom, année académique ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Form for adding or editing a semester */}
      {showForm && (
        <div className="bg-white shadow sm:rounded-lg p-4 mt-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {formData.id ? "Modifier le Semestre" : "Ajouter un Nouveau Semestre"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom du semestre
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
                  Année académique
                </label>
                <div className="mt-1">
                  <select
                    id="academicYear"
                    name="academicYear"
                    required
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Sélectionner une année</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Date de début
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    disabled={hasActiveSemester && !formData.id}
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Marquer comme semestre actif
                  </label>
                </div>
                {hasActiveSemester && !formData.id && (
                  <p className="mt-1 text-xs text-red-500">
                    Un semestre est déjà actif. Vous devez d'abord l'archiver.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {formData.id ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of semesters */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredSemesters.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">
            {activeTab === "actif" 
              ? "Aucun semestre actif n'a été trouvé." 
              : "Aucun semestre archivé n'a été trouvé."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Semestre
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Période
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Année Académique
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Classes
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Statut
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredSemesters.map((semester) => (
                <tr key={semester.id} className={semester.isActive ? "bg-blue-50" : ""}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="font-medium">{semester.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{semester.description}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {semester.academicYear}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiUsers className="mr-1 h-4 w-4 text-gray-400" />
                      <span>{getClassCount(semester.id)} classe(s)</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {semester.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="mr-1 h-3 w-3" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <FiX className="mr-1 h-3 w-3" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleManageClasses(semester.id)}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-primary-600 shadow-sm ring-1 ring-inset ring-primary-300 hover:bg-primary-50"
                      >
                        <FiUsers className="mr-1 h-4 w-4" />
                        Classes ({getClassCount(semester.id)})
                      </button>
                      
                      {!semester.isArchived && !semester.isActive && (
                        <button
                          onClick={() => handleActivateSemester(semester.id)}
                          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-600 shadow-sm ring-1 ring-inset ring-green-300 hover:bg-green-50"
                        >
                          <FiCheck className="mr-1 h-4 w-4" />
                          Activer
                        </button>
                      )}
                      
                      {!semester.isArchived && (
                        <button
                          onClick={() => handleArchiveSemester(semester.id)}
                          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-amber-600 shadow-sm ring-1 ring-inset ring-amber-300 hover:bg-amber-50"
                        >
                          <FiArchive className="mr-1 h-4 w-4" />
                          Archiver
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteSemester(semester.id)}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                      >
                        <FiTrash2 className="mr-1 h-4 w-4" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Semestre;
