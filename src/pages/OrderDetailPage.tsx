import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../api/backend';
import { Order, OrderTracking } from '../types';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadOrderDetails(parseInt(id));
    }
  }, [id]);

  const loadOrderDetails = async (orderId: number) => {
    setLoading(true);
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.order);
      setTracking(response.tracking);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    }
    setLoading(false);
  };

  const formatPrice = (priceJpy: number) => {
    return `¥${priceJpy.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purchasing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'purchased': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipping': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const parseImageUrls = (imageUrls?: string): string[] => {
    if (!imageUrls) return [];
    try {
      return JSON.parse(imageUrls);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Order Not Found'}
          </h2>
          <button onClick={() => navigate('/orders')} className="text-blue-600 hover:underline">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const images = parseImageUrls(order.image_urls);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Car Info */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <div className="w-32 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={`${order.make} ${order.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {order.year} {order.make} {order.model}
                  </h3>
                  {order.vin && <p className="text-sm text-gray-600 mt-1">VIN: {order.vin}</p>}
                </div>
              </div>
            </div>

            {/* Tracking History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Tracking History</h2>
              <div className="space-y-4">
                {tracking.map((track, index) => (
                  <div key={track.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {index === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-xs font-bold">{tracking.length - index}</span>
                        )}
                      </div>
                      {index < tracking.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 flex-1 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 capitalize">{track.status}</h3>
                        <span className="text-sm text-gray-600">
                          {new Date(track.created_at).toLocaleString()}
                        </span>
                      </div>
                      {track.description && (
                        <p className="text-gray-700 text-sm">{track.description}</p>
                      )}
                      {track.location && (
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="font-medium">Location:</span> {track.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Shipping Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Shipping Address:</span>
                  <p className="font-medium text-gray-900">{order.shipping_address}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Contact Email:</span>
                  <p className="font-medium text-gray-900">{order.contact_email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Contact Phone:</span>
                  <p className="font-medium text-gray-900">{order.contact_phone}</p>
                </div>
                {order.notes && (
                  <div>
                    <span className="text-sm text-gray-600">Notes:</span>
                    <p className="font-medium text-gray-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Car Price:</span>
                  <span className="font-medium">
                    {formatPrice(order.total_price_jpy - order.service_fee_jpy - order.shipping_fee_jpy)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Service Fee:</span>
                  <span className="font-medium">{formatPrice(order.service_fee_jpy)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping Fee:</span>
                  <span className="font-medium">{formatPrice(order.shipping_fee_jpy)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(order.total_price_jpy)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.payment_status === 'refunded' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                {order.payment_method && (
                  <p className="text-sm text-gray-600">
                    Method: <span className="font-medium">{order.payment_method}</span>
                  </p>
                )}
              </div>

              {order.payment_status === 'pending' && (
                <div className="mt-6">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Complete Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
