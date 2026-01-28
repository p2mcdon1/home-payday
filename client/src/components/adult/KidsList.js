import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Table, Alert, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import AvatarInput from '../common/AvatarInput';

function KidsList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'kid',
    password: '',
    avatar: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/adult/kids');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/adult/kids', formData);
      setShowCreateForm(false);
      setFormData({ name: '', role: 'kid', password: '', avatar: null });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await api.delete(`/adult/kids/${userId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleUnlock = async (userId) => {
    try {
      await api.post(`/adult/kids/${userId}/unlock`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unlock user');
    }
  };

  const handleUpdateBalances = async (userId) => {
    try {
      const response = await api.post(`/adult/kids/${userId}/update-balances`);
      const updatedCount = response.data.updatedBalances?.length || 0;
      setSuccess(`Updated balances for ${updatedCount} account(s).`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update balances');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kids</h2>
        <Button
          variant={showCreateForm ? 'secondary' : 'success'}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Add User'}
        </Button>
      </div>

      <ToastContainer position="bottom-center" className="p-3">
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

      {showCreateForm && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Create New User</Card.Title>
            <Form onSubmit={handleCreate}>
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                >
                  <option value="kid">Kid</option>
                  <option value="adult">Adult</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <AvatarInput
                value={formData.avatar}
                onChange={(avatar) => setFormData({ ...formData, avatar })}
                name={formData.name}
                label="Avatar (Optional)"
              />
              <Button type="submit" variant="primary">
                Create Kid
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {users.length === 0 ? (
        <Alert variant="info" className="text-center">
          No users found
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Created On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar avatar={user.avatar} name={user.name} size="sm" />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdOn).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateBalances(user.id)}
                        >
                          Update Balances
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleUnlock(user.id)}
                          disabled={!user.lockedUntil}
                        >
                          Unlock
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default KidsList;
