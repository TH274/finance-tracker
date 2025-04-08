import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="text-9xl font-bold text-gray-300 dark:text-gray-700"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        404
      </motion.div>
      
      <motion.h1
        className="mt-5 text-2xl font-bold text-gray-800 dark:text-gray-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Page Not Found
      </motion.h1>
      
      <motion.p
        className="mt-3 text-center text-gray-600 dark:text-gray-400 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Oops! We couldn't find the page you're looking for. Let's get you back on track.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          to="/"
          className="mt-8 flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
        >
          <Home className="mr-2 h-5 w-5" />
          Return Home
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NotFound; 