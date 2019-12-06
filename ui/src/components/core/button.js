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
      '&:not(:disabled):hover': {
        color: 'primary',
        bg: 'black',
      },
    },
    secondary: {
      color: 'white',
      bg: 'transparent',
      borderColor: 'white',
      '&:not(:disabled):hover': {
        color: 'black',
        bg: 'white',
      },
    },
    tertiary: {
      color: 'white',
      bg: 'transparent',
      border: 'none',
      opacity: 0.8,
      padding: 0,
      '&:not(:disabled):hover': {
        opacity: 1,
      },
    },
  },
};

const defaultProps = {
  variant: 'primary',
  paddingY: '10px',
  paddingX: 3,
  fontSize: 1,
  fontWeight: 4,
  borderRadius: 1,
  border: 0,
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

  &:disabled {
    cursor: not-allowed;
  }

  transition: all 250ms;

  &:disabled {
    opacity: .4;
  }

  ${space} ${layout} ${typography} ${color} ${border} ${shadow} ${flexbox}

  ${variant(variants)}
`;

Btn.defaultProps = defaultProps;

export const LinkButton = styled.a`
  text-decoration: none;
  font-family: inherit;
  cursor: pointer;
  text-transform: capitalize;

  &:disabled {
    opacity: .4;
  }

  &:disabled {
    cursor: not-allowed;
  }

  transition: all 250ms;

  ${space} ${layout} ${typography} ${color} ${border} ${shadow} ${flexbox}

  ${variant(variants)}
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
