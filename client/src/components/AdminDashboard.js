import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import EmployeesList from './admin/EmployeesList';
import EmployeeDetail from './admin/EmployeeDetail';
import TransactionsList from './admin/TransactionsList';

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand>Home Payday - Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/employees">Employees</Nav.Link>
              <Nav.Link as={Link} to="/admin/transactions">Transactions</Nav.Link>
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">Welcome, {user.name}</Navbar.Text>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-4">
        <Routes>
          <Route path="/employees" element={<EmployeesList />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/transactions" element={<TransactionsList />} />
          <Route path="/" element={<Navigate to="/admin/employees" />} />
        </Routes>
      </Container>
    </div>
  );
}

export default AdminDashboard;
