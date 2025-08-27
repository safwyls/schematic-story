import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import './swagger-ui.css'; // Import the default styles
import { Paper } from '@mantine/core';

export default function ApiPage() {
  return (
    <Paper bg="gray.1" m="md">
      <SwaggerUI url="/src/assets/schematic-story-api-Stage-oas30.yaml" />
    </Paper>
  );
};