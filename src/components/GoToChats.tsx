"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

type Props = {
  href: string;
};

export const GoToChats = ({ href }: Props) => {
  const router = useRouter();
  const handleGotoChatsClick = () => {
    router.push(href);
  };
  return (
    <Button
      className="text-white bg-orange-500 hover:bg-orange-600"
      onClick={handleGotoChatsClick}
    >
      Go to Chats
    </Button>
  );
};

export default GoToChats;
