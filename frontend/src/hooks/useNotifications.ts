import { useQuery } from "@tanstack/react-query";
import apiRequest from "../utils/apiRequest";

export const useNotifications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest.get("/notifications").then((res) => res.data),
    enabled,
  });
};