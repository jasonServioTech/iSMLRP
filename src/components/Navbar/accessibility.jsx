import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const AccessibilityContainer = styled.div`
  display: flex;
  margin-left: 10px;
`;

const LogoutButton = styled.button`
  border: 0;
  outline: 0;
  padding: 8px 1em;
  color: #222;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  background-color: transparent;
  border: 2px solid #27ae61;
  transition: all 240ms ease-in-out;
  cursor: pointer;

  &:hover {
    color: #fff;
    background-color: #27ae61;
  }

  &:not(:last-of-type) {
    margin-right: 7px;
  }
`;

export function Accessibility(props) {
  const [error, setError] = useState('');
  const { logout } = useAuth();

  async function handleLogout() {
    setError('');

    try {
      await logout();
      this.context.history.push('/login');
    } catch {
      setError('Failed to log out');
      console.log(error);
    }
  }

  return (
    <AccessibilityContainer>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </AccessibilityContainer>
  );
}
