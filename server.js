import http from 'http';
import path from 'path';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5173'],
        credentials: true,
    }
    app.use(cors(corsOptions))
}
import { logger } from './services/logger.service.js';
import { authRoutes } from './api/auth/auth.routes.js';
import { userRoutes } from './api/user/user.routes.js';
import { chatRoutes } from './api/chat/chat.routes.js';
import { setupSocketAPI } from './services/socket.service.js';
import { loadKnowledgeBase } from './api/chat/chat.service.js';
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js';

app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

setupSocketAPI(server)
loadKnowledgeBase().then(() => {
    console.log('Knowledge base loaded')
})

// Make every server-side route match the index.html
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const port = process.env.PORT || 3030
server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})
