import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModel } from '../context/ModelContext';

const UploadDataset = () => {
  const [file, setFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { uploadDataset } = useModel();
  const navigate = useNavigate();
  
  // Animation effect on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please upload a CSV file');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');

    // Create default dataset name from file name
    if (selectedFile && !datasetName) {
      const fileName = selectedFile.name.replace('.csv', '');
      setDatasetName(fileName);
    }

    // Parse and preview CSV
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvData = parseCSV(event.target.result);
          setPreviewData(csvData);
        } catch (err) {
          setError('Error parsing CSV file: ' + err.message);
          setPreviewData(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    
    // Extract headers (first row)
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Process data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(value => value.trim());
        const row = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j];
        }
        data.push(row);
      }
    }
    
    return { headers, data };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    if (!datasetName.trim()) {
      setError('Please enter a dataset name');
      return;
    }
    
    if (!previewData) {
      setError('Unable to parse the dataset');
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload dataset
      uploadDataset(datasetName, previewData.data, previewData.headers);
      
      // Navigate to train model page
      navigate('/train');
    } catch (err) {
      setError('Error uploading dataset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="animate-float-slow absolute top-20 left-[10%] w-72 h-72 bg-indigo-600 opacity-5 rounded-full blur-3xl"></div>
        <div className="animate-float-delayed absolute bottom-20 right-[15%] w-80 h-80 bg-purple-600 opacity-5 rounded-full blur-3xl"></div>
      </div>
      
      <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-10"></div>
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
                Upload Dataset
              </h2>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md" role="alert">
                  <p>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="datasetName" className="block text-gray-700 text-sm font-medium mb-2">
                    Dataset Name
                  </label>
                  <input
                    id="datasetName"
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="input-modern w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter a name for your dataset"
                  />
                </div>
                
                <div>
                  <label htmlFor="file" className="block text-gray-700 text-sm font-medium mb-2">
                    Upload CSV File
                  </label>
                  <div className="relative">
                    <input
                      id="file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="block w-full text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Please upload a CSV file with headers in the first row
                  </p>
                </div>
                
                {previewData && (
                  <div className={`overflow-x-auto transition-all duration-500 ease-out transform ${previewData ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <h3 className="text-gray-700 text-lg font-semibold mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      Data Preview
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-modern">
                          <thead className="bg-gray-50">
                            <tr>
                              {previewData.headers.map((header, index) => (
                                <th
                                  key={index}
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {previewData.data.slice(0, 5).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                {previewData.headers.map((header, colIndex) => (
                                  <td
                                    key={`${rowIndex}-${colIndex}`}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {row[header]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {previewData.data.length > 5 && (
                        <div className="py-2 px-4 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
                          Showing 5 of {previewData.data.length} rows
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : 'Upload Dataset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDataset; 