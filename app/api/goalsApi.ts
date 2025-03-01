import axios from "axios";
import Constants from "expo-constants";
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export interface Goals {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  joined: boolean;
  status: string;
  user_voted: boolean;
  vote_count: number
}

interface GoalsResponse {
  goals: Goals[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchGoals(
    page = 1,
    limit = 10,
    query = "",
    token: string | null
  ): Promise<GoalsResponse> {
    console.log("fetchGoals called with:", { page, limit, query, token });
    const response = await axios.get<GoalsResponse>(`${API_BASE_URL}/goal`, {
      params: { page, limit, query },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }


export async function fetchJoinedGoals(token: string | null): Promise<Goals[]> {
  const response = await axios.get(`${API_BASE_URL}/goal/joined`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.goals;
}

export async function fetchOwnedGoals(token: string | null): Promise<Goals[]> {
  const response = await axios.get(`${API_BASE_URL}/goal/owned`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.goals;
}

export async function JoinGoals(goalId: number, token: string | null): Promise<void> {
  console.log("Token is ", token)
  await axios.post(`${API_BASE_URL}/goal/${goalId}/join`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function CreateGoals(name: string, description: string, token: string | null): Promise<void> {
  await axios.post(`${API_BASE_URL}/goal`,{
    name,
    description,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function LeaveGoals(goalId: number, token: string | null): Promise<void> {
  await axios.delete(`${API_BASE_URL}/goal/${goalId}/leave`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function CompleteGoals(goalId: number, token: string | null): Promise<void> {
  await axios.put(`${API_BASE_URL}/goal/${goalId}/complete`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function AddTips(goalId: number, token: string | null, tip: {title: string, content: string}): Promise<void> {
  await axios.post(`${API_BASE_URL}/goal/${goalId}/tips`, {
    tip: tip
  },{
    headers: { Authorization: `Bearer ${token}` },
  });
}


export async function AddSuccessStory(goalId: number, token: string | null, successStory: {title: string, content: string}): Promise<void> {
  await axios.post(`${API_BASE_URL}/goal/${goalId}/successStories`, {
    successStory: successStory
  },{
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function VoteGoal(goalId: number, vote: string, token: string | null): Promise<void> {
  await axios.post(`${API_BASE_URL}/goal/${goalId}/vote`, {
    action: vote
  },{
    headers: { Authorization: `Bearer ${token}` },
  });
}

