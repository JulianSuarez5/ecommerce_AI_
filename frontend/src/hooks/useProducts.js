import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getAll(p || params);
      const data = res?.content || res || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: () => fetchProducts(), setParams };
}
