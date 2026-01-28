import React, { useState, useEffect } from 'react';
import { Navbar, Container, Card, Table, Spinner, Nav, Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../utils/api';
import Chores from './user/Chores';

function UserDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand>927 Payroll</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/user/accounts">Accounts</Nav.Link>
              <Nav.Link as={Link} to="/user/chores">Chores</Nav.Link>
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">Welcome, {user.name}</Navbar.Text>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-4">
        <Routes>
          <Route path="/accounts" element={<AccountsView />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/" element={<Navigate to="/user/accounts" />} />
        </Routes>
      </Container>
    </div>
  );
}

// Accounts view component (extracted from original UserDashboard)
function AccountsView() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Auto-dismiss error toast after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/accounts');
      setAccounts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/user/accounts', { name: accountName });
      setAccountName('');
      setShowCreateForm(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
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
      <h2 className="mb-4">My Accounts</h2>
      <ToastContainer position="top-end" className="p-3">
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
      </ToastContainer>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div></div>
        <Button
          variant={showCreateForm ? 'secondary' : 'success'}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Account'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Create New Account</Card.Title>
            <Form onSubmit={handleCreateAccount}>
              <Form.Group className="mb-3">
                <Form.Label>Account Name</Form.Label>
                <Form.Control
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account name"
                  maxLength={100}
                />
              </Form.Group>
              <Button type="submit" variant="primary">
                Create Account
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {accounts.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <Card.Title>No Accounts</Card.Title>
            <Card.Text>Create your first account to get started.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Balance</th>
                    <th>Created On</th>
                  </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                    <tr key={account.id}>
                      <td>{account.name}</td>
                      <td className="fw-bold">
                        ${parseFloat(account.balance || 0).toFixed(2)}
                      </td>
                      <td>{new Date(account.createdOn).toLocaleDateString()}</td>
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

export default UserDashboard;
