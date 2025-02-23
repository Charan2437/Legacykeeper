import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight } from 'lucide-react';

const data = [
  { name: 'JAN', debits: 4000, investments: 2400 },
  { name: 'FEB', debits: 3000, investments: 1398 },
  { name: 'MAR', debits: 2000, investments: 9800 },
  { name: 'APR', debits: 2780, investments: 3908 },
  { name: 'MAY', debits: 1890, investments: 4800 },
  { name: 'JUN', debits: 2390, investments: 3800 },
  { name: 'JUL', debits: 3490, investments: 4300 },
];

const transactions = [
  {
    id: 1,
    date: '21-03-2024',
    name: 'Netflix Subscription',
    type: 'Paid',
    method: 'Phone Pay',
    amount: '₹1,499',
  },
  {
    id: 2,
    date: '17-03-2024',
    name: 'Amazon Prime Subscription',
    type: 'Renewal',
    method: 'Google Pay',
    amount: '₹1,499',
  },
  {
    id: 3,
    date: '16-03-2024',
    name: 'Telecom Recharge',
    type: 'Paid',
    method: 'Phone Pay',
    amount: '₹1,499',
  },
];

interface StatCardProps {
  title: string;
  count: string;
  link: string;
}

function StatCard({ title, count, link }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-3xl font-semibold text-gray-900">{count}</p>
        <a
          href={link}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          View Details
          <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Requests" count="06" link="#" />
        <StatCard title="Nominees" count="04" link="#" />
        <StatCard title="Trustees" count="02" link="#" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="space-x-4">
            <button className="text-indigo-600 font-medium">Debits</button>
            <button className="text-gray-500 hover:text-gray-700">Investments</button>
          </div>
          <select className="border-gray-300 rounded-lg text-sm">
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="debits"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="investments"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Transactions (32)
            </h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              See all
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded hover:bg-gray-100">
                <ArrowRight className="h-5 w-5 transform rotate-180" />
              </button>
              <span className="text-sm text-gray-700">Page 1 of 3</span>
              <button className="p-2 rounded hover:bg-gray-100">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}