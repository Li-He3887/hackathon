import axios from 'axios';

const api = axios.create({
    baseUrl: process.env.FSAT_API_URL
})

// upload picture to server
export const uploadPicture = () => 
    api.post(`/api/test`, {
        formData
    })