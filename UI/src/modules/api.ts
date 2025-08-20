import axios from 'axios';

const apiGateway = axios.create({
    baseURL: import.meta.env.VITE_APP_APIURL,
    withCredentials: false
});

export { apiGateway }