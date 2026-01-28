import React from 'react';
import { Navbar } from 'react-bootstrap';

/**
 * Reusable welcome text component for dashboard navbars
 * Ensures consistent formatting of welcome messages across the application
 * 
 * @param {Object} user - User object containing name property
 * @param {string} className - Optional additional CSS classes (default: "me-3")
 */
function WelcomeText({ user, className = "me-3" }) {
  if (!user || !user.name) {
    return null;
  }

  return (
    <Navbar.Text className={className}>
      Welcome, {user.name}!
    </Navbar.Text>
  );
}

export default WelcomeText;
