import { useState, useEffect, useCallback } from 'react';

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  variables: string;
  updatedAt: number;
}

const STORAGE_KEY = 'accesslayer_graphql_saved_queries';

export function useSavedQueries() {
  const [queries, setQueries] = useState<SavedQuery[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    } catch (err) {
      console.error('Failed to persist saved queries:', err);
    }
  }, [queries]);

  const saveQuery = useCallback((name: string, query: string, variables: string): SavedQuery => {
    const newEntry: SavedQuery = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Untitled Query',
      query,
      variables,
      updatedAt: Date.now(),
    };
    setQueries((prev) => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const updateQuery = useCallback((id: string, updates: Partial<Omit<SavedQuery, 'id'>>) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: Date.now() } : q))
    );
  }, []);

  const renameQuery = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    updateQuery(id, { name: newName.trim() });
  }, [updateQuery]);

  const deleteQuery = useCallback((id: string) => {
    setQueries((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return {
    queries,
    saveQuery,
    updateQuery,
    renameQuery,
    deleteQuery,
  };
}
