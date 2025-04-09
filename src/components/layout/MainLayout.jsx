import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  FiMenu, FiX, FiHome, FiCalendar, FiUsers, 
  FiClipboard, FiLogOut, FiChevronDown, FiSettings, FiChevronRight,
  FiSearch, FiRefreshCw, FiBarChart2
} from 'react-icons/fi';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('all'); // 'all', 'classes', 'semestres', 'etudiants'
  const [openSubMenu, setOpenSubMenu] = useState(''); 
  
  const location = useLocation();
  const navigate = useNavigate();

  // Exemple de données que vous pourriez avoir dans une vraie application
  const mockData = {
    etudiants: [
      { id: 1, nom: 'Dupont', prenom: 'Jean', type: 'etudiant' },
      { id: 2, nom: 'Martin', prenom: 'Sophie', type: 'etudiant' },
      { id: 3, nom: 'Dubois', prenom: 'Pierre', type: 'etudiant' }
    ],
    classes: [
      { id: 1, nom: 'Classe A', niveau: '1ère année', type: 'classe' },
      { id: 2, nom: 'Classe B', niveau: '2ème année', type: 'classe' }
    ],
    semestres: [
      { id: 1, nom: 'Semestre 1', annee: '2024-2025', type: 'semestre' },
      { id: 2, nom: 'Semestre 2', annee: '2024-2025', type: 'semestre' }
    ]
  };

  // Fonction pour gérer la recherche
  useEffect(() => {
    if (searchTerm.length > 1) {
      const term = searchTerm.toLowerCase();
      let results = [];
      
      if (searchType === 'all' || searchType === 'etudiants') {
        const etudiantsResults = mockData.etudiants.filter(
          etudiant => etudiant.nom.toLowerCase().includes(term) || 
                      etudiant.prenom.toLowerCase().includes(term)
        );
        results = [...results, ...etudiantsResults];
      }
      
      if (searchType === 'all' || searchType === 'classes') {
        const classesResults = mockData.classes.filter(
          classe => classe.nom.toLowerCase().includes(term) || 
                    classe.niveau.toLowerCase().includes(term)
        );
        results = [...results, ...classesResults];
      }
      
      if (searchType === 'all' || searchType === 'semestres') {
        const semestresResults = mockData.semestres.filter(
          semestre => semestre.nom.toLowerCase().includes(term) || 
                      semestre.annee.toLowerCase().includes(term)
        );
        results = [...results, ...semestresResults];
      }
      
      setSearchResults(results);
      setSearchActive(true);
    } else {
      setSearchResults([]);
      setSearchActive(false);
    }
  }, [searchTerm, searchType]);

  // Fonction pour naviguer vers la page appropriée lors de la sélection d'un résultat
  const handleSearchResultClick = (item) => {
    setSearchTerm('');
    setSearchActive(false);
    
    switch(item.type) {
      case 'etudiant':
        navigate(`/etudiant/${item.id}`);
        break;
      case 'classe':
        navigate(`/classe/${item.id}`);
        break;
      case 'semestre':
        navigate(`/semestre/${item.id}`);
        break;
      default:
        break;
    }
  };

  // Fonction pour ouvrir/fermer le menu latéralement
  const toggleMenu = () => {
    setMenuExpanded(!menuExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', name: 'Tableau de bord', icon: <FiHome className="w-5 h-5" /> },
    { path: '/absence', name: 'Absences', icon: <FiClipboard className="w-5 h-5" /> },
    { path: '/semestre', name: 'Semestres', icon: <FiCalendar className="w-5 h-5" /> },
    { path: '/statistiques', name: 'Statistiques', icon: <FiBarChart2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - avec animation de droite à gauche */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full transform bg-white shadow-lg transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${menuExpanded ? 'w-64' : 'w-16'}`}
      >
        {/* En-tête du menu avec le titre et bouton de fermeture */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div 
            className="flex items-center cursor-pointer w-full"
            onClick={toggleMenu}
          >
            {menuExpanded && (
              <h1 className="text-xl font-bold text-primary-700 flex-grow transition-opacity duration-300">
                Gestion Absences
              </h1>
            )}
            <div className={`transform transition-transform duration-300 ml-auto ${menuExpanded ? 'rotate-180' : 'rotate-0'}`}>
              <FiChevronRight className={`h-5 w-5 ${menuExpanded ? 'text-primary-600' : 'text-gray-500'}`} />
            </div>
          </div>
          <button
            className={`ml-2 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden ${!menuExpanded && 'hidden'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation principale - avec noms qui apparaissent/disparaissent */}
        <nav className="mt-5 px-2">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = location.pathname.startsWith(item.path);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isSubMenuOpen = openSubMenu === item.name;
              
              return (
                <li key={item.name} className="group">
                  {hasSubItems ? (
                    <div>
                      <button
                        onClick={() => setOpenSubMenu(isSubMenuOpen ? '' : item.name)}
                        className={`flex w-full items-center rounded-md px-3 py-2 ${
                          isActive 
                            ? 'bg-primary-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } transition-all duration-200 ease-in-out`}
                      >
                        <div className={`mr-3 ${isActive ? 'animate-pulse' : ''}`}>
                          {item.icon}
                        </div>
                        <span className={`${menuExpanded ? 'opacity-100' : 'opacity-0 hidden'} transition-opacity duration-300`}>
                          {item.name}
                        </span>
                        {hasSubItems && menuExpanded && (
                          <div className={`ml-auto transform transition-transform duration-300 ${isSubMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                            <FiChevronDown className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                        )}
                      </button>
                      
                      {/* Sous-menu avec animation */}
                      {hasSubItems && menuExpanded && (
                        <ul 
                          className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                            isSubMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          {item.subItems.map((subItem, subIndex) => {
                            const isSubActive = location.pathname.startsWith(subItem.path);
                            return (
                              <li 
                                key={subItem.name}
                                style={{
                                  transitionDelay: `${subIndex * 50}ms`,
                                  opacity: isSubMenuOpen ? 1 : 0,
                                  transform: isSubMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                                  transition: 'opacity 300ms, transform 300ms'
                                }}
                              >
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center rounded-md px-3 py-2 ${
                                    isSubActive 
                                      ? 'bg-primary-600 text-white shadow-md' 
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  } transition-all duration-200 ease-in-out hover:scale-105`}
                                >
                                  <div className={`mr-3 ${isSubActive ? 'animate-pulse' : ''}`}>
                                    {subItem.icon}
                                  </div>
                                  <span className="transition-opacity duration-300">
                                    {subItem.name}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center rounded-md px-3 py-2 ${
                        isActive 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-all duration-200 ease-in-out ${
                        !menuExpanded ? 'justify-center' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className={`${!menuExpanded ? '' : 'mr-3'} ${isActive ? 'animate-pulse' : ''}`}>
                        {item.icon}
                      </div>
                      <span className={`${menuExpanded ? 'opacity-100' : 'opacity-0 hidden'} transition-opacity duration-300`}>
                        {item.name}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bouton déconnexion en bas de menu */}
        <div className="absolute bottom-0 w-full border-t p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 hover:scale-105 ${!menuExpanded && 'justify-center'}`}
            title={!menuExpanded ? "Déconnexion" : ""}
          >
            <FiLogOut className={`${menuExpanded ? 'mr-3' : ''} h-5 w-5`} />
            {menuExpanded && (
              <span>Déconnexion</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content - ajustement dynamique en fonction de la largeur du menu */}
      <div className={`transition-all duration-300 ease-in-out ${menuExpanded ? 'lg:pl-64' : 'lg:pl-16'}`}>
        {/* Top navbar with search */}
        <header className="sticky top-0 z-10 flex h-16 items-center bg-white shadow-sm">
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center">
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu className="h-6 w-6" />
              </button>
            </div>

            {/* Barre de recherche dynamique */}
            <div className="flex-grow max-w-lg mx-4 relative">
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all duration-200">
                <div className="pl-3">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full py-2 pl-2 pr-10 focus:outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FiRefreshCw className="h-4 w-4" />
                  </button>
                )}
                
                {/* Filtres de recherche */}
                <div className="pr-3 border-l border-gray-200 pl-2">
                  <select 
                    className="text-xs appearance-none bg-transparent border-none focus:outline-none text-gray-600"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="etudiants">Étudiants</option>
                    <option value="classes">Classes</option>
                    <option value="semestres">Semestres</option>
                  </select>
                </div>
              </div>
              
              {/* Résultats de recherche */}
              {searchActive && searchResults.length > 0 && (
                <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  <ul className="py-1">
                    {searchResults.map((result, index) => (
                      <li 
                        key={`${result.type}-${result.id}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 text-sm"
                        onClick={() => handleSearchResultClick(result)}
                        style={{ 
                          animationDelay: `${index * 30}ms`,
                          opacity: 1,
                          transform: 'translateY(0)',
                          transition: 'opacity 300ms, transform 300ms',
                          transitionDelay: `${index * 30}ms`
                        }}
                      >
                        <div className="flex items-center">
                          {result.type === 'etudiant' && (
                            <FiUsers className="mr-2 h-4 w-4 text-primary-600" />
                          )}
                          {result.type === 'classe' && (
                            <FiUsers className="mr-2 h-4 w-4 text-secondary-600" />
                          )}
                          {result.type === 'semestre' && (
                            <FiCalendar className="mr-2 h-4 w-4 text-indigo-600" />
                          )}
                          <div>
                            <div className="font-medium">
                              {result.type === 'etudiant' ? `${result.nom} ${result.prenom}` : result.nom}
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.type === 'etudiant' ? 'Étudiant' : result.type === 'classe' ? `${result.niveau}` : `${result.annee}`}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {searchActive && searchTerm.length > 1 && searchResults.length === 0 && (
                <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 text-sm text-gray-500">Aucun résultat trouvé</div>
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    {localStorage.getItem('userInitials') || 'U'}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {localStorage.getItem('userName') || 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
