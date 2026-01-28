import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import KidsList from './adult/KidsList';
import KidDetail from './adult/KidDetail';
import Chores from './adult/Chores';
import Service from './adult/Service';

function AdultDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand>927 Payroll - Adult</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/adult/kids">Kids</Nav.Link>
              <Nav.Link as={Link} to="/adult/chores">Chores</Nav.Link>
              <Nav.Link as={Link} to="/adult/service">Service</Nav.Link>
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
          <Route path="/kids" element={<KidsList />} />
          <Route path="/kids/:id" element={<KidDetail />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/service" element={<Service />} />
          <Route path="/" element={<Navigate to="/adult/kids" />} />
        </Routes>
      </Container>
    </div>
  );
}

export default AdultDashboard;
