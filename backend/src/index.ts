interface Env {
    DB: D1Database;
  }
  
  // Admin encrypted_yw_id - NEVER expose to frontend
  const ADMIN_ENCRYPTED_YWID = '9Ozhnbbgb2oT9OBKaAZ26xkkdsu0QGirVGS_r8zqK_J9bLi91EMwIZRZUHERlYyvhNjY4w';
  
  // CORS headers for all responses
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Project-Id, X-Encrypted-Yw-ID, X-Is-Login, X-Yw-Env',
  };
  
  // Helper function to create JSON response with CORS
  function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  }
  
  // Helper function to check if user is admin
  function isAdmin(request: Request): boolean {
    const userId = request.headers.get('X-Encrypted-Yw-ID');
    return userId === ADMIN_ENCRYPTED_YWID;
  }
  
  // Helper function to get or create user
  async function getOrCreateUser(env: Env, encrypted_yw_id: string, display_name?: string, photo_url?: string, email?: string, phone?: string) {
    // Check if user exists
    const existingUser = await env.DB.prepare('SELECT * FROM users WHERE encrypted_yw_id = ?')
      .bind(encrypted_yw_id)
      .first();
  
    if (existingUser) {
      // Update user info if provided
      if (display_name || photo_url || email || phone) {
        await env.DB.prepare(
          'UPDATE users SET display_name = COALESCE(?, display_name), photo_url = COALESCE(?, photo_url), email = COALESCE(?, email), phone = COALESCE(?, phone), updated_at = datetime("now") WHERE encrypted_yw_id = ?'
        ).bind(display_name || null, photo_url || null, email || null, phone || null, encrypted_yw_id).run();
      }
      return existingUser;
    }
  
    // Create new user
    const result = await env.DB.prepare(
      'INSERT INTO users (encrypted_yw_id, display_name, photo_url, email, phone) VALUES (?, ?, ?, ?, ?)'
    ).bind(encrypted_yw_id, display_name || null, photo_url || null, email || null, phone || null).run();
  
    return {
      id: result.meta.last_row_id,
      encrypted_yw_id,
      display_name,
      photo_url,
      email,
      phone,
    };
  }
  
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
      }
  
      const url = new URL(request.url);
      const path = url.pathname;
      const userId = request.headers.get('X-Encrypted-Yw-ID');
  
      try {
        // ========== CAR ENDPOINTS ==========
        
        // GET /api/cars - Get all available cars with filters
        if (path === '/api/cars' && request.method === 'GET') {
          const make = url.searchParams.get('make');
          const model = url.searchParams.get('model');
          const minPrice = url.searchParams.get('minPrice');
          const maxPrice = url.searchParams.get('maxPrice');
          const fuelType = url.searchParams.get('fuelType');
          const transmission = url.searchParams.get('transmission');
          const bodyType = url.searchParams.get('bodyType');
  
          let query = 'SELECT * FROM cars WHERE stock_status = ?';
          const params: any[] = ['available'];
  
          if (make) {
            query += ' AND make = ?';
            params.push(make);
          }
          if (model) {
            query += ' AND model = ?';
            params.push(model);
          }
          if (minPrice) {
            query += ' AND price_jpy >= ?';
            params.push(parseInt(minPrice));
          }
          if (maxPrice) {
            query += ' AND price_jpy <= ?';
            params.push(parseInt(maxPrice));
          }
          if (fuelType) {
            query += ' AND fuel_type = ?';
            params.push(fuelType);
          }
          if (transmission) {
            query += ' AND transmission = ?';
            params.push(transmission);
          }
          if (bodyType) {
            query += ' AND body_type = ?';
            params.push(bodyType);
          }
  
          query += ' ORDER BY created_at DESC';
  
          const stmt = env.DB.prepare(query);
          const { results } = await stmt.bind(...params).all();
  
          return jsonResponse({ success: true, cars: results });
        }
  
        // GET /api/cars/:id - Get single car details
        if (path.match(/^\/api\/cars\/\d+$/) && request.method === 'GET') {
          const carId = path.split('/').pop();
          const car = await env.DB.prepare('SELECT * FROM cars WHERE id = ?')
            .bind(carId)
            .first();
  
          if (!car) {
            return jsonResponse({ success: false, error: 'Car not found' }, 404);
          }
  
          return jsonResponse({ success: true, car });
        }
  
        // POST /api/cars - Create new car listing (Admin only)
        if (path === '/api/cars' && request.method === 'POST') {
          if (!isAdmin(request)) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
          }
  
          const body = await request.json();
          const {
            make, model, year, price_jpy, mileage_km, fuel_type, transmission,
            color, description, image_urls, vin, engine_size, body_type,
            market_source, auction_date
          } = body;
  
          const result = await env.DB.prepare(
            `INSERT INTO cars (make, model, year, price_jpy, mileage_km, fuel_type, transmission, 
             color, description, image_urls, vin, engine_size, body_type, market_source, auction_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            make, model, year, price_jpy, mileage_km, fuel_type, transmission,
            color, description || null, image_urls ? JSON.stringify(image_urls) : null,
            vin || null, engine_size || null, body_type || null,
            market_source || null, auction_date || null
          ).run();
  
          return jsonResponse({
            success: true,
            car_id: result.meta.last_row_id,
            message: 'Car created successfully'
          });
        }
  
        // PUT /api/cars/:id - Update car (Admin only)
        if (path.match(/^\/api\/cars\/\d+$/) && request.method === 'PUT') {
          if (!isAdmin(request)) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
          }
  
          const carId = path.split('/').pop();
          const body = await request.json();
  
          const updates: string[] = [];
          const params: any[] = [];
  
          Object.keys(body).forEach(key => {
            if (key === 'image_urls' && body[key]) {
              updates.push(`${key} = ?`);
              params.push(JSON.stringify(body[key]));
            } else if (body[key] !== undefined) {
              updates.push(`${key} = ?`);
              params.push(body[key]);
            }
          });
  
          updates.push('updated_at = datetime("now")');
          params.push(carId);
  
          await env.DB.prepare(
            `UPDATE cars SET ${updates.join(', ')} WHERE id = ?`
          ).bind(...params).run();
  
          return jsonResponse({ success: true, message: 'Car updated successfully' });
        }
  
        // DELETE /api/cars/:id - Delete car (Admin only)
        if (path.match(/^\/api\/cars\/\d+$/) && request.method === 'DELETE') {
          if (!isAdmin(request)) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
          }
  
          const carId = path.split('/').pop();
          await env.DB.prepare('DELETE FROM cars WHERE id = ?').bind(carId).run();
  
          return jsonResponse({ success: true, message: 'Car deleted successfully' });
        }
  
        // ========== ORDER ENDPOINTS ==========
  
        // POST /api/orders - Create new order
        if (path === '/api/orders' && request.method === 'POST') {
          if (!userId) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
          }
  
          const body = await request.json();
          const {
            car_id, shipping_address, contact_email, contact_phone,
            display_name, photo_url, user_email, user_phone, notes
          } = body;
  
          // Get or create user
          const user = await getOrCreateUser(
            env, userId, display_name, photo_url, user_email, user_phone
          );
  
          // Get car details
          const car: any = await env.DB.prepare('SELECT * FROM cars WHERE id = ? AND stock_status = ?')
            .bind(car_id, 'available')
            .first();
  
          if (!car) {
            return jsonResponse({ success: false, error: 'Car not available' }, 400);
          }
  
          // Calculate fees (example calculation)
          const service_fee_jpy = Math.floor(car.price_jpy * 0.05); // 5% service fee
          const shipping_fee_jpy = 150000; // Fixed shipping fee
          const total_price_jpy = car.price_jpy + service_fee_jpy + shipping_fee_jpy;
  
          // Generate unique order number
          const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
          // Create order
          const result = await env.DB.prepare(
            `INSERT INTO orders (order_number, user_id, car_id, total_price_jpy, service_fee_jpy, 
             shipping_fee_jpy, shipping_address, contact_email, contact_phone, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            order_number, user.id, car_id, total_price_jpy, service_fee_jpy,
            shipping_fee_jpy, shipping_address, contact_email, contact_phone, notes || null
          ).run();
  
          // Update car status to reserved
          await env.DB.prepare('UPDATE cars SET stock_status = ? WHERE id = ?')
            .bind('reserved', car_id)
            .run();
  
          // Create initial tracking entry
          await env.DB.prepare(
            'INSERT INTO order_tracking (order_id, status, description) VALUES (?, ?, ?)'
          ).bind(result.meta.last_row_id, 'pending', 'Order created and awaiting confirmation').run();
  
          return jsonResponse({
            success: true,
            order_id: result.meta.last_row_id,
            order_number,
            total_price_jpy,
            message: 'Order created successfully'
          });
        }
  
        // GET /api/orders - Get user's orders
        if (path === '/api/orders' && request.method === 'GET') {
          if (!userId) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
          }
  
          // Get user
          const user = await env.DB.prepare('SELECT id FROM users WHERE encrypted_yw_id = ?')
            .bind(userId)
            .first();
  
          if (!user) {
            return jsonResponse({ success: true, orders: [] });
          }
  
          const { results } = await env.DB.prepare(
            `SELECT o.*, c.make, c.model, c.year, c.image_urls
             FROM orders o
             JOIN cars c ON o.car_id = c.id
             WHERE o.user_id = ?
             ORDER BY o.created_at DESC`
          ).bind(user.id).all();
  
          return jsonResponse({ success: true, orders: results });
        }
  
        // GET /api/orders/:id - Get order details with tracking
        if (path.match(/^\/api\/orders\/\d+$/) && request.method === 'GET') {
          if (!userId) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
          }
  
          const orderId = path.split('/').pop();
  
          const order: any = await env.DB.prepare(
            `SELECT o.*, c.make, c.model, c.year, c.image_urls, c.vin
             FROM orders o
             JOIN cars c ON o.car_id = c.id
             WHERE o.id = ?`
          ).bind(orderId).first();
  
          if (!order) {
            return jsonResponse({ success: false, error: 'Order not found' }, 404);
          }
  
          // Check authorization
          const user = await env.DB.prepare('SELECT id FROM users WHERE encrypted_yw_id = ?')
            .bind(userId)
            .first();
  
          if (order.user_id !== user?.id && !isAdmin(request)) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
          }
  
          // Get tracking history
          const { results: tracking } = await env.DB.prepare(
            'SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at DESC'
          ).bind(orderId).all();
  
          return jsonResponse({
            success: true,
            order,
            tracking
          });
        }
  
        // GET /api/admin/orders - Get all orders (Admin only)
        if (path === '/api/admin/orders' && request.method === 'GET') {
          if (!isAdmin(request)) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
          }
  
          const status = url.searchParams.get('status');
          let query = `SELECT o.*, c.make, c.model, c.year, u.display_name, u.email
                       FROM orders o
                       JOIN cars c ON o.car_id = c.id
                       JOIN users u ON o.user_id = u.id`;
          
          const params: any[] = [];
          if (status) {
            query += ' WHERE o.status = ?';
            params.push(status);
          }
  
          query += ' ORDER BY o.created_at DESC';
  
          const stmt = env.DB.prepare(query);
          const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  
          return jsonResponse({ success: true, orders: results });
        }
  
        // PUT /api/admin/orders/:id/status - Update order status (Admin only)
        if (path.match(/^\/api\/admin\/orders\/\d+\/status$/) && request.method === 'PUT') {
          if (!isAdmin(request)) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
          }
  
          const orderId = path.split('/')[4];
          const body = await request.json();
          const { status, description, location } = body;
  
          // Update order status
          await env.DB.prepare('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?')
            .bind(status, orderId)
            .run();
  
          // Add tracking entry
          await env.DB.prepare(
            'INSERT INTO order_tracking (order_id, status, description, location, updated_by) VALUES (?, ?, ?, ?, ?)'
          ).bind(orderId, status, description || null, location || null, userId).run();
  
          // Update car status based on order status
          if (status === 'cancelled') {
            const order: any = await env.DB.prepare('SELECT car_id FROM orders WHERE id = ?')
              .bind(orderId)
              .first();
            
            if (order) {
              await env.DB.prepare('UPDATE cars SET stock_status = ? WHERE id = ?')
                .bind('available', order.car_id)
                .run();
            }
          } else if (status === 'delivered') {
            const order: any = await env.DB.prepare('SELECT car_id FROM orders WHERE id = ?')
              .bind(orderId)
              .first();
            
            if (order) {
              await env.DB.prepare('UPDATE cars SET stock_status = ? WHERE id = ?')
                .bind('sold', order.car_id)
                .run();
            }
          }
  
          return jsonResponse({ success: true, message: 'Order status updated successfully' });
        }
  
        // ========== USER ENDPOINTS ==========
  
        // GET /api/user/profile - Get current user profile
        if (path === '/api/user/profile' && request.method === 'GET') {
          if (!userId) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
          }
  
          const user = await env.DB.prepare('SELECT * FROM users WHERE encrypted_yw_id = ?')
            .bind(userId)
            .first();
  
          if (!user) {
            return jsonResponse({ success: true, user: null });
          }
  
          return jsonResponse({ success: true, user });
        }
  
        // PUT /api/user/profile - Update user profile
        if (path === '/api/user/profile' && request.method === 'PUT') {
          if (!userId) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
          }
  
          const body = await request.json();
          const { display_name, photo_url, email, phone, shipping_address } = body;
  
          await getOrCreateUser(env, userId, display_name, photo_url, email, phone);
  
          if (shipping_address !== undefined) {
            await env.DB.prepare(
              'UPDATE users SET shipping_address = ?, updated_at = datetime("now") WHERE encrypted_yw_id = ?'
            ).bind(shipping_address, userId).run();
          }
  
          return jsonResponse({ success: true, message: 'Profile updated successfully' });
        }
  
        // GET /api/admin/check - Check if user is admin
        if (path === '/api/admin/check' && request.method === 'GET') {
          return jsonResponse({ success: true, is_admin: isAdmin(request) });
        }
  
        // ========== MARKET DATA ENDPOINTS ==========
  
        // GET /api/market-data - Get market pricing data
        if (path === '/api/market-data' && request.method === 'GET') {
          const make = url.searchParams.get('make');
          const model = url.searchParams.get('model');
  
          let query = 'SELECT * FROM market_data';
          const params: any[] = [];
  
          if (make && model) {
            query += ' WHERE make = ? AND model = ?';
            params.push(make, model);
          } else if (make) {
            query += ' WHERE make = ?';
            params.push(make);
          }
  
          query += ' ORDER BY data_date DESC LIMIT 100';
  
          const stmt = env.DB.prepare(query);
          const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  
          return jsonResponse({ success: true, market_data: results });
        }
  
        // POST /api/admin/market-data - Add market data (Admin only)
        if (path === '/api/admin/market-data' && request.method === 'POST') {
          if (!isAdmin(request)) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
          }
  
          const body = await request.json();
          const { make, model, year, avg_price_jpy, min_price_jpy, max_price_jpy, sample_count, data_date } = body;
  
          const result = await env.DB.prepare(
            `INSERT INTO market_data (make, model, year, avg_price_jpy, min_price_jpy, max_price_jpy, sample_count, data_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            make, model, year, avg_price_jpy || null, min_price_jpy || null,
            max_price_jpy || null, sample_count || null, data_date
          ).run();
  
          return jsonResponse({
            success: true,
            data_id: result.meta.last_row_id,
            message: 'Market data added successfully'
          });
        }
  
        // Default 404 response
        return jsonResponse({ success: false, error: 'Endpoint not found' }, 404);
  
      } catch (error: any) {
        console.error('API Error:', error);
        return jsonResponse({ 
          success: false, 
          error: error.message || 'Internal server error' 
        }, 500);
      }
    },
  };
  