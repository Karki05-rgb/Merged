const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// Allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Storage for latest frames
let latestFrameBuffer1 = null;
let latestFrameBuffer2 = null;

// Create two WebSocket.Server instances
const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });

// Handle WebSocket for cam1
wss1.on('connection', (ws) => {
  console.log('WebSocket client connected (cam1)');
  ws.on('message', (message) => {
    const base64Data = message.toString().replace(/^data:image\/jpeg;base64,/, '');
    const frameBuffer = Buffer.from(base64Data, 'base64');
    latestFrameBuffer1 = frameBuffer;
    // No MJPEG broadcasting logic here
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected (cam1)');
  });
});

// Handle WebSocket for cam2
wss2.on('connection', (ws) => {
  console.log('WebSocket client connected (cam2)');
  ws.on('message', (message) => {
    const base64Data = message.toString().replace(/^data:image\/jpeg;base64,/, '');
    const frameBuffer = Buffer.from(base64Data, 'base64');
    latestFrameBuffer2 = frameBuffer;
    // No MJPEG broadcasting logic here
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected (cam2)');
  });
});

// Route WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws/cam1') {
    wss1.handleUpgrade(req, socket, head, (ws) => {
      wss1.emit('connection', ws, req);
    });
  } else if (req.url === '/ws/cam2') {
    wss2.handleUpgrade(req, socket, head, (ws) => {
      wss2.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Optional ping route
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Start server
const PORT = process.env.PORT;
if (!PORT) throw new Error("PORT environment variable is not set");
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});



// //This is for the merged one, just to deploy one server
// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');

// const app = express();
// const server = http.createServer(app);

// // Allow CORS
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// });

// const BOUNDARY = '--frame';

// // Storage & client lists for cam1 and cam2
// let latestFrameBuffer1 = null;
// let latestFrameBuffer2 = null;
// const mjpegClients1 = [];
// const mjpegClients2 = [];

// // MJPEG endpoint cam1
// app.get('/video_feed/cam1', (req, res) => {
//   res.writeHead(200, {
//     'Content-Type': 'multipart/x-mixed-replace; boundary=' + BOUNDARY,
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });
//   mjpegClients1.push(res);
//   req.on('close', () => {
//     const idx = mjpegClients1.indexOf(res);
//     if (idx !== -1) mjpegClients1.splice(idx, 1);
//   });
// });

// // MJPEG endpoint cam2
// app.get('/video_feed/cam2', (req, res) => {
//   res.writeHead(200, {
//     'Content-Type': 'multipart/x-mixed-replace; boundary=' + BOUNDARY,
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });
//   mjpegClients2.push(res);
//   req.on('close', () => {
//     const idx = mjpegClients2.indexOf(res);
//     if (idx !== -1) mjpegClients2.splice(idx, 1);
//   });
// });

// // Ping route
// app.get('/ping', (req, res) => {
//   res.status(200).send('pong');
// });

// // Create two WebSocket.Server instances without listening directly
// const wss1 = new WebSocket.Server({ noServer: true });
// const wss2 = new WebSocket.Server({ noServer: true });

// // Handle websocket for cam1
// wss1.on('connection', (ws) => {
//   console.log('WebSocket client connected (cam1)');
//   ws.on('message', (message) => {
//     const base64Data = message.toString().replace(/^data:image\/jpeg;base64,/, '');
//     const frameBuffer = Buffer.from(base64Data, 'base64');
//     latestFrameBuffer1 = frameBuffer;
//     mjpegClients1.forEach((res) => {
//       try {
//         res.write(`${BOUNDARY}\r\n`);
//         res.write('Content-Type: image/jpeg\r\n\r\n');
//         res.write(frameBuffer);
//         res.write('\r\n');
//       } catch (err) { /* ignore */ }
//     });
//   });
//   ws.on('close', () => {
//     console.log('WebSocket client disconnected (cam1)');
//   });
// });

// // Handle websocket for cam2
// wss2.on('connection', (ws) => {
//   console.log('WebSocket client connected (cam2)');
//   ws.on('message', (message) => {
//     const base64Data = message.toString().replace(/^data:image\/jpeg;base64,/, '');
//     const frameBuffer = Buffer.from(base64Data, 'base64');
//     latestFrameBuffer2 = frameBuffer;
//     mjpegClients2.forEach((res) => {
//       try {
//         res.write(`${BOUNDARY}\r\n`);
//         res.write('Content-Type: image/jpeg\r\n\r\n');
//         res.write(frameBuffer);
//         res.write('\r\n');
//       } catch (err) { /* ignore */ }
//     });
//   });
//   ws.on('close', () => {
//     console.log('WebSocket client disconnected (cam2)');
//   });
// });

