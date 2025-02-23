import Cryptr from 'cryptr';
import bcrypt from 'bcrypt';
import { userService } from '../user/user.service.js';
import { logger } from '../../services/logger.service.js';

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234');

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken
};

async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`);
    const user = await userService.getByUsername(username);
    if (!user) throw 'Invalid username or password';
    if (!bcrypt.compareSync(password, user.password)) throw 'Invalid username or password';
    delete user.password;
    user._id = user._id.toString();
    return user;
}

async function signup({ username, password, fullname, imgUrl }) {
    const saltRounds = 10;
    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`);
    if (!username || !password || !fullname) throw 'Missing required signup information';

    const userExist = await userService.getByUsername(username);
    if (userExist) throw 'Username already taken';

    const hash = await bcrypt.hash(password, saltRounds);
    return userService.add({ username, password: hash, fullname, imgUrl });
}

function getLoginToken(user) {
    const userInfo = { _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin };
    return cryptr.encrypt(JSON.stringify(userInfo));
}

function validateToken(loginToken) {
    if (!loginToken) {
        console.log('Invalid login token: Token is null or undefined');
        return null;
    }
    try {
        const json = cryptr.decrypt(loginToken);
        const loggedinUser = JSON.parse(json);
        return loggedinUser;
    } catch (err) {
        console.log('Invalid login token', err);
        return null;
    }
}
