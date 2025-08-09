import { Container, SimpleGrid } from '@mantine/core';
import { SchematicCard } from './SchematicCard/SchematicCard';

const mockdata = [
  {
    title: 'Coal Mine',
    image: "https://imgur.com/qUHWHXB.png",
    author: {
        id: "1",
        name: "Jonas",
        avatarUrl: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
    },
    description: "Resident Evil Village is a direct sequel to 2017’s Resident Evil 7, but takes a very different direction to its predecessor, namely the fact that this time round instead of fighting against various mutated zombies, you’re now dealing with more occult enemies like werewolves and vampires.",
    date: 'August 18, 2022',
    url: "/schematic/1"
  },
  {
    badge: "new",
    title: 'The Mansion',
    image: "http://imgur.com/ZRmbKOC.png",
    author: {
        id: "2",
        name: "Tyron",
        avatarUrl: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
    },
    description: "Resident Evil Village is a direct sequel to 2017’s Resident Evil 7, but takes a very different direction to its predecessor, namely the fact that this time round instead of fighting against various mutated zombies, you’re now dealing with more occult enemies like werewolves and vampires.",
    date: 'August 18, 2022',
    url: "/schematic/2"
  },
  {
    badge: "new",
    title: 'Resident Evil Village review',
    image: "https://imgur.com/L0Saq5F.png",
    author: {
        id: "3",
        name: "53k31574",
        avatarUrl: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-4.png"
    },
    description: "Resident Evil Village is a direct sequel to 2017’s Resident Evil 7, but takes a very different direction to its predecessor, namely the fact that this time round instead of fighting against various mutated zombies, you’re now dealing with more occult enemies like werewolves and vampires.",
    date: 'August 18, 2022',
    url: "/schematic/3"
  },
  {
    badge: "new",
    title: 'Resident Evil Village review',
    image: "https://imgur.com/ZarnXAK.png",
    author: {
        id: "4",
        name: "shintharo13",
        avatarUrl: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png"
    },
    description: "Resident Evil Village is a direct sequel to 2017’s Resident Evil 7, but takes a very different direction to its predecessor, namely the fact that this time round instead of fighting against various mutated zombies, you’re now dealing with more occult enemies like werewolves and vampires.",
    date: 'August 18, 2022',
    url: "/schematic/4"
  },
  {
    badge: "new",
    title: 'Forlorn Hope Tower',
    image: "https://imgur.com/iv1jOld.png",
    author: {
        id: "5",
        name: "Freakyuser397",
        avatarUrl: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png"
    },
    description: "Resident Evil Village is a direct sequel to 2017’s Resident Evil 7, but takes a very different direction to its predecessor, namely the fact that this time round instead of fighting against various mutated zombies, you’re now dealing with more occult enemies like werewolves and vampires.",
    date: 'August 18, 2022',
    url: "/schematic/5"
  }
];

interface GridProps {
    maxCards: number,
    maxNumWide: number
}

export function SchematicsGrid(props: GridProps) {
    const cards = () => {
        const elements = [];
        for (var i = 0; i < props.maxCards; i++) {
            var index = Math.floor(Math.random() * 5);
            elements.push(<SchematicCard key={i} {...mockdata[index]} />);
        }
        return elements;
    }

    return (
        <Container fluid>
            <SimpleGrid cols={{ base: 2, sm: 4, lg: props.maxNumWide }} spacing={{ base: 0, sm: 'lg' }}>
                {cards()}
            </SimpleGrid>
        </Container>
    )
}