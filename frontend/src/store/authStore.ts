import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Position {
  id: number;
  code: string;
  name: string;
  fee1st: number;
  fee2nd: number;
}

interface Project {
  id: number;
  name: string;
  status: string;
}

interface AuthUser {
  employeeId: string;
  name: string;
  role: 'ADMIN' | 'USER';
  projectId: number;
  positionId: number;
  isStoreOwner: boolean;
  position: Position;
  project: Project;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  selectedProjectId: number | null; // Admin용 프로젝트 전환
  setAuth: (user: AuthUser, token: string) => void;
  setSelectedProject: (projectId: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedProjectId: null,
      setAuth: (user, token) => {
        set({ user, token, selectedProjectId: user.projectId });
      },
      setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),
      logout: () => {
        set({ user: null, token: null, selectedProjectId: null });
      },
    }),
    { name: 'lasbook-auth' },
  ),
);
