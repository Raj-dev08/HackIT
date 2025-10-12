import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useHackStore = create((set, get) => ({
    hackathons: [],
    isLoading: false,
    hasMoreHackathons:true,
    userHackathons:[],
    searchFilter:"",
    clickedHackathon:null,
    updatingHackathon:[],


    setUpdatingHackathon: (data) => set({updatingHackathon:data}),

    changeSearchFilter: (data) => {
        set({ searchFilter : data, hackathons : [], hasMoreHackathons : true })
    },

    getHackathons: async(limit,skip) =>{
        set({isLoading:true})
        try {
            const search = get().searchFilter;
            const query = `/service/api?limit=${limit}&skip=${skip}${ search ? `&search=${search}`:""}`
            const res = await axiosInstance.get(query)

           
            const existing = new Set(get().hackathons.map((h) => h._id));
            const newOnes = res.data.hackathons.filter((h) => !existing.has(h._id));

            set((state) => ({
                hackathons: [...state.hackathons, ...newOnes],
                hasMoreHackathons: res.data.hasMore,
                isLoading: false,
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load projects");
            set({ isLoadingProjects: false });
        }
    },
    getUserHackathons: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/service/api/user-hackathons");
            set({ userHackathons: res.data.hackathons, isLoading: false });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load your hackathons");
            set({ isLoading: false });
        }
    },
    getHackathonDetail: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/service/api/${id}`);
            set({ clickedHackathon: res.data.hackathon, isLoading: false });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load hackathon details");
            set({ isLoading: false });
        }
    },
    createHackathon: async (data) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post("/service/api/create", data);
            toast.success("Hackathon created successfully!");
            set((state) => ({
                userHackathons: [res.data.newHackathon, ...state.userHackathons],
                isLoading: false,
            }));
            return true
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create hackathon");
            set({ isLoading: false });
            return false
        }
    },
    voteHackathon: async (id, method,authUser) => {
        try {
            if (!["like", "dislike"].includes(method)) {
               toast.error("Invalid Method");
               return;
            }
            const res = await axiosInstance.post(`/service/api/vote/${id}?method=${method}`);
            set((state)=>({
                hackathons: state.hackathons.map((h)=>
                    h._id === id? res.data.hackathon : h 
                )
            }))
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to vote");
        }
    },
    giveReview: async (id, review) => {
        try {
            const res = await axiosInstance.post(`/service/api/give-review/${id}`, { review });
            toast.success(res.data.message);
            set((state)=>({
                hackathons: state.hackathons.map((h)=>
                    h._id === id? res.data.hackathon : h 
                )
            }))
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to give review");
        }
    },
    deleteHackathon: async (id) => {
        try {
        const res = await axiosInstance.delete(`/service/api/${id}`);
        toast.success(res.data.message);
        set((state) => ({
            userHackathons: state.userHackathons.filter((h) => h._id !== id),
        }));
        } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete hackathon");
        }
    },
}));