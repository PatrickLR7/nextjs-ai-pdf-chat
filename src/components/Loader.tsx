import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

interface LoaderProps {
  width?: string;
  height?: string;
}

const Loader: FC<LoaderProps> = ({ width, height }) => {
  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ height: height ? `calc(${height} + 20px)` : undefined }}
    >
      <div className="relative">
        <div
          className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"
          style={{ width, height }}
        ></div>
        <div
          className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-orange-500 animate-spin"
          style={{ width, height }}
        ></div>
      </div>
    </div>
  );
};

export default Loader;
