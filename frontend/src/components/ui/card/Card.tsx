import { motion } from 'framer-motion';
import React from 'react';

const Card = ({ children, className = '', ...props }: React.ComponentPropsWithoutRef<typeof motion.div>) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export default Card; 