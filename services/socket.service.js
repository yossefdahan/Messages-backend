import { logger } from './logger.service.js';
import { Server } from 'socket.io';

var gIo = null;
var usersInRoom = {};

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        }
    });
    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`);

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected [id: ${socket.id}]`);
            if (socket.myTopic) {
                const userIndex = usersInRoom[socket.myTopic].findIndex(user => user.userId === socket.userId);
                if (userIndex !== -1) usersInRoom[socket.myTopic].splice(userIndex, 1);
                gIo.to(socket.myTopic).emit('users-in-room', usersInRoom[socket.myTopic]);
            }
        });

        socket.on('chat-set-topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic);
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`);
                const userIndex = usersInRoom[socket.myTopic].findIndex(user => user.userId === socket.userId);
                if (userIndex !== -1) usersInRoom[socket.myTopic].splice(userIndex, 1);
                gIo.to(socket.myTopic).emit('users-in-room', usersInRoom[socket.myTopic]);
            }
            socket.join(topic);
            socket.myTopic = topic;
            if (!usersInRoom[topic]) usersInRoom[topic] = [];
            usersInRoom[topic].push({ userId: socket.userId, fullname: socket.fullname });
            gIo.to(topic).emit('users-in-room', usersInRoom[topic]);
        });

        socket.on('chat-send-msg', msg => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`);
            socket.broadcast.to(socket.myTopic).emit('chat-add-msg', msg);
        });

        socket.on('user-watch', userId => {
            logger.info(`user-watch from socket [id: ${socket.id}], on user ${userId}`);
            socket.join('watching:' + userId);
        });

        socket.on('set-user-socket', user => {
            logger.info(`Setting socket.userId = ${user._id} and socket.fullname = ${user.fullname} for socket [id: ${socket.id}]`);
            socket.userId = user._id;
            socket.fullname = user.fullname;
            if (socket.myTopic) {
                if (!usersInRoom[socket.myTopic]) usersInRoom[socket.myTopic] = [];
                usersInRoom[socket.myTopic].push({ userId: user._id, fullname: user.fullname });
                gIo.to(socket.myTopic).emit('users-in-room', usersInRoom[socket.myTopic]);
            }
        });

        socket.on('unset-user-socket', () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`);
            if (socket.userId && socket.myTopic) {
                const userIndex = usersInRoom[socket.myTopic].findIndex(user => user.userId === socket.userId);
                if (userIndex !== -1) usersInRoom[socket.myTopic].splice(userIndex, 1);
                gIo.to(socket.myTopic).emit('users-in-room', usersInRoom[socket.myTopic]);
            }
            delete socket.userId;
            delete socket.fullname;
        });

        socket.on('get-users-in-room', () => {
            if (socket.myTopic) {
                gIo.to(socket.id).emit('users-in-room', usersInRoom[socket.myTopic]);
            }
        });

        socket.on('bot-response', ({ botMsg, room }) => {
            logger.info(`New bot msg from server, emitting to topic ${room}`);
            gIo.to(room).emit('chat-add-msg', botMsg);
        });
    });
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data);
    else gIo.emit(type, data);
}

async function emitToUser({ type, data, userId }) {
    userId = userId.toString();
    const socket = await _getUserSocket(userId);

    if (socket) {
        logger.info(`Emitting event: ${type} to user: ${userId} socket [id: ${socket.id}]`);
        socket.emit(type, data);
    } else {
        logger.info(`No active socket for user: ${userId}`);
    }
}

// If possible, send to all sockets BUT not the current socket 
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
    userId = userId.toString();

    logger.info(`Broadcasting event: ${type}`);
    const excludedSocket = await _getUserSocket(userId);
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`);
        excludedSocket.broadcast.to(room).emit(type, data);
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`);
        excludedSocket.broadcast.emit(type, data);
    } else if (room) {
        logger.info(`Emit to room: ${room}`);
        gIo.to(room).emit(type, data);
    } else {
        logger.info(`Emit to all`);
        gIo.emit(type, data);
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.userId === userId);
    return socket;
}

async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets();
    return sockets;
}

async function _printSockets() {
    const sockets = await _getAllSockets();
    console.log(`Sockets: (count: ${sockets.length}):`);
    sockets.forEach(_printSocket);
}

function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`);
}

export const socketService = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo,
    // emit to a specific user (if currently active in system)
    emitToUser,
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast,
};
