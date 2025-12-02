import axios from "axios"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

const fetchCryptoPrices = async ids => {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
    params: {
      vs_currency: "usd",
      ids: ids.join(","),
    },
  })
  return response.data
}

const validateCryptoId = async id => {
  const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
    params: {
      vs_currency: "usd",
      ids: id,
    },
  })
  return response.data
}

const fetchCoinList = async () => {
  const response = await axios.get(`${COINGECKO_BASE_URL}/coins/list`)
  return response.data
}

const fetchCoinDetails = async id => {
  const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
  })
  return response.data
}

// 1 day price history for sparkline
const fetchCoinMarketChart = async (id, days = 1) => {
  const response = await axios.get(
    `${COINGECKO_BASE_URL}/coins/${id}/market_chart`,
    {
      params: {
        vs_currency: "usd",
        days,
      },
    }
  )
  // response.data.prices is [timestamp, price][]
  return response.data.prices
}

export {
  fetchCryptoPrices,
  validateCryptoId,
  fetchCoinList,
  fetchCoinDetails,
  fetchCoinMarketChart,
}
