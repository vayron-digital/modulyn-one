import { motion } from 'framer-motion';
import React from 'react';

const Badge = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<typeof motion.span>) => (
  <motion.span
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.92 }}
    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
    {...props}
  >
    {children}
  </motion.span>
);

export default Badge; 