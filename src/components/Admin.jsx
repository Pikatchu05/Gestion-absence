import React, { useState, useEffect } from 'react';
import { FiCalendar, FiSettings } from 'react-icons/fi';
import MainLayout from './layout/MainLayout';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('annees');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [animateMenu, setAnimateMenu] = useState(false);
  
  // Données d'exemple
  const [anneesScolaires, setAnneesScolaires] = useState([
    { id: 1, annee: "2023-2024", active: true, dateDebut: "2023-09-01", dateFin: "2024-07-05" },
    { id: 2, annee: "2022-2023", active: false, dateDebut: "2022-09-01", dateFin: "2023-07-07" },
    { id: 3, annee: "2021-2022", active: false, dateDebut: "2021-09-01", dateFin: "2022-07-06" },
  ]);

  const [parametres, setParametres] = useState({
    seuilAbsences: 10,
    notificationParents: true,
    archivageAutomatique: true,
  });

  // Animation du menu lors du changement d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAnimateMenu(true);
    setTimeout(() => setAnimateMenu(false), 300);
  };

  // Gestion de l'edition d'une année scolaire
  const handleEdit = (annee) => {
    setEditingId(annee.id);
  };

  // Gestion de l'annulation de l'édition
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Toggle du dropdown pour les années scolaires
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Rendu du contenu en fonction de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'annees':
        return renderAnneesTab();
      case 'parametres':
        return renderParametresTab();
      default:
        return renderAnneesTab();
    }
  };

  // Onglet Années scolaires
  const renderAnneesTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-end mb-6">
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 transform hover:scale-105 flex items-center">
            <span className="mr-2">+</span> Ajouter une année scolaire
          </button>
        </div>
        
        {/* Tableau des années scolaires */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {anneesScolaires.map((annee) => (
                  <tr key={annee.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">{annee.annee}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{annee.dateDebut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{annee.dateFin}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        annee.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {annee.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Modifier
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Onglet Paramètres
  const renderParametresTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="seuilAbsences" className="block text-sm font-medium text-gray-700">
                Seuil d'absences avant notification
              </label>
              <input
                type="number"
                id="seuilAbsences"
                name="seuilAbsences"
                min="1"
                max="100"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={parametres.seuilAbsences}
                onChange={(e) => setParametres({...parametres, seuilAbsences: e.target.value})}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="notificationParents"
                name="notificationParents"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={parametres.notificationParents}
                onChange={(e) => setParametres({...parametres, notificationParents: e.target.checked})}
              />
              <label htmlFor="notificationParents" className="ml-2 block text-sm text-gray-900">
                Activer les notifications aux parents
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="archivageAutomatique"
                name="archivageAutomatique"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={parametres.archivageAutomatique}
                onChange={(e) => setParametres({...parametres, archivageAutomatique: e.target.checked})}
              />
              <label htmlFor="archivageAutomatique" className="ml-2 block text-sm text-gray-900">
                Archivage automatique des données en fin d'année
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Enregistrer les paramètres
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu latéral */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Administration</h2>
            <ul>
              <li className="mb-1">
                <button
                  onClick={() => handleTabChange('annees')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                    activeTab === 'annees' 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiCalendar className={`mr-2 ${activeTab === 'annees' && !animateMenu ? 'animate-pulse' : ''}`} />
                  <span>Années scolaires</span>
                </button>
              </li>
              <li className="mb-1">
                <button
                  onClick={() => handleTabChange('parametres')}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                    activeTab === 'parametres' 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiSettings className={`mr-2 ${activeTab === 'parametres' && !animateMenu ? 'animate-pulse' : ''}`} />
                  <span>Paramètres</span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;
