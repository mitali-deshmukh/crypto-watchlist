import axios from 'axios';

const fetchCryptoPrices = async () => {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,litecoin,cardano');
  return response.data;
};

export { fetchCryptoPrices };