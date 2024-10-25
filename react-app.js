// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookDetail from './components/BookDetail';
import LibrarianRequestList from './components/LibrarianRequestList';
import UserNotifications from './components/UserNotifications';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/books/:bookId" element={<BookDetail />} />
          <Route path="/librarian/requests" element={<LibrarianRequestList />} />
          <Route path="/notifications" element={<UserNotifications />} />
        </Routes>
      </div>
    </Router>
  );
};

// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const userRole = localStorage.getItem('userRole');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const data = await getUserNotifications(userId);
        setNotifications(data.filter(n => !n.isRead));
      }
    };

    fetchNotifications();
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">
          Thư Viện
        </Link>
        <div className="flex items-center space-x-4">
          {userRole === 'LIBRARIAN' && (
            <Link to="/librarian/requests" className="hover:text-gray-300">
              Quản Lý Yêu Cầu
            </Link>
          )}
          <Link to="/notifications" className="hover:text-gray-300 relative">
            Thông Báo
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};
