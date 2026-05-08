/**
 * Utility functions for formatting and calculations
 */

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

export const getMonthName = (month: number): string => {
  return new Date(2000, month - 1).toLocaleString("id-ID", { month: "long" });
};

export const getCurrentMonth = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export const parseDecimal = (value: string | number): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toFixed(2);
};
