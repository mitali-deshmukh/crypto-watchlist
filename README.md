# Crypto Watchlist

Simple crypto watchlist built with Next.js and React Query.  
You can search, add, remove, and refresh coins, and the app keeps your watchlist in localStorage.

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/9gt3Te7AG_4/0.jpg)](https://www.youtube.com/watch?v=9gt3Te7AG_4)


## Features

- Default watchlist with popular coins on first load
- Persistent watchlist stored in localStorage between sessions
- Search within your watchlist
- Add new coins from the full CoinGecko list with:
  - Fuzzy search by name, symbol, or id
  - Keyboard navigation with arrow keys and Enter
- Remove coins from the watchlist
- Manual refresh of prices
- Initial full page loading state only on first load
- Uses CoinGecko public API for prices and coin metadata


## Watchlist Behavior

- On first load:
  - Tries to read `watchlist` from `localStorage`
  - If missing or invalid, falls back to:
    - `["bitcoin", "ethereum", "ripple", "litecoin", "cardano"]`
- On change:
  - Writes the current `watchlist` back to `localStorage`
  - If the list is empty, the key is removed

## Data Fetching

### Prices

React Query configuration:

- `queryKey: ["cryptoPrices", watchlist]`
- `queryFn: () => fetchCryptoPrices(watchlist)`
- Enabled only if:
  - `isWatchlistReady` is true
  - `watchlist.length > 0`
- `keepPreviousData: true` to avoid flicker when refetching

There is a `Refresh` button that calls `refetch` manually.  
`isFetching` is used to disable the button while a refresh is running.

### Coin List

React Query configuration:

- `queryKey: ["coinList"]`
- `queryFn: () => fetchCoinList()`
- Enabled only after the user interacts with the "Search coins to add" input
- `staleTime: 1000 * 60 * 60` (1 hour)

The coin dropdown:

- Filters by name, symbol, or id
- Sorts results to prioritize:
  - Exact symbol
  - Exact id
  - Exact name
  - Partial matches
- Caps results at 20 items

## Loading States

The app uses a `Spinner` component and an internal flag:

- `isInitialLoading` is true only when:
  - The watchlist is not ready, or
  - The first price fetch is in progress with no data yet
- A separate `hasLoadedOnce` flag ensures the full page loader is shown only on the first load
- Later refetches, such as when you add a coin, will not show the full screen loader

## Keyboard Support

In the "Search coins to add" input:

- ArrowDown / ArrowUp to move through the dropdown list
- Enter or Insert to select the highlighted coin
- Escape to close the dropdown

If the dropdown is closed and you press ArrowDown or ArrowUp while there are results, it opens the dropdown.

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm, yarn, or pnpm

### Installation

Clone the repository, then install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
