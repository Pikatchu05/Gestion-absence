// src/components/Etudiant.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiFilter, FiDownload, FiTrash2, FiEdit, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiArrowLeft } from "react-icons/fi";

function Etudiant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    gender: "",
    classId: "",
    registrationNumber: ""
  });
  
  // Les classes seront récupérées depuis l'API
  const [classes, setClasses] = useState([]);

  // Charger les données des étudiants et des classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupération des classes depuis l'API
        try {
          const classesResponse = await fetch('http://localhost:5001/api/classes');
          if (classesResponse.ok) {
            const classesData = await classesResponse.json();
            console.log('Classes récupérées:', classesData);
            if (classesData && Array.isArray(classesData.classes)) {
              setClasses(classesData.classes);
            }
          } else {
            console.error('Erreur lors de la récupération des classes:', classesResponse.status);
          }
        } catch (classError) {
          console.error('Exception lors de la récupération des classes:', classError);
        }
        
        // Récupération des données étudiants depuis l'API
        const response = await fetch('http://localhost:5001/api/students');
        console.log('Réponse API étudiants:', response);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Données récupérées de l\'API:', data);
        
        if (data && Array.isArray(data.students)) {
          setStudents(data.students);
          
          // Si on a un ID d'étudiant, récupérer les détails de cet étudiant
          if (id) {
            const selectedStudent = data.students.find(student => student.id === parseInt(id));
            setCurrentStudent(selectedStudent || null);
            
            if (selectedStudent) {
              setFormData({
                firstName: selectedStudent.first_name || "",
                lastName: selectedStudent.last_name || "",
                email: selectedStudent.email || "",
                phone: selectedStudent.phone || "",
                dateOfBirth: selectedStudent.date_of_birth || "",
                address: selectedStudent.address || "",
                gender: selectedStudent.gender || "",
                classId: selectedStudent.class_id || "",
                registrationNumber: selectedStudent.registration_number || ""
              });
            }
          }
        } else {
          console.error('Format de données incorrect:', data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Filtrer les étudiants en fonction du terme de recherche
  const filteredStudents = students.filter(student => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (student.first_name && student.first_name.toLowerCase().includes(searchValue)) ||
      (student.last_name && student.last_name.toLowerCase().includes(searchValue)) ||
      (student.email && student.email.toLowerCase().includes(searchValue)) ||
      (student.registration_number && student.registration_number.toLowerCase().includes(searchValue))
    );
  });

  // Gestion du changement de champ dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const endpoint = id 
        ? `http://localhost:5001/api/students/${id}` 
        : 'http://localhost:5001/api/students';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          gender: formData.gender,
          class_id: formData.classId,
          registration_number: formData.registrationNumber
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la ${id ? 'mise à jour' : 'création'} de l'étudiant`);
      }
      
      // Réinitialiser le formulaire et recharger les données
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        gender: "",
        classId: "",
        registrationNumber: ""
      });
      
      setShowForm(false);
      
      // Recharger la liste des étudiants
      const studentsResponse = await fetch('http://localhost:5001/api/students');
      const studentsData = await studentsResponse.json();
      
      if (studentsData && Array.isArray(studentsData.students)) {
        setStudents(studentsData.students);
      }
      
      // Si nous étions en mode édition, retourner à la liste
      if (id) {
        navigate('/etudiant');
      }
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // Supprimer un étudiant
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/students/${studentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'étudiant');
      }
      
      // Filtrer l'étudiant supprimé de la liste
      setStudents(students.filter(s => s.id !== studentId));
      
      if (currentStudent && currentStudent.id === studentId) {
        setCurrentStudent(null);
        navigate('/etudiant');
      }
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // Naviguer vers l'édition d'un étudiant
  const handleEditStudent = (studentId) => {
    navigate(`/etudiant/${studentId}`);
  };

  // Revenir à la liste des étudiants
  const handleBackToList = () => {
    setCurrentStudent(null);
    setShowForm(false);
    navigate('/etudiant');
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Si nous sommes en mode détail d'un étudiant
  if (currentStudent) {
    return (
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FiUser className="me-2" />
              Détails de l'étudiant
            </h5>
            <button 
              className="btn btn-sm btn-light" 
              onClick={handleBackToList}
            >
              <FiArrowLeft className="me-1" />
              Retour
            </button>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Informations personnelles</h6>
                <p><strong>Nom:</strong> {currentStudent.last_name}</p>
                <p><strong>Prénom:</strong> {currentStudent.first_name}</p>
                <p><strong>Numéro d'inscription:</strong> {currentStudent.registration_number}</p>
                <p>
                  <strong>Genre:</strong> {
                    currentStudent.gender === 'M' ? 'Masculin' : 
                    currentStudent.gender === 'F' ? 'Féminin' : 
                    'Non spécifié'
                  }
                </p>
                <p>
                  <strong>Date de naissance:</strong> {
                    currentStudent.date_of_birth ? 
                    new Date(currentStudent.date_of_birth).toLocaleDateString() : 
                    'Non spécifiée'
                  }
                </p>
              </div>
              <div className="col-md-6">
                <h6>Coordonnées</h6>
                <p><FiMail className="me-2" />{currentStudent.email || 'Non spécifié'}</p>
                <p><FiPhone className="me-2" />{currentStudent.phone || 'Non spécifié'}</p>
                <p><FiMapPin className="me-2" />{currentStudent.address || 'Non spécifiée'}</p>
                <p>
                  <strong>Classe:</strong> {
                    classes.find(c => c.id === currentStudent.class_id)?.name || 
                    'Non spécifiée'
                  }
                </p>
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-3">
              <button 
                className="btn btn-warning me-2" 
                onClick={() => handleEditStudent(currentStudent.id)}
              >
                <FiEdit className="me-1" />
                Modifier
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDeleteStudent(currentStudent.id)}
              >
                <FiTrash2 className="me-1" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire d'ajout/modification d'étudiant
  if (showForm) {
    return (
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FiUser className="me-2" />
              {id ? 'Modifier' : 'Ajouter'} un étudiant
            </h5>
            <button 
              className="btn btn-sm btn-light" 
              onClick={handleBackToList}
            >
              <FiArrowLeft className="me-1" />
              Annuler
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="lastName" className="form-label">Nom</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="firstName" className="form-label">Prénom</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="registrationNumber" className="form-label">Numéro d'inscription</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="registrationNumber" 
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="classId" className="form-label">Classe</label>
                  <select 
                    className="form-select" 
                    id="classId" 
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="phone" className="form-label">Téléphone</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="dateOfBirth" className="form-label">Date de naissance</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="dateOfBirth" 
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="gender" className="form-label">Genre</label>
                  <select 
                    className="form-select" 
                    id="gender" 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="address" className="form-label">Adresse</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="address" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" className="btn btn-primary">
                  {id ? 'Mettre à jour' : 'Ajouter'} l'étudiant
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Interface de liste des étudiants
  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h2 className="mb-3">Gestion des Étudiants</h2>
        </div>
        <div className="col-md-6 text-md-end">
          <button 
            className="btn btn-primary me-2" 
            onClick={() => { setShowForm(true); setCurrentStudent(null); }}
          >
            <FiPlus className="me-1" />
            Nouvel Étudiant
          </button>
          <button className="btn btn-outline-secondary">
            <FiDownload className="me-1" />
            Exporter
          </button>
        </div>
      </div>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FiSearch />
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Rechercher un étudiant..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <button className="btn btn-outline-secondary">
                <FiFilter className="me-1" />
                Filtrer
              </button>
            </div>
          </div>
          
          {filteredStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Numéro d'inscription</th>
                    <th>Email</th>
                    <th>Classe</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.last_name}</td>
                      <td>{student.first_name}</td>
                      <td>{student.registration_number}</td>
                      <td>{student.email}</td>
                      <td>
                        {classes.find(c => c.id === student.class_id)?.name || 'Non définie'}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() => navigate(`/etudiant/${student.id}`)}
                        >
                          <FiUser />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => handleEditStudent(student.id)}
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                {searchTerm ? 'Aucun étudiant ne correspond à votre recherche' : 'Aucun étudiant trouvé'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Etudiant;
