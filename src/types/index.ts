// Type definitions for the car trading platform

export interface Car {
    id: number;
    make: string;
    model: string;
    year: number;
    price_jpy: number;
    mileage_km: number;
    fuel_type: string;
    transmission: string;
    color: string;
    description?: string;
    image_urls?: string; // JSON string of image paths
    vin?: string;
    engine_size?: string;
    body_type?: string;
    stock_status: 'available' | 'reserved' | 'sold';
    market_source?: string;
    auction_date?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface User {
    id: number;
    encrypted_yw_id: string;
    display_name?: string;
    photo_url?: string;
    email?: string;
    phone?: string;
    shipping_address?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    car_id: number;
    status: 'pending' | 'confirmed' | 'purchasing' | 'purchased' | 'shipping' | 'delivered' | 'cancelled';
    total_price_jpy: number;
    service_fee_jpy: number;
    shipping_fee_jpy: number;
    payment_status: 'pending' | 'paid' | 'refunded';
    payment_method?: string;
    payment_transaction_id?: string;
    shipping_address: string;
    contact_email: string;
    contact_phone: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    // Joined fields
    make?: string;
    model?: string;
    year?: number;
    image_urls?: string;
    vin?: string;
    display_name?: string;
    email?: string;
  }
  
  export interface OrderTracking {
    id: number;
    order_id: number;
    status: string;
    description?: string;
    location?: string;
    updated_by?: string;
    created_at: string;
  }
  
  export interface MarketData {
    id: number;
    make: string;
    model: string;
    year: number;
    avg_price_jpy?: number;
    min_price_jpy?: number;
    max_price_jpy?: number;
    sample_count?: number;
    data_date: string;
    created_at: string;
  }
  
  export interface UserInfo {
    encrypted_yw_id: string;
    display_name?: string;
    photo_url?: string;
  }
  