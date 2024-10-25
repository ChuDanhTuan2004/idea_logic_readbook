// src/services/bookService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const getBookDetails = async (bookId) => {
  const response = await axios.get(`${API_BASE_URL}/books/${bookId}`);
  return response.data;
};

export const checkBookAccess = async (userId, bookId) => {
  const response = await axios.get(`${API_BASE_URL}/book-access/check/${userId}/${bookId}`);
  return response.data;
};

export const createAccessRequest = async (requestData) => {
  const response = await axios.post(`${API_BASE_URL}/book-access/request`, requestData);
  return response.data;
};

export const getAccessRequests = async () => {
  const response = await axios.get(`${API_BASE_URL}/book-access/requests`);
  return response.data;
};

export const processRequest = async (requestId, processData) => {
  const response = await axios.post(
    `${API_BASE_URL}/book-access/process/${requestId}`,
    processData
  );
  return response.data;
};

export const getUserNotifications = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/notifications/user/${userId}`);
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axios.post(`${API_BASE_URL}/notifications/${notificationId}/read`);
  return response.data;
};
