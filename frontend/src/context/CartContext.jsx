import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

const CartContext = createContext(null);

const GUEST_KEY = 'to_cart_guest';

function loadGuestCart() {
  try {
    const saved = localStorage.getItem(GUEST_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

function mapServerItem(item) {
  const key = `${item.productoId}-default`;
  return {
    key,
    id: item.productoId,
    nombre: item.productoNombre,
    precio: item.precioUnitario,
    img: item.imagenPrincipal,
    color: 'default',
    sku: '',
    qty: item.cantidad,
    stock: item.stockDisponible,
    _serverId: item.id,
    _synced: true,
  };
}

export function CartProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState(() => []);
  const [initialized, setInitialized] = useState(false);
  const loginSyncing = useRef(false);

  const userId = user?.id;
  const isLoggedIn = !!userId;

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn) {
      cartService.obtener()
        .then((data) => {
          const serverItems = (data.items || []).map(mapServerItem);
          setItems(serverItems);
        })
        .catch(() => setItems([]))
        .finally(() => setInitialized(true));
    } else {
      setItems(loadGuestCart());
      setInitialized(true);
    }
  }, [isLoggedIn, authLoading]);

  useEffect(() => {
    function handleLogin(e) {
      if (loginSyncing.current) return;
      loginSyncing.current = true;

      const localItems = loadGuestCart();
      if (localItems.length === 0) {
        cartService.obtener()
          .then((data) => {
            const serverItems = (data.items || []).map(mapServerItem);
            setItems(serverItems);
          })
          .catch(() => setItems([]))
          .finally(() => { loginSyncing.current = false; });
        return;
      }

      const syncPromises = localItems.map((item) =>
        cartService.agregarItem(item.id, item.qty).catch(() => null)
      );

      Promise.allSettled(syncPromises).then(() => {
        localStorage.removeItem(GUEST_KEY);
        return cartService.obtener();
      })
        .then((data) => {
          const serverItems = (data.items || []).map(mapServerItem);
          setItems(serverItems);
        })
        .catch(() => setItems([]))
        .finally(() => { loginSyncing.current = false; });
    }

    window.addEventListener('auth:login', handleLogin);
    return () => window.removeEventListener('auth:login', handleLogin);
  }, []);

  useEffect(() => {
    if (!initialized || loginSyncing.current) return;
    if (!isLoggedIn) {
      saveGuestCart(items);
    }
  }, [items, isLoggedIn, initialized]);

  const addItem = useCallback((product) => {
    if (!initialized) return;
    setItems((prev) => {
      const key = `${product.id}-${product.color || 'default'}`;
      const existing = prev.find((item) => item.key === key);
      const maxStock = product.stock !== undefined && product.stock > 0 ? product.stock : 999;

      if (existing) {
        const newQty = Math.min(existing.qty + (product.qty || 1), maxStock);
        const updated = prev.map((item) =>
          item.key === key ? { ...item, qty: newQty } : item
        );
        if (isLoggedIn && existing._serverId) {
          cartService.actualizarCantidad(existing._serverId, newQty).catch(() => {});
        } else if (isLoggedIn) {
          cartService.agregarItem(product.id, newQty).catch(() => {});
        }
        return updated;
      }

      const initialQty = Math.min(product.qty || 1, maxStock);
      if (isLoggedIn) {
        cartService.agregarItem(product.id, initialQty)
          .then((data) => {
            const serverItem = data.items?.find((i) => i.productoId === product.id);
            if (serverItem) {
              setItems((cur) =>
                cur.map((i) =>
                  i.key === key ? { ...i, _serverId: serverItem.id, _synced: true } : i
                )
              );
            }
          })
          .catch(() => {});
      }
      return [...prev, { ...product, key, qty: initialQty, stock: product.stock, _synced: false }];
    });
  }, [isLoggedIn, initialized]);

  const removeItem = useCallback((key) => {
    setItems((prev) => {
      const item = prev.find((i) => i.key === key);
      if (isLoggedIn && item?._serverId) {
        cartService.eliminarItem(item._serverId).catch(() => {});
      }
      return prev.filter((i) => i.key !== key);
    });
  }, [isLoggedIn]);

  const updateQty = useCallback((key, qty) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const maxStock = item.stock !== undefined ? item.stock : 999;
          const newQty = Math.min(qty, maxStock);
          if (isLoggedIn && item._serverId) {
            cartService.actualizarCantidad(item._serverId, newQty).catch(() => {});
          }
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  }, [isLoggedIn]);

  const clear = useCallback(() => {
    setItems([]);
    if (isLoggedIn) {
      cartService.limpiar().catch(() => {});
    }
  }, [isLoggedIn]);

  const total = items.reduce((sum, item) => sum + item.precio * item.qty, 0);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
