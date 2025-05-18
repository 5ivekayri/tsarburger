export const API_BASE_URL = '/api';

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
};

export const CART_ENDPOINTS = {
  BASE: `${API_BASE_URL}/cart`,
  ITEMS: `${API_BASE_URL}/cart/items`,
};

export const ORDER_ENDPOINTS = {
  BASE: `${API_BASE_URL}/orders`,
};

export const USER_ENDPOINTS = {
  BASE: `${API_BASE_URL}/users`,
};

export const MENU_ENDPOINTS = {
  BASE: `${API_BASE_URL}/menu`,
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.PREPARING]: 'info',
  [ORDER_STATUS.READY]: 'success',
  [ORDER_STATUS.DELIVERED]: 'default',
} as const; 