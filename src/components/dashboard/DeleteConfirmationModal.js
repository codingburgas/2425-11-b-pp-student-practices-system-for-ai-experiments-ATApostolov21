import React from 'react';

const DeleteConfirmationModal = ({ 
  isModelDelete, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="relative animate-fade-in-up">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur opacity-20"></div>
        <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Confirm {isModelDelete ? 'Model' : 'Dataset'} Deletion
          </h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this {isModelDelete ? 'model' : 'dataset'}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              Delete {isModelDelete ? 'Model' : 'Dataset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 