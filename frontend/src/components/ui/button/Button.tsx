import { motion } from 'framer-motion';
import React from 'react';

const AnimatedButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof motion.button>>(({ children, ...props }, ref) => (
  <motion.button
    whileHover={{ scale: 1.04, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    ref={ref}
    {...props}
  >
    {children}
  </motion.button>
));

AnimatedButton.displayName = 'AnimatedButton';
export default AnimatedButton; 