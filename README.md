# Schematic Story
Schematic Story is a community driven schematic sharing serverless web application powered by AWS-managed services and a React frontend.

# Front End
<img width="1659" height="1273" alt="image" src="https://github.com/user-attachments/assets/62d67847-583c-472f-a11d-5423dcdc7e5d" />

# System Architecture Diagram
For the system architecture we will be leveraging AWS services for the backend stack
- Cognito for user pools and authentication
- API Gateway for RESTful API endpoints
- DynamoDB for our primary database
- Lambda for interfacing between API Gateway and DynamoDB
- S3 for large file and media storage
- Cloudfront CDN for delivering S3 files to the front end

For the frontend stack we will be building the application in React/Vite with Mantine for UI components and hosting the app on Netlify, utilizing Netlify Edge for CDN.

<img width="1021" height="1021" alt="image" src="https://github.com/user-attachments/assets/6ef59318-843c-4e37-8e11-5402fe601fe5" />

# DynamoDB ERD
Even though DynamoDB is a NoSQL database, I wanted to draw out a full ERD for the application so we could properly map out all data access patterns in advance.

This is important with DynamoDB since adding additional GSIs later is a costly change.

<img width="1265" height="1108" alt="image" src="https://github.com/user-attachments/assets/f118d69c-d644-40af-a4c8-68799869706b" />
