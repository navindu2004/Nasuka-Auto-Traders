import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarStore } from '../store/useCarStore';
import { Car } from '../types';

const CarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCarById } = useCarStore();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      loadCar(parseInt(id));
    }
  }, [id]);

  const loadCar = async (carId: number) => {
    setLoading(true);
    const carData = await getCarById(carId);
    setCar(carData);
    setLoading(false);
  };

  const parseImageUrls = (imageUrls?: string): string[] => {
    if (!imageUrls) return [];
    try {
      return JSON.parse(imageUrls);
    } catch {
      return [];
    }
  };

  const formatPrice = (priceJpy: number) => {
    return `¥${priceJpy.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h2>
          <button
            onClick={() => navigate('/cars')}
            className="text-blue-600 hover:underline"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  const images = parseImageUrls(car.image_urls);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cars')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cars
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
              <div className="aspect-video bg-gray-200">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-video rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {car.year} {car.make} {car.model}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    car.stock_status === 'available' ? 'bg-green-100 text-green-800' :
                    car.stock_status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {car.stock_status}
                  </span>
                </div>
                <p className="text-4xl font-bold text-blue-600 mb-4">{formatPrice(car.price_jpy)}</p>
              </div>

              {/* Specifications */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Year</span>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Mileage</span>
                    <p className="font-medium">{car.mileage_km.toLocaleString()} km</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Transmission</span>
                    <p className="font-medium">{car.transmission}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Fuel Type</span>
                    <p className="font-medium">{car.fuel_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Color</span>
                    <p className="font-medium">{car.color}</p>
                  </div>
                  {car.body_type && (
                    <div>
                      <span className="text-gray-600 text-sm">Body Type</span>
                      <p className="font-medium">{car.body_type}</p>
                    </div>
                  )}
                  {car.engine_size && (
                    <div>
                      <span className="text-gray-600 text-sm">Engine Size</span>
                      <p className="font-medium">{car.engine_size}</p>
                    </div>
                  )}
                  {car.vin && (
                    <div className="col-span-2">
                      <span className="text-gray-600 text-sm">VIN</span>
                      <p className="font-medium font-mono text-sm">{car.vin}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{car.description}</p>
                </div>
              )}

              {/* Market Source */}
              {car.market_source && (
                <div className="mb-6 text-sm text-gray-600">
                  <p>Source: {car.market_source}</p>
                  {car.auction_date && <p>Auction Date: {new Date(car.auction_date).toLocaleDateString()}</p>}
                </div>
              )}

              {/* Order Button */}
              {car.stock_status === 'available' && (
                <button
                  onClick={() => navigate(`/order/${car.id}`)}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Place Order
                </button>
              )}

              {car.stock_status === 'reserved' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
                  <p className="text-yellow-800 font-medium">This car is currently reserved</p>
                </div>
              )}

              {car.stock_status === 'sold' && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                  <p className="text-gray-800 font-medium">This car has been sold</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;