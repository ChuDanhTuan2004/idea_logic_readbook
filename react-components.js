// src/components/BookDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AccessRequestForm from './AccessRequestForm';
import { checkBookAccess, getBookDetails } from '../services/bookService';

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const userId = localStorage.getItem('userId'); // Assuming user ID is stored in localStorage

  useEffect(() => {
    const fetchBookAndAccess = async () => {
      const bookData = await getBookDetails(bookId);
      setBook(bookData);
      
      const accessStatus = await checkBookAccess(userId, bookId);
      setHasAccess(accessStatus);
    };

    fetchBookAndAccess();
  }, [bookId, userId]);

  const handleReadNow = () => {
    if (hasAccess) {
      window.location.href = book.resourceUrl;
    } else {
      setShowRequestForm(true);
    }
  };

  if (!book) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{book.title}</h1>
      <p className="text-gray-600 mb-4">Author: {book.author}</p>
      <div className="mb-4">{book.description}</div>
      
      <button
        onClick={handleReadNow}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Đọc Ngay
      </button>

      {showRequestForm && !hasAccess && (
        <AccessRequestForm 
          bookId={bookId} 
          onRequestSubmitted={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
};

// src/components/AccessRequestForm.jsx
import React, { useState } from 'react';
import { createAccessRequest } from '../services/bookService';

const AccessRequestForm = ({ bookId, onRequestSubmitted }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAccessRequest({
        userId,
        bookId,
        reason
      });
      onRequestSubmitted();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Yêu Cầu Truy Cập Sách</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Lý do yêu cầu:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded p-2"
              rows="4"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onRequestSubmitted()}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// src/components/LibrarianRequestList.jsx
import React, { useState, useEffect } from 'react';
import { getAccessRequests, processRequest } from '../services/bookService';

const LibrarianRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const librarianId = localStorage.getItem('userId');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getAccessRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (requestId, approved, rejectionReason = '') => {
    try {
      await processRequest(requestId, {
        librarianId,
        approved,
        rejectionReason
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error processing request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Yêu Cầu Truy Cập Sách</h1>
      <div className="space-y-4">
        {requests.map(request => (
          <div key={request.id} className="border p-4 rounded">
            <div className="mb-2">
              <strong>Người yêu cầu:</strong> {request.user.fullName}
            </div>
            <div className="mb-2">
              <strong>Sách:</strong> {request.book.title}
            </div>
            <div className="mb-2">
              <strong>Lý do:</strong> {request.reason}
            </div>
            <div className="mb-2">
              <strong>Ngày yêu cầu:</strong> {new Date(request.requestDate).toLocaleDateString()}
            </div>
            {request.status === 'PENDING' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleProcess(request.id, true)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Phê duyệt
                </button>
                <button
                  onClick={() => {
                    const reason = window.prompt('Lý do từ chối:');
                    if (reason) handleProcess(request.id, false, reason);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// src/components/UserNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications, markNotificationAsRead } from '../services/bookService';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getUserNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    if (notification.type === 'APPROVAL') {
      navigate(`/books/${notification.request.book.id}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thông Báo</h1>
      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 rounded cursor-pointer ${
              notification.isRead ? 'bg-gray-100' : 'bg-blue-50'
            }`}
          >
            <p className="mb-2">{notification.message}</p>
            <p className="text-sm text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
