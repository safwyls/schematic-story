import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import {
  Container,
  Divider,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core';
import { ContactIconsList } from './ContactIcons';
import classes from './ContactUs.module.css';

const social = [IconBrandTwitter, IconBrandYoutube, IconBrandInstagram];

export function ContactUs() {

  return (
    <Container my={60} id="contact-us" className={classes.wrapper}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={10}>
        <div>
          <Title className={classes.title} mb={30}>Contact me</Title>

          <ContactIconsList />
        </div>
        <div className={classes.about}>
            <Text mb={10}>
                This website was part portfolio project and part vintage story player dream.
                I wanted to provide a common space for builders to share their creations while also taking the opportunity 
                to build a functioning demo of a full stack cloud native application.
            </Text>
            <Text>
                All design documents, code, and relevant information for this site are open source and available on my github.
            </Text>
            <Divider my={15}/>
            <Text>
                I'm fairly active on discord, but you can contact me via email as well. If you have any questions, suggestions, or just want to say hi don't hesitate to reach out!
            </Text>
        </div>
      </SimpleGrid>
    </Container>
  );
}