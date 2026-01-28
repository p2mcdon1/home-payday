import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import UsersList from './admin/UsersList';
import UserDetail from './admin/UserDetail';
import Chores from './admin/Chores';
import Service from './admin/Service';
import UserMenu from './common/UserMenu';
import { setCurrentUser } from '../utils/auth';

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUserState] = useState(user);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUserState(updatedUser);
    setCurrentUser(updatedUser);
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
              <Nav.Link as={Link} to="/admin/service">Service</Nav.Link>
            </Nav>
            <UserMenu user={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-4">
        <Routes>
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/service" element={<Service />} />
          <Route path="/" element={<Navigate to="/admin/users" />} />
        </Routes>
      </Container>
    </div>
  );
}

export default AdminDashboard;
