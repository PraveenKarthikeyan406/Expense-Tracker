import axios from 'axios';
const API = process.env.REACT_APP_API || 'http://localhost:5000';

export async function register({ email, password, name }){
  const res = await axios.post(`${API}/api/auth/register`, { email, password, name });
  return res.data;
}
export async function login({ email, password }){
  const res = await axios.post(`${API}/api/auth/login`, { email, password });
  return res.data;
}
export async function getMe(token){
  const res = await axios.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }});
  return res.data;
}
