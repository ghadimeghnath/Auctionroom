import { useEffect } from "react";
import { socket } from "../socket";
import { celebrate } from "../utils/celebrate";

export function useCelebration() {
  useEffect(() => {
    const onPlayerSold = () => {
      celebrate();
    };

    socket.on("playerSold", onPlayerSold);

    return () => {
      socket.off("playerSold", onPlayerSold);
    };
  }, []);
}