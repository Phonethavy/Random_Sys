import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Participant {
  id: number;
  employee_name: string;
  employee_id: string;
  company: string;
  created_at: string;
}

export interface Winner {
  id: number;
  participant_id: number;
  employee_name: string;
  employee_id: string;
  company: string;
  prize_name: string;
  prize_rank: number;
  draw_timestamp: string;
}

// Participants API
export const uploadParticipants = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/participants/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getParticipants = async () => {
  const response = await api.get<{ participants: Participant[]; total: number }>('/participants');
  return response.data;
};

export const getEligibleParticipants = async () => {
  const response = await api.get<{ eligible: Participant[]; total: number }>('/participants/eligible');
  return response.data;
};

// Draw API
export const conductDraw = async (numberOfWinners: number, prizeRank: number, prizeName?: string) => {
  const response = await api.post('/draw/conduct', { numberOfWinners, prizeRank, prizeName });
  return response.data;
};

export const getDrawHistory = async () => {
  const response = await api.get<{ history: Winner[]; total: number }>('/draw/history');
  return response.data;
};

export const getWinners = async () => {
  const response = await api.get<{ winners: Winner[]; total: number }>('/draw/winners');
  return response.data;
};

export const clearAllWinners = async () => {
  const response = await api.delete('/draw/winners');
  return response.data;
};

// Export API
export const exportEligibleToExcel = () => {
  window.open('/api/export/eligible/excel', '_blank');
};

export const exportEligibleToPDF = () => {
  window.open('/api/export/eligible/pdf', '_blank');
};

export const exportWinnersToExcel = () => {
  window.open('/api/export/winners/excel', '_blank');
};

export default api;
