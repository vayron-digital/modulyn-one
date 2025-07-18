import { motion } from 'framer-motion';
import React from 'react';

const AnimatedIcon = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof motion.span>) => (
  <motion.span
    whileHover={{ scale: 1.2, rotate: -8 }}
    whileTap={{ scale: 0.9, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    {...props}
  >
    {children}
  </motion.span>
);

export default AnimatedIcon; 