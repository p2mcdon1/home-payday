import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, Table, Button, Spinner, Toast, ToastContainer, Badge } from 'react-bootstrap';
import api from '../../utils/api';

function Service() {
  const [activeTab, setActiveTab] = useState('pending-payments');
  const [pendingEfforts, setPendingEfforts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'pending-payments') {
      fetchPendingEfforts();
    }
  }, [activeTab]);

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
      <h2 className="mb-4">Service</h2>
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
    </div>
  );
}

export default Service;
