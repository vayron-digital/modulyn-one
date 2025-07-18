import { motion } from 'framer-motion';
import React, { useState } from 'react';

const AnimatedInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<typeof motion.input>>(
  ({ className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <motion.input
        ref={ref}
        className={`transition-all duration-200 border rounded px-3 py-2 outline-none ${className}`}
        style={{ boxShadow: isFocused ? '0 0 0 2px #6366f1' : 'none' }}
        animate={{
          scale: isFocused ? 1.03 : 1,
          borderColor: isFocused ? '#6366f1' : '#e5e7eb',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        onFocus={e => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';
export default AnimatedInput; 