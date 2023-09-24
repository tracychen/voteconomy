import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { provider } from "../utils/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function resolveEnsOrTruncate(address: string) {
  const ens = await provider.lookupAddress(address);
  if (ens) {
    return ens;
  }
  return truncateAddress(address);
}
