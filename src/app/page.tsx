"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase"; // Adjust the path as needed
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Student {
  id: string;
  imageUrls: string[];
  reviewed: boolean;
}

export default function ReviewImages() {
  const [student, setStudent] = useState<Student | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [responses, setResponses] = useState<{ [url: string]: boolean }>({});
  const [isClient, setIsClient] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true when the component mounts on the client

    const fetchOrRestoreStudent = async () => {
      if (typeof window !== "undefined") {
        const savedStudentId = localStorage.getItem("studentId");
        const savedImageIndex = localStorage.getItem("currentImageIndex");

        if (savedStudentId) {
          const studentRef = doc(db, "students", savedStudentId);
          const studentSnapshot = await getDoc(studentRef);

          if (studentSnapshot.exists()) {
            const studentData = studentSnapshot.data() as Student;
            setStudent({
              id: studentSnapshot.id,
              imageUrls: studentData.imageUrls,
              reviewed: studentData.reviewed,
            });

            if (savedImageIndex) {
              setCurrentImageIndex(parseInt(savedImageIndex, 10));
            }
          }
        } else {
          const studentsRef = collection(db, "students");
          const q = query(studentsRef, where("reviewed", "==", false));
          const querySnapshot = await getDocs(q);

          const unreviewedStudents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as DocumentData),
          })) as Student[];

          if (unreviewedStudents.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * unreviewedStudents.length
            );
            const selectedStudent = unreviewedStudents[randomIndex];
            setStudent(selectedStudent);
            localStorage.setItem("studentId", selectedStudent.id);
          } else {
            console.log("No unreviewed students found");
          }
        }
      }
    };

    fetchOrRestoreStudent();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentImageIndex", currentImageIndex.toString());
    }
  }, [currentImageIndex]);

  const handleResponse = (response: boolean) => {
    if (student) {
      const currentUrl = student.imageUrls[currentImageIndex];
      setResponses((prev) => ({
        ...prev,
        [currentUrl]: response,
      }));

      if (currentImageIndex < student.imageUrls.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (student) {
      try {
        const studentRef = doc(db, "students", student.id);
        await updateDoc(studentRef, {
          responses,
          reviewed: true,
        });

        alert("Responses saved successfully!");
        localStorage.removeItem("studentId");
        localStorage.removeItem("currentImageIndex");
        setStudent(null);
        setResponses({});
        setCurrentImageIndex(0);
      } catch (error) {
        console.error("Error updating document:", error);
      }
    }
  };

  const progress = student
    ? ((currentImageIndex + 1) / student.imageUrls.length) * 100
    : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Review Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {student ? (
          <>
            <div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {currentImageIndex + 1}/{student.imageUrls.length} images
                reviewed
              </p>
            </div>

            <div className="aspect-video relative rounded-lg overflow-hidden">
              {student && student.imageUrls[currentImageIndex] ? (
                <Image
                  src={student.imageUrls[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <p className="text-center">Image not available</p>
              )}
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold">Suggested Grade: 3</p>
              <p className="text-sm text-muted-foreground">
                Do you agree with this grade?
              </p>
            </div>
          </>
        ) : (
          <p className="text-center">Loading student data...</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button
          onClick={() => handleResponse(true)}
          variant="default"
          disabled={!student}
        >
          Agree
        </Button>
        <Button
          onClick={() => handleResponse(false)}
          variant="outline"
          disabled={!student}
        >
          Disagree
        </Button>
      </CardFooter>
      <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-full"
          >
            Grading Instructions
            {showInstructions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <Card>
            <CardContent className="p-4 text-sm">
              <h3 className="font-semibold mb-2">Grading Considerations:</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>
                  Defect Size: The relative size of any defect compared to the
                  garment.
                </li>
                <li>
                  Color Contrast: How noticeable a defect is based on the color
                  difference with the surrounding area.
                </li>
                <li>
                  Defect Location: The impact of a defect depends on where it
                  is, with higher importance placed on areas like the top,
                  armpit, or crotch.
                </li>
                <li>
                  Formality of Clothing: More formal items (e.g., a dress shirt)
                  are graded more strictly than casual items (e.g., ripped
                  jeans).
                </li>
              </ul>
              <h3 className="font-semibold mt-4 mb-2">Grading Scale:</h3>
              <ul className="list-none space-y-1">
                <li>
                  <strong>Grade 1:</strong> Excellent – Like new; no signs of
                  wear, stains, or damage.
                </li>
                <li>
                  <strong>Grade 2:</strong> Good – Minor wear like slight fading
                  or pilling; no major damage.
                </li>
                <li>
                  <strong>Grade 3:</strong> Fair – Noticeable wear, minor
                  stains, or small tears, but still wearable.
                </li>
                <li>
                  <strong>Grade 4:</strong> Poor – Significant wear, multiple
                  stains, or damage; usable only in limited cases.
                </li>
                <li>
                  <strong>Grade 5:</strong> Very Poor – Heavily damaged or worn;
                  unusable in current form.
                </li>
              </ul>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
