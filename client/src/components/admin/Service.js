import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, Table, Button, Spinner, Toast, ToastContainer, Badge, Modal, Form } from 'react-bootstrap';
import api from '../../utils/api';

function Service() {
  const [activeTab, setActiveTab] = useState('pending-payments');
  const [pendingEfforts, setPendingEfforts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [withdrawalData, setWithdrawalData] = useState({
    userId: '',
    accountId: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    if (activeTab === 'pending-payments') {
      fetchPendingEfforts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (showWithdrawalModal) {
      fetchUsers();
    }
  }, [showWithdrawalModal]);

  useEffect(() => {
    if (withdrawalData.userId) {
      fetchAccountsForUser(withdrawalData.userId);
    } else {
      setAccounts([]);
      setWithdrawalData(prev => ({ ...prev, accountId: '' }));
    }
  }, [withdrawalData.userId]);

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

  const fetchPendingEfforts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pending-efforts');
      setPendingEfforts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pending efforts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const fetchAccountsForUser = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/accounts`);
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setAccounts([]);
    }
  };

  const handleWithdrawalClick = () => {
    setShowWithdrawalModal(true);
    setWithdrawalData({
      userId: '',
      accountId: '',
      amount: '',
      notes: ''
    });
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/withdrawals', {
        accountId: withdrawalData.accountId,
        amount: parseFloat(withdrawalData.amount),
        notes: withdrawalData.notes || null
      });
      setSuccess('Withdrawal created and balance updated successfully!');
      setShowWithdrawalModal(false);
      setWithdrawalData({
        userId: '',
        accountId: '',
        amount: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create withdrawal');
    }
  };

  const handleWithdrawalCancel = () => {
    setShowWithdrawalModal(false);
    setWithdrawalData({
      userId: '',
      accountId: '',
      amount: '',
      notes: ''
    });
  };

  const handleApprove = async (effortId) => {
    try {
      await api.post(`/admin/efforts/${effortId}/approve`);
      setSuccess('Effort approved and payment created successfully!');
      fetchPendingEfforts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve effort');
    }
  };

  const handleDeny = async (effortId) => {
    if (!window.confirm('Are you sure you want to deny this effort?')) return;
    
    try {
      await api.post(`/admin/efforts/${effortId}/deny`);
      setSuccess('Effort denied successfully!');
      fetchPendingEfforts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deny effort');
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
        <h2>Service</h2>
        <Button variant="primary" onClick={handleWithdrawalClick}>
          Withdrawal
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

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="pending-payments" title="Pending Payments">
          {pendingEfforts.length === 0 ? (
            <Card>
              <Card.Body className="text-center">
                <Card.Title>No Pending Payments</Card.Title>
                <Card.Text>
                  There are no efforts awaiting approval at this time.
                </Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Chore</th>
                      <th>Date</th>
                      <th>Account</th>
                      <th>Completion</th>
                      <th>Expected Amount</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEfforts.map((effort) => (
                      <tr key={effort.id}>
                        <td className="fw-bold">{effort.userName}</td>
                        <td>{effort.choreName}</td>
                        <td>{new Date(effort.effortedOn).toLocaleDateString()}</td>
                        <td>
                          {effort.accountName ? (
                            <Badge bg="info">{effort.accountName}</Badge>
                          ) : (
                            <Badge bg="secondary">Oldest Account</Badge>
                          )}
                        </td>
                        <td>{effort.completion}%</td>
                        <td className="fw-bold">{getExpectedPaymentAmount(effort)}</td>
                        <td>{effort.notes || '-'}</td>
                        <td>
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => handleApprove(effort.id)}
                            className="me-2"
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeny(effort.id)}
                          >
                            Deny
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Tab>
      </Tabs>

      {/* Withdrawal Modal */}
      <Modal show={showWithdrawalModal} onHide={handleWithdrawalCancel} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleWithdrawalSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>User *</Form.Label>
              <Form.Select
                value={withdrawalData.userId}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, userId: e.target.value, accountId: '' })}
                required
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account *</Form.Label>
              <Form.Select
                value={withdrawalData.accountId}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, accountId: e.target.value })}
                required
                disabled={!withdrawalData.userId || accounts.length === 0}
              >
                <option value="">
                  {!withdrawalData.userId 
                    ? 'Select a user first' 
                    : accounts.length === 0 
                    ? 'No accounts available' 
                    : 'Select an account'}
                </option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} (Balance: ${parseFloat(account.balance || 0).toFixed(2)})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0.01"
                value={withdrawalData.amount}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                placeholder="Enter withdrawal amount"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={withdrawalData.notes}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, notes: e.target.value })}
                placeholder="Optional notes about this withdrawal"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleWithdrawalCancel}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={!withdrawalData.accountId || !withdrawalData.amount}>
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Service;
