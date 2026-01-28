import React, { useState, useEffect } from 'react';
import { Nav, NavDropdown, Modal, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import api from '../../utils/api';
import WelcomeText from './WelcomeText';

/**
 * User menu component with dropdown containing Edit Profile and Logout options
 * 
 * @param {Object} user - User object containing id, name, role
 * @param {Function} onLogout - Callback function when user logs out
 * @param {Function} onUserUpdate - Callback function when user profile is updated (optional)
 */
function UserMenu({ user, onLogout, onUserUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEditClick = () => {
    setName(user?.name || '');
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Determine the correct API endpoint based on user role
      const endpoint = user?.role === 'adult' ? '/adult/profile' : '/kid/profile';
      const response = await api.put(endpoint, { name: name.trim() });
      
      setSuccess('Profile updated successfully!');
      
      // Call onUserUpdate callback if provided
      if (onUserUpdate) {
        onUserUpdate(response.data);
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!loading) {
      setShowEditModal(false);
      setError('');
      setSuccess('');
    }
  };

  // Auto-dismiss success toast
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error toast
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Update name when user prop changes
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  return (
    <>
      <Nav>
        <WelcomeText user={user} />
        <NavDropdown title="Menu" id="user-menu-dropdown" align="end">
          <NavDropdown.Item onClick={handleEditClick}>
            Edit Profile
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={onLogout}>
            Logout
          </NavDropdown.Item>
        </NavDropdown>
      </Nav>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ToastContainer position="top-center" className="p-3">
            <Toast 
              show={!!error} 
              onClose={() => setError('')} 
              bg="danger" 
              autohide 
              delay={5000}
            >
              <Toast.Header>
                <strong className="me-auto">Error</strong>
              </Toast.Header>
              <Toast.Body className="text-white">{error}</Toast.Body>
            </Toast>
            <Toast 
              show={!!success} 
              onClose={() => setSuccess('')} 
              bg="success" 
              autohide 
              delay={5000}
            >
              <Toast.Header>
                <strong className="me-auto">Success</strong>
              </Toast.Header>
              <Toast.Body className="text-white">{success}</Toast.Body>
            </Toast>
          </ToastContainer>

          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={100}
                required
                disabled={loading}
                autoFocus
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={handleModalClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default UserMenu;
