import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Converted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const STATUS_OPTIONS = ["New", "Contacted", "Qualified", "Converted", "Lost"];
export const SOURCE_OPTIONS = ["Website", "Facebook", "LinkedIn", "Referral", "Email", "Cold Call", "Other"];
