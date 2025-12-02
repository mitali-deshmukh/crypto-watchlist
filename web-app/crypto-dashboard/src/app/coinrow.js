import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { fetchCoinDetails } from "./services/pricing"

function CoinRow({ coin, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    data: details,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useQuery({
    queryKey: ["coinDetails", coin.id],
    queryFn: () => fetchCoinDetails(coin.id),
    enabled: isExpanded,
    staleTime: 1000 * 60 * 5,
  })

  const marketData = details?.market_data
  const homepage = details?.links?.homepage?.[0]

  return (
    <li
      className="watchlist-item bg-gray-800 rounded-lg mb-3 p-4 cursor-pointer shadow transition-shadow hover:shadow-lg hover:shadow-black/40"
      onClick={() => setIsExpanded(prev => !prev)}
    >

      <div className="flex justify-between items-center">
        <div className="flex min-w-0 gap-x-4">
          <img
            alt=""
            src={coin.image}
            className="size-12 flex-none rounded-full bg-gray-50"
          />
          <div className="min-w-0 flex-auto">
            <p className="text-sm/6 font-semibold text-white">{coin.name}</p>
            <p className="mt-1 truncate text-xs/5 text-gray-200">
              {coin.symbol.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="shrink-0 flex flex-col items-end">
            <p className="text-sm/6 text-white">${coin.current_price}</p>
            <p className="mt-1 text-xs/5 text-gray-200">
              Last Updated: {format(new Date(coin.last_updated), "h:mm a")}
            </p>
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onRemove(coin.id)
            }}
            className="mt-2 remove-button flex items-center justify-center"
            aria-label={`Remove ${coin.name} from watchlist`}
          >
            <svg
              viewBox="0 0 41.336 41.336"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="var(--accent)"
            >
              <path
                d="M36.335,5.668h-8.167V1.5c0-0.828-0.672-1.5-1.5-1.5h-12c-0.828,0-1.5,0.672-1.5,1.5v4.168H5.001c-1.104,0-2,0.896-2,2 
                s0.896,2,2,2h2.001v29.168c0,1.381,1.119,2.5,2.5,2.5h22.332c1.381,0,2.5-1.119,2.5-2.5V9.668h2.001c1.104,0,2-0.896,2-2 
                S37.438,5.668,36.335,5.668z M14.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 
                s1.5,0.672,1.5,1.5V35.67z M22.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 
                s1.5,0.672,1.5,1.5V35.67z M25.168,5.668h-9V3h9V5.668z M30.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21 
                c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5V35.67z"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 text-xs text-gray-200 border-t border-gray-700 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {isDetailsLoading && <p>Loading details...</p>}
            {isDetailsError && <p>Unable to load details.</p>}

            {!isDetailsLoading && !isDetailsError && marketData && (
              <>
                <div>
                  <p className="text-gray-400">Market Cap</p>
                  <p>${marketData.market_cap?.usd?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">24h Volume</p>
                  <p>${marketData.total_volume?.usd?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">24h High</p>
                  <p>${marketData.high_24h?.usd}</p>
                </div>
                <div>
                  <p className="text-gray-400">24h Low</p>
                  <p>${marketData.low_24h?.usd}</p>
                </div>
                <div>
                  <p className="text-gray-400">24h Change</p>
                  <p>{marketData.price_change_percentage_24h?.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Circulating Supply</p>
                  <p>{marketData.circulating_supply?.toLocaleString()}</p>
                </div>
                {homepage && (
                  <div className="col-span-2">
                    <p className="text-gray-400">Homepage</p>
                    <a
                      href={homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline break-all"
                      onClick={e => e.stopPropagation()}
                    >
                      {homepage}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export default CoinRow;
