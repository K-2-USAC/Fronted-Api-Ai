import { useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

export const useCalls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCallsByProject = useCallback(async (projectId, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/calls/project/${projectId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching project calls');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCallDetails = useCallback(async (callSid) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/calls/${callSid}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching call details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCallRecord = useCallback(async (callSid) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/calls/${callSid}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting call record');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCallsByProject,
    getCallDetails,
    deleteCallRecord,
    isLoading,
    error
  };
};
