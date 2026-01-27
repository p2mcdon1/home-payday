import React, { useState, useEffect } from 'react';
import { Navbar, Container, Card, Table, Badge, Spinner, Alert, Nav, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function UserDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [accountName, setAccountName] = useState('');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

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
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }


  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand>927 Payroll</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Navbar.Text className="me-3">Welcome, {user.name}</Navbar.Text>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Accounts</h2>
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
      </Container>
    </div>
  );
}

export default UserDashboard;
