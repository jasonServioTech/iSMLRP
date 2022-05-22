import React from 'react';
import styled from 'styled-components';
import LogoMain from '../../assets/Images/Logo.png';
import Servio from '../../assets/Images/Servio.webp';

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImg = styled.div`
  width: 29px;
  height: 29px;

  img {
    width: 100%;
    height: 100%;
  }
`;

const LogoImgFooter = styled.div`
  display: spae-evenly;
  width: 142;
  height: 40px;

  img {
    width: 142px;
    height: 40px;
  }
`;

const LogoText = styled.h2`
  font-size: 16px;
  margin: 0;
  margin-left: 4px;
  color: #222;
  font-weight: 500;
`;

export function Logo(props) {
  return (
    <LogoWrapper>
      <LogoImg>
        <img src={LogoMain} alt="Logo" />
      </LogoImg>
      <LogoText>iSMLRP</LogoText>
    </LogoWrapper>
  );
}

export function Footer(props) {
  return (
    <LogoImgFooter>
      {'Powered by: '} <img src={Servio} alt="Logo" />{' '}
      {new Date().getFullYear()}
      {'.'}
    </LogoImgFooter>
  );
}
