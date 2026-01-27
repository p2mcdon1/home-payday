import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../../utils/api';

function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionType, setActionType] = useState(null);
  const [actionData, setActionData] = useState({ amount: '', description: '' });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/employees/${id}`);
      setEmployee(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        actionType === 'earn'
          ? `/admin/employees/${id}/earn`
          : actionType === 'deduct'
          ? `/admin/employees/${id}/deduct`
          : `/admin/employees/${id}/payment`;

      const response = await api.post(endpoint, {
        amount: parseFloat(actionData.amount),
        description: actionData.description,
      });

      setActionType(null);
      setActionData({ amount: '', description: '' });
      fetchEmployee();
      alert(`Success! New balance: $${response.data.new_balance.toFixed(2)}`);
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

  if (error && !employee) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  return (
    <div>
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/admin/employees')}>
        ← Back to Employees
      </Button>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <Card>
        <Card.Body>
          <Card.Title className="mb-4">Employee Details</Card.Title>
          <div className="mb-4 pb-3 border-bottom">
            <p className="mb-2"><strong>Employee ID:</strong> {employee.employee_id}</p>
            <p className="mb-2"><strong>Name:</strong> {employee.name}</p>
            <p className="mb-2"><strong>Email:</strong> {employee.email || '-'}</p>
            <p className="mb-0">
              <strong>Current Balance:</strong>{' '}
              <Badge bg="success" className="fs-5 ms-2">
                ${parseFloat(employee.current_balance).toFixed(2)}
              </Badge>
            </p>
          </div>

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
        </Card.Body>
      </Card>
    </div>
  );
}

export default EmployeeDetail;
