import SwaggerUI from 'swagger-ui-react';
import { Paper } from '@mantine/core';
import { useAuthStore } from '@/store/AuthStore';
import './swagger-ui.css'; // Import the default styles

export function SwaggerPage() {
  const { getAccessToken } = useAuthStore();
  
  return (
    <Paper bg="gray.1" m="md">
      <SwaggerUI url="/src/assets/schematic-story-api-Stage-oas30.yaml"
        requestInterceptor={async (req) => {
          const token = await getAccessToken(); 
          if (token) {
            req.url = req.url.replace('https://api.schematicstory.com', '/api');
            req.headers.Authorization = `Bearer ${token}`;
          }
          return req;
        }}


      />
    </Paper>
  );
};