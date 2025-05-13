export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  address?: string;
  roles: string[];
  enabled: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
} 