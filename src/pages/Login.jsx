import React, { useState } from 'react';
import axios from 'axios';
import {  useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  //redirection
  const navigate = useNavigate();

  // Appel pour récupérer le cookie CSRF avant le login
  const getCsrfCookie = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true, // Les cookies sont nécessaires pour Sanctum
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du cookie CSRF', error);
    }
  };

  // Vérifier si l'utilisateur est authentifié (optionnel)
  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/user', {
        withCredentials: true, // envoie les cookies
      });
      console.log('Utilisateur connecté :', response.data);
    } catch (e) {
      console.log('Non connecté :', e.response ? e.response.data : e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Récupérer le cookie CSRF avant de poster le login
    await getCsrfCookie();

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        { email, password },
        {
          withCredentials: true, // essentiel pour Laravel Sanctum
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Réponse login :', response.data);
      navigate('/Mvola');

      //alert('Connexion réussie !');

      // Vérifier la session après login (optionnel)
      await checkAuth();

    } catch (error) {
      if (error.response) {
        console.error(error.response.data);
        alert('Erreur : ' + error.response.data.message);
      } else {
        console.error(error.message);
        alert('Erreur serveur');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl">
        {/* Partie gauche - Illustration */}
        <div className="bg-indigo-600 rounded-tl-2xl rounded-tr-2xl md:rounded-tr-none md:rounded-bl-2xl text-white md:w-2/5 p-5 flex flex-col justify-center items-center">
          <div className="text-center">
            <h2 className="font-bold text-3xl mb-2">Bienvenue</h2>
            <div className="border-2 w-10 border-white inline-block mb-2"></div>
            <p className="mb-6">Connectez-vous pour accéder à votre espace</p>
            <div className="flex justify-center my-8">
              <div className="bg-white p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs">Vous n'avez pas de compte? <a href="#" className="font-semibold hover:text-gray-300">Inscrivez-vous</a></p>
          </div>
        </div>

        {/* Partie droite - Formulaire */}
        <div className="md:w-3/5 p-5 bg-gray-50 rounded-bl-2xl rounded-br-2xl md:rounded-bl-none md:rounded-tr-2xl">
          <div className="text-right mb-6">
            <span className="text-sm text-gray-500">Nouveau ici? </span>
            <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Créer un compte</a>
          </div>
          
          <div className="py-10 px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Connectez-vous à votre compte</h2>
            <div className="border-2 w-10 border-indigo-600 inline-block mb-6"></div>
            
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" className="block text-gray-600 mb-2">Adresse email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    placeholder="votre@email.com" 
                    required 
                  />
                </div>
              </div>
              
              {/* Password */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-600 mb-2">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    placeholder="Votre mot de passe" 
                    required 
                  />
                </div>
                <div className="text-right mt-2">
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">Mot de passe oublié?</a>
                </div>
              </div>
              
              {/* Remember Me */}
              <div className="flex items-center mb-6">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Se souvenir de moi</label>
              </div>
              
              <button 
                type="submit" 
                className="bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg w-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
