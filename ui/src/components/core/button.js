import React from 'react';
import styled from 'styled-components';
import {
  space,
  layout,
  color,
  border,
  typography,
  variant,
  shadow,
  flexbox,
} from 'styled-system';
import { useLinkProps } from 'react-navi';

const variants = {
  variants: {
    primary: {
      color: 'black',
      bg: 'primary',
      border: 0,
      '&:not(:disabled):hover': {
        color: 'primary',
        bg: 'black',
      },
      '&:not(:disabled):focus': {
        color: 'primary',
        bg: 'black',
      },
    },
    secondary: {
      color: 'black',
      bg: 'white',
      border: 0,
      borderColor: 'white',
      '&:not(:disabled):hover': {
        color: 'white',
        bg: 'black',
      },
      '&:not(:disabled):focus': {
        color: 'white',
        bg: 'black',
      },
    },
    tertiary: {
      color: 'white',
      bg: 'transparent',
      border: 0,
      borderColor: 'white',
      padding: '6px',
      '&:not(:disabled):hover': {
        color: 'black',
        bg: 'white',
      },
      '&:not(:disabled):focus': {
        color: 'black',
        bg: 'white',
      },
    },
  },
};

const defaultProps = {
  variant: 'primary',
  fontSize: 1,
  fontWeight: 4,
  borderRadius: 1,
  boxShadow: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export const Btn = styled.button`
  appearance: none;
  border: none;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 200ms;
  padding: 10px 12px;

  &:disabled {
    cursor: not-allowed;
    opacity: .4;
  }

  &:focus {
    outline: none !important;
  }

  ${variant(variants)}

  ${space} ${layout} ${typography} ${color} ${border} ${shadow} ${flexbox}
`;

Btn.defaultProps = defaultProps;

export const LinkButton = styled.a`
  text-decoration: none;
  font-family: inherit;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 200ms;
  padding: 10px 12px;

  &:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  &:focus {
    outline: none !important;
  }

  ${variant(variants)}

  ${space} ${layout} ${typography} ${color} ${border} ${shadow} ${flexbox}
`;
LinkButton.defaultProps = defaultProps;

const Button = ({ href, title, onClick, ...rest }) => {
  if (href) {
    return (
      <LinkButton {...useLinkProps({ href, onClick })} {...rest}>
        {title}
      </LinkButton>
    );
  }

  return (
    <Btn onClick={onClick} {...rest}>
      {title}
    </Btn>
  );
};

Button.defaultProps = {
  href: null,
  title: '',
};

export default Button;
