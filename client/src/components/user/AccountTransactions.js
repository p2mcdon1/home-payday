import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Spinner, Badge, Toast, ToastContainer, Button } from 'react-bootstrap';
import api from '../../utils/api';

function AccountTransactions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccountAndTransactions();
  }, [id]);

  // Auto-dismiss error toast after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchAccountAndTransactions = async () => {
    try {
      setLoading(true);
      const [accountsResponse, transactionsResponse] = await Promise.all([
        api.get(`/kid/accounts`),
        api.get(`/kid/accounts/${id}/transactions`)
      ]);
      
      const account = accountsResponse.data.find(acc => acc.id === id);
      setAccount(account);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusBadge = (transaction) => {
    if (transaction.type === 'pending-effort') {
      return <Badge bg="warning">Pending</Badge>;
    }
    if (transaction.type === 'denied-effort') {
      return <Badge bg="danger">Denied</Badge>;
    }
    if (transaction.type === 'payment') {
      return <Badge bg="success">Done</Badge>;
    }
    if (transaction.type === 'withdrawal') {
      if (transaction.status === 'Pending') {
        return <Badge bg="warning">Pending</Badge>;
      }
      if (transaction.status === 'Done') {
        return <Badge bg="success">Done</Badge>;
      }
    }
    return null;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'payment':
        return 'Payment';
      case 'withdrawal':
        return 'Withdrawal';
      case 'pending-effort':
        return 'Pending Effort';
      case 'denied-effort':
        return 'Denied Effort';
      default:
        return type;
    }
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
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="link"
          className="p-0 me-3"
          onClick={() => navigate('/kid/accounts')}
          style={{ textDecoration: 'none' }}
        >
          ← Back to Accounts
        </Button>
        <h2 className="mb-0">
          {account ? `Transactions - ${account.name}` : 'Transactions'}
        </h2>
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
      </ToastContainer>

      {transactions.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <Card.Title>No Transactions</Card.Title>
            <Card.Text>
              This account has no transactions yet.
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={`${transaction.type}-${transaction.id}`}>
                    <td>{getTypeLabel(transaction.type)}</td>
                    <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                    <td className="fw-bold">
                      {transaction.type === 'payment' ? (
                        <span className="text-success">{formatAmount(transaction.amount)}</span>
                      ) : transaction.type === 'withdrawal' ? (
                        <span className="text-danger">{formatAmount(transaction.amount)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {transaction.type === 'payment' && transaction.choreName && (
                        <span>Chore: {transaction.choreName}</span>
                      )}
                      {transaction.type === 'withdrawal' && (
                        <div>
                          {transaction.loggedByName && (
                            <div className="small text-muted">By: {transaction.loggedByName}</div>
                          )}
                          {transaction.notes && (
                            <div>{transaction.notes}</div>
                          )}
                          {!transaction.loggedByName && !transaction.notes && '-'}
                        </div>
                      )}
                      {(transaction.type === 'pending-effort' || transaction.type === 'denied-effort') && transaction.choreName && (
                        <span>Chore: {transaction.choreName}</span>
                      )}
                      {transaction.type !== 'withdrawal' && !transaction.choreName && !transaction.notes && '-'}
                    </td>
                    <td>
                      {getStatusBadge(transaction) || '-'}
                      {transaction.type === 'denied-effort' && transaction.deniedByName && (
                        <span className="ms-2 text-muted small">
                          by {transaction.deniedByName}
                        </span>
                      )}
                    </td>
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

export default AccountTransactions;
