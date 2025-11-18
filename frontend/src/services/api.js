import axios from "axios";

export const api = axios.create({
  baseURL: 'https://testmybackendpower.onrender.com/api/v1/'
  // baseURL: 'http://localhost:3000/api/v1'
});