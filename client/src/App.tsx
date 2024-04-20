// import external dependencies
import axios from 'axios';
import { useState } from 'react';

// import local dependencies
import Spinner from './components/Spinner';
import CvssScore from './components/CvssScore';
import { Environment } from './constants/base';

// import css dependencies
import './App.css';

interface IVulnerability {
  id: number;
  cve_id: string;
  published: Date;
  status: string;
  description: string;
  cvss_score: number;
}

function App() {
  const [isLoading, setLoading] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<IVulnerability[]>([]);
  
  const onSearch = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${Environment.SERVER_BASE_URL}/api/vulnerabilities`);
      setVulnerabilities(data.slice(0, 100));
    } catch (err) {
      console.error("Error while fetching data: ", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='App max-sm:px-0'>
      <div className='flex flex-col justify-center h-full'>
        <div className='min-w-[400px] max-w-full md:min-w-[600px] lg:min-w-[800px] min-h-[600px] border rounded-xl border-solid bg-gray-900 m-auto p-4 overflow-auto'>
          <div className='flex justify-center'>
            <button
              className='w-[200px] bg-green-500 hover:bg-green-700 disabled:bg-green-200 h-10 rounded-md flex justify-center items-center gap-1'
              onClick={onSearch}
              disabled={isLoading}
            >
              Search Vulnerabilities
              {isLoading && <Spinner />}
            </button>
          </div>
          <div>
            <table className="min-w-full max-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-0">
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                    Published
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                    Description
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-200">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vulnerabilities.map(vul => (
                  <tr key={vul.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-200 sm:pl-0">
                      {vul.cve_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200">
                      {new Date(vul.published).toDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200 max-w-[150px] sm:max-w-[350px]">
                      {vul.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200">
                      {vul.status}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200">
                      <div style={{ scale: '0.5' }} className='hidden lg:block'>
                        <CvssScore score={vul.cvss_score} />
                      </div>
                      <div className='block lg:hidden text-lg'>
                        {vul.cvss_score}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
