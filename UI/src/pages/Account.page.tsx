import { Autocomplete, Button, Card, Center, Container, Grid, Group, Modal, PasswordInput, Space, Stack, TextInput, Title, Typography, Alert, LoadingOverlay, Avatar, Text, Loader, Box } from "@mantine/core"; 
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { IconKey, IconTrash, IconAlertCircle, IconCheck, IconUser, IconUpload, IconLogin } from "@tabler/icons-react";
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import classes from './Account.module.css';
import { CognitoIdentityProviderClient, ChangePasswordCommand, DeleteUserCommand, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { ImageUpload, UploadedImage } from "@/components/ImageUpload/ImageUpload";
import apiClient from "@/api/client";
import { useAuth, authKeys } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

dayjs.extend(utc);
dayjs.extend(timezone);

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
    region: import.meta.env.VITE_APP_AWS_REGION || 'us-east-2'
});

export function AccountPage() {
    const [visible, { toggle }] = useDisclosure(false);    
    const [delVisible, { toggle: toggleDel }] = useDisclosure(false);
    const [delOpened, { open: delOpen, close: delClose }] = useDisclosure(false);
    const [pwOpened, { open: pwOpen, close: pwClose }] = useDisclosure(false);
    const [avatarModalOpened, { open: avatarModalOpen, close: avatarModalClose }] = useDisclosure(false);
    const [avatarUpdating, setAvatarUpdating] = useState(false);
    
    // Loading states
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { 
        user,
        userId,
        userProfile,     
        avatar,
        avatarLoading,
        idToken,
        isAuthenticated,
        login,
        logout,
        error
    } = useAuth()

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            userName: userProfile?.preferred_username,
            email: userProfile?.email,
            tz: userProfile?.tz == '' || null ? dayjs.tz.guess() : userProfile?.tz,
        },
        validate: {
          email: (value) => value ? (/^\S+@\S+$/.test(value) ? null : 'Invalid email') : null,
        },
    });

    useEffect(() => {
        if (avatarUpdating) {
            setAvatarUpdating(false);
        }
    }, [avatar]);

    // const profileQuery = useQuery({
    //     queryKey: ['profile'],
    //     queryFn: async () => {
    //         const response = await apiClient.get(`/users/${userId}`)
    //         return response.data
    //     },
    //     enabled: !!idToken,
    // });

    const avatarMutation = useMutation({
        mutationFn: async (imageId: string) => {
            const data = await apiClient.post(`/users/${userId}/avatar`, { imageId });
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: authKeys.avatar });
        },
    });

    // const updateProfileMutation = useMutation({
    //     mutationFn: async (profileData: any) => {
    //         const response = await apiClient.post(`/users/${userId}/profile`, profileData)
    //         return response.data
    //     },
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['profile'] });
    //     }
    // });

    const passwordForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validate: {
            currentPassword: (value) => value.length < 1 ? 'Current password is required' : null,
            newPassword: (value) => {
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
                if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
                if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
                if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
                return null;
            },
            confirmPassword: (value, values) => 
                value !== values.newPassword ? 'Passwords do not match' : null,
        },
    });

    const deleteForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            password: '',
        },
        validate: {
            password: (value) => value.length < 1 ? 'Password is required' : null,
        },
    });

    const deleteUserAccount = async (values: { password: string }) => {
        setIsDeletingAccount(true);
        
        try {
            if (!idToken) {
                throw new Error('No access token available');
            }

            // First verify the user by trying to get user info with current session
            const getUserCommand = new GetUserCommand({
                AccessToken: idToken
            });
            
            await cognitoClient.send(getUserCommand);

            // If verification successful, proceed with deletion
            const deleteCommand = new DeleteUserCommand({
                AccessToken: idToken
            });

            await cognitoClient.send(deleteCommand);

            notifications.show({
                title: 'Account Deleted',
                message: 'Your account has been successfully deleted.',
                color: 'green',
                icon: <IconCheck size="1rem" />,
            });

            // Sign out and redirect
            logout();
            
        } catch (error: any) {
            console.error('Delete account error:', error);
            
            let errorMessage = 'Failed to delete account. Please try again.';
            
            if (error.name === 'NotAuthorizedException') {
                errorMessage = 'Invalid password. Please check your password and try again.';
            } else if (error.name === 'UserNotFoundException') {
                errorMessage = 'User not found. Please try logging in again.';
            } else if (error.name === 'InvalidParameterException') {
                errorMessage = 'Invalid request. Please try logging in again.';
            }

            notifications.show({
                title: 'Delete Failed',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size="1rem" />,
            });
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleAvatarUploadStarted = () => {
        avatarModalClose();
        setAvatarUpdating(true);
    };

    const handleAvatarUploadSuccess = async (images: UploadedImage[]) => {
        try {
            const response = await avatarMutation.mutateAsync(images[0].id);

            if (response != null && response.avatarUrl != null) {
                setCurrentAvatarUrl(response.thumbnailUrl || response.avatarUrl);
                
                notifications.show({
                    title: 'Avatar Updated',
                    message: 'Your profile avatar has been successfully updated.',
                    color: 'green',
                    icon: <IconCheck size="1rem" />,
                });
                
                avatarModalClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update avatar');
            }
            
        } catch (error: any) {
            notifications.show({
                title: 'Avatar Update Failed',
                message: error.message || 'Failed to update avatar',
                color: 'red',
                icon: <IconAlertCircle size="1rem" />,
            });
        }
    };

    const handleUserUpdate = async (values: any) => {
        setIsUpdatingProfile(true);
        
        try {
            // Here you would typically call your API to update user profile
            // Since Cognito user attributes updates require admin privileges,
            // you'd need to call your backend API
            
            const response = await apiClient.put('/users/update-profile', {
                preferred_username: values.userName,
                timezone: values.tz
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            notifications.show({
                title: 'Profile Updated',
                message: 'Your profile has been successfully updated.',
                color: 'green',
                icon: <IconCheck size="1rem" />,
            });

        } catch (error) {
            console.error('Update profile error:', error);
            notifications.show({
                title: 'Update Failed',
                message: 'Failed to update profile. Please try again.',
                color: 'red',
                icon: <IconAlertCircle size="1rem" />,
            });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePassUpdate = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        setIsUpdatingPassword(true);
        
        try {
            if (!idToken) {
                throw new Error('No access token available');
            }

            const changePasswordCommand = new ChangePasswordCommand({
                AccessToken: idToken,
                PreviousPassword: values.currentPassword,
                ProposedPassword: values.newPassword,
            });

            await cognitoClient.send(changePasswordCommand);

            notifications.show({
                title: 'Password Changed',
                message: 'Your password has been successfully updated.',
                color: 'green',
                icon: <IconCheck size="1rem" />,
            });

            passwordForm.reset();
            pwClose();

        } catch (error: any) {
            console.error('Change password error:', error);
            
            let errorMessage = 'Failed to change password. Please try again.';
            
            if (error.name === 'NotAuthorizedException') {
                errorMessage = 'Current password is incorrect. Please try again.';
            } else if (error.name === 'InvalidPasswordException') {
                errorMessage = 'New password does not meet security requirements.';
            } else if (error.name === 'LimitExceededException') {
                errorMessage = 'Too many attempts. Please try again later.';
            }

            notifications.show({
                title: 'Password Change Failed',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size="1rem" />,
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <Container>
            <Modal opened={delOpened} onClose={delClose} title="Account Deletion">
                <LoadingOverlay visible={isDeletingAccount} />
                <form onSubmit={deleteForm.onSubmit(deleteUserAccount)}>
                    <Stack align="center">
                        <Alert
                            icon={<IconAlertCircle size="1rem" />}
                            title="Warning"
                            color="red"
                            variant="light"
                        >
                            This action cannot be undone. All your data will be permanently deleted.
                        </Alert>
                        
                        <Typography ta="center">
                            Are you sure you want to delete your account? 
                            <Space />
                            Please enter your password to confirm.
                        </Typography>
                        
                        <PasswordInput
                            withAsterisk
                            miw={250}
                            mx="auto"
                            label="Current Password"
                            placeholder="Enter your password"
                            visible={delVisible}
                            onVisibilityChange={toggleDel}
                            key={deleteForm.key('password')}
                            {...deleteForm.getInputProps('password')}
                        />
                        
                        <Group>
                            <Button 
                                type="submit" 
                                color="red" 
                                loading={isDeletingAccount}
                                disabled={isDeletingAccount}
                            >
                                Delete Account
                            </Button>
                            <Button 
                                onClick={delClose}
                                variant="light"
                                disabled={isDeletingAccount}
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal opened={pwOpened} onClose={pwClose} title="Change Password" size="md">
                <LoadingOverlay visible={isUpdatingPassword} />
                <form onSubmit={passwordForm.onSubmit(handlePassUpdate)}>
                    <Stack>
                        <Alert
                            icon={<IconAlertCircle size="1rem" />}
                            title="Password Requirements"
                            color="blue"
                            variant="light"
                        >
                            Password must be at least 8 characters and contain:
                            <ul>
                                <li>At least one lowercase letter</li>
                                <li>At least one uppercase letter</li>
                                <li>At least one number</li>
                                <li>At least one special character (@$!%*?&)</li>
                            </ul>
                        </Alert>

                        <PasswordInput
                            withAsterisk
                            label="Current Password"
                            placeholder="Enter current password"
                            key={passwordForm.key('currentPassword')}
                            {...passwordForm.getInputProps('currentPassword')}
                        />
                        
                        <PasswordInput
                            withAsterisk
                            label="New Password"
                            placeholder="Enter new password"
                            visible={visible}
                            onVisibilityChange={toggle}
                            key={passwordForm.key('newPassword')}
                            {...passwordForm.getInputProps('newPassword')}
                        />
                        
                        <PasswordInput
                            withAsterisk
                            label="Confirm New Password"
                            placeholder="Confirm new password"
                            visible={visible}
                            onVisibilityChange={toggle}
                            key={passwordForm.key('confirmPassword')}
                            {...passwordForm.getInputProps('confirmPassword')}
                        />   
                        
                        <Group justify="flex-end" mt="md">
                            <Button 
                                onClick={pwClose} 
                                variant="light"
                                disabled={isUpdatingPassword}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                loading={isUpdatingPassword}
                                disabled={isUpdatingPassword}
                            >
                                Change Password
                            </Button>
                        </Group> 
                    </Stack>     
                </form>
            </Modal>

            <Modal opened={avatarModalOpened} onClose={avatarModalClose} title="Upload Avatar">
                <ImageUpload

                    onUploadStarted={handleAvatarUploadStarted}
                    onUploadProgress={()  => {}}
                    onUploadSuccess={handleAvatarUploadSuccess}
                    maxImages={1}
                    imageType="avatar"
                />
            </Modal>

            <Grid grow>            
                <Grid.Col span={12}>
                    <Title>Account Settings</Title>
                </Grid.Col>
                
                <Grid.Col span={12}>
                    <Card>
                        <LoadingOverlay visible={isUpdatingProfile} />
                        <Title order={3} pb="1em">User Details</Title>
                        <form onSubmit={form.onSubmit(handleUserUpdate)}>
                            
                        <Group mb="lg">
                            <Group align="center" onClick={avatarModalOpen} style={{ cursor: 'pointer' }}>
                                <Box pos="relative">
                                    <LoadingOverlay visible={avatarLoading || avatarUpdating} />
                                    <Avatar  pos="relative"
                                        src={avatar ? avatar.avatarUrl : '/src/assets/silhouette.png'} 
                                        size={80}
                                        radius="xl"
                                    >
                                        
                                        <IconUser size="2rem" />
                                    </Avatar>
                                </Box>
                                <Stack gap="xs">
                                    <Text fw={500}>Profile Picture</Text>
                                    <Text size="sm" c="dimmed">
                                        {avatar ? 'Click to change avatar' : 'Click to upload avatar'} (max 10MB)
                                    </Text>
                                </Stack>
                            </Group>
                        </Group>
                            <TextInput
                                withAsterisk
                                label="Username"
                                placeholder="jonasfalx"
                                key={form.key('userName')}
                                {...form.getInputProps('userName')}
                            />

                            <TextInput
                                withAsterisk
                                label="Email"
                                placeholder="your@email.com"
                                key={form.key('email')}
                                {...form.getInputProps('email')}
                                disabled
                                description="Email changes require verification and must be done through account recovery"
                            />

                            <Autocomplete
                                label="Timezone"
                                key={form.key('tz')}
                                data={Intl.supportedValuesOf('timeZone')}
                                {...form.getInputProps('tz')}
                            />
                            
                            <Group justify="space-between" mt="md">
                                <Button onClick={pwOpen}>
                                    <IconKey style={{ marginRight: '8px' }} />
                                    Change Password
                                </Button>
                                <Button 
                                    type="submit"
                                    loading={isUpdatingProfile}
                                    disabled={isUpdatingProfile}
                                >
                                    Save Changes
                                </Button>
                            </Group>
                        </form>
                    </Card>
                </Grid.Col>
                
                <Grid.Col span={12}>
                    <Card>
                        <Title className={classes.danger} order={3} pb="1em">Danger Zone</Title>
                        <Alert
                            icon={<IconAlertCircle size="1rem" />}
                            title="Account Deletion"
                            color="red"
                            variant="light"
                            mb="md"
                        >
                            Once you delete your account, there is no going back. All your schematics, 
                            comments, and profile data will be permanently deleted.
                        </Alert>
                        <Center>
                            <Button color="red" onClick={delOpen}> 
                                <IconTrash style={{ marginRight: '8px' }} />
                                Delete User Account
                            </Button>
                        </Center>
                    </Card>
                </Grid.Col>
            </Grid>
        </Container>
    );
}