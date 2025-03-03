---
id: project-docs
title: Project Documentation
sidebar: false
---

# Project Setup Guide

## How to Run the Web App
1. Clone the repository:
   ```bash
   git clone https://github.com/mitali-deshmukh/crypto-watchlist.git
   cd web-app\crypto-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The app will be accessible at `http://localhost:3000`.


# API Integration Details

## Data Fetching
The app fetches cryptocurrency prices using the CoinGecko API. The `fetchCryptoPrices` function makes a GET request to the API endpoint:

```javascript
const fetchCryptoPrices = async () => {
  const response = await axios.get(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,litecoin,cardano'
  );
  return response.data;
};
```

## Data Updating
The data is updated every time the user clicks the "Refresh" button.

React Query's `refetch` function is used to manually trigger a refetch:

```javascript
const { refetch } = useQuery({
  queryKey: ['cryptoPrices'],
  queryFn: fetchCryptoPrices,
});
```

---

# State Management Explanation

## Why React Query?
React Query was chosen for its simplicity and powerful features:

- **Automatic Caching:** Reduces redundant API calls by caching data.
- **Background Refetching:** Keeps data up-to-date without manual intervention.
- **Built-in Loading and Error States:** Simplifies handling of loading and error states.


### Alternatives Considered
- **Zustand:**
  - A lightweight state management library.
  - Does not provide built-in support for server-state management.

- **Context API:**
  - Requires more boilerplate code.
  - Does not handle caching or background updates.

---

# Challenges & Solutions

## Challenge 1: Time Management
- **Problem:** The project needed to be completed within 24 hours, which added significant pressure.
- **Solution:** Prioritized core functionalities first, followed by secondary features. Utilized React Query's built-in features to minimize custom logic and speed up development.

## Challenge 2: Making Page Responsive
- **Problem:** The page needed to be user-friendly on both mobile and web devices.
- **Solution:** Used Tailwind CSS for flexible layout design. Applied responsive utility classes to ensure proper display across different screen sizes.

## Challenge 3: Creating Docusaurus Documentation
- **Problem:** It was the first time working with Docusaurus to generate project documentation.
- **Solution:** Followed the official Docusaurus documentation and tutorials. Created a basic documentation structure with clear sections and easy navigation.