// // Route WebSocket upgrade requests based on URL
// server.on('upgrade', (req, socket, head) => {
//   if (req.url === '/ws/cam1') {
//     wss1.handleUpgrade(req, socket, head, (ws) => {
//       wss1.emit('connection', ws, req);
//     });
//   } else if (req.url === '/ws/cam2') {
//     wss2.handleUpgrade(req, socket, head, (ws) => {
//       wss2.emit('connection', ws, req);
//     });
//   } else {
//     socket.destroy();
//   }
// });

// // Listen on Render-assigned port
// const PORT = process.env.PORT;
// if (!PORT) throw new Error("PORT environment variable is not set");
// server.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });






// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');

// //Receives frames from the Python webcam script and broadcasts them as MJPEG to Unity.
// let latestFrameBuffer = null;
// const mjpegClients = [];
// const app = express();

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// });

// const BOUNDARY = '--frame';

// app.get('/video_feed', (req, res) => {
//   res.writeHead(200, {
//     'Content-Type': 'multipart/x-mixed-replace; boundary=' + BOUNDARY,
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });

//   mjpegClients.push(res);
//   req.on('close', () => {
//     const idx = mjpegClients.indexOf(res);
//     if (idx !== -1) mjpegClients.splice(idx, 1);
//   });
// });


// //this part is for ping pong interaction!
// app.get('/ping', (req, res) => {
//   res.status(200).send('pong');
// });

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// wss.on('connection', (ws) => {
//   console.log('WebSocket client connected');

//   // Adds Unity as an MJPEG stream client.
//   ws.on('message', (message) => {
//     const base64Data = message.toString().replace(/^data:image\/jpeg;base64,/, '');
//     const frameBuffer = Buffer.from(base64Data, 'base64');
//     latestFrameBuffer = frameBuffer;

//     mjpegClients.forEach((res) => {
//       try {
//         res.write(`${BOUNDARY}\r\n`);
//         res.write('Content-Type: image/jpeg\r\n\r\n');
//         res.write(frameBuffer);
//         res.write('\r\n');
//       } catch (err) {
//         // Ignore disconnected clients
//       }
//     });
//   });

//   ws.on('close', () => {
//     console.log('WebSocket client disconnected');
//   });
// });

// // Receives a base64-encoded frame from Python webcam and forwards it as JPEG to Unity.
// const PORT = process.env.PORT;
// if (!PORT) throw new Error("PORT environment variable is not set");

// server.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
// });










// This is the javascript for making render service possible for one camera, worked perfectly.

// '''// 1. Import modules
// const express   = require('express');
// const http      = require('http');
// const WebSocket = require('ws');
// const fs        = require('fs');
// const path      = require('path');

// // 2. In‐memory buffer for the latest JPEG frame
// let latestFrameBuffer = null;

// // 3. List of HTTP response objects for all MJPEG clients
// const mjpegClients = [];

// // 4. Express app (serves MJPEG endpoint)
// const app = express();

// // 5. Allow cross‐origin requests (so Unity on a different domain can connect)
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// });

// // 6. MJPEG boundary string
// const BOUNDARY = '--frame';

// // 7. HTTP endpoint: serve MJPEG stream at /video_feed
// app.get('/video_feed', (req, res) => {
//   // Set response headers for MJPEG
//   res.writeHead(200, {
//     'Content-Type': 'multipart/x-mixed-replace; boundary=' + BOUNDARY,
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });

//   // Register this client
//   mjpegClients.push(res);

//   // If the client disconnects, remove from list
//   req.on('close', () => {
//     const idx = mjpegClients.indexOf(res);
//     if (idx !== -1) mjpegClients.splice(idx, 1);
//   });
// });

// // 8. Create HTTP server from Express app
// const server = http.createServer(app);

// // 9. WebSocket server on the same HTTP server
// const wss = new WebSocket.Server({ server });

// let counter = 0;
// const IMAGES_DIR = path.join(__dirname, 'images');

// // 10. Ensure “images” folder exists for optional disk saving
// if (!fs.existsSync(IMAGES_DIR)) {
//   fs.mkdirSync(IMAGES_DIR, { recursive: true });
// }

// wss.on('connection', (ws) => {
//   console.log('WebSocket client connected');

//   ws.on('message', (message) => {
//     // message is a Buffer with “data:image/jpeg;base64,…” string
//     const base64String = message.toString();
//     // Strip prefix (if present)
//     const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, '');
//     // Decode base64 to raw JPEG bytes
//     const frameBuffer = Buffer.from(base64Data, 'base64');

//     // (Optional) Save to disk for debugging
//     const filename = `webcam_${Date.now()}_${counter++}.jpg`;
//     const filePath = path.join(IMAGES_DIR, filename);
//     fs.writeFile(filePath, frameBuffer, (err) => {
//       if (err) console.error('Failed to save image:', err);
//       else console.log(`Image saved: ${filename}`);
//     });

//     // Update “latestFrameBuffer” in memory
//     latestFrameBuffer = frameBuffer;

