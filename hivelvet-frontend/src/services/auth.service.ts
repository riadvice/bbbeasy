import axios from 'axios';

const API_URL = 'http://hivelvet.test/';

class AuthService {
    register(username: string, email: string, password: string, confirmPassword: string) {
        return axios.post(API_URL + 'account/api/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }
    login(email: string, password: string) {
        return axios.post(API_URL + 'account/api/login', {
            email,
            password,
        });
    }
    logout() {
        localStorage.removeItem('user');
    }
}

export default new AuthService();
