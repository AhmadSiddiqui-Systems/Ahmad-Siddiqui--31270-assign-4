const express = require('express');
const dotenv = require('dotenv');
const cluster = require('cluster');
const os = require('os');
const connectDb = require('./db/connectDb');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoute = require('./routes/orderRoute');
const searchRoute = require('./routes/searchRoute');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers based on the number of CPU cores
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Restart the worker if it exits
    cluster.fork();
  });
} else {
  const app = express();

  connectDb();
  app.use(express.json());
  dotenv.config();
  const Port = process.env.PORT || 3000;

  // All Routes
  app.get('/', (req, res) => {
    res.send('Server is running...');
  });

  app.use(userRoutes);
  app.use('/categories', categoryRoutes);
  app.use('/products', productRoutes);
  app.use('/cart', cartRoutes);
  app.use('/checkout', orderRoute);
  app.use('/product', searchRoute);

  app.listen(Port, () => {
    console.log(`Worker ${process.pid} is running on port ${Port}`);
  });
}
