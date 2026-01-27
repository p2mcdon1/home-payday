import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../utils/api';
import { setCurrentUser } from '../utils/auth';

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { name, password });
      const { token, user } = response.data;
      
      setCurrentUser(user);
      onLogin(user, token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card className="shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body className="p-4">
          <Card.Title as="h1" className="text-center mb-2">Home Payday</Card.Title>
          <Card.Subtitle as="h2" className="text-center text-muted mb-4">Sign In</Card.Subtitle>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="admin"
                maxLength={100}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                maxLength={100}
              />
            </Form.Group>
            
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>
          
          <Alert variant="info" className="mt-3 mb-0 text-center">
            <small>Default admin: admin / admin123</small>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
