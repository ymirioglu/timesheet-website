import axios from "./axios";

export const fetchAllUsers = () => axios.get("/admin/users");

export const fetchUserTimesheets = (userId, customUrl = null) => {
  return customUrl
    ? axios.get(customUrl)
    : axios.get(`/admin/timesheets?userId=${userId}`);
};

