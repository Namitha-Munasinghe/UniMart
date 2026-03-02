import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast'; // Import toast for notifications
import { use } from 'react';

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true, // New state to track if we're checking auth status

    signup: async(name, email, studentId, faculty, phone, password, confirmPassword) =>{
        set({ loading: true });
        if(password !== confirmPassword){
            set({ loading: false });
            return toast.error("Passwords do not match");
        }
        try{
            const res = await axios.post('/auth/signup', {name, email, studentId, faculty, phone, password});
            set({ user: res.data.user, loading: false });
            toast.success("Signup successful");
        }catch(error){
            set({ loading: false });
            toast.error(error.response?.data?.message || "an error occurred");

        }
    }

    // login: async (email, password) => {
    //     set({ loading: true });
    //     try {
    //         const res = await axios.post('/auth/login', { email, password });
    //         set({ user: res.data.user, loading: false });
    //         toast.success("Login successful");
    //     } catch (error) {
    //         set({ loading: false });
    //         toast.error(error.response?.data?.message || "an error occurred");
    //     }
    // }
})) 