import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../utils/api';
import { setCurrentUser } from '../utils/auth';

function Login({ onLogin }) {
  const [name, setName] = useState(() => {
    // Restore username from sessionStorage if component remounts
    return sessionStorage.getItem('loginUsername') || '';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState(() => {
    // Restore error from sessionStorage if component remounts
    return sessionStorage.getItem('loginError') || '';
  });
  const [loading, setLoading] = useState(false);

  // Persist username to sessionStorage whenever it changes
  useEffect(() => {
    if (name) {
      sessionStorage.setItem('loginUsername', name);
    } else {
      sessionStorage.removeItem('loginUsername');
    }
  }, [name]);

  // Persist error to sessionStorage whenever it changes
  useEffect(() => {
    if (error) {
      sessionStorage.setItem('loginError', error);
    } else {
      sessionStorage.removeItem('loginError');
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear error only when starting a new login attempt
    setError('');
    sessionStorage.removeItem('loginError');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { name, password });
      const { token, user } = response.data;
      
      setCurrentUser(user);
      onLogin(user, token);
    } catch (err) {
      // Show generic error message to avoid leaking details
      setError('Invalid username or password. Please try again.');
      // Clear password but keep username
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card className="shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body className="p-4">
          <Card.Title as="h1" className="text-center mb-2">927 Payroll</Card.Title>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="username"
                required
                maxLength={100}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                maxLength={100}
              />
            </Form.Group>
            
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            {error && (
              <Alert 
                variant="danger" 
                className="mt-3 mb-0"
                dismissible
                onClose={() => {
                  setError('');
                  sessionStorage.removeItem('loginError');
                }}
              >
                {error}
              </Alert>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