//     // Push this frame to all connected MJPEG clients
//     mjpegClients.forEach((res) => {
//       try {
//         res.write(`${BOUNDARY}\r\n`);
//         res.write('Content-Type: image/jpeg\r\n\r\n');
//         res.write(frameBuffer);
//         res.write('\r\n');
//       } catch (err) {
//         // If writing fails (e.g. client disconnected), ignore
//       }
//     });
//   });

//   ws.on('close', () => {
//     console.log('WebSocket client disconnected');
//   });
// });

// // 11. Listen on assigned port (Render’s $PORT) or 3001 if local
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`HTTP+WebSocket server listening on port ${PORT}`);
// });
// '''




// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 3000 });

// wss.on('connection', function connection(ws) {
//   console.log('Client connected');

//   ws.on('message', function incoming(message) {
//     console.log('Received:', message);
//     ws.send(`Server received: ${message}`);
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// console.log('WebSocket server started on ws://localhost:3000');

// index.js
// const express   = require('express');
// const http      = require('http');
// const WebSocket = require('ws');
// const fs        = require('fs');
// const path      = require('path');

// // In‐memory buffer for the latest JPEG frame
// let latestFrameBuffer = null;

// // List of HTTP response objects subscribing to /video_feed
// const mjpegClients = [];

// const app = express();

// // CORS headers (so Unity or browsers on different hosts can connect)
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// });

// // MJPEG boundary string
// const BOUNDARY = '--frame';

// // HTTP endpoint: serves MJPEG stream
// app.get('/video_feed', (req, res) => {
//   // Set headers for MJPEG multipart response
//   res.writeHead(200, {
//     'Content-Type': 'multipart/x-mixed-replace; boundary=' + BOUNDARY,
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });

//   // Add this client’s response to the list
//   mjpegClients.push(res);

//   // When the client disconnects, remove from list
//   req.on('close', () => {
//     const idx = mjpegClients.indexOf(res);
//     if (idx !== -1) mjpegClients.splice(idx, 1);
//   });
// });

// // Create HTTP server and attach Express
// const server = http.createServer(app);

// // Create WebSocket server on the same HTTP server
// const wss = new WebSocket.Server({ server });

// let counter = 0;  
// const IMAGES_DIR = path.join(__dirname, 'images');

// // Ensure images directory exists (for optional disk debugging)
// if (!fs.existsSync(IMAGES_DIR)) {
//   fs.mkdirSync(IMAGES_DIR, { recursive: true });
// }

// wss.on('connection', (ws) => {
//   console.log('WebSocket client connected');

//   ws.on('message', (message) => {
//     // message is a Buffer containing "data:image/jpeg;base64,...."
//     const base64String = message.toString();
//     // Remove the data URI prefix, if present
//     const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, '');
//     // Decode base64 to raw JPEG bytes
//     const frameBuffer = Buffer.from(base64Data, 'base64');

//     // (Optional) Save each frame to disk for debugging
//     const filename = `webcam_${Date.now()}_${counter++}.jpg`;
//     const filePath = path.join(IMAGES_DIR, filename);
//     fs.writeFile(filePath, frameBuffer, (err) => {
//       if (err) console.error('Failed to save image:', err);
//       else console.log(`Image saved: ${filename}`);
//     });

//     // Update our in-memory “latestFrameBuffer”
//     latestFrameBuffer = frameBuffer;

//     // Broadcast this frame to all currently connected MJPEG HTTP clients
//     mjpegClients.forEach((res) => {
//       try {
//         res.write(`${BOUNDARY}\r\n`);
//         res.write('Content-Type: image/jpeg\r\n\r\n');
//         res.write(frameBuffer);
//         res.write('\r\n');
//       } catch (err) {
//         // If writing fails (e.g. client disconnected), ignore.
//       }
//     });
//   });

//   ws.on('close', () => {
//     console.log('WebSocket client disconnected');
//   });
// });

// // Listen on the port Render assigns (or 3001 locally)
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`HTTP+WebSocket server listening on port ${PORT}`);
// });



//This works completely:
// const WebSocket = require('ws');
// const fs = require('fs');
// const path = require('path');

// const port = process.env.PORT || 3001;
// const wss = new WebSocket.Server({ port });

// let counter = 0;

// console.log(`WebSocket server listening on port ${port}`);

// wss.on('connection', (ws) => {
//   console.log('Client connected');

//   ws.on('message', (message) => {
//     const base64String = message.toString();
//     const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, '');

//     const buffer = Buffer.from(base64Data, 'base64');

//     const imagesDir = path.join(__dirname, 'images');
//     if (!fs.existsSync(imagesDir)) {
//       fs.mkdirSync(imagesDir, { recursive: true });
//     }

//     const filename = `webcam_${Date.now()}_${counter++}.jpg`;
//     const filePath = path.join(imagesDir, filename);

//     fs.writeFile(filePath, buffer, (err) => {
//       if (err) {
//         console.error('Failed to save image:', err);
//       } else {
//         console.log(`Image saved: ${filename}`);
//       }
//     });
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });
// 





