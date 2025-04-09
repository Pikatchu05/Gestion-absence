import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiRefreshCw, FiCheckCircle, FiXCircle } from "react-icons/fi";

function FichePresence() {
  const { classId, date } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [className, setClassName] = useState("");
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split("T")[0]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Simuler l'ID de l'enseignant connecté (à remplacer par la vraie valeur du contexte d'auth)
  const enseignantId = 1;

  useEffect(() => {
    fetchClassDetails();
    fetchStudents();
  }, [classId, selectedDate]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/classes/${classId}`);
      const data = await response.json();

      if (data.success) {
        setClassName(data.class.name);
      } else {
        console.error("Erreur lors du chargement des détails de la classe:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails de la classe:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/absences/classe/${classId}/date/${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        // Préparer les données des étudiants avec leur statut d'absence
        const studentList = data.absences.map(student => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          isAbsent: student.absence_id !== null // Si l'ID d'absence existe, l'étudiant est absent
        }));

        setStudents(studentList);
        
        // Mettre à jour la liste des étudiants absents
        setAbsentStudents(studentList.filter(s => s.isAbsent).map(s => s.id));
      } else {
        console.error("Erreur lors du chargement des étudiants:", data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des étudiants:", error);
      setLoading(false);
    }
  };

  const handleToggleAbsence = (studentId) => {
    // Mettre à jour l'interface
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, isAbsent: !student.isAbsent } 
        : student
    ));

    // Mettre à jour la liste des absents
    setAbsentStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('http://localhost:5001/api/absences/presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date: selectedDate,
          absences: absentStudents,
          enseignantId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error("Erreur lors de l'enregistrement de la fiche de présence:", data.message);
        alert("Erreur lors de l'enregistrement: " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la fiche de présence:", error);
      alert("Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  // Filtre des étudiants basé sur le terme de recherche
  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft className="mr-1" /> Retour
          </button>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Fiche de présence: {className}
          </h1>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:mt-0 gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block sm:text-sm border-gray-300 rounded-md"
          />
          <button
            onClick={fetchStudents}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={handleSubmit}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'}`}
            disabled={saving}
          >
            {success ? (
              <>
                <FiCheckCircle className="mr-1" /> Enregistré!
              </>
            ) : (
              <>
                <FiSave className="mr-1" /> Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Liste des étudiants ({students.length})
            </h2>
            <div className="mt-2 sm:mt-0">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block sm:text-sm border-gray-300 rounded-md"
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200 divide-y divide-gray-200">
            {loading ? (
              <div className="py-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-500">Chargement des étudiants...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-500">Aucun étudiant trouvé.</p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`py-4 px-2 flex items-center justify-between hover:bg-gray-50 ${
                    student.isAbsent ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {student.lastName} {student.firstName}
                      </p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleToggleAbsence(student.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                        student.isAbsent
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {student.isAbsent ? (
                        <>
                          <FiXCircle className="mr-1" /> Absent
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="mr-1" /> Présent
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FichePresence;
