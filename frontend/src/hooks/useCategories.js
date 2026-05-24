import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    categoryService.getAll()
      .then((res) => {
        if (!mounted) return;
        setCategories(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
      })
      .catch((err) => { if (mounted) setError(err.response?.data?.message || err.message || 'Error al cargar categorías'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { categories, loading, error };
}
