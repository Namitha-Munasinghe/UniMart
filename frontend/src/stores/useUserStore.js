import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async ({ name, email, studentId, faculty, phone, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

	try {
			const res = await axios.post("/auth/signup", { name, email, studentId, faculty, phone, password });
			set({ user: res.data, loading: false });
			toast.success("Profile created successfully");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({ user: res.data, loading: false });
			toast.success("Login successful");
		} catch (error) {
			set({ user: null, loading: false });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
			toast.success("You have been logged out");
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	deleteAccount: async () => {
		try {
			set({ loading: true });
			const res = await axios.delete("/users/delete-account");
			set({ user: null, loading: false });
			toast.success(res.data?.message || "Account deleted successfully");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Failed to delete account");
			return false;
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile", {
				skipAuthRefresh: true,
			});
			set({ user: response.data, checkingAuth: false });
		} catch {
			set({ checkingAuth: false, user: null });
		}
	},
    

	refreshToken: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
	updateProfile: async (data) => {
  try {
    set({ loading: true });

    const res = await axios.put("/users/update-profile", data);

    set({
      user: res.data,
      loading: false
    });

    toast.success("Profile updated successfully");

  } catch (error) {
    set({ loading: false });
    toast.error(error.response?.data?.message || "Update failed");
  }
},
}));

let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
		async (error) => {
			const originalRequest = error.config;
			if (
				error.response?.status === 401 &&
				!originalRequest?.skipAuthRefresh &&
				!originalRequest._retry &&
				originalRequest?.url !== "/auth/refresh-token"
			) {
				originalRequest._retry = true;

			try {
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);
