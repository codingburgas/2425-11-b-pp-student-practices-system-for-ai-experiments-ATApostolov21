import React from 'react';
import { Link } from 'react-router-dom';

const SummaryCard = ({ 
  title, 
  count, 
  description, 
  icon, 
  gradientFrom, 
  gradientTo, 
  bgColor, 
  linkText, 
  linkUrl, 
  linkIcon 
}) => {
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${gradientFrom}-500 to-${gradientTo}-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>
      <div className="relative bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between">
          <h4 className="text-gray-800 font-semibold">
            {title}
          </h4>
          <span className={`p-2 bg-${bgColor}-100 text-${bgColor}-600 rounded-lg`}>
            {icon}
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
        {linkText && linkUrl && (
          <Link to={linkUrl} className={`mt-4 inline-flex items-center text-sm text-${bgColor}-600 hover:text-${bgColor}-800 font-medium`}>
            {linkText}
            {linkIcon || (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SummaryCard; 