import axios from "./axios";

export const fetchTimesheets = () => axios.get("/timesheets");

export const addTimesheet = (data) => axios.post("/timesheets", data);

export const deleteTimesheet = (id) => axios.delete(`/timesheets/${id}`);

export const updateTimesheet = (id, data) => axios.put(`/timesheets/${id}`, data);

