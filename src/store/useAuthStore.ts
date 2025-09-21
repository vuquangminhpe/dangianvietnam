import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  loginUser,
  registerUser,
  verifyRegistration,
  storeAuthToken,
} from "../apis/user.api";
import type {
  User,
  UserLoginType,
  RegisterUserType,
  OtpRegisterType,
} from "../types/User.type";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tempEmail: string | null;
  register: (userData: RegisterUserType) => Promise<boolean>;
  verifyOtp: (otpData: OtpRegisterType) => Promise<boolean>;
  login: (credentials: UserLoginType) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  setTempEmail: (email: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tempEmail: null,

        register: async (userData: RegisterUserType) => {
          set({ isLoading: true, error: null });
          try {
            await registerUser(userData);
            // Store the email for later use in OTP verification
            set({ tempEmail: userData.email, isLoading: false });
            return true;
          } catch (error) {
            console.error("Registration error:", error);
            let errorMessage = "Failed to send verification email";
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
            return false;
          }
        },

        verifyOtp: async (otpData: OtpRegisterType) => {
          set({ isLoading: true, error: null });
          try {
            await verifyRegistration(otpData);
            set({ isLoading: false });
            return true;
          } catch (error) {
            let errorMessage = "OTP verification failed";
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
            return false;
          }
        },

        login: async (credentials: UserLoginType) => {
          set({ isLoading: true, error: null });
          try {
            const response = await loginUser(credentials);
            const { access_token, user } = response.result;

            storeAuthToken(access_token);
            set({
              user: user,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } catch (error) {
            let errorMessage = "Login failed";
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
            return false;
          }
        },
        logout: () => {
          localStorage.removeItem("accessToken");
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          // Redirect to home page (public route)
          window.location.href = "/";
        },

        updateUser: (user: User) => {
          set({ user, isAuthenticated: true });
        },

        setTempEmail: (email: string) => set({ tempEmail: email }),

        clearError: () => set({ error: null }),
      }),
      {
        name: "auth-storage",
      }
    )
  )
);

// Helper function to get redirect path based on user role
export const getRedirectPathByRole = (
  role: "staff" | "admin" | "customer"
): string => {
  switch (role) {
    case "customer":
      return "";
    case "staff":
      return "/partner";
    case "admin":
      return "/admin";
    // default:
    //   return "/home";
  }
};
