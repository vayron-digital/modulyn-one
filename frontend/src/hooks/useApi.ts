import { useState, useCallback } from 'react';
import { ApiResponse } from '../types/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (promise: Promise<{ data: ApiResponse<T> }>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await promise;
      setState({
        data: response.data.data,
        loading: false,
        error: null,
      });
      return response.data.data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
} 