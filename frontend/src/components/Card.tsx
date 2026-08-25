import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'warning';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick
}) => {
  const baseStyles = 'rounded-3xl shadow-lg p-6 md:p-8 transition-shadow';
  
  const variants = {
    default: 'bg-white',
    highlight: 'bg-blue-50 border-2 border-blue-100',
    warning: 'bg-orange-50 border-2 border-orange-100'
  };

  const clickableStyles = onClick ? 'cursor-pointer hover:shadow-xl' : '';
  const classes = `${baseStyles} ${variants[variant]} ${clickableStyles} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};
