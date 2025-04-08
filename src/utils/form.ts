export interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
  }
  
export interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
export interface LoginFormData {
    email: string;
    password: string;
  }