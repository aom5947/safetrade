import axios from "axios";

export const api = axios.create({
  baseURL: 'https://testmybackendpower.onrender.com/api/v1/'
});