import { useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

export const useProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProjects = useCallback(async (name = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (name.trim()) params.name = name.trim();
      
      const response = await apiClient.get('/projects', {
        params
      });
      return response.data.projects || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching projects');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProjectById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data.project;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching project details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data.project;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData);
      return response.data.project;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateProject = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/projects/${id}/activate`);
      return response.data.project;
    } catch (err) {
      setError(err.response?.data?.message || 'Error activating project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      return response.data.project;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    activateProject,
    isLoading,
    error
  };
};
