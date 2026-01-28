import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Badge, Toast, ToastContainer } from 'react-bootstrap';
import api from '../../utils/api';

function Chores() {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChores();
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
        <Card>
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

export default Chores;
