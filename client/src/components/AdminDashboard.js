import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import UsersList from './admin/UsersList';
import UserDetail from './admin/UserDetail';
import Chores from './admin/Chores';

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
          <Navbar.Brand>927 Payroll - Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
              <Nav.Link as={Link} to="/admin/chores">Chores</Nav.Link>
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
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/" element={<Navigate to="/admin/users" />} />
        </Routes>
      </Container>
    </div>
  );
}

export default AdminDashboard;
