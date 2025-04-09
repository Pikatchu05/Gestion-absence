// src/components/Absence.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiFilter, FiDownload, FiTrash2, FiEdit } from "react-icons/fi";

function Absence() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    date: new Date().toISOString().split("T")[0],
    reason: "",
    justified: false,
    notes: ""
  });

  // Chargement des absences depuis l'API
  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        console.log('Tentative de récupération des absences...');
        const response = await fetch('http://localhost:5001/api/absences');
        const data = await response.json();
        
        console.log('Réponse de l\'API absences:', data);
        
        if (data.success) {
          // Formater les données d'absences pour correspondre à notre format d'affichage
          const formattedAbsences = data.absences.map(absence => ({
            id: absence.id,
            student: absence.student_name || `Étudiant ID: ${absence.student_id}`,
            studentId: absence.student_id,
            class: absence.class_name || `Classe ID: ${absence.class_id}`,
            classId: absence.class_id,
            date: absence.date ? new Date(absence.date).toISOString().split('T')[0] : '-',
            reason: absence.reason || '',
            justified: absence.justified ? true : false,
            notes: ''
          }));
          
          console.log('Absences formatées:', formattedAbsences);
          setAbsences(formattedAbsences);
        } else {
          console.error('Erreur lors du chargement des absences:', data.message);
          // En cas d'erreur, définir absences comme tableau vide
          setAbsences([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des absences:', error);
        setAbsences([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAbsences();
  }, []);

  // États pour stocker les étudiants et les classes
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Chargement des étudiants depuis l'API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/students');
        const data = await response.json();
        
        if (data.success) {
          setStudents(data.students.map(student => ({
            id: student.id,
            name: `${student.firstname} ${student.lastname}`,
            classId: student.class_id
          })));
        } else {
          console.error('Erreur lors du chargement des étudiants:', data.message);
          setStudents([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
        setStudents([]);
      }
    };
    
    fetchStudents();
  }, []);
  
  // Chargement des classes depuis l'API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/classes');
        const data = await response.json();
        
        if (data.success) {
          setClasses(data.classes.map(cls => ({
            id: cls.id,
            name: cls.name
          })));
        } else {
          console.error('Erreur lors du chargement des classes:', data.message);
          setClasses([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
        setClasses([]);
      }
    };
    
    fetchClasses();
  }, []);

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
      // Trouver les détails de l'étudiant et de la classe
      const student = students.find(s => s.id === formData.studentId);
      const classe = classes.find(c => c.id === formData.classId);
      
      if (!student || !classe) {
        console.error('Étudiant ou classe introuvable');
        return;
      }
      
      // Préparer les données à envoyer
      const absenceData = {
        student_id: formData.studentId,
        class_id: formData.classId,
        date: formData.date,
        justified: formData.justified,
        justification_reason: formData.reason,
        notes: formData.notes
      };
      
      // Déterminer si c'est une création ou une modification
      let url = 'http://localhost:5001/api/absences';
      let method = 'POST';
      
      if (editMode && selectedAbsenceId) {
        url = `http://localhost:5001/api/absences/${selectedAbsenceId}`;
        method = 'PUT';
      }
      
      // Appel à l'API
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(absenceData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour l'interface après succès
        if (editMode) {
          // Remplacer l'absence modifiée dans la liste
          const updatedAbsences = absences.map(abs => 
            abs.id === selectedAbsenceId ? {
              ...abs,
              student: student.name,
              class: classe.name,
              date: formData.date,
              reason: formData.reason,
              justified: formData.justified,
              notes: formData.notes
            } : abs
          );
          setAbsences(updatedAbsences);
        } else {
          // Ajouter la nouvelle absence à la liste
          const newId = data.absenceId || absences.length + 1;
          const newAbsence = {
            id: newId,
            student: student.name,
            studentId: formData.studentId,
            class: classe.name,
            classId: formData.classId,
            date: formData.date,
            reason: formData.reason,
            justified: formData.justified,
            notes: formData.notes
          };
          setAbsences([newAbsence, ...absences]);
        }
        
        // Réinitialiser le formulaire
        setFormData({
          studentId: "",
          classId: "",
          date: new Date().toISOString().split("T")[0],
          reason: "",
          justified: false,
          notes: ""
        });
        
        // Réinitialiser l'état du formulaire
        setShowForm(false);
        setEditMode(false);
        setSelectedAbsenceId(null);
      } else {
        console.error('Erreur lors de l\'enregistrement de l\'absence:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
    }
  };

  // Filter absences based on search term
  const filteredAbsences = absences.filter(absence => 
    absence.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    absence.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (absence.reason && absence.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Fonction pour éditer une absence existante
  const handleEdit = (absence) => {
    setFormData({
      studentId: absence.studentId,
      classId: absence.classId,
      date: absence.date,
      reason: absence.reason || '',
      justified: absence.justified || false,
      notes: absence.notes || ''
    });
    
    setEditMode(true);
    setSelectedAbsenceId(absence.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Gestion des Absences
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <FiPlus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nouvelle Absence
          </button>
        </div>
      </div>

      {/* Absence Form */}
      {showForm && (
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {editMode ? 'Modifier une absence' : 'Enregistrer une nouvelle absence'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    Étudiant
                  </label>
                  <select
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    className="input mt-1"
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({classes.find(c => c.id === student.classId).name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                    Classe
                  </label>
                  <select
                    id="classId"
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    required
                    className="input mt-1"
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(classe => (
                      <option key={classe.id} value={classe.id}>
                        {classe.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Motif
                </label>
                <select
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  className="input mt-1"
                >
                  <option value="">Sélectionner un motif</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Rendez-vous médical">Rendez-vous médical</option>
                  <option value="Familial">Familial</option>
                  <option value="Transport">Transport</option>
                  <option value="Compétition sportive">Compétition sportive</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input mt-1"
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="flex items-center">
                <input
                  id="justified"
                  name="justified"
                  type="checkbox"
                  checked={formData.justified}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="justified" className="ml-2 block text-sm text-gray-900">
                  Absence justifiée
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editMode ? 'Modifier' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="card">
        <div className="p-4 sm:flex sm:items-center sm:justify-between">
          <div className="relative flex-grow max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Rechercher un étudiant, une classe ou un motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mt-3 flex items-center space-x-2 sm:mt-0">
            <button className="btn btn-outline">
              <FiFilter className="mr-2 h-4 w-4" />
              Filtrer
            </button>
            <button className="btn btn-outline">
              <FiDownload className="mr-2 h-4 w-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Absences Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Chargement des données...</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classe
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motif
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAbsences.length > 0 ? (
                  filteredAbsences.map((absence) => (
                    <tr key={absence.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {absence.student}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {absence.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(absence.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {absence.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          absence.justified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {absence.justified ? 'Justifiée' : 'Non justifiée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {absence.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(absence)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          title="Modifier cette absence"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer cette absence"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucune absence trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Absence;
