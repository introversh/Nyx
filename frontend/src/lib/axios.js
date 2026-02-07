import axios from "axios"

export const axiosInstance = axios.create({
    baseURL:"https://nyx-6amq.onrender.com/api",
    withCredentials:true,
    
})