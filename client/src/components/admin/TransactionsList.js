import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import api from '../../utils/api';

function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/transactions?limit=100');
      setTransactions(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" />
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
      <h2 className="mb-4">All Transactions</h2>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {transactions.length === 0 ? (
        <Alert variant="info" className="text-center">
          No transactions found
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.created_at).toLocaleString()}</td>
                    <td>
                      {transaction.employee_name} ({transaction.employee_code})
                    </td>
                    <td>
                      <Badge bg={getBadgeVariant(transaction.transaction_type)}>
                        {transaction.transaction_type.toUpperCase()}
                      </Badge>
                    </td>
                    <td
                      className={`fw-bold ${
                        transaction.transaction_type === 'earn'
                          ? 'text-success'
                          : 'text-danger'
                      }`}
                    >
                      {transaction.transaction_type === 'earn' ? '+' : '-'}$
                      {parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td>{transaction.description || '-'}</td>
                    <td>{transaction.created_by_name || '-'}</td>
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

export default TransactionsList;
