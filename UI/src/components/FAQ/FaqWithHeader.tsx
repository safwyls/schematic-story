import { Accordion, Container, Overlay, SimpleGrid, Text, ThemeIcon, Title, UnstyledButton } from '@mantine/core';
import classes from './FaqWithHeader.module.css';
import { IconPlus } from '@tabler/icons-react';

export function FaqWithHeader() {
  return (
    <Container my={60} id="faq" className={classes.wrapper} >
      <div className={classes.header}>
        <div>
          <Title className={classes.title}>Frequently Asked Questions</Title>
          <Title className={classes.titleOverlay} role="presentation">
            FAQ
          </Title>
        </div>

      </div>

      <Accordion
          chevronPosition="right"
          defaultValue="reset-password"
          chevronSize={26}
          variant="separated"
          disableChevronRotation
          chevron={
            <ThemeIcon radius="xl" className={classes.gradient} size={26}>
              <IconPlus size={18} stroke={1.5} />
            </ThemeIcon>
          }
        >
          <Accordion.Item className={classes.item} value="reset-password">
            <Accordion.Control>How can I reset my password?</Accordion.Control>
            <Accordion.Panel>
              Click your username in the upper right corner, then navigate to Account Settings from the dropdown.
              In the account settings page you can find the reset password option.
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.item} value="another-account">
            <Accordion.Control>Can I create more that one account?</Accordion.Control>
            <Accordion.Panel>There are no restrictions on account numbers per user. But please do not abuse the system.</Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.item} value="credit-card">
            <Accordion.Control>Do you store credit card information securely?</Accordion.Control>
            <Accordion.Panel>All payment processing is handled by Stripe connect, we do not store nor have access to any of your credit card information.</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
    </Container>
  );
}