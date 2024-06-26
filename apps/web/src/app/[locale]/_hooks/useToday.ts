import { useEffect, useState } from "react";

export const useToday = () => {
  const [today, setToday] = useState<Date | undefined>(undefined);

  // Set today's date on the client side
  // as the timezone may differ from the server.
  useEffect(() => {
    setToday(new Date());
  }, []);

  return today;
};
