// Script to seed the database with car data
// Run this with: node backend/seed-database.js

const fs = require('fs');
const https = require('https');

// Read the car data
const carsData = JSON.parse(fs.readFileSync('./backend/seed-cars.json', 'utf8'));

// Function to add a single car
async function addCar(car) {
  const carData = {
    make: car.make,
    model: car.model,
    year: car.year,
    price_jpy: car.price_jpy,
    mileage_km: car.mileage_km,
    fuel_type: car.fuel_type,
    transmission: car.transmission,
    color: car.color,
    description: `${car.description}. Engine: ${car.engine_size}, Power: ${car.horsepower}hp, Top Speed: ${car.top_speed_kmh}km/h`,
    image_urls: null, // Will add images later
    vin: `JN${Math.random().toString(36).substring(2, 17).toUpperCase()}`,
    engine_size: car.engine_size,
    body_type: car.body_type,
    stock_status: 'available',
    market_source: 'Japan Auction Network',
    auction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(carData);
    
    const options = {
      hostname: 'backend.youware.com',
      path: '/api/cars',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ Added: ${car.year} ${car.make} ${car.model} - ¥${car.price_jpy.toLocaleString()}`);
          resolve(JSON.parse(data));
        } else {
          console.error(`✗ Failed to add ${car.make} ${car.model}: ${res.statusCode}`);
          console.error(data);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`✗ Error adding ${car.make} ${car.model}:`, error.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// Function to add all cars with a delay
async function seedDatabase() {
  console.log(`\n🚗 Starting to seed database with ${carsData.length} cars...\n`);
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < carsData.length; i++) {
    const result = await addCar(carsData[i]);
    
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add a small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Database seeding complete!`);
  console.log(`   Success: ${successCount} cars`);
  console.log(`   Failed: ${failCount} cars`);
  console.log(`\n   Total cars in catalog: ${successCount}`);
}

// Run the seeding
seedDatabase().catch(console.error);
