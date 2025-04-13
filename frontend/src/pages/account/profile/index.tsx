// frontend/src/pages/account/profile/index.tsx
import {
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { clientApi } from '../../../api/client';
import NavBar from '../../../components/navbar';
import { useAuth } from '../../../context/authcontext';
import LocalStorage from '../../../localStorage';

const ProfilePage = () => {
  const { user, logoutAuth } = useAuth();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    // REMOVED: currentPassword field
    password: '', // CHANGED: from newPassword to password
  });

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      // REMOVED: currentPassword reset
      password: '', // CHANGED: from newPassword to password
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        // SIMPLIFIED: Direct password update without current password
        ...(formData.password && { password: formData.password }), // CHANGED: field name and structure
      };

      // CHANGED: PUT → PATCH to match backend route
      const response = await clientApi.patch(`/users/${user.id}`, payload);
      LocalStorage.setUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(`Update failed: ${error.response?.data?.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await clientApi.delete(`/users/${user.id}`);
      logoutAuth();
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error(`Deletion failed: ${error.response?.data?.message}`);
    }
  };

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          padding: 4,
        }}
      >
        <Avatar sx={{ m: 2, bgcolor: 'secondary.main', width: 80, height: 80 }}>
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>

        <TextField
          label="Username"
          variant="outlined"
          name="username"
          value={formData.username}
          onChange={handleChange}
          sx={{ width: '400px', mb: 3 }}
        />

        <TextField
          label="Email Address"
          variant="outlined"
          name="email"
          value={formData.email}
          onChange={handleChange}
          sx={{ width: '400px', mb: 3 }}
        />

        {/* REMOVED: Current Password field */}

        <TextField
          label="New Password" // CHANGED: from "New Password" to "Password"
          type="password"
          variant="outlined"
          name="password" // CHANGED: from newPassword to password
          value={formData.password}
          onChange={handleChange}
          sx={{ width: '400px', mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" size="large" onClick={handleSaveProfile}>
            Save Profile
          </Button>

          <Button variant="contained" color="error" size="large" onClick={() => setOpenDeleteDialog(true)}>
            Delete Account
          </Button>
        </Box>

        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete Account</DialogTitle>
          <DialogContent>
            Are you sure you want to permanently delete your account? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteAccount} color="error" variant="contained">
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProfilePage;
