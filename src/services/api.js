// src/services/api.js
import axios from 'axios';

// Créer une instance axios avec une configuration de base
const API = axios.create({
  baseURL: 'http://localhost:3000/api', // Ajustez selon votre configuration backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter le token JWT à chaque requête
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Services pour les étudiants
export const etudiantService = {
  getAll: async () => {
    try {
      const response = await API.get('/etudiants');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await API.get(`/etudiants/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (etudiantData) => {
    try {
      const response = await API.post('/etudiants', etudiantData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id, etudiantData) => {
    try {
      const response = await API.put(`/etudiants/${id}`, etudiantData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await API.delete(`/etudiants/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Services pour les semestres
export const semestreService = {
  getAll: async () => {
    try {
      const response = await API.get('/semestres');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await API.get(`/semestres/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (semestreData) => {
    try {
      const response = await API.post('/semestres', semestreData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id, semestreData) => {
    try {
      const response = await API.put(`/semestres/${id}`, semestreData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await API.delete(`/semestres/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Services pour les absences
export const absenceService = {
  getAll: async () => {
    try {
      const response = await API.get('/absences');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getByEtudiant: async (etudiantId) => {
    try {
      const response = await API.get(`/absences/etudiant/${etudiantId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (absenceData) => {
    try {
      const response = await API.post('/absences', absenceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id, absenceData) => {
    try {
      const response = await API.put(`/absences/${id}`, absenceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await API.delete(`/absences/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default API;
