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

// Registration data type
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}
