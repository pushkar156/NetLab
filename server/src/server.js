require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initDatabase } = require('./database/db');
const { setupSocketIO } = require('./sockets/socketHandler');
const { getLocalNetworkInterfaces } = require('./routes/health');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

// Setup Socket.IO with multi-device CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketIO(io);

async function startServer() {
  try {
    await initDatabase();

    server.listen(PORT, HOST, () => {
      console.log('========================================================');
      console.log(' NetLab: Hybrid Client-Server Network Simulator Backend ');
      console.log('========================================================');
      console.log(` Server bound to: http://${HOST}:${PORT}`);
      console.log(` Local access:    http://localhost:${PORT}`);

      const interfaces = getLocalNetworkInterfaces();
      if (interfaces.length > 0) {
        console.log('\n Available LAN IP Addresses for Multi-Device Access:');
        for (const iface of interfaces) {
          console.log(`   - [${iface.interface}]: http://${iface.ip}:${PORT}`);
        }
        console.log('\n Physical phones/laptops on the same Wi-Fi can connect');
        console.log(` to the above IP addresses to participate in real-time.`);
      } else {
        console.log('\n No active Wi-Fi or Ethernet LAN interface detected.');
      }
      console.log('========================================================\n');
    });
  } catch (err) {
    console.error('Fatal error during NetLab server initialization:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down NetLab server gracefully...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

startServer();
