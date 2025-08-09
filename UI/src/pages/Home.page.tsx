import { SchematicsGrid } from '@/components/Schematics/SchematicsGrid';
import { Welcome } from '../components/Welcome/Welcome';
import { Container, Group, Title } from '@mantine/core';
import { ContactUs } from '@/components/ContactUs/ContactUs';
import { FaqWithHeader } from '@/components/FAQ/FaqWithHeader';

export function HomePage() {
  return (
    <>
      <Welcome />
      <Container size="xl" pt="3rem">
        <Group justify="center">
          <Title variant="h3">
            Recent Schematics
          </Title>
        </Group>
        <SchematicsGrid maxCards={8} maxNumWide={4} />
        <FaqWithHeader />
        <ContactUs />
      </Container>
    </>
  );
}
