'use client';

import { useEffect, useState } from 'react';

type Tab = 'infos' | 'orders';

interface User {
  email: string;
  name: string;
  createdAt: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
}

const Page = () => {
  const [activeTab, setActiveTab] = useState<Tab>('infos');
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Appel à la route API pour obtenir les informations utilisateur
        const userResponse = await fetch('/api/users');
        if (!userResponse.ok) {
          throw new Error(`User fetch failed with status: ${userResponse.status}`);
        }
        const userData: User = await userResponse.json();
        setUserInfo(userData);

        // Appel à la route API pour obtenir les commandes utilisateur
        const ordersResponse = await fetch('/api/orders');
        if (!ordersResponse.ok) {
          throw new Error(`Orders fetch failed with status: ${ordersResponse.status}`);
        }
        const ordersData: Order[] = await ordersResponse.json();
        setUserOrders(ordersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex border-b">
        <button
          onClick={() => handleTabClick('infos')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'infos' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Personal information
        </button>
        <button
          onClick={() => handleTabClick('orders')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Orders
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'infos' && userInfo && (
          <div>
            <h2 className="text-lg font-semibold pb-2">Profile Information</h2>
            <p>Name: {userInfo.name || 'N/A'}</p>
            <p>Email: {userInfo.email || 'N/A'}</p>
            {/* <p>Created At: {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}</p> */}
          </div>
        )}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold pb-2">Your orders</h2>
            {userOrders.length > 0 ? (
              <ul>
                {userOrders.map((order) => (
                  <li key={order.id}>
                    <p>Order ID: {order.id}</p>
                    <p>Amount: ${order.amount}</p>
                    <p>Status: {order.status}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;