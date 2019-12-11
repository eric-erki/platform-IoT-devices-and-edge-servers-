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
import theme from '../../theme';

const variants = {
  variants: {
    primary: {
      color: 'black',
      bg: 'primary',
      border: 0,
      '&:not(:disabled):hover': {
        bg: 'transparent',
        color: theme.colors.primary,
        boxShadow: `0px 0px 0px 3px ${theme.colors.primary} inset`,
      },
      '&:not(:disabled):focus': {
        bg: 'transparent',
        color: theme.colors.primary,
        boxShadow: `0px 0px 0px 3px ${theme.colors.primary} inset`,
      },
    },
    secondary: {
      color: 'white',
      border: 0,
      borderColor: 'white',
      '&:not(:disabled):hover': {
        boxShadow: `0px 0px 0px 3px #fff inset`,
      },
      '&:not(:disabled):focus': {
        boxShadow: `0px 0px 0px 3px #fff inset`,
      },
    },
    tertiary: {
      color: 'white',
      border: 0,
      borderColor: 'white',
      padding: 1,
      fontSize: 0,
      '&:not(:disabled):hover': {
        color: 'black',
        bg: 'white',
      },
      '&:not(:disabled):focus': {
        color: 'black',
        bg: 'white',
      },
    },
    text: {
      color: 'white',
      border: 'none',
      opacity: 0.8,
      padding: 0,
      '&:not(:disabled):hover': {
        opacity: 1,
      },
      '&:not(:disabled):focus': {
        opacity: 1,
      },
    },
    icon: {
      bg: 'transparent',
      border: 'none',
      padding: 0,
    },
  },
};

const defaultProps = {
  variant: 'primary',
  fontSize: 1,
  fontWeight: 2,
  borderRadius: 1,
  boxShadow: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  bg: 'transparent',
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
  transform: translateZ(0);
  backface-visibility: hidden;

  &:disabled {
    cursor: not-allowed;
    opacity: .4;
  }

  &:focus {
    outline: none;
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
  transition: all 200ms;
  padding: 10px 12px;
  transform: translateZ(0);
  backface-visibility: hidden;

  &:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

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
