/**
 * Real-Time Socket.IO Handler for NetLab Multi-Device Client-Server System
 * Handles physical device connections, unique client registry, secure message routing,
 * delivery confirmations, and persistent event logging.
 */

const { run, get, all } = require('../database/db');

// In-memory mapping of active socket connections: socket.id -> client metadata
const activeSockets = new Map();

function setupSocketIO(io) {
  io.on('connection', async (socket) => {
    const rawIp = socket.handshake.address || socket.conn.remoteAddress || '127.0.0.1';
    // Clean up IPv6-mapped IPv4 addresses (::ffff:192.168.1.x -> 192.168.1.x)
    const clientIp = rawIp.replace(/^::ffff:/, '');
    const userAgent = socket.handshake.headers['user-agent'] || 'Unknown Browser';
    const now = new Date().toISOString();

    console.log(`[Socket.IO] New connection established: Socket ID ${socket.id} from IP ${clientIp}`);

    // Temporary guest registration until display name is submitted
    socket.data = {
      socketId: socket.id,
      ipAddress: clientIp,
      userAgent,
      clientId: null,
      displayName: null,
      registered: false
    };

    // Send immediate welcome & server info to the connecting client
    socket.emit('connection_established', {
      socketId: socket.id,
      serverTime: now,
      observedIp: clientIp,
      status: 'CONNECTED_AWAITING_REGISTRATION'
    });

    /**
     * Event: Register Client
     * Assigns a unique internal client ID and binds the display name.
     */
    socket.on('register_client', async (data, callback) => {
      try {
        const displayName = (data && data.displayName ? data.displayName.trim() : '').slice(0, 50);
        if (!displayName) {
          if (typeof callback === 'function') {
            return callback({ success: false, error: 'Display name is required.' });
          }
          return;
        }

        // Generate a cryptographically distinct, readable client ID
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const connTime = new Date().toISOString();

        // Save or update client in SQLite database
        await run(
          `INSERT INTO clients (id, display_name, socket_id, ip_address, user_agent, is_active, connected_at, last_seen)
           VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
          [clientId, displayName, socket.id, clientIp, userAgent, connTime, connTime]
        );

        // Update socket session
        socket.data.clientId = clientId;
        socket.data.displayName = displayName;
        socket.data.registered = true;

        activeSockets.set(socket.id, {
          clientId,
          displayName,
          socketId: socket.id,
          ipAddress: clientIp,
          userAgent,
          connectedAt: connTime
        });

        // Log registration event
        await run(
          `INSERT INTO event_logs (id, event_type, source, description, result, correlation_id, created_at)
           VALUES (?, 'CLIENT_REGISTERED', ?, ?, 'SUCCESS', ?, ?)`,
          [`log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, displayName, `Physical client registered: "${displayName}" with ID ${clientId} from ${clientIp}`, clientId, connTime]
        );

        // Notify caller
        const registrationPayload = {
          success: true,
          client: {
            id: clientId,
            displayName,
            socketId: socket.id,
            ipAddress: clientIp,
            connectedAt: connTime
          }
        };

        if (typeof callback === 'function') {
          callback(registrationPayload);
        }

        socket.emit('registered', registrationPayload);

        // Broadcast updated active client list to all connected clients
        broadcastActiveClients(io);
      } catch (err) {
        console.error('Error during client registration:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Database error during registration.' });
        }
      }
    });

    /**
     * Event: Send Message (Private or Broadcast)
     * Enforces that sender is derived strictly from socket session to prevent identity spoofing.
     */
    socket.on('send_message', async (data, callback) => {
      try {
        if (!socket.data.registered || !socket.data.clientId) {
          if (typeof callback === 'function') {
            return callback({ success: false, error: 'You must register before sending messages.' });
          }
          return;
        }

        const senderId = socket.data.clientId;
        const senderName = socket.data.displayName;
        const messageText = (data.message || '').trim().slice(0, 1000);
        const recipientId = data.recipientId || null; // null for broadcast
        const isBroadcast = Boolean(data.isBroadcast || !recipientId || recipientId === 'all');
        const nowTime = new Date().toISOString();
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        if (!messageText) {
          if (typeof callback === 'function') {
            return callback({ success: false, error: 'Message cannot be empty.' });
          }
          return;
        }

        let recipientName = 'All Connected Clients';
        let targetSocketId = null;

        if (!isBroadcast) {
          // Find target client in active sockets
          let targetEntry = null;
          for (const [sId, entry] of activeSockets.entries()) {
            if (entry.clientId === recipientId) {
              targetEntry = entry;
              targetSocketId = sId;
              break;
            }
          }

          if (!targetEntry) {
            if (typeof callback === 'function') {
              return callback({ success: false, error: 'Recipient client is not currently connected.' });
            }
            return;
          }
          recipientName = targetEntry.displayName;
        }

        // Store message in database
        await run(
          `INSERT INTO messages (id, sender_id, sender_name, recipient_id, recipient_name, message, is_broadcast, created_at, delivery_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'delivered')`,
          [messageId, senderId, senderName, isBroadcast ? null : recipientId, recipientName, messageText, isBroadcast ? 1 : 0, nowTime]
        );

        // Update sender's last seen
        await run(`UPDATE clients SET last_seen = ? WHERE id = ?`, [nowTime, senderId]);

        const messagePayload = {
          id: messageId,
          senderId,
          senderName,
          recipientId: isBroadcast ? 'all' : recipientId,
          recipientName,
          message: messageText,
          isBroadcast,
          timestamp: nowTime
        };

        if (isBroadcast) {
          // Emit to all connected clients
          io.emit('new_message', messagePayload);
        } else {
          // Send to recipient
          io.to(targetSocketId).emit('new_message', messagePayload);
          // Also echo back to sender so their UI receives confirmation
          socket.emit('new_message', messagePayload);
        }

        // Log message event
        await run(
          `INSERT INTO event_logs (id, event_type, source, description, result, correlation_id, created_at)
           VALUES (?, 'MESSAGE_SENT', ?, ?, 'DELIVERED', ?, ?)`,
          [`log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, senderName, `${isBroadcast ? 'Broadcast' : 'Private'} message from "${senderName}" to "${recipientName}"`, messageId, nowTime]
        );

        if (typeof callback === 'function') {
          callback({
            success: true,
            messageId,
            timestamp: nowTime,
            recipient: recipientName
          });
        }
      } catch (err) {
        console.error('Error handling send_message:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Failed to deliver message.' });
        }
      }
    });

    /**
     * Event: Disconnect
     */
    socket.on('disconnect', async () => {
      console.log(`[Socket.IO] Client disconnected: Socket ID ${socket.id}`);
      const clientEntry = activeSockets.get(socket.id);

      if (clientEntry) {
        const discTime = new Date().toISOString();
        activeSockets.delete(socket.id);

        try {
          await run(
            `UPDATE clients SET is_active = 0, last_seen = ? WHERE id = ?`,
            [discTime, clientEntry.clientId]
          );

          await run(
            `INSERT INTO event_logs (id, event_type, source, description, result, correlation_id, created_at)
             VALUES (?, 'CLIENT_DISCONNECTED', ?, ?, 'INFO', ?, ?)`,
            [`log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, clientEntry.displayName, `Client "${clientEntry.displayName}" (${clientEntry.clientId}) disconnected`, clientEntry.clientId, discTime]
          );
        } catch (err) {
          console.error('Error recording client disconnect in DB:', err);
        }

        // Broadcast updated active client list
        broadcastActiveClients(io);
      }
    });
  });
}

/**
 * Broadcasts the current list of connected, active clients to all sockets.
 */
function broadcastActiveClients(io) {
  const activeList = Array.from(activeSockets.values()).map(c => ({
    id: c.clientId,
    displayName: c.displayName,
    ipAddress: c.ipAddress,
    connectedAt: c.connectedAt
  }));

  io.emit('active_clients_updated', activeList);
}

module.exports = {
  setupSocketIO,
  getActiveSocketsCount: () => activeSockets.size
};
