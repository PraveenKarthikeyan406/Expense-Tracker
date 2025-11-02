import axios from 'axios';
const API = process.env.REACT_APP_API || 'http://localhost:5000';

function authHeaders(token){
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function fetchExpenses(token, { startDate, endDate } = {}) {
  const qs = [];
  if(startDate) qs.push('startDate=' + encodeURIComponent(startDate));
  if(endDate) qs.push('endDate=' + encodeURIComponent(endDate));
  const url = `${API}/api/expenses` + (qs.length ? '?' + qs.join('&') : '');
  const res = await axios.get(url, authHeaders(token));
  return res.data;
}

export async function createExpense(token, payload){
  const res = await axios.post(`${API}/api/expenses`, payload, authHeaders(token));
  return res.data;
}

export async function updateExpense(token, id, payload){
  const res = await axios.put(`${API}/api/expenses/${id}`, payload, authHeaders(token));
  return res.data;
}

export async function deleteExpense(token, id){
  const res = await axios.delete(`${API}/api/expenses/${id}`, authHeaders(token));
  return res.data;
}
