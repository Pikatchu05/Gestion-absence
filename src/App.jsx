// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Semestre from "./components/Semestre";
import Classe from "./components/Classe";
import Absence from "./components/Absence";
import Etudiant from "./components/Etudiant";
import Admin from "./components/Admin"; // Import du composant Admin
import NotFound from "./components/NotFound"; // Page 404 pour gérer les erreurs de routes
import MainLayout from "./components/layout/MainLayout";
import SemestreClasses from "./components/SemestreClasses"; // Import du composant de gestion des classes par semestre
import FichePresence from "./components/FichePresence"; // Import du composant FichePresence
import StatistiquesAbsences from "./components/StatistiquesAbsences"; // Import du composant des statistiques d'absences
import GestionMotifs from "./components/GestionMotifs"; // Import du composant de gestion des motifs d'absences

function App() {
  return (
    <Router>
      <Routes>
        {/* Route Login sans layout */}
        <Route path="/" element={<Login />} />
        
        {/* Routes avec le MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/semestre" element={<Semestre />} />
          <Route path="/semestre/:semestreId/classes" element={<SemestreClasses />} />
          <Route path="/classe" element={<Classe />} />
          <Route path="/absence" element={<Absence />} />
          <Route path="/etudiant" element={<Etudiant />} />
          <Route path="/etudiant/:id" element={<Etudiant />} />
          <Route path="/admin" element={<Admin />} /> 
          <Route path="/classe/:classId/presence/:date?" element={<FichePresence />} />
          <Route path="/statistiques" element={<StatistiquesAbsences />} />
          <Route path="/motifs" element={<GestionMotifs />} />
          <Route path="*" element={<NotFound />} />  {/* Gestion des routes non trouvées */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
