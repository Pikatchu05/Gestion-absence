import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { FiFilter, FiRefreshCw, FiBarChart2, FiPieChart } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatistiquesAbsences = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Récupération des classes au chargement du composant
  useEffect(() => {
    fetchClasses();
    // Charger toutes les statistiques par défaut
    fetchStats();
  }, []);

  // Récupération des statistiques quand on change la classe sélectionnée
  useEffect(() => {
    if (selectedClassId) {
      fetchStats(selectedClassId);
    } else {
      fetchStats();
    }
  }, [selectedClassId]);

  // Récupérer la liste des classes
  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/classes');
      const data = await response.json();
      
      if (data.success) {
        setClasses(data.classes);
      } else {
        setError('Erreur lors du chargement des classes');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      setError('Erreur lors du chargement des classes');
    }
  };

  // Récupérer les statistiques
  const fetchStats = async (classId = null) => {
    setLoading(true);
    setError('');
    try {
      const url = classId 
        ? `http://localhost:5001/api/absences/statistiques?class_id=${classId}` 
        : 'http://localhost:5001/api/absences/statistiques';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Erreur lors du chargement des statistiques: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Gestion du changement de classe
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
  };

  // Préparer les données pour le graphique d'absences par mois
  const prepareChartData = () => {
    if (!stats || !stats.global || !stats.global.par_mois) {
      return {
        labels: [],
        datasets: [{
          label: 'Nombre d\'absences',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        }]
      };
    }

    const months = Object.keys(stats.global.par_mois).sort();
    const absenceData = months.map(month => stats.global.par_mois[month].nombre_absences);

    return {
      labels: months.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      }),
      datasets: [{
        label: 'Nombre d\'absences',
        data: absenceData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      }]
    };
  };

  // Préparer les données pour le graphique circulaire des absences par classe
  const prepareClassPieData = () => {
    if (!stats || !stats.par_classe || stats.par_classe.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
        }]
      };
    }

    const colors = [
      'rgba(255, 99, 132, 0.5)',
      'rgba(54, 162, 235, 0.5)',
      'rgba(255, 206, 86, 0.5)',
      'rgba(75, 192, 192, 0.5)',
      'rgba(153, 102, 255, 0.5)',
      'rgba(255, 159, 64, 0.5)',
    ];

    return {
      labels: stats.par_classe.map(c => c.class_name),
      datasets: [{
        data: stats.par_classe.map(c => c.nombre_absences),
        backgroundColor: stats.par_classe.map((_, index) => colors[index % colors.length]),
      }]
    };
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Statistiques des Absences</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-2">
          <FiFilter className="text-gray-500" />
          <h3 className="text-lg font-semibold">Filtres</h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe
            </label>
            <select
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={selectedClassId}
              onChange={handleClassChange}
            >
              <option value="">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.level_name ? `(${cls.level_name})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center gap-2"
              onClick={() => selectedClassId ? fetchStats(selectedClassId) : fetchStats()}
            >
              <FiRefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Absences</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.global.nombre_absences || 0}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Étudiants absents</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.global.nombre_etudiants_absents || 0}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total étudiants</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.global.nombre_total_etudiants || 0}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <FiBarChart2 className="text-primary-600" />
                <h3 className="text-lg font-semibold">Évolution des absences par mois</h3>
              </div>
              <div style={{ height: '300px' }}>
                <Bar
                  data={prepareChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Absences par mois',
                      },
                    },
                  }}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiPieChart className="text-primary-600" />
                <h3 className="text-lg font-semibold">Répartition par classe</h3>
              </div>
              <div style={{ height: '300px' }}>
                <Pie
                  data={prepareClassPieData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Détails par classe</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classe
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absences
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étudiants absents
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total étudiants
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % d'absences
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.par_classe.map(classe => (
                    <tr key={classe.class_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {classe.class_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classe.level_name || 'Non défini'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classe.nombre_absences}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classe.nombre_etudiants_absents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classe.nombre_total_etudiants}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classe.nombre_total_etudiants 
                          ? ((classe.nombre_etudiants_absents / classe.nombre_total_etudiants) * 100).toFixed(1) + '%' 
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {stats.par_classe.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Aucune statistique disponible
        </div>
      )}
    </div>
  );
};

export default StatistiquesAbsences;
