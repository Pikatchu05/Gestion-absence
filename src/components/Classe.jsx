import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiFilter, FiDownload, FiTrash2, FiEdit, FiUsers, FiUpload } from "react-icons/fi";

function Classe() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    academicYear: "2024-2025",
    capacity: "",
    description: ""
  });

  // Simulated data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setClasses([
        { id: 1, name: "Classe 1", level: "Première année", academicYear: "2024-2025", capacity: 30, studentCount: 28, description: "Filière informatique" },
        { id: 2, name: "Classe 2", level: "Deuxième année", academicYear: "2024-2025", capacity: 25, studentCount: 22, description: "Filière gestion" },
        { id: 3, name: "Classe 3", level: "Troisième année", academicYear: "2024-2025", capacity: 20, studentCount: 18, description: "Filière réseaux" },
        { id: 4, name: "Classe 4", level: "Première année", academicYear: "2024-2025", capacity: 30, studentCount: 27, description: "Filière électronique" },
        { id: 5, name: "Classe 5", level: "Deuxième année", academicYear: "2024-2025", capacity: 25, studentCount: 23, description: "Filière mécanique" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Display the name of the uploaded file
    const fileName = file.name;
    
    // In a real app, this would parse the CSV and extract levels or other data
    // For this example, we'll set a placeholder message
    setFormData({
      ...formData,
      level: `Importé depuis ${fileName}` // Placeholder for actual data parsing
    });
    
    // Here you would add the actual CSV parsing logic
    // For example:
    // const reader = new FileReader();
    // reader.onload = (event) => {
    //   const csvData = event.target.result;
    //   // Parse CSV and update form data
    // };
    // reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new class record
    const newClass = {
      id: classes.length + 1,
      ...formData,
      studentCount: 0
    };
    
    // Add to the list (in a real app, this would be an API call)
    setClasses([newClass, ...classes]);
    
    // Reset form
    setFormData({
      name: "",
      level: "",
      academicYear: "2024-2025",
      capacity: "",
      description: ""
    });
    
    // Hide form
    setShowForm(false);
  };

  // Filter classes based on search term
  const filteredClasses = classes.filter(classe => 
    classe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classe.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle edit (to be implemented)
  const handleEdit = (classId) => {
    // Find the class and populate form data
    const classToEdit = classes.find(c => c.id === classId);
    if (classToEdit) {
      setFormData({
        name: classToEdit.name,
        level: classToEdit.level,
        academicYear: classToEdit.academicYear,
        capacity: classToEdit.capacity,
        description: classToEdit.description
      });
      setShowForm(true);
    }
  };

  // Function to handle delete (to be implemented)
  const handleDelete = (classId) => {
    // Filter out the class with the given id
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Gestion des Classes
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <FiPlus className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nouvelle Classe
          </button>
        </div>
      </div>

      {/* Class Form */}
      {showForm && (
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Ajouter une nouvelle classe</h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom de la classe
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input mt-1"
                    placeholder="Ex: Classe 1"
                  />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                    Niveau
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="input mt-1"
                    required={!formData.level.includes("Importé depuis")}
                  >
                    <option value="">Sélectionnez un niveau</option>
                    <option value="Première année">Première année</option>
                    <option value="Deuxième année">Deuxième année</option>
                    <option value="Troisième année">Troisième année</option>
                    <option value="Quatrième année">Quatrième année</option>
                    <option value="Cinquième année">Cinquième année</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
                    Année académique
                  </label>
                  <select
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                    className="input mt-1"
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacité
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    min="1"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    className="input mt-1"
                    placeholder="Ex: 30"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input mt-1"
                  placeholder="Description de la classe..."
                />
              </div>
              
              {/* Import section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiUpload className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Importer les données</h4>
                    <p className="text-xs text-gray-500">
                      Importez un fichier CSV contenant les informations des classes (nom, niveau, capacité, etc.)
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                    Fichier CSV
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="input mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format attendu: nom, niveau, année académique, capacité, description
                  </p>
                </div>
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
                  Enregistrer
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
              placeholder="Rechercher une classe..."
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

      {/* Classes Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Chargement des données...</p>
          </div>
        ) : (
          filteredClasses.map((classe) => (
            <div key={classe.id} className="card overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                    <FiUsers className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">{classe.name}</h3>
                    <p className="text-sm text-gray-500">{classe.level}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Année académique</dt>
                      <dd className="mt-1 text-sm text-gray-900">{classe.academicYear}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Étudiants</dt>
                      <dd className="mt-1 text-sm text-gray-900">{classe.studentCount} / {classe.capacity}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{classe.description || "Aucune description"}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex justify-end space-x-3">
                  <button 
                    className="text-primary-600 hover:text-primary-900"
                    onClick={() => handleEdit(classe.id)}
                  >
                    <FiEdit className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(classe.id)}
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {!loading && filteredClasses.length === 0 && (
          <div className="col-span-full p-8 text-center">
            <p className="text-gray-500">Aucune classe trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Classe;