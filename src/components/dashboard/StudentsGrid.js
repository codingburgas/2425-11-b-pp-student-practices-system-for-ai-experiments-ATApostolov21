import React from 'react';

const StudentsGrid = ({ students, models, isVisible }) => {
  return (
    <div id="students" className={`mb-10 transition-all duration-1000 delay-200 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </span>
        Your Students
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => {
          const studentModels = models.filter(m => m.createdBy === student.username);
          
          return (
            <div key={student.username} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{student.username}</h4>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                      <span>
                        {studentModels.length} {studentModels.length === 1 ? 'model' : 'models'}
                      </span>
                    </div>
                    {studentModels.length > 0 && (
                      <div className="mt-3 flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Best R²:</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          Math.max(...studentModels.map(m => m.metrics.r2)) > 0.8 ? 'bg-green-100 text-green-800' : 
                          Math.max(...studentModels.map(m => m.metrics.r2)) > 0.6 ? 'bg-blue-100 text-blue-800' : 
                          Math.max(...studentModels.map(m => m.metrics.r2)) > 0.4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {Math.max(...studentModels.map(m => m.metrics.r2)).toFixed(4)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentsGrid; 