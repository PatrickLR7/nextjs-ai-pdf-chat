"use client";

import axios from "axios";
import Loader from "./Loader";
import { useQuery } from "@tanstack/react-query";

type Props = {
  pdf_url: string;
};

const PDFViewer = ({ pdf_url }: Props) => {
  const { data: blob, isLoading } = useQuery({
    queryKey: ["fileBlob", pdf_url],
    queryFn: async () => {
      const fileBlob = (
        await axios.get<Blob>(pdf_url, {
          responseType: "blob",
          headers: {
            "Content-Type": "application/pdf",
          },
        })
      ).data;
      return fileBlob;
    },
  });

  const fileUrl = blob ? URL.createObjectURL(blob) : "";
  return (
    <div className="w-full h-full flex justify-center items-center">
      {isLoading ? (
        <Loader />
      ) : (
        <object data={fileUrl} className="w-full h-full" />
      )}
    </div>
  );
};

export default PDFViewer;
