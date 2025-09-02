import SwaggerUI from 'swagger-ui-react';
import { Paper } from '@mantine/core';
import '../styles/swagger-ui.css'; // Import the default styles
import { useAuth } from '@/hooks/useAuth';

export function SwaggerPage() {
  const { idToken } = useAuth();
  
  return (
    <Paper bg="gray.1" m="md">
      <SwaggerUI url="/src/assets/schematic-story-api-Stage-oas30.yaml"
        requestInterceptor={async (req) => {
          if (idToken) {
            req.url = req.url.replace(import.meta.env.VITE_APP_API_URL, '/api');
            req.headers.Authorization = `Bearer ${idToken}`;
          }
          return req;
        }}
      />
    </Paper>
  );
};