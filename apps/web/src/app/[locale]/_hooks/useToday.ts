import { useEffect, useState } from "react";

export const useToday = () => {
  const [today, setToday] = useState<Date | undefined>(undefined);

  // Avoid SSR timezone mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date());
  }, []);

  return today;
};
