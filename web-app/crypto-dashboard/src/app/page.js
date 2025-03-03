"use client";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchCryptoPrices } from "./services/pricing";
import { format } from "date-fns";
import { useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: cryptoPrices,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["cryptoPrices"],
    queryFn: fetchCryptoPrices,
  });

  const filteredCryptoPrices = cryptoPrices
    ? cryptoPrices.filter(
        (crp) =>
          crp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crp.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const Spinner = () => (
    <div className="flex justify-center h-150 items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center  items-center min-h-screen bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md md:max-w-2xl lg:max-w-4xl">
      <div className="top-bar flex justify-between">
        <input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={refetch}
          disabled={isFetching}
          className="refresh-button"
        >
          <svg className="refresh-icon" viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
          </svg>
        </button>
      </div>

      {isFetching ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <ul role="list" className="divide-y divide-gray-700">
          {filteredCryptoPrices.map((crp) => (
            <li
              key={crp.id}
              className="flex justify-between items-center py-3 shadow-lg bg-gray-800 rounded-lg mb-3 p-4"
            >
            
            <div className="flex min-w-0 gap-x-4">
                <img
                  alt=""
                  src={crp.image}
                  className="size-12 flex-none rounded-full bg-gray-50"
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm/6 font-semibold text-white">
                    {crp.name}
                  </p>
                  <p className="mt-1 truncate text-xs/5 text-gray-500">
                    {crp.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
                <p className="text-sm/6 text-white">${crp.current_price}</p>
                <p className="mt-1 text-xs/5 text-gray-500">
                  Last Updated : {format(new Date(crp.last_updated), "h:mm a")}
                </p>
              </div>

              
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
