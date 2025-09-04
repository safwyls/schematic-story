import { useAuth } from '@/hooks/useAuth';
import { Loader, Stack, Text, Button, Card, Container } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import classes from './ProtectedRoute.module.css';
import SchematicStoryLogo from "@/assets/schematicstory.svg?react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login, error } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Container>
        <Card withBorder radius="md" className={classes.card}>
          <Card.Section>
            <SchematicStoryLogo height={100}/>
          </Card.Section>
    
          <Stack align="center">
            <Loader size="lg" />
            <Text className={classes.title} fw={500} lineClamp={1}>
              Checking authentication...
            </Text>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <Container>
        <Card withBorder radius="md" className={classes.card}>
          <Card.Section>
            <SchematicStoryLogo height={100}/>
          </Card.Section>
    
          <Stack align="center">
              <Text className={classes.title} fw={500} lineClamp={1}>
                Authentication error occurred
              </Text>
              <Button leftSection={<IconLogin />} onClick={() => login()}>Try Again</Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Container>
        <Card withBorder radius="md" className={classes.card}>
          <Card.Section>
            <SchematicStoryLogo height={100}/>
          </Card.Section>
    
          <Stack align="center">
              <Text className={classes.title} fw={500} lineClamp={1}>
                Sign In
              </Text>
        
              <Text fz="sm" c="dimmed" lineClamp={4}>
                Please sign in to continue
              </Text>
              <Button leftSection={<IconLogin />} onClick={() => login()}>Sign In</Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Render protected content
  return <>{children}</>;
}
