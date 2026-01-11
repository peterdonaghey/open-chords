/**
 * User Menu - Circular avatar with dropdown menu
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './Auth/LoginModal';
import './UserMenu.css';

export default function UserMenu() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleLoginClick = () => {
    setIsDropdownOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleSignupClick = () => {
    setIsDropdownOpen(false);
    navigate('/signup');
  };

  const getInitials = () => {
    if (!user?.email) return '?';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="user-menu" ref={dropdownRef}>
        <button
          className="user-menu-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
        >
          <div className="user-avatar">
            {isAuthenticated ? getInitials() : '👤'}
          </div>
        </button>

        {isDropdownOpen && (
          <div className="user-menu-dropdown">
            {isAuthenticated ? (
              <>
                <div className="user-menu-header">
                  <div className="user-email">{user?.email}</div>
                  {isAdmin && <div className="admin-badge">Admin</div>}
                </div>
                <div className="user-menu-divider"></div>
                <button
                  className="user-menu-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/profile');
                  }}
                >
                  <span>Profile</span>
                </button>
                <button
                  className="user-menu-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/my-songs');
                  }}
                >
                  <span>My Songs</span>
                </button>
                {isAdmin && (
                  <button
                    className="user-menu-item admin-menu-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/admin');
                    }}
                  >
                    <span>⚡ Admin Panel</span>
                  </button>
                )}
                <button
                  className="user-menu-item"
                  onClick={handleSignOut}
                >
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className="user-menu-item"
                  onClick={handleLoginClick}
                >
                  <span>Sign In</span>
                </button>
                <button
                  className="user-menu-item"
                  onClick={handleSignupClick}
                >
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          // Page doesn't refresh, just close modal
        }}
      />
    </>
  );
}





