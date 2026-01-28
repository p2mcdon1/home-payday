import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Badge, Toast, ToastContainer, Button, Modal, Form } from 'react-bootstrap';
import api from '../../utils/api';

function Chores() {
  const [chores, setChores] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogWorkModal, setShowLogWorkModal] = useState(false);
  const [selectedChore, setSelectedChore] = useState(null);
  const [logWorkData, setLogWorkData] = useState({
    accountId: '',
    completion: 100,
    notes: ''
  });

  useEffect(() => {
    fetchChores();
    fetchAccounts();
    fetchPendingPayments();
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

  // Auto-dismiss success toast after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchChores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/chores');
      setChores(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load chores');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/user/accounts');
      setAccounts(response.data);
    } catch (err) {
      // Silently fail - accounts are optional
      console.error('Failed to load accounts:', err);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await api.get('/user/pending-payments');
      setPendingPayments(response.data);
    } catch (err) {
      console.error('Failed to load pending payments:', err);
    }
  };

  const handleLogWorkClick = (chore) => {
    setSelectedChore(chore);
    setLogWorkData({
      accountId: '',
      completion: 100,
      notes: ''
    });
    setShowLogWorkModal(true);
  };

  const handleLogWorkSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/user/efforts', {
        choreId: selectedChore.id,
        accountId: logWorkData.accountId || null,
        completion: parseInt(logWorkData.completion),
        notes: logWorkData.notes || null
      });
      setSuccess('Work logged successfully!');
      setShowLogWorkModal(false);
      setSelectedChore(null);
      fetchChores();
      fetchPendingPayments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log work');
    }
  };

  const getExpectedPaymentAmount = (effort) => {
    if (effort.each) {
      return `$${parseFloat(effort.each).toFixed(2)}`;
    }
    if (effort.formula) {
      return `Formula: ${effort.formula}`;
    }
    return 'N/A';
  };

  const getLifecycleDescription = (chore) => {
    if (chore.infinite) {
      return <Badge bg="info">Infinite</Badge>;
    }
    if (chore.daily) {
      return <Badge bg="success">Daily</Badge>;
    }
    if (chore.daysOfWeekMask) {
      return <Badge bg="secondary">Custom Schedule</Badge>;
    }
    return <Badge bg="secondary">N/A</Badge>;
  };

  const getRateDescription = (chore) => {
    if (chore.each) {
      return `$${parseFloat(chore.each).toFixed(2)} each`;
    }
    if (chore.formula) {
      return `Formula: ${chore.formula}`;
    }
    return 'N/A';
  };

  const getLimitInfo = (chore) => {
    const parts = [];
    if (chore.maxPerDay) {
      parts.push(`${chore.effortsToday || 0}/${chore.maxPerDay} today`);
    }
    if (chore.maxPerHour) {
      parts.push(`${chore.effortsThisHour || 0}/${chore.maxPerHour} this hour`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'No limits';
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
      <h2 className="mb-4">Available Chores</h2>
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

      {chores.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <Card.Title>No Chores Available</Card.Title>
            <Card.Text>
              There are no chores available at this time. Check back later or contact an administrator.
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Card className="mb-4">
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Chore Name</th>
                  <th>Description</th>
                  <th>Link</th>
                  <th>Lifecycle</th>
                  <th>Rate</th>
                  <th>Limits</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {chores.map((chore) => (
                  <tr key={chore.id}>
                    <td className="fw-bold">{chore.name}</td>
                    <td>{chore.description || '-'}</td>
                    <td>
                      {chore.link ? (
                        <a href={chore.link} target="_blank" rel="noopener noreferrer">
                          View Link
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{getLifecycleDescription(chore)}</td>
                    <td>{getRateDescription(chore)}</td>
                    <td className="small text-muted">{getLimitInfo(chore)}</td>
                    <td>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleLogWorkClick(chore)}
                      >
                        Log Work
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Pending Payments Section */}
      <h3 className="mb-3">Pending Payments</h3>
      {pendingPayments.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <Card.Text>No pending payments.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Chore</th>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Completion</th>
                  <th>Expected Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="fw-bold">{payment.choreName}</td>
                    <td>{new Date(payment.effortedOn).toLocaleDateString()}</td>
                    <td>{payment.accountName || '-'}</td>
                    <td>{payment.completion}%</td>
                    <td className="fw-bold">{getExpectedPaymentAmount(payment)}</td>
                    <td>{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Log Work Modal */}
      <Modal show={showLogWorkModal} onHide={() => setShowLogWorkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Log Work - {selectedChore?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogWorkSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Account (Optional)</Form.Label>
              <Form.Select
                value={logWorkData.accountId}
                onChange={(e) => setLogWorkData({ ...logWorkData, accountId: e.target.value })}
              >
                <option value="">No account selected</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} (${parseFloat(account.balance || 0).toFixed(2)})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Completion (%)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={logWorkData.completion}
                onChange={(e) => setLogWorkData({ ...logWorkData, completion: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={logWorkData.notes}
                onChange={(e) => setLogWorkData({ ...logWorkData, notes: e.target.value })}
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="me-2">
              Log Work
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowLogWorkModal(false)}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Chores;
