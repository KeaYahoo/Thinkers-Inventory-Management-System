/**
 * useTripFilters: synchronizes trip filtering controls with the URL query string and exposes
 * debounced values for data fetching.
 */
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DEBOUNCE_DELAY = 300;
export const DEFAULT_MAX_PRICE = 10000;

const parseMaxPriceParam = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  const rounded = Math.round(parsed);
  if (rounded <= 0) {
    return null;
  }
  return Math.min(DEFAULT_MAX_PRICE, rounded);
};

export function useTripFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsSnapshot = searchParams.toString();

  const initialSearch = searchParams.get("search") ?? "";
  const initialMaxPrice = parseMaxPriceParam(searchParams.get("maxPrice"));

  const [searchTerm, setSearchTermState] = useState(initialSearch);
  const [maxPrice, setMaxPriceState] = useState<number | null>(initialMaxPrice);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch.trim());
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<number | null>(
    initialMaxPrice !== null && initialMaxPrice < DEFAULT_MAX_PRICE ? initialMaxPrice : null,
  );

  // Keep local state in sync when the URL query params change externally.
  useEffect(() => {
    const nextSearch = searchParams.get("search") ?? "";
    const nextMaxPrice = parseMaxPriceParam(searchParams.get("maxPrice"));

    if (nextSearch !== searchTerm) {
      setSearchTermState(nextSearch);
      setDebouncedSearchTerm(nextSearch.trim());
    }

    const normalizedMaxPrice =
      nextMaxPrice !== null && nextMaxPrice < DEFAULT_MAX_PRICE ? nextMaxPrice : null;

    if (nextMaxPrice !== maxPrice) {
      setMaxPriceState(nextMaxPrice);
      setDebouncedMaxPrice(normalizedMaxPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsSnapshot]);

  // Debounce URL updates and downstream filter values.
  useEffect(() => {
    const handler = window.setTimeout(() => {
      const trimmedSearch = searchTerm.trim();
      const sanitizedMaxPrice =
        maxPrice !== null && Number.isFinite(maxPrice) ? Math.min(DEFAULT_MAX_PRICE, Math.max(0, Math.round(maxPrice))) : null;
      const normalizedMaxPrice =
        sanitizedMaxPrice !== null && sanitizedMaxPrice > 0 && sanitizedMaxPrice < DEFAULT_MAX_PRICE
          ? sanitizedMaxPrice
          : null;

      const params = new URLSearchParams(paramsSnapshot);

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      } else {
        params.delete("search");
      }

      if (normalizedMaxPrice !== null) {
        params.set("maxPrice", String(normalizedMaxPrice));
      } else {
        params.delete("maxPrice");
      }

      const nextString = params.toString();
      if (nextString !== paramsSnapshot) {
        setSearchParams(params, { replace: true });
      }

      setDebouncedSearchTerm(trimmedSearch);
      setDebouncedMaxPrice(normalizedMaxPrice);
    }, DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(handler);
    };
  }, [searchTerm, maxPrice, paramsSnapshot, setSearchParams]);

  const setSearchTerm = useCallback((value: string) => {
    setSearchTermState(value);
  }, []);

  const setMaxPrice = useCallback((value: number | null) => {
    setMaxPriceState(value);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    maxPrice,
    setMaxPrice,
    debouncedSearchTerm,
    debouncedMaxPrice,
  } as const;
}
