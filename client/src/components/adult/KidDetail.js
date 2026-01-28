import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../utils/api';
import Avatar from '../common/Avatar';

function KidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionType, setActionType] = useState(null);
  const [actionData, setActionData] = useState({ amount: '', description: '' });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/adult/kids/${id}`);
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        actionType === 'earn'
          ? `/adult/kids/${id}/earn`
          : actionType === 'deduct'
          ? `/adult/kids/${id}/deduct`
          : `/adult/kids/${id}/payment`;

      const response = await api.post(endpoint, {
        amount: parseFloat(actionData.amount),
        description: actionData.description,
      });

      setActionType(null);
      setActionData({ amount: '', description: '' });
      fetchUser();
      alert(`Success! New balance: $${response.data.newBalance.toFixed(2)}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process action');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error && !user) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  return (
    <div>
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/adult/kids')}>
        ← Back to Kids
      </Button>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <Card>
        <Card.Body>
          <Card.Title className="mb-4">Kid Details</Card.Title>
          <div className="mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar avatar={user.avatar} name={user.name} size="lg" />
              <div>
                <p className="mb-1"><strong>Name:</strong> {user.name}</p>
                <p className="mb-0"><strong>Role:</strong> {user.role}</p>
              </div>
            </div>
            {user.currentBalance !== undefined && (
              <p className="mb-0">
                <strong>Current Balance:</strong>{' '}
                <Badge bg="success" className="fs-5 ms-2">
                  ${parseFloat(user.currentBalance).toFixed(2)}
                </Badge>
              </p>
            )}
          </div>

          {user.currentBalance !== undefined && (
            <div>
              <h4 className="mb-3">Actions</h4>
              <div className="d-flex gap-2 mb-4">
                <Button
                  variant="success"
                  onClick={() => setActionType('earn')}
                >
                  Add Earnings
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setActionType('deduct')}
                >
                  Deduct Money
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setActionType('payment')}
                >
                  Process Payment
                </Button>
              </div>

              {actionType && (
                <Card className="bg-light">
                  <Card.Body>
                    <Card.Title>
                      {actionType === 'earn'
                        ? 'Add Earnings'
                        : actionType === 'deduct'
                        ? 'Deduct Money'
                        : 'Process Payment'}
                    </Card.Title>
                    <Form onSubmit={handleAction}>
                      <Form.Group className="mb-3">
                        <Form.Label>Amount *</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={actionData.amount}
                          onChange={(e) =>
                            setActionData({ ...actionData, amount: e.target.value })
                          }
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={actionData.description}
                          onChange={(e) =>
                            setActionData({ ...actionData, description: e.target.value })
                          }
                        />
                      </Form.Group>
                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary">
                          Submit
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setActionType(null);
                            setActionData({ amount: '', description: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default KidDetail;
