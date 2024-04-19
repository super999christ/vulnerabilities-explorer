import { useState } from 'react';
import './App.css';
import Spinner from './components/Spinner';
import CvssScore from './components/CvssScore';
import axios from 'axios';
import { Environment } from './constants/base';

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
      // const { data } = await axios.get(`${Environment.SERVER_BASE_URL}/api/vulnerabilities`);
      // setVulnerabilities(data);
      setVulnerabilities([
        {
          id: 0,
          cve_id: '2024-0001',
          published: new Date(),
          status: 'Analyzed',
          description: 'An information exposure vulnerability in the Palo Alto Networks Cortex XDR agent on Windows devices allows a local system administrator to disclose the admin password for the agent in cleartext, which bad actors can then use to execute privileged cytool commands that disable or uninstall the agent.',
          cvss_score: 9.1
        },
        {
          id: 1,
          cve_id: '2024-0001',
          published: new Date(),
          status: 'Analyzed',
          description: 'An information exposure vulnerability in the Palo Alto Networks Cortex XDR agent on Windows devices allows a local system administrator to disclose the admin password for the agent in cleartext, which bad actors can then use to execute privileged cytool commands that disable or uninstall the agent.',
          cvss_score: 9.1
        },
      ])
    } catch (err) {
      console.log("Error while fetching data: ", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='App'>
      <div className='flex flex-col justify-center h-full'>
        <main className='min-w-[400px] md:min-w-[600px] lg:min-w-[800px] min-h-[600px] border rounded-xl border-solid bg-gray-900 m-auto p-4'>
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
          <div className=''>
            <table className="min-w-full divide-y divide-gray-300">
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
                      {vul.published.toDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200 max-w-[350px]">
                      {vul.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200">
                      {vul.status}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-200">
                      <div style={{ scale: '0.5' }}>
                        <CvssScore score={vul.cvss_score} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
