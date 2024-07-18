import { authService } from '../api/auth/auth.service.js';
import { asyncLocalStorage } from '../services/als.service.js';

export async function setupAsyncLocalStorage(req, res, next) {
    const storage = {};
    asyncLocalStorage.run(storage, () => {
        if (!req.cookies) return next();
        console.log('Cookies:', req.cookies);
        const loginToken = req.cookies.loginToken;
        if (!loginToken) {
            console.log('No login token found in cookies.');
            return next();
        }
        const loggedinUser = authService.validateToken(loginToken);
        console.log("Logged in User:", loggedinUser);
        if (loggedinUser) {
            const alsStore = asyncLocalStorage.getStore();
            alsStore.loggedinUser = loggedinUser;
        }
        next();
    });
}
