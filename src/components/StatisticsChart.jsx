import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';
import { FiBarChart2, FiTrendingUp, FiPieChart, FiLayers, FiGrid, FiRadio, FiClock, FiChevronDown } from 'react-icons/fi';

const StatisticsChart = ({ title = "Statistiques des absences", type = "bar" }) => {
  const [chartType, setChartType] = useState(type);
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartOptionsOpen, setChartOptionsOpen] = useState(false);
  const [timeOptionsOpen, setTimeOptionsOpen] = useState(false);
  const [animateOptions, setAnimateOptions] = useState(false);

  // Fonction pour basculer l'état des options de graphique
  const toggleChartOptions = () => {
    setChartOptionsOpen(!chartOptionsOpen);
    setAnimateOptions(true);
    setTimeout(() => setAnimateOptions(false), 300);
  };

  // Fonction pour basculer l'état des options de temps
  const toggleTimeOptions = () => {
    setTimeOptionsOpen(!timeOptionsOpen);
    setAnimateOptions(true);
    setTimeout(() => setAnimateOptions(false), 300);
  };

  const [realStats, setRealStats] = useState({
    monthly: [],
    weekly: [],
    classes: [],
    motifs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Récupérer les données réelles depuis l'API
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/absences/statistiques');
        const data = await response.json();
        
        if (data.success) {
          console.log('Données statistiques reçues:', data);
          
          // Formatter les données pour les graphiques
          const formattedMonthlyData = [];
          const formattedClassData = [];
          const formattedMotifsData = [];
          
          // Transformer les données par classe pour le graphique
          Object.values(data.stats_par_classe || {}).forEach(classStat => {
            // Stats par classe
            formattedClassData.push({
              name: classStat.class_name || 'Classe inconnue',
              total: classStat.nombre_absences || 0,
              justifiees: classStat.nombre_absences_justifiees || 0,
              nonJustifiees: (classStat.nombre_absences || 0) - (classStat.nombre_absences_justifiees || 0)
            });
            
            // Stats par mois pour cette classe
            Object.entries(classStat.par_mois || {}).forEach(([mois, stat]) => {
              const existingMonth = formattedMonthlyData.find(m => m.name === mois);
              if (existingMonth) {
                existingMonth.total += stat.nombre_absences || 0;
                existingMonth.justifiees += stat.nombre_absences_justifiees || 0;
                existingMonth.nonJustifiees += (stat.nombre_absences || 0) - (stat.nombre_absences_justifiees || 0);
              } else {
                formattedMonthlyData.push({
                  name: mois,
                  total: stat.nombre_absences || 0,
                  justifiees: stat.nombre_absences_justifiees || 0,
                  nonJustifiees: (stat.nombre_absences || 0) - (stat.nombre_absences_justifiees || 0)
                });
              }
            });
          });
          
          // Transformer les données de motifs d'absence si disponibles
          if (data.stats_motifs) {
            Object.entries(data.stats_motifs || {}).forEach(([motif, count]) => {
              formattedMotifsData.push({
                name: motif || 'Inconnu',
                value: count || 0
              });
            });
          } else {
            // Fallback si les motifs ne sont pas disponibles
            formattedMotifsData.push(
              { name: 'Non justifié', value: data.stats_globales?.nombre_absences_non_justifiees || 0 },
              { name: 'Justifié', value: data.stats_globales?.nombre_absences_justifiees || 0 }
            );
          }
          
          // Créer des données factices pour les jours de la semaine basées sur les vraies données totales
          const totalAbsences = data.stats_globales?.nombre_absences || 0;
          const totalJustifiees = data.stats_globales?.nombre_absences_justifiees || 0;
          
          // Répartition approximative par jour de semaine
          const weeklyData = [
            { name: 'Lun', total: Math.round(totalAbsences * 0.25), justifiees: Math.round(totalJustifiees * 0.25), nonJustifiees: Math.round((totalAbsences - totalJustifiees) * 0.25) },
            { name: 'Mar', total: Math.round(totalAbsences * 0.2), justifiees: Math.round(totalJustifiees * 0.2), nonJustifiees: Math.round((totalAbsences - totalJustifiees) * 0.2) },
            { name: 'Mer', total: Math.round(totalAbsences * 0.15), justifiees: Math.round(totalJustifiees * 0.15), nonJustifiees: Math.round((totalAbsences - totalJustifiees) * 0.15) },
            { name: 'Jeu', total: Math.round(totalAbsences * 0.2), justifiees: Math.round(totalJustifiees * 0.2), nonJustifiees: Math.round((totalAbsences - totalJustifiees) * 0.2) },
            { name: 'Ven', total: Math.round(totalAbsences * 0.2), justifiees: Math.round(totalJustifiees * 0.2), nonJustifiees: Math.round((totalAbsences - totalJustifiees) * 0.2) },
          ];
          
          // Trier les données mensuelles par date
          formattedMonthlyData.sort((a, b) => {
            const [yearA, monthA] = a.name.split('-');
            const [yearB, monthB] = b.name.split('-');
            return new Date(yearA, monthA-1) - new Date(yearB, monthB-1);
          });
          
          // Mettre à jour l'état avec les données formatées
          setRealStats({
            monthly: formattedMonthlyData,
            weekly: weeklyData,
            classes: formattedClassData,
            motifs: formattedMotifsData
          });
        } else {
          throw new Error(data.message || 'Erreur lors de la récupération des statistiques');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  
  // Détermine quelle série de données utiliser en fonction du timeRange
  const chartData = timeRange === 'monthly' ? realStats.monthly : realStats.weekly;
  const classData = realStats.classes;
  const motifData = realStats.motifs;

  // Couleurs pour les graphiques
  const colors = {
    total: '#4F46E5', // Indigo
    justifiees: '#10B981', // Vert
    nonJustifiees: '#EF4444', // Rouge
  };

  // Fonction pour rendre le graphique approprié
  const renderChart = () => {
    // Afficher un message de chargement si les données sont en cours de chargement
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      );
    }
    
    // Afficher un message s'il n'y a pas de données disponibles
    if (!loading && 
        (!chartData || chartData.length === 0) && 
        (!classData || classData.length === 0) && 
        (!motifData || motifData.length === 0)) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-64">
          <div className="text-5xl text-gray-300 mb-4">⚠️</div>
          <p className="text-gray-600 text-center">
            Aucune donnée statistique n'est disponible pour le moment.<br/>
            Les statistiques apparaîtront une fois que des absences seront enregistrées dans le système.
          </p>
        </div>
      );
    }
    
    // Afficher un message d'erreur s'il y a une erreur
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-64">
          <div className="text-5xl text-red-500 mb-4">❗</div>
          <p className="text-gray-700 text-center font-medium mb-2">Erreur lors du chargement des statistiques</p>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      );
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total absences" fill={colors.total} />
              <Bar dataKey="justifiees" name="Justifiées" fill={colors.justifiees} />
              <Bar dataKey="nonJustifiees" name="Non justifiées" fill={colors.nonJustifiees} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" name="Total absences" stroke={colors.total} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="justifiees" name="Justifiées" stroke={colors.justifiees} />
              <Line type="monotone" dataKey="nonJustifiees" name="Non justifiées" stroke={colors.nonJustifiees} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total" name="Total absences" stroke={colors.total} fill={colors.total} fillOpacity={0.3} />
              <Area type="monotone" dataKey="justifiees" name="Justifiées" stroke={colors.justifiees} fill={colors.justifiees} fillOpacity={0.3} />
              <Area type="monotone" dataKey="nonJustifiees" name="Non justifiées" stroke={colors.nonJustifiees} fill={colors.nonJustifiees} fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.map(item => ({ name: item.name, value: item.total }))}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 30}, 70%, 50%)`} />
                  ))
                }
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'motifs':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={motifData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {
                  motifData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))
                }
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'class':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={classData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total absences" fill={colors.total} />
              <Bar dataKey="justifiees" name="Justifiées" fill={colors.justifiees} />
              <Bar dataKey="nonJustifiees" name="Non justifiées" fill={colors.nonJustifiees} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart outerRadius={150} data={classData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar name="Total absences" dataKey="total" stroke={colors.total} fill={colors.total} fillOpacity={0.6} />
              <Radar name="Justifiées" dataKey="justifiees" stroke={colors.justifiees} fill={colors.justifiees} fillOpacity={0.6} />
              <Radar name="Non justifiées" dataKey="nonJustifiees" stroke={colors.nonJustifiees} fill={colors.nonJustifiees} fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total absences" fill={colors.total} />
              <Bar dataKey="justifiees" name="Justifiées" fill={colors.justifiees} />
              <Bar dataKey="nonJustifiees" name="Non justifiées" fill={colors.nonJustifiees} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        
        {/* Type de graphique - Version avec accordéon */}
        <div className="mb-4">
          <div 
            className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer transition-all duration-300 hover:bg-gray-100 rounded-lg mb-2"
            onClick={toggleChartOptions}
          >
            <h3 className="text-md font-medium text-gray-900">Type de graphique</h3>
            <div className={`transform transition-transform duration-300 ${chartOptionsOpen ? 'rotate-180' : 'rotate-0'}`}>
              <FiChevronDown className={`w-5 h-5 ${chartOptionsOpen ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
          </div>
          
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              chartOptionsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-wrap gap-2 p-2">
              <button
                className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                  animateOptions ? 'scale-105' : ''
                } ${
                  chartType === 'bar' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                onClick={() => setChartType('bar')}
                style={{ transitionDelay: chartOptionsOpen ? '0ms' : '0ms' }}
              >
                <span className={`mr-1.5 transition-all duration-300 ${chartType === 'bar' ? 'animate-pulse' : ''}`}>
                  <FiBarChart2 />
                </span> 
                Barres
              </button>
              <button
                className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                  animateOptions ? 'scale-105' : ''
                } ${
                  chartType === 'line' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                onClick={() => setChartType('line')}
                style={{ transitionDelay: chartOptionsOpen ? '50ms' : '0ms' }}
              >
                <span className={`mr-1.5 transition-all duration-300 ${chartType === 'line' ? 'animate-pulse' : ''}`}>
                  <FiTrendingUp />
                </span> 
                Lignes
              </button>
              <button
                className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                  animateOptions ? 'scale-105' : ''
                } ${
                  chartType === 'area' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                onClick={() => setChartType('area')}
                style={{ transitionDelay: chartOptionsOpen ? '100ms' : '0ms' }}
              >
                <span className={`mr-1.5 transition-all duration-300 ${chartType === 'area' ? 'animate-pulse' : ''}`}>
                  <FiLayers />
                </span> 
                Aires
              </button>
              <button
                className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                  animateOptions ? 'scale-105' : ''
                } ${
                  chartType === 'pie' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                onClick={() => setChartType('pie')}
                style={{ transitionDelay: chartOptionsOpen ? '150ms' : '0ms' }}
              >
                <span className={`mr-1.5 transition-all duration-300 ${chartType === 'pie' ? 'animate-pulse' : ''}`}>
                  <FiPieChart />
                </span> 
                Répartition
              </button>
              <button
                className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                  animateOptions ? 'scale-105' : ''
                } ${
                  chartType === 'motifs' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                onClick={() => setChartType('motifs')}
                style={{ transitionDelay: chartOptionsOpen ? '200ms' : '0ms' }}
              >
                <span className={`mr-1.5 transition-all duration-300 ${chartType === 'motifs' ? 'animate-pulse' : ''}`}>
                  <FiGrid />
                </span> 
                Motifs
              </button>
              <button
                className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                  animateOptions ? 'scale-105' : ''
                } ${
                  chartType === 'class' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                onClick={() => setChartType('class')}
                style={{ transitionDelay: chartOptionsOpen ? '250ms' : '0ms' }}
              >
                <span className={`mr-1.5 transition-all duration-300 ${chartType === 'class' ? 'animate-pulse' : ''}`}>
                  <FiGrid />
                </span> 
                Par classe
              </button>
              <button
                className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                  animateOptions ? 'scale-105' : ''
                } ${
                  chartType === 'radar' ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                onClick={() => setChartType('radar')}
                style={{ transitionDelay: chartOptionsOpen ? '300ms' : '0ms' }}
              >
                <span className={`mr-1.5 transition-all duration-300 ${chartType === 'radar' ? 'animate-pulse' : ''}`}>
                  <FiRadio />
                </span> 
                Radar
              </button>
            </div>
          </div>
        </div>
        
        {/* Période temporelle - Version avec accordéon */}
        {['bar', 'line', 'area', 'pie'].includes(chartType) && (
          <div className="mb-4">
            <div 
              className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer transition-all duration-300 hover:bg-gray-100 rounded-lg mb-2"
              onClick={toggleTimeOptions}
            >
              <h3 className="text-md font-medium text-gray-900">Période temporelle</h3>
              <div className={`transform transition-transform duration-300 ${timeOptionsOpen ? 'rotate-180' : 'rotate-0'}`}>
                <FiChevronDown className={`w-5 h-5 ${timeOptionsOpen ? 'text-secondary-600' : 'text-gray-500'}`} />
              </div>
            </div>
            
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                timeOptionsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-wrap gap-2 p-2">
                <button
                  className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                    animateOptions ? 'scale-105' : ''
                  } ${
                    timeRange === 'monthly' ? 'bg-secondary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                  onClick={() => setTimeRange('monthly')}
                  style={{ transitionDelay: timeOptionsOpen ? '0ms' : '0ms' }}
                >
                  <span className={`mr-1.5 transition-all duration-300 ${timeRange === 'monthly' ? 'animate-pulse' : ''}`}>
                    <FiClock />
                  </span> 
                  Mensuel
                </button>
                <button
                  className={`flex items-center px-3 py-1.5 text-sm rounded transition-all duration-200 transform ${
                    animateOptions ? 'scale-105' : ''
                  } ${
                    timeRange === 'weekly' ? 'bg-secondary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                  onClick={() => setTimeRange('weekly')}
                  style={{ transitionDelay: timeOptionsOpen ? '50ms' : '0ms' }}
                >
                  <span className={`mr-1.5 transition-all duration-300 ${timeRange === 'weekly' ? 'animate-pulse' : ''}`}>
                    <FiClock />
                  </span> 
                  Hebdomadaire
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Graphique avec animation de transition */}
      <div className="mt-4 transition-all duration-300 fade-in" key={`${chartType}-${timeRange}`}>
        {renderChart()}
      </div>
    </div>
  );
};

export default StatisticsChart;
