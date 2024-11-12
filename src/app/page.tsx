'use client';
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface DataItem {
  id: string;
  imageUrls: string[];
  reviewed: boolean;
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        const studentsData = querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            imageUrls: docData.imageUrls || [],
            reviewed: docData.reviewed || false,
          };
        });

        setData(studentsData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firestore Data</h1>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.id} className="p-4 bg-gray-100 rounded-md shadow-sm">
            <p><strong>ID:</strong> {item.id}</p>
            <p><strong>Reviewed:</strong> {item.reviewed ? "Yes" : "No"}</p>
            <div className="mt-2">
              <strong>Image URLs:</strong>
              <ul className="list-disc ml-4">
                {item.imageUrls.map((url, index) => (
                  <li key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}