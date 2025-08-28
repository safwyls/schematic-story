import SwaggerUI from 'swagger-ui-react';
import './swagger-ui.css'; // Import the default styles
import { Paper } from '@mantine/core';

export function SwaggerPage() {
  return (
    <Paper bg="gray.1" m="md">
      <SwaggerUI url="/src/assets/schematic-story-api-Stage-oas30.yaml" />
    </Paper>
  );
};