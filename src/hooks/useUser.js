import { useState, useCallback } from "react";
import apiClient from "../api/apiClient";

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/user/profile");
      return response.data.user;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (uid, passwords) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(
        `/user/update-password/${uid}`,
        passwords,
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch("/user/profile/update", data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (uid) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/user/delete/${uid}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting account");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getUserProfile, updatePassword, updateUserProfile, deleteAccount, isLoading, error };
};
