// authStore.js
import { createStore, addMiddleware } from 'pulsy';
import axios from 'axios';

// Create a store to hold the user and token
createStore('auth', {
  user: null,
  token: null,
  
  
}, { persist: true }); // Persist the auth state in localStorage

// Middleware to add Authorization header for authenticated requests
addMiddleware('auth', (nextValue, prevValue, storeName) => {
  if (nextValue.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${nextValue.token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
  return nextValue;
});