import React, { useState, useEffect } from 'react';
import { Navbar, Container, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../utils/api';

function UserDashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, transactionsRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/transactions'),
      ]);
      setProfile(profileRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Container fluid>
            <Navbar.Brand>Home Payday</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text className="me-3">Welcome, {user.name}</Navbar.Text>
              <Navbar.Text onClick={onLogout} style={{ cursor: 'pointer' }}>
                Logout
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Container className="mt-5">
          <Card>
            <Card.Body className="text-center">
              <Card.Title>No User Profile Found</Card.Title>
              <Card.Text>Please contact an administrator to set up your user profile.</Card.Text>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'earn':
        return 'success';
      case 'deduct':
        return 'danger';
      case 'payment':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand>Home Payday</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-3">Welcome, {user.name}</Navbar.Text>
            <Navbar.Text onClick={onLogout} style={{ cursor: 'pointer' }}>
              Logout
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Card className="mb-4 text-center">
          <Card.Body>
            <Card.Title className="text-muted mb-3">Current Balance</Card.Title>
            <h1 className="display-4 fw-bold text-primary mb-4">
              ${parseFloat(profile.currentBalance || 0).toFixed(2)}
            </h1>
            <div className="border-top pt-3 mt-3 text-start">
              <p className="mb-1"><strong>User ID:</strong> {profile.id}</p>
              <p className="mb-0"><strong>Name:</strong> {profile.name}</p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Card.Title className="mb-4">Transaction History</Card.Title>
            {transactions.length === 0 ? (
              <p className="text-center text-muted py-4">No transactions yet</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                      <td>
                        <Badge bg={getBadgeVariant(transaction.transactionType)}>
                          {transaction.transactionType.toUpperCase()}
                        </Badge>
                      </td>
                      <td
                        className={`fw-bold ${
                          transaction.transactionType === 'earn'
                            ? 'text-success'
                            : 'text-danger'
                        }`}
                      >
                        {transaction.transactionType === 'earn' ? '+' : '-'}$
                        {parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td>{transaction.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default UserDashboard;
