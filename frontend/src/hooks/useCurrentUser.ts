import { useQuery } from "@tanstack/react-query";
import apiRequest from "../utils/apiRequest";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () =>
      apiRequest.get("/users/auth/me").then((res) => res.data),
    retry: false,
  });
};