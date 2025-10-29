import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { authAPI, UserProfileUpdate, ChangePasswordRequest } from '../api/auth';
import { 
  validateEmail, 
  validateIdNumber,
  validateFullName,
  validateEmployeeNumber,
  sanitizeInput,
  validatePassword,
  VALIDATION_MESSAGES 
} from '../utils/validation';

interface ProfileFormErrors {
  FullName?: string;
  Email?: string;
  IDNumber?: string;
  EmployeeNumber?: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});

  // Profile form state
  const [profileForm, setProfileForm] = useState<UserProfileUpdate>({
    FullName: '',
    Email: '',
    IDNumber: '',
    EmployeeNumber: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileForm({
        FullName: user.fullName,
        Email: user.email,
        IDNumber: user.idNumber || '',
        EmployeeNumber: user.employeeNumber || ''
      });
    }
  }, [user]);

  const validateProfileForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    // Full Name validation using centralized regex
    if (!profileForm.FullName.trim()) {
      newErrors.FullName = VALIDATION_MESSAGES.REQUIRED;
    } else if (!validateFullName(profileForm.FullName)) {
      newErrors.FullName = VALIDATION_MESSAGES.FULL_NAME_INVALID;
    }

    // Email validation
    if (!profileForm.Email.trim()) {
      newErrors.Email = VALIDATION_MESSAGES.REQUIRED;
    } else if (!validateEmail(profileForm.Email)) {
      newErrors.Email = VALIDATION_MESSAGES.EMAIL_INVALID;
    }

    
    // ID Number validation (for customers) using centralized regex
    if (user?.role === 'Customer' && profileForm.IDNumber && profileForm.IDNumber.trim()) {
      if (!validateIdNumber(profileForm.IDNumber)) {
        newErrors.IDNumber = VALIDATION_MESSAGES.ID_NUMBER_INVALID;
      }
    }

    // Employee Number validation (for employees) using centralized regex
    if (user?.role === 'Employee' && profileForm.EmployeeNumber && profileForm.EmployeeNumber.trim()) {
      if (!validateEmployeeNumber(profileForm.EmployeeNumber)) {
        newErrors.EmployeeNumber = VALIDATION_MESSAGES.EMPLOYEE_NUMBER_INVALID;
      }
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordFormErrors = {};

    // Current password validation
    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = VALIDATION_MESSAGES.REQUIRED;
    }

    // New password validation
    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = VALIDATION_MESSAGES.REQUIRED;
    } else if (!validatePassword(passwordForm.newPassword)) {
      newErrors.newPassword = VALIDATION_MESSAGES.PASSWORD_INVALID;
    }

    // Confirm password validation
    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.REQUIRED;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current
    if (passwordForm.currentPassword && passwordForm.newPassword && 
        passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const updatedUser = await authAPI.updateProfile(profileForm);
      updateUser(updatedUser);
      setIsEditing(false);
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully!'
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await authAPI.changePassword(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      addNotification({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed successfully!'
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Password Change Failed',
        message: err.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setProfileForm(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (profileErrors[name as keyof ProfileFormErrors]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setPasswordForm(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (passwordErrors[name as keyof PasswordFormErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const cancelEdit = () => {
    if (user) {
      setProfileForm({
        FullName: user.fullName,
        Email: user.email,
        IDNumber: user.idNumber || '',
        EmployeeNumber: user.employeeNumber || ''
      });
    }
    setProfileErrors({});
    setIsEditing(false);
  };

  const cancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setIsChangingPassword(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>


            {/* Profile Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
              
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="FullName"
                        value={profileForm.FullName}
                        onChange={handleProfileChange}
                        required
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${profileErrors.FullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {profileErrors.FullName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.FullName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="Email"
                        value={profileForm.Email}
                        onChange={handleProfileChange}
                        required
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${profileErrors.Email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {profileErrors.Email && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.Email}</p>
                      )}
                    </div>

                    {user.role === 'Customer' && (
                      <div>
                        <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                          ID Number
                        </label>
                        <input
                          type="text"
                          id="idNumber"
                          name="IDNumber"
                          value={profileForm.IDNumber}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${profileErrors.IDNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        />
                        {profileErrors.IDNumber && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.IDNumber}</p>
                        )}
                      </div>
                    )}

                    {user.role === 'Employee' && (
                      <div>
                        <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700">
                          Employee Number
                        </label>
                        <input
                          type="text"
                          id="employeeNumber"
                          name="EmployeeNumber"
                          value={profileForm.EmployeeNumber}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${profileErrors.EmployeeNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        />
                        {profileErrors.EmployeeNumber && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.EmployeeNumber}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900">{user.role}</p>
                  </div>
                  {user.idNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID Number</label>
                      <p className="mt-1 text-sm text-gray-900">{user.idNumber}</p>
                    </div>
                  )}
                  {user.employeeNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee Number</label>
                      <p className="mt-1 text-sm text-gray-900">{user.employeeNumber}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelPasswordChange}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500">
                  Click "Change Password" to update your password.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
