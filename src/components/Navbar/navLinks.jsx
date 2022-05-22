import React from 'react';
import styled from 'styled-components';

const NavLinksContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

const LinksWrapper = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
  height: 100%;
  list-style: none;
`;

const LinkItem = styled.li`
  height: 100%;
  padding: 0 1.1em;
  color: #222;
  font-weight: 500;
  font-size: 14px;
  align-items: center;
  justify-content: center;
  display: flex;
  border-top: 5px solid transparent;
  transition: all 220ms ease-in-out;

  &:hover {
    border-top: 2px solid #0071bd;
  }
`;

const Link = styled.a`
  text-decoration: none;
  color: inherit;
  font-size: inherit;
`;

export function NavLinks(props) {
  return (
    <NavLinksContainer>
      <LinksWrapper>
        <LinkItem>
          <Link href="/Borrower">Borrower</Link>
        </LinkItem>
        <LinkItem>
          <Link href="/Loan">Loan</Link>
        </LinkItem>
        <LinkItem>
          <Link href="/Transaction">Transaction</Link>
        </LinkItem>
        <LinkItem>
          <Link href="/Ledger">Ledger</Link>
        </LinkItem>
        <LinkItem>
          <Link href="/Report">Reports</Link>
        </LinkItem>
      </LinksWrapper>
    </NavLinksContainer>
  );
}
