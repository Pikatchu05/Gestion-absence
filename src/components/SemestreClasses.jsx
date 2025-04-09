import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiCheckCircle, FiAlertCircle, FiXCircle, FiUpload, FiDownload, FiCheckSquare } from "react-icons/fi";

function SemestreClasses() {
  const { semestreId } = useParams();
  const navigate = useNavigate();
  const [semestre, setSemestre] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level_id: "",
    capacity: 30,
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClass, setEditingClass] = useState(null);
  const [levels, setLevels] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState({ loading: false, message: "" });

  useEffect(() => {
    fetchSemestreDetails();
    fetchLevels();
  }, [semestreId]);

  const fetchSemestreDetails = async () => {
    try {
      setLoading(true);
      
      console.log("Récupération des détails pour le semestre ID:", semestreId);
      
      // Récupérer les détails du semestre
      const semestreResponse = await fetch(`http://localhost:5001/api/semestres/${semestreId}`);
      const semestreData = await semestreResponse.json();
      
      console.log("Réponse du semestre:", semestreData);
      
      if (semestreData.success) {
        setSemestre(semestreData.semestre);
        
        // Récupérer uniquement les classes du semestre sélectionné
        const classesUrl = `http://localhost:5001/api/classes/semestre/${semestreId}`;
        console.log("Récupération des classes pour le semestre avec URL:", classesUrl);
        
        const classesResponse = await fetch(classesUrl, {
          // Ajouter cache: 'no-store' pour éviter la mise en cache des résultats
          cache: 'no-store'
        });
        const classesData = await classesResponse.json();
        
        console.log("Réponse des classes:", classesData);
        
        if (classesData.success) {
          // Formater les données des classes pour correspondre à notre format d'affichage
          const formattedClasses = classesData.classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            level: cls.level_name || "Non défini",
            level_id: cls.level_id,
            capacity: cls.capacity || 30,
            studentCount: cls.student_count || 0,
            description: cls.description || "",
            semestre_id: parseInt(semestreId)
          }));
          
          console.log("Classes formatées:", formattedClasses);
          setClasses(formattedClasses);
        } else {
          console.error("Erreur lors du chargement des classes:", classesData.message);
          alert("Erreur lors du chargement des classes: " + classesData.message);
          // En cas d'erreur, définir classes comme tableau vide
          setClasses([]);
        }
      } else {
        console.error("Erreur lors du chargement des détails du semestre:", semestreData.message);
        alert("Erreur lors du chargement du semestre: " + semestreData.message);
        // En cas d'erreur, définir classes comme tableau vide
        setClasses([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      alert("Erreur lors du chargement des données: " + error.message);
      setLoading(false);
      // En cas d'erreur, définir classes comme tableau vide
      setClasses([]);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/levels');
      const data = await response.json();
      
      if (data.success) {
        setLevels(data.levels);
      } else {
        console.error('Erreur lors de la récupération des niveaux:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des niveaux:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Préparer les données à envoyer
      const classData = {
        name: formData.name,
        semestre_id: parseInt(semestreId),
        capacity: formData.capacity,
        description: formData.description
      };
      
      // LOGS DE DÉBOGAGE DÉTAILLÉS
      console.log('============ DONNÉES ENVOYÉES AU SERVEUR ============');
      console.log('SemestreId brut:', semestreId, 'type:', typeof semestreId);
      console.log('SemestreId après parseInt:', parseInt(semestreId), 'type:', typeof parseInt(semestreId));
      console.log('Données complètes de la classe à créer:', classData);
      console.log('URL de l\'API:', 'http://localhost:5001/api/classes');
      console.log('====================================================');
      
      let response;
      
      if (editingClass) {
        // Mode édition
        response = await fetch(`http://localhost:5001/api/classes/${editingClass.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classData),
        });
      } else {
        // Mode ajout
        console.log('Envoi de la requête POST...');
        response = await fetch('http://localhost:5001/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classData),
        });
        console.log('Réponse reçue, status:', response.status);
      }
      
      // VÉRIFICATION DU STATUT HTTP
      if (!response.ok) {
        console.error('Erreur HTTP:', response.status, response.statusText);
      }
      
      const data = await response.json();
      console.log('Réponse JSON complète:', data);
      
      if (data.success) {
        console.log('Création réussie, données reçues:', data);
        
        // Vérifier si nous avons reçu les données de la classe
        if (data.class) {
          console.log('Classe créée retournée par le serveur:', data.class);
        } else {
          console.warn('Attention: le serveur n\'a pas retourné les détails de la classe, seulement son ID:', data.classId);
        }
        
        // Ajouter la nouvelle classe directement à l'état en cas de succès
        if (!editingClass && data.class) {
          // Si c'est une nouvelle classe et que nous avons les données de la classe créée
          const newClass = {
            id: data.class.id,
            name: data.class.name,
            capacity: data.class.capacity || 30,
            studentCount: 0, // Nouvelle classe n'a pas encore d'étudiants
            description: data.class.description || "",
            semestre_id: parseInt(semestreId)
          };
          
          console.log('Nouvelle classe formatée à ajouter:', newClass);
          
          // Ajouter la classe à notre état local
          setClasses(prevClasses => {
            console.log('État actuel des classes avant ajout:', prevClasses);
            const updatedClasses = [...prevClasses, newClass];
            console.log('Nouvel état des classes après ajout:', updatedClasses);
            return updatedClasses;
          });
        } else {
          // Si c'est une mise à jour ou si nous n'avons pas les données complètes, rafraîchir tout
          console.log('Rafraîchissement complet des données du semestre...');
          await fetchSemestreDetails();
        }
        
        // Réinitialiser le formulaire
        resetForm();
      } else {
        console.error("Erreur lors de l'enregistrement de la classe:", data.message);
        alert("Erreur lors de l'enregistrement: " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la classe:", error);
      alert("Erreur lors de l'enregistrement. Veuillez réessayer.");
    }
  };

  const handleEdit = (classToEdit) => {
    setFormData({
      name: classToEdit.name,
      capacity: classToEdit.capacity,
      description: classToEdit.description,
    });
    setEditingClass(classToEdit);
    setShowForm(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm("Supprimer cette classe ?")) {
      try {
        const response = await fetch(`http://localhost:5001/api/classes/${classId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Mettre à jour l'état local en supprimant la classe
          setClasses(prevClasses => prevClasses.filter(c => c.id !== classId));
        } else {
          console.error("Erreur lors de la suppression de la classe:", data.message);
          alert("Erreur lors de la suppression: " + data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la classe:", error);
        alert("Erreur lors de la suppression. Veuillez réessayer.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      capacity: 30,
      description: "",
    });
    setEditingClass(null);
    setShowForm(false);
  };

  const handleManageStudents = (classId) => {
    // Naviguer vers la page de gestion des étudiants pour cette classe
    navigate(`/semestre/${semestreId}/classe/${classId}/etudiants`);
  };

  const handleTakeAttendance = (classId) => {
    // Naviguer vers la page de fiche de présence pour cette classe
    const today = new Date().toISOString().split("T")[0];
    navigate(`/classe/${classId}/presence/${today}`);
  };

  // Filtrer les classes en fonction du terme de recherche
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculer le pourcentage d'occupation
  const calculateOccupancyPercentage = (studentCount, capacity) => {
    return Math.round((studentCount / capacity) * 100);
  };

  // Déterminer la couleur en fonction du pourcentage d'occupation
  const getOccupancyColor = (percentage) => {
    if (percentage < 70) return "bg-green-500"; // Moins de 70% -> vert
    if (percentage < 90) return "bg-yellow-500"; // Entre 70% et 90% -> jaune
    return "bg-red-500"; // Plus de 90% -> rouge
  };

  // Icône en fonction du pourcentage d'occupation
  const getOccupancyIcon = (percentage) => {
    if (percentage < 70) return <FiCheckCircle className="text-green-500" />;
    if (percentage < 90) return <FiAlertCircle className="text-yellow-500" />;
    return <FiXCircle className="text-red-500" />;
  };

  // Gestion du changement de fichier pour l'import
  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  // Téléchargement du modèle CSV
  const handleDownloadTemplate = () => {
    window.location.href = 'http://localhost:5001/api/templates/class_template.csv';
  };

  // Soumission du formulaire d'import
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    
    if (!importFile) {
      alert("Veuillez sélectionner un fichier à importer");
      return;
    }
    
    setImportStatus({ loading: true, message: 'Import en cours...' });
    
    const formData = new FormData();
    formData.append('importFile', importFile);
    
    try {
      const response = await fetch('http://localhost:5001/api/classes/import', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setImportStatus({ 
          loading: false, 
          message: `Import réussi ! ${result.classesCreated} classes et ${result.studentsCreated} étudiants ont été créés.`
        });
        
        // Rafraîchir la liste des classes
        fetchSemestreDetails();
        
        // Réinitialiser le form après quelques secondes
        setTimeout(() => {
          setShowImportForm(false);
          setImportFile(null);
          setImportStatus({ loading: false, message: '' });
        }, 3000);
      } else {
        setImportStatus({ 
          loading: false, 
          message: `Erreur lors de l'import : ${result.message}`
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'import :", error);
      setImportStatus({ 
        loading: false, 
        message: "Une erreur est survenue lors de l'import"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <FiArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Classes {semestre && `du ${semestre.name}`} ({classes.length} classe{classes.length !== 1 ? 's' : ''})
            </h1>
          </div>
          {semestre && (
            <p className="mt-2 text-sm text-gray-500">
              Année académique: {semestre.academic_year} | Période: {new Date(semestre.start_date).toLocaleDateString('fr-FR')} - {new Date(semestre.end_date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowImportForm(!showImportForm)}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mr-3"
          >
            <FiUpload className="-ml-0.5 mr-1.5 h-5 w-5" />
            Importer des classes
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            {showForm ? (
              <>
                <FiXCircle className="-ml-0.5 mr-1.5 h-5 w-5" />
                Annuler
              </>
            ) : (
              <>
                <FiPlus className="-ml-0.5 mr-1.5 h-5 w-5" />
                Ajouter une classe
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formulaire d'import */}
      {showImportForm && (
        <div className="bg-white shadow sm:rounded-lg p-4 mt-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Importer des classes et des étudiants
          </h2>
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div>
              <label htmlFor="importFile" className="block text-sm font-medium text-gray-700">
                Fichier CSV d'import
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  id="importFile"
                  name="importFile"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Téléchargez et remplissez notre modèle avec les informations des classes et des étudiants, puis importez-le ici.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiDownload className="mr-1.5 h-4 w-4" />
                Télécharger le modèle
              </button>
            </div>
            
            {importStatus.message && (
              <div className={`text-sm ${importStatus.message.includes('réussi') ? 'text-green-600' : 'text-red-600'}`}>
                {importStatus.message}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowImportForm(false);
                  setImportFile(null);
                  setImportStatus({ loading: false, message: '' });
                }}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={importStatus.loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={importStatus.loading}
              >
                {importStatus.loading ? 'Import en cours...' : 'Importer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Rechercher par nom, niveau ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Class form */}
      {showForm && (
        <div className="bg-white shadow sm:rounded-lg p-4 mt-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingClass ? `Modifier la classe ${editingClass.name}` : "Ajouter une nouvelle classe"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom de la classe
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
                    placeholder="ex: Classe 1A"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="level_id" className="block text-sm font-medium text-gray-700">
                  Niveau
                </label>
                <div className="mt-1">
                  <select
                    id="level_id"
                    name="level_id"
                    required
                    value={formData.level_id}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Sélectionner un niveau</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacité
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    min="1"
                    required
                    value={formData.capacity}
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
                    placeholder="Description de la classe..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {editingClass ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Class list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune classe trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Aucun résultat ne correspond à votre recherche." : "Commencez par ajouter une classe à ce semestre."}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              <FiPlus className="-ml-0.5 mr-1.5 h-5 w-5" />
              Nouvelle classe
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => {
            const occupancyPercentage = calculateOccupancyPercentage(cls.studentCount, cls.capacity);
            const occupancyColor = getOccupancyColor(occupancyPercentage);
            const occupancyIcon = getOccupancyIcon(occupancyPercentage);
            
            return (
              <div 
                key={cls.id} 
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{cls.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{cls.level}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(cls)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    {cls.description}
                  </p>
                  
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                      <div className="flex items-center">
                        {occupancyIcon}
                        <span className="ml-1.5">
                          {cls.studentCount} / {cls.capacity} étudiants
                        </span>
                      </div>
                      <span>{occupancyPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${occupancyColor} h-2.5 rounded-full`} 
                        style={{ width: `${occupancyPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-end space-x-2">
                    <button
                      onClick={() => handleTakeAttendance(cls.id)}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-green-600 shadow-sm ring-1 ring-inset ring-green-300 hover:bg-green-50"
                    >
                      <FiCheckSquare className="mr-1 h-4 w-4" />
                      Faire l'appel
                    </button>
                    <button
                      onClick={() => handleManageStudents(cls.id)}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-primary-600 shadow-sm ring-1 ring-inset ring-primary-300 hover:bg-primary-50"
                    >
                      <FiUsers className="mr-1 h-4 w-4" />
                      Gérer les étudiants
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SemestreClasses;
