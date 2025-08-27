import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  GridCol,
  Card,
  Avatar,
  Text,
  Title,
  Group,
  Stack,
  Tabs,
  Badge,
  Button,
  ActionIcon,
  Skeleton,
  Alert,
  SimpleGrid,
  Paper,
  Divider
} from '@mantine/core';
import {
  IconUser,
  IconHeart,
  IconUsers,
  IconMessageCircle,
  IconCalendar,
  IconMail,
  IconUserPlus,
  IconUserMinus
} from '@tabler/icons-react';
import { ExpandedUser, Schematic, Comment } from '@/types/common';

interface FollowedUser {
  id: string;
  username: string;
  avatarUrl?: string;
  followedAt: string;
}

export function ProfilePage() {
  const { username, tab } = useParams<{ username: string; tab?: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ExpandedUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [followedSchematics, setFollowedSchematics] = useState<Schematic[]>([]);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('schematics');

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tab && ['schematics', 'users', 'comments'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, fetch user data to get the user ID
      const userResponse = await fetch(`https://api.schematicstory.com/users/by-username/${username}`);
      if (!userResponse.ok) throw new Error('Failed to fetch user');
      const userData = await userResponse.json();
      setUser(userData);

      // Use the user ID for subsequent API calls
      const userId = userData.id;
      setUserId(userId);

      // Fetch followed schematics
      const schematicsResponse = await fetch(`https://api.schematicstory.com/users/${userId}/followed-schematics`);
      if (schematicsResponse.ok) {
        const schematicsData = await schematicsResponse.json();
        setFollowedSchematics(schematicsData);
      }

      // Fetch followed users
      const usersResponse = await fetch(`https://api.schematicstory.com/users/${userId}/following`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setFollowedUsers(usersData);
      }

      // Fetch user comments
      const commentsResponse = await fetch(`https://api.schematicstory.com/users/${userId}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setUserComments(commentsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !userId) return;

    try {
      const method = user.isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`https://api.schematicstory.com/users/${userId}/follow`, { method });
      
      if (response.ok) {
        setUser(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
    if (value && username) {
      navigate(`/profile/${username}/${value}`, { replace: true });
    }
  };

  if (loading) {
    return (
      <Container>
        <Grid>
          <GridCol span={12}>
            <Card>
              <Group>
                <Skeleton height={80} circle />
                <Stack gap="xs">
                  <Skeleton height={20} width={200} />
                  <Skeleton height={16} width={150} />
                  <Skeleton height={16} width={100} />
                </Stack>
              </Group>
            </Card>
          </GridCol>
        </Grid>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container>
        <Alert color="red" title="Error">
          {error || 'User not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Grid>
        {/* User Profile Header */}
        <GridCol span={12}>
          <Card>
            <Group align="flex-start">
              <Avatar
                src={user.avatarUrl}
                size={80}
                radius="md"
              >
                <IconUser size="2rem" />
              </Avatar>
              
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group justify="space-between">
                  <div>
                    <Title order={2}>{user.username}</Title>
                    <Text size="sm" c="dimmed">{user.email}</Text>
                  </div>
                  
                  <Button
                    variant={user.isFollowing ? "outline" : "filled"}
                    leftSection={user.isFollowing ? <IconUserMinus size="1rem" /> : <IconUserPlus size="1rem" />}
                    onClick={handleFollowToggle}
                  >
                    {user.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                </Group>

                {user.bio && (
                  <Text size="sm">{user.bio}</Text>
                )}

                <Group gap="xl">
                  <Group gap="xs">
                    <IconUsers size="1rem" />
                    <Text size="sm">
                      <strong>{user.followersCount}</strong> followers
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconHeart size="1rem" />
                    <Text size="sm">
                      <strong>{user.followingCount}</strong> following
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconCalendar size="1rem" />
                    <Text size="sm">
                      Joined {new Date(user.joinedAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </Group>
              </Stack>
            </Group>
          </Card>
        </GridCol>

        {/* Tabs Content */}
        <GridCol span={12}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tabs.List>
              <Tabs.Tab value="schematics" leftSection={<IconHeart size="1rem" />}>
                Followed Schematics ({followedSchematics.length})
              </Tabs.Tab>
              <Tabs.Tab value="users" leftSection={<IconUsers size="1rem" />}>
                Following ({followedUsers.length})
              </Tabs.Tab>
              <Tabs.Tab value="comments" leftSection={<IconMessageCircle size="1rem" />}>
                Comments ({userComments.length})
              </Tabs.Tab>
            </Tabs.List>

            {/* Followed Schematics Tab */}
            <Tabs.Panel value="schematics">
              <Stack mt="md">
                {followedSchematics.length === 0 ? (
                  <Paper p="xl" ta="center">
                    <IconHeart size="3rem" stroke={1} color="gray" />
                    <Text size="lg" mt="md" c="dimmed">
                      No followed schematics yet
                    </Text>
                  </Paper>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {followedSchematics.map((schematic) => (
                      <Card key={schematic.id} shadow="sm" padding="lg" radius="md" withBorder>
                        {schematic.coverImageUrl && (
                          <Card.Section>
                            <img
                              src={schematic.coverImageUrl}
                              alt={schematic.title}
                              style={{ height: 160, width: '100%', objectFit: 'cover' }}
                            />
                          </Card.Section>
                        )}
                        
                        <Stack gap="xs" mt="md">
                          <Title order={4}>{schematic.title}</Title>
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {schematic.description}
                          </Text>
                          
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed">
                              by {schematic.author}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {schematic.downloadCount} downloads
                            </Text>
                          </Group>
                          
                          <Group gap="xs">
                            {schematic.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} size="xs" variant="light">
                                {tag}
                              </Badge>
                            ))}
                          </Group>
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Following Users Tab */}
            <Tabs.Panel value="users">
              <Stack mt="md">
                {followedUsers.length === 0 ? (
                  <Paper p="xl" ta="center">
                    <IconUsers size="3rem" stroke={1} color="gray" />
                    <Text size="lg" mt="md" c="dimmed">
                      Not following anyone yet
                    </Text>
                  </Paper>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {followedUsers.map((followedUser) => (
                      <Card key={followedUser.id} shadow="sm" padding="lg" radius="md" withBorder>
                        <Group>
                          <Avatar
                            src={followedUser.avatarUrl}
                            size={50}
                            radius="md"
                          >
                            <IconUser size="1.5rem" />
                          </Avatar>
                          
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Text fw={500}>{followedUser.username}</Text>
                            <Text size="xs" c="dimmed">
                              Followed {new Date(followedUser.followedAt).toLocaleDateString()}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Comments Tab */}
            <Tabs.Panel value="comments">
              <Stack mt="md">
                {userComments.length === 0 ? (
                  <Paper p="xl" ta="center">
                    <IconMessageCircle size="3rem" stroke={1} color="gray" />
                    <Text size="lg" mt="md" c="dimmed">
                      No comments yet
                    </Text>
                  </Paper>
                ) : (
                  <Stack gap="md">
                    {userComments.map((comment) => (
                      <Card key={comment.id} shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={500} size="sm">
                              On: {comment.schematicTitle}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </Text>
                          </Group>
                          
                          <Divider />
                          
                          <Text size="sm">
                            {comment.content}
                          </Text>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </GridCol>
      </Grid>
    </Container>
  );
}
