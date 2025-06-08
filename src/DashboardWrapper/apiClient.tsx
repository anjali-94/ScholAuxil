import axios from "axios";
import { auth } from "../firebaseConfig";

export const apiClient = async () => {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    return axios.create({
        baseURL: 'https://backend-scholauxil.onrender.com/api',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
