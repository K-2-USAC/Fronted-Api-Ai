import { useState } from 'react';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const setAuth = useAuthStore(state => state.login);
  const clearAuth = useAuthStore(state => state.logout);

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', userData);
      const resData = response.data;
      
      if (resData.success) {
        const { userDetails, user, token, accessToken, jwt, data } = resData;
        const finalUser = userDetails || user || data?.user || data?.userDetails;
        const finalToken = token || accessToken || jwt || data?.token || data?.accessToken;
        
        setAuth(finalUser, finalToken || null);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error during registration');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      console.log('Login Response:', response.data);
      
      const resData = response.data;
      
      if (resData.success) {
        // Broad search for token, though it might be in HttpOnly cookies
        const token = resData.token || resData.accessToken || resData.jwt || 
                      resData.data?.token || resData.data?.accessToken || 
                      resData.userDetails?.token;
        
        const user = resData.userDetails || resData.user || 
                     resData.data?.user || resData.data?.userDetails || 
                     resData;
        
        // Even if token is null (HttpOnly cookies), we are authenticated because success was true
        setAuth(user, token || null);
        console.log('Auth set successfully (Cookie or Body token)');
      } else {
        console.warn('Login response was not successful:', resData);
      }
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/google', { token: googleToken });
      const { user, token } = response.data;
      if (token) setAuth(user, token);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  return { register, login, loginWithGoogle, logout, isLoading, error };
};
