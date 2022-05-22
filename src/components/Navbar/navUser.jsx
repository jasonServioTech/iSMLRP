import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const NavUserContainer = styled.div`
  display: flex;
  margin-left: 10px;
  align-items: center;
`;

export function NavUsers(props) {
  const { currentUser } = useAuth();

  return (
    <NavUserContainer>
      user: {currentUser ? currentUser.email : ''}
    </NavUserContainer>
  );
}
