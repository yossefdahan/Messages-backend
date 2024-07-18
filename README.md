# ChatApp Backend

This directory contains the backend code for ChatApp, a real-time chat application. The backend is responsible for managing user authentication, real-time messaging, and storing chat messages.

## Features

- **User Authentication:** Handles user signup and login.
- **Real-Time Messaging:** Supports real-time communication using Socket.io.
- **Message Storage:** Stores chat messages in MongoDB.
- **Bot Interaction:** Allows interaction with a bot that can learn new responses.

## Technologies Used

- **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express:** A minimal and flexible Node.js web application framework.
- **Socket.io:** A library for real-time web applications.
- **MongoDB:** A NoSQL database for storing user data and chat messages.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.

## API Endpoints

- **POST /api/auth/login:** User login
- **POST /api/auth/signup:** User signup
- **POST /api/chat:** Send a chat message
- **GET /api/chat/:room:** Get chat messages for a room

## WebSocket Events

- **SOCKET_EMIT_SEND_MSG:** Emit to send a new message.
- **SOCKET_EVENT_ADD_MSG:** Listen for new messages.
- **SOCKET_EMIT_SET_TOPIC:** Set the chat room topic.
- **SOCKET_EVENT_USERS_IN_ROOM:** Get the list of users in a room.

## Contact

For any inquiries, please reach out to:

- **GitHub:** [yossefdahan](https://github.com/yossefdahan)
- **Email:** yossefdahan1@gmail.com
- **LinkedIn:** [Yossef Dahan](https://www.linkedin.com/in/yossef-dahan-fs18/)

© 2024 ChatApp. All rights reserved by Yossef Dahan.