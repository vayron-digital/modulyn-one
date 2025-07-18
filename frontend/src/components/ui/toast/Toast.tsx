import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {toasts.map((toast) => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="toast"
    >
      {/* ...toast content... */}
    </motion.div>
  ))}
</AnimatePresence> 