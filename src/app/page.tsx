'use client'
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface DataItem {
  id: string;
  [key: string]: any;
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "your-collection-name"));
      const items: DataItem[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firestore Data</h1>
      <ul className="space-y-2">
        {data.map(item => (
          <li key={item.id} className="p-4 bg-gray-100 rounded-md shadow-sm">
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}