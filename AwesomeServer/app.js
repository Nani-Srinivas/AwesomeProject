// import 'dotenv/config';
// import { connectDB } from "./src/config/connect.js";
// import fastify from 'fastify';
// import { PORT } from "./src/config/config.js";
// import fastifySocketIO from "fastify-socket.io";
// import { registerRoutes } from "./src/routes/index.js";
// import { admin, buildAdminRouter } from './src/config/setup.js';

// const start = async()=>{
//     await connectDB(process.env.MONGO_URI);
//     const app = fastify()

//     app.register(fastifySocketIO,{
//         cors:{
//             origin:"*"
//         },
//         pingInterval:10000,
//         pingTimeout:5000,
//         transports:['websocket']
//     })

//     await registerRoutes(app)

//     await buildAdminRouter(app);

//     app.listen({port:PORT,host:'0.0.0.0'},(err,addr)=>{
//         if(err){
//             console.log(err);
//         }else{
//             console.log(`Grocery App running on http://localhost:${PORT}${admin.options.rootPath}`)
//         }
//     })

//     app.ready().then(()=>{
//         app.io.on('connection',(socket)=>{
//             console.log("A User Connected ✅")

//             socket.on("joinRoom",(orderId)=>{
//                 socket.join(orderId);
//                 console.log(` 🔴 User Joined room ${orderId}`)
//             })

//             socket.on('disconnect',()=>{
//                 console.log("User Disconnected ❌")
//             })
//         })
//     })
    

// }

// start()

import 'dotenv/config';
import { connectDB } from "./src/config/connect.js";
import fastify from 'fastify';
import { PORT } from "./src/config/config.js";
import websocketPlugin from '@fastify/websocket';
import rateLimit from '@fastify/rate-limit';
import { registerRoutes } from "./src/routes/index.js";
import { admin, buildAdminRouter } from './src/config/setup.js';

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  const app = fastify();

  // Add rate limiting
  await app.register(rateLimit, {
    max: 100, // limit each IP to 100 requests per window
    timeWindow: '1 minute',
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    }
  });

  // Register WebSocket plugin
  await app.register(websocketPlugin, {
    options: {
      maxPayload: 1048576, // 1MB
    },
  });

  // Example WebSocket route
  app.get('/ws', { websocket: true }, (connection /* SocketStream */, req) => {
    console.log("A user connected ✅");

    connection.socket.on('message', (message) => {
      console.log("Received:", message.toString());

      // Example: echo back
      connection.socket.send(`You said: ${message}`);
    });

    connection.socket.on('close', () => {
      console.log("User disconnected ❌");
    });
  });

  // Normal REST routes
  await registerRoutes(app);
  await buildAdminRouter(app);

  app.listen({ port: PORT, host: '0.0.0.0' }, (err, addr) => {
    if (err) {
      console.error(err);
    } else {
      console.log(
        `Grocery App running on http://localhost:${PORT}${admin.options.rootPath}`
        // `Grocery App running on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });
};

start();