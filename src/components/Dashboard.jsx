// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiClipboard, FiBarChart2, FiBookOpen, FiClock, FiChevronDown, FiList } from 'react-icons/fi';
import StatisticsChart from './StatisticsChart'; // Import du composant StatisticsChart

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalAbsences: 0,
    totalSemesters: 0
  });
  
  const [recentAbsences, setRecentAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionsOpen, setSectionsOpen] = useState({
    stats: true,
    chartStats: true,
    recentAbsences: true,
    quickLinks: true
  });
  const [animateSection, setAnimateSection] = useState(null);
  
  // Toggle section visibility
  const toggleSection = (sectionName) => {
    setSectionsOpen({
      ...sectionsOpen,
      [sectionName]: !sectionsOpen[sectionName]
    });
    setAnimateSection(sectionName);
    setTimeout(() => setAnimateSection(null), 300);
  };

  // Récupération des données réelles depuis les API existantes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les stats des classes
        const classesResponse = await fetch('http://localhost:5001/api/classes');
        const classesData = await classesResponse.json();
        
        // Récupérer les stats des absences
        const absencesResponse = await fetch('http://localhost:5001/api/absences');
        const absencesData = await absencesResponse.json();
        
        // Récupérer les stats des semestres
        const semestresResponse = await fetch('http://localhost:5001/api/semestres');
        const semestresData = await semestresResponse.json();
        
        console.log('Données des classes:', classesData);
        console.log('Données des absences:', absencesData);
        console.log('Données des semestres:', semestresData);
        
        // Calculer le nombre d'étudiants total (on accumule les étudiants par classe)
        let totalStudents = 0;
        if (classesData.success && classesData.classes) {
          classesData.classes.forEach(classe => {
            if (classe.student_count) {
              totalStudents += parseInt(classe.student_count, 10) || 0;
            }
          });
        }
        
        // Mettre à jour les stats globales avec les données disponibles
        setStats({
          totalStudents: totalStudents,
          totalClasses: classesData.success ? classesData.classes.length : 0,
          totalAbsences: absencesData.success ? absencesData.absences.length : 0,
          totalSemesters: semestresData.success ? semestresData.semestres.length : 0
        });
        
        // Formater les absences récentes
        if (absencesData.success && absencesData.absences && absencesData.absences.length > 0) {
          // Trier par date décroissante et prendre les 5 plus récentes
          const recentAbs = absencesData.absences
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(absence => ({
              id: absence.id,
              studentName: absence.student_name || 'Étudiant inconnu',
              className: absence.class_name || 'Classe inconnue',
              date: absence.date,
              justification: absence.justification_reason || absence.reason,
              status: absence.justified ? 'Justifiée' : 'Non justifiée'
            }));
          
          setRecentAbsences(recentAbs);
        } else {
          setRecentAbsences([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', error);
        // Ne pas cacher l'UI en cas d'erreur
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date to local format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          Tableau de bord
        </h1>
      </div>

        {/* Section Header - Stats */}
        <div className="card">
          <div 
            className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer transition-all duration-300 hover:bg-gray-100"
            onClick={() => toggleSection('stats')}
          >
            <h2 className="text-lg font-medium text-gray-900">Vue d'ensemble</h2>
            <div className={`transform transition-transform duration-300 ${sectionsOpen.stats ? 'rotate-180' : 'rotate-0'}`}>
              <FiChevronDown className={`w-5 h-5 ${sectionsOpen.stats ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Stats Cards */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden 
              ${sectionsOpen.stats ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="p-4">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card overflow-hidden shadow-sm hover:shadow transition-all duration-200 transform hover:scale-105">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <FiUsers className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Étudiants</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats.totalStudents}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link to="/etudiant" className="font-medium text-primary-700 hover:text-primary-900 transition-colors duration-200">
                        Voir tous les étudiants
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="card overflow-hidden shadow-sm hover:shadow transition-all duration-200 transform hover:scale-105">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                        <FiCalendar className="h-6 w-6 text-secondary-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats.totalClasses}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link to="/classe" className="font-medium text-secondary-700 hover:text-secondary-900 transition-colors duration-200">
                        Voir toutes les classes
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="card overflow-hidden shadow-sm hover:shadow transition-all duration-200 transform hover:scale-105">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                        <FiClipboard className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Absences</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats.totalAbsences}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link to="/absence" className="font-medium text-red-700 hover:text-red-900 transition-colors duration-200">
                        Voir toutes les absences
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="card overflow-hidden shadow-sm hover:shadow transition-all duration-200 transform hover:scale-105">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <FiBookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Semestres</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{stats.totalSemesters}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link to="/semestre" className="font-medium text-green-700 hover:text-green-900 transition-colors duration-200">
                        Voir tous les semestres
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* La section des statistiques a été supprimée */}

        {/* Section Header - Recent Absences */}
        <div className="card">
          <div 
            className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer transition-all duration-300 hover:bg-gray-100"
            onClick={() => toggleSection('recentAbsences')}
          >
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-900">Absences récentes</h2>
              <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {recentAbsences.length}
              </span>
            </div>
            <div className={`transform transition-transform duration-300 ${sectionsOpen.recentAbsences ? 'rotate-180' : 'rotate-0'}`}>
              <FiChevronDown className={`w-5 h-5 ${sectionsOpen.recentAbsences ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Recent Absences */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden 
              ${sectionsOpen.recentAbsences ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="p-4">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                  <p className="mt-2 text-gray-500">Chargement des données...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                          Justification
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentAbsences.map((absence, index) => (
                        <tr 
                          key={absence.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                          style={{ 
                            animationDelay: `${index * 100}ms`,
                            opacity: sectionsOpen.recentAbsences ? 1 : 0,
                            transform: sectionsOpen.recentAbsences ? 'translateY(0)' : 'translateY(-10px)',
                            transition: 'opacity 300ms, transform 300ms'
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {absence.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {absence.className}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(absence.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {absence.justification || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              absence.status === "Justifiée" 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {absence.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-center mt-4">
                    <Link 
                      to="/absence" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                    >
                      <FiList className="mr-2" /> Voir toutes les absences
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default Dashboard;
