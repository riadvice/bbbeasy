import axios from 'axios';

const API_URL = 'http://api.hivelvet.test';

class AuthService {
    register(username: string, email: string, password: string, confirmPassword: string) {
        return axios.post(API_URL + '/api/account/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }
    login(email: string, password: string) {
        return axios.post(API_URL + '/api/account/login', {
            email,
            password,
        });
    }
    logout() {
        localStorage.removeItem('user');
    }
}

export default new AuthService();
