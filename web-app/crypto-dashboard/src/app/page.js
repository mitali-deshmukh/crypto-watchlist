"use client"
import { useQuery } from "@tanstack/react-query"
import { fetchCryptoPrices, fetchCoinList } from "./services/pricing"
import { useEffect, useState, useRef } from "react"
import CoinRow from "./coinrow"

const Spinner = () => (
  <div className="flex justify-center h-150 items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
)

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const [watchlist, setWatchlist] = useState([])
  const [isWatchlistReady, setIsWatchlistReady] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const [addSearchTerm, setAddSearchTerm] = useState("")
  const [actionError, setActionError] = useState("")
  const [hasInteractedWithAddSearch, setHasInteractedWithAddSearch] =
    useState(false)
  const [isCoinDropdownOpen, setIsCoinDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const addSearchContainerRef = useRef(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("watchlist")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlist(parsed)
          setIsWatchlistReady(true)
          return
        }
      } catch {}
    }
    setWatchlist(["bitcoin", "ethereum", "ripple", "litecoin", "cardano"])
    setIsWatchlistReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isWatchlistReady) return
    if (watchlist.length === 0) {
      window.localStorage.removeItem("watchlist")
      return
    }
    window.localStorage.setItem("watchlist", JSON.stringify(watchlist))
  }, [watchlist, isWatchlistReady])

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        addSearchContainerRef.current &&
        !addSearchContainerRef.current.contains(event.target)
      ) {
        setIsCoinDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const {
    data: cryptoPrices = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["cryptoPrices", watchlist],
    queryFn: () => fetchCryptoPrices(watchlist),
    enabled: isWatchlistReady && watchlist.length > 0,
    keepPreviousData: true,
  })

  const {
    data: coinList = [],
    isLoading: isCoinListLoading,
    isError: isCoinListError,
  } = useQuery({
    queryKey: ["coinList"],
    queryFn: () => fetchCoinList(),
    enabled: hasInteractedWithAddSearch,
    staleTime: 1000 * 60 * 60,
  })

  useEffect(() => {
    if (!isLoading && isWatchlistReady && cryptoPrices.length > 0) {
      setHasLoadedOnce(true)
    }
  }, [isLoading, isWatchlistReady, cryptoPrices.length])

  const filteredCryptoPrices = cryptoPrices.filter(crp => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    const name = crp.name?.toLowerCase() || ""
    const symbol = crp.symbol?.toLowerCase() || ""
    return name.includes(q) || symbol.includes(q)
  })

  const normalizedAddSearch = addSearchTerm.trim().toLowerCase()

  const filteredCoinsToAdd =
    !normalizedAddSearch || !Array.isArray(coinList)
      ? []
      : (() => {
          const q = normalizedAddSearch

          const matches = coinList.filter(coin => {
            const name = coin.name?.toLowerCase() || ""
            const symbol = coin.symbol?.toLowerCase() || ""
            const id = coin.id?.toLowerCase() || ""
            return name.includes(q) || symbol.includes(q) || id.includes(q)
          })

          const exactSymbol = matches.filter(
            c => (c.symbol || "").toLowerCase() === q
          )

          const exactId = matches.filter(
            c =>
              (c.id || "").toLowerCase() === q &&
              !exactSymbol.includes(c)
          )

          const exactName = matches.filter(
            c =>
              (c.name || "").toLowerCase() === q &&
              !exactSymbol.includes(c) &&
              !exactId.includes(c)
          )

          const partial = matches.filter(
            c =>
              !exactSymbol.includes(c) &&
              !exactId.includes(c) &&
              !exactName.includes(c)
          )

          return [...exactSymbol, ...exactId, ...exactName, ...partial].slice(
            0,
            20
          )
        })()

  useEffect(() => {
    if (filteredCoinsToAdd.length === 0) {
      setHighlightedIndex(0)
      return
    }
    setHighlightedIndex(prev =>
      prev >= filteredCoinsToAdd.length ? filteredCoinsToAdd.length - 1 : prev
    )
  }, [filteredCoinsToAdd.length])

  const handleSelectCoin = coin => {
    const id = coin.id
    if (!id) return
    if (watchlist.includes(id)) {
      setActionError("Already in watchlist")
      return
    }
    setActionError("")
    setWatchlist(prev => [...prev, id])
    setAddSearchTerm("")
    setIsCoinDropdownOpen(false)
  }

  const handleRemove = id => {
    setWatchlist(prev => prev.filter(item => item !== id))
  }

  const handleAddSearchKeyDown = event => {
    if (
      !isCoinDropdownOpen &&
      (event.key === "ArrowDown" || event.key === "ArrowUp")
    ) {
      if (filteredCoinsToAdd.length > 0) {
        setIsCoinDropdownOpen(true)
      }
      return
    }

    if (!filteredCoinsToAdd.length) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlightedIndex(prev =>
        prev + 1 >= filteredCoinsToAdd.length ? 0 : prev + 1
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlightedIndex(prev =>
        prev - 1 < 0 ? filteredCoinsToAdd.length - 1 : prev - 1
      )
    } else if (event.key === "Enter" || event.key === "Insert") {
      event.preventDefault()
      const coin = filteredCoinsToAdd[highlightedIndex]
      if (coin) {
        handleSelectCoin(coin)
      }
    } else if (event.key === "Escape") {
      setIsCoinDropdownOpen(false)
    }
  }

  const isInitialLoading =
    !hasLoadedOnce &&
    (!isWatchlistReady || (isLoading && cryptoPrices.length === 0))

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto p-4 max-w-md md:max-w-2xl lg:max-w-4xl flex-1 flex flex-col">
        <h1 className="text-2xl font-semibold text-white mb-4 text-center">
          Crypto Watchlist
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          Track prices, trends, and your favorite coins in real time
        </p>

        <div>
          <div className="flex gap-4 p-4 mx-auto mt-6">
            <input
              placeholder="Search watchlist"
              className="w-full"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
              }}
            />

            <div className="relative min-w-90" ref={addSearchContainerRef}>
              <input
                placeholder="Search coins to add, for example dogecoin"
                value={addSearchTerm}
                onChange={e => {
                  const value = e.target.value
                  setAddSearchTerm(value)
                  setActionError("")
                  if (!hasInteractedWithAddSearch) {
                    setHasInteractedWithAddSearch(true)
                  }
                  setIsCoinDropdownOpen(true)
                }}
                onFocus={() => {
                  if (!hasInteractedWithAddSearch) {
                    setHasInteractedWithAddSearch(true)
                  }
                  if (addSearchTerm.trim()) {
                    setIsCoinDropdownOpen(true)
                  }
                }}
                onKeyDown={handleAddSearchKeyDown}
                aria-autocomplete="list"
                aria-expanded={isCoinDropdownOpen}
                aria-haspopup="listbox"
                className="w-full pr-10"
              />

              {isCoinDropdownOpen && normalizedAddSearch && (
                <div
                  className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg max-h-64 overflow-y-auto border border-gray-700"
                  role="listbox"
                >
                  {isCoinListLoading && (
                    <div className="px-3 py-2 text-xs text-gray-200">
                      Loading coins...
                    </div>
                  )}

                  {isCoinListError && !isCoinListLoading && (
                    <div className="px-3 py-2 text-xs text-red-400">
                      Unable to load coin list
                    </div>
                  )}

                  {!isCoinListLoading &&
                    !isCoinListError &&
                    filteredCoinsToAdd.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-200">
                        No coins match that search
                      </div>
                    )}

                  {!isCoinListLoading &&
                    !isCoinListError &&
                    filteredCoinsToAdd.map((coin, index) => {
                      const isActive = index === highlightedIndex
                      return (
                        <button
                          type="button"
                          key={coin.id}
                          onClick={() => handleSelectCoin(coin)}
                          className={
                            "w-full text-left px-3 py-2 text-xs flex justify-between items-center " +
                            (isActive
                              ? "bg-gray-700 text-white"
                              : "text-gray-100 hover:bg-gray-700")
                          }
                          role="option"
                          aria-selected={isActive}
                        >
                          <span className="truncate mr-2">{coin.name}</span>
                          <span className="text-gray-300 uppercase text-[10px]">
                            {coin.symbol}
                          </span>
                        </button>
                      )
                    })}
                </div>
              )}
            </div>

            <button
              onClick={refetch}
              disabled={isFetching}
              aria-label="Refresh prices"
              title="Refresh"
            >
              <svg className="refresh-icon" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
              </svg>
            </button>
          </div>

          {actionError && (
            <p className="mt-2 text-xs text-red-400 text-center">
              {actionError}
            </p>
          )}
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center text-gray-200 mt-8">
            Your watchlist is empty. Search for a coin above to add it.
          </div>
        ) : filteredCryptoPrices.length === 0 ? (
          <div className="text-center text-gray-200 mt-8">
            No results match your search.
          </div>
        ) : (
          <div>
            <ul role="list" className="divide-y divide-gray-700 mt-6">
              {filteredCryptoPrices.map(crp => (
                <CoinRow key={crp.id} coin={crp} onRemove={handleRemove} />
              ))}
            </ul>
          </div>
        )}

        <footer className="text-center text-gray-500 text-xs mt-10 mb-4 mt-auto">
          Built with CoinGecko API
        </footer>
      </main>
    </div>
  )
}
