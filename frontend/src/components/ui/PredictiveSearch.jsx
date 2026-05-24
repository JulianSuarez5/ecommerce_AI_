import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, Loader } from 'lucide-react'
import { motion, AnimatePresence } from '../../utils/motion'
import { productService } from '../../services/productService';
import { formatPrecio } from '../../utils/format';
import { getProductImage, resolveImageUrl } from '../../utils/imageUrl'
import SafeImg from './SafeImg'

export default function PredictiveSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  const trimmed = query.trim()
  const showDropdown = isOpen && trimmed.length >= 2

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      setIsOpen(false)
      return
    }

    setLoading(true)
    setIsOpen(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productService.getAll({ busqueda: trimmed, size: 5 })
        const productos = data?.content || data || []
        setResults(Array.isArray(productos) ? productos : [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    setQuery(e.target.value)
    setActiveIndex(-1)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const closeSearch = () => {
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const submitSearch = () => {
    if (trimmed) {
      navigate(`/catalogo?busqueda=${encodeURIComponent(trimmed)}`)
      closeSearch()
    }
  }

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && results[activeIndex]) {
          navigate(`/producto/${results[activeIndex].id}`)
          closeSearch()
        } else {
          submitSearch()
        }
        break
      case 'Escape':
        e.preventDefault()
        closeSearch()
        inputRef.current?.blur()
        break
    }
  }

  const getThumbnail = (product) => {
    const raw = getProductImage(product)
    return raw ? resolveImageUrl(raw) : null
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative flex items-center">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (trimmed.length >= 2) setIsOpen(true)
          }}
          placeholder="Buscar productos..."
          className="w-full h-11 pl-10 pr-10
            bg-white/70 dark:bg-[#0f2027]/70
            backdrop-blur-xl
            border border-white/20 dark:border-white/10
            rounded-2xl
            text-sm text-ink dark:text-ink-dark
            placeholder:text-ink-tertiary
            shadow-lg shadow-black/5
            focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500/50
            transition-all duration-200"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1
              text-ink-tertiary hover:text-ink dark:hover:text-ink-dark
              transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Limpiar búsqueda"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <X size={16} />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            key="search-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="absolute top-full mt-2 left-0 right-0
              bg-white/80 dark:bg-[#0f2027]/80
              backdrop-blur-2xl
              border border-white/20 dark:border-white/10
              rounded-2xl
              shadow-xl shadow-black/10
              overflow-hidden z-50"
          >
            {loading ? (
              <div className="p-3 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-1.5">
                  <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
                    Productos
                  </p>
                </div>
                {results.map((product, index) => {
                  const thumbSrc = getThumbnail(product)
                  return (
                    <Link
                      key={product.id}
                      to={`/producto/${product.id}`}
                      onClick={closeSearch}
                      className={`
                        flex items-center gap-3 px-4 py-2.5
                        transition-colors duration-150
                        ${activeIndex === index
                          ? 'bg-accent-500/10 dark:bg-accent-500/15'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                        }
                      `}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <SafeImg
                        src={thumbSrc}
                        alt={product.nombre}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">
                          {product.nombre}
                        </p>
                        <p className="text-xs text-ink-secondary dark:text-ink-dark-secondary truncate">
                          {product.categoria?.nombre || ''}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-semibold text-accent-600 dark:text-accent-400">
                          {formatPrecio(product.precio)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                <div className="mb-3 p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Search size={22} className="text-ink-tertiary" />
                </div>
                <p className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">
                  Sin resultados
                </p>
                <p className="text-xs text-ink-secondary dark:text-ink-dark-secondary max-w-[200px]">
                  No encontramos productos para &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
              <button
                onClick={submitSearch}
                className="w-full text-left text-xs font-medium text-accent-600 dark:text-accent-400
                  hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
              >
                Ver todos los resultados para &ldquo;{query}&rdquo; &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
