import { ActionIcon, Autocomplete, Button, Card, Center, Container, Grid, Group, Modal, MultiSelect, Paper, PasswordInput, Space, Stack, TextInput, Title, Typography } from "@mantine/core";
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useState } from "react";
import { IconKey, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from '@mantine/hooks';
import classes from './Account.module.css';

dayjs.extend(utc);
dayjs.extend(timezone);

export function AccountPage() {
    const [visible, { toggle }] = useDisclosure(false);
    const [delOpened, { open: delOpen, close: delClose }] = useDisclosure(false);
    const [pwOpened, { open: pwOpen, close: pwClose }] = useDisclosure(false);
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            userName: 'Jonas Falx',
            email: 'jonas.falx@example.com',
            tz: dayjs.tz.guess(),
            avatarUrl: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
        },
        validate: {
          email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email')
        },
    });

    const deleteUserAccount = () => {
        alert("account deleted");
        close();
    }

    const handleUserUpdate = (values: any) => {
        console.log(values);
    }

    const handlePassUpdate = (values: any) => {
        // call cognito function to update password here
    }

    return (
        <Container>            
            <Modal opened={delOpened} onClose={delClose} title="Account Deletion">
                <Stack align="center">
                <Typography>
                    Are you sure you want to delete your account? 
                    <Space />
                    This is cannot be undone.
                </Typography>
                    <Group>
                        <Button onClick={deleteUserAccount} color="red">Delete</Button>
                        <Button onClick={delClose}>Cancel</Button>
                    </Group>
                </Stack>
            </Modal>
            <Modal opened={pwOpened} onClose={pwClose} title="Change Password">
                    <form onSubmit={form.onSubmit(handlePassUpdate)}>
                        <Stack align="center">
                            <PasswordInput
                                withAsterisk
                                miw={200}
                                mx="auto"
                                label="Password"
                                visible={visible}
                                onVisibilityChange={toggle}
                            />
                            <PasswordInput
                                withAsterisk
                                miw={200}
                                mx="auto"
                                label="Confirm password"
                                visible={visible}
                                onVisibilityChange={toggle}
                            />   
                            <Group>
                                <Button type="submit">Save</Button>
                                <Button onClick={pwClose} color="red">Cancel</Button>
                            </Group> 
                        </Stack>     
                    </form>
            </Modal>
            <Grid grow>            
                <Grid.Col span={12}>
                    <Title>Account Settings</Title>
                </Grid.Col>
                
                <Grid.Col span={12}>
                    <Card>
                        <Title order={3} pb="1em">User Details</Title>
                        <form onSubmit={form.onSubmit(handleUserUpdate)}>
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
                            />

                            <Autocomplete
                                label="Timezone"
                                key={form.key('tz')}
                                data={Intl.supportedValuesOf('timeZone')}
                                {...form.getInputProps('tz')}
                            />
                            
                            <Group justify="space-between" mt="md">
                                <Button onClick={pwOpen}>
                                    <IconKey/> Change Password
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </Group>
                        </form>
                    </Card>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Card>
                        <Title className={classes.danger} order={3} pb="1em">Danger Zone</Title>
                        <Center>
                            <Button color="red" onClick={delOpen}> 
                                <IconTrash/>
                                Delete User Account
                            </Button>
                        </Center>
                    </Card>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
