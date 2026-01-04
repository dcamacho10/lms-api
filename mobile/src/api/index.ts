import axios from "axios";
import Constants from "expo-constants";

// Change this to your local IP address for physical device testing
// example: "http://192.168.1.100:3000"
const BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:3000/api";

export const api = axios.create({
    baseURL: BASE_URL,
});

export const getOverdueLoans = async () => {
    const response = await api.get("/loans/overdue");
    return response.data;
};

export const getClients = async () => {
    const response = await api.get("/clients/list");
    return response.data;
};

export const getActiveLoans = async () => {
    const response = await api.get("/loans/active");
    return response.data;
};

export const createClient = async (clientData: { name: string; address?: string; phone?: string }) => {
    const response = await api.post("/clients", clientData);
    return response.data;
};

export const createLoan = async (loanData: { clientId: number; principal: number; loanDate?: string; monthlyFeeRate?: number }) => {
    const response = await api.post("/loans", loanData);
    return response.data;
};

export const payLoan = async (loanId: number) => {
    const response = await api.post(`/loans/${loanId}/pay`);
    return response.data;
};

export const payFee = async (feeId: number) => {
    const response = await api.post(`/fees/${feeId}/pay`);
    return response.data;
};

export const applyFees = async () => {
    const response = await api.post('/jobs/apply-fees');
    return response.data;
};

export const getYearlyBalance = async (year?: number) => {
    const params = year ? { year } : {};
    const response = await api.get('/stats/balance', { params });
    return response.data;
};
