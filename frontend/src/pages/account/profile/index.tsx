import { Avatar, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NavBar from '../../../components/navbar';
import { useAuth } from '../../../context/authcontext';
import { clientApi } from '../../../api/client';
import LocalStorage from '../../../localStorage';

const ProfilePage = () => {
  const { user, logoutAuth } = useAuth();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    setFormData({
      displayName: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        username: formData.displayName,
        email: formData.email,
        ...(formData.newPassword && { 
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword 
        })
      };

      const response = await clientApi.put(`/users/${user.id}`, payload);
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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: 4 
      }}>
        <Avatar sx={{ m: 2, bgcolor: 'secondary.main', width: 80, height: 80 }}>
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="h4" gutterBottom>Edit Profile</Typography>
        
        <TextField
          label="Display Name"
          variant="outlined"
          name="displayName"
          value={formData.displayName}
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

        <TextField
          label="Current Password (for password change)"
          type="password"
          variant="outlined"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          sx={{ width: '400px', mb: 3 }}
        />

        <TextField
          label="New Password"
          type="password"
          variant="outlined"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          sx={{ width: '400px', mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleSaveProfile}
          >
            Save Profile
          </Button>

          <Button 
            variant="contained" 
            color="error" 
            size="large"
            onClick={() => setOpenDeleteDialog(true)}
          >
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
