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
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod urna eget orci molestie, a rutrum magna ornare. Proin consequat pretium molestie. Nulla eleifend consequat libero ut lobortis. Aliquam non dapibus est. Fusce rhoncus ut diam in faucibus. Quisque quam enim, aliquam at pulvinar vel, interdum et leo. Fusce dapibus elit et velit fermentum placerat. \n Etiam bibendum arcu enim, a bibendum ipsum scelerisque a. Cras bibendum in eros ac bibendum. Etiam eu pharetra nisl. Quisque gravida arcu odio, sed aliquam augue aliquet nec. Sed ut suscipit felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras vel urna in ante consectetur pellentesque id a diam. Pellentesque congue felis risus, at porttitor lorem tincidunt et. Mauris rutrum faucibus dui, mattis placerat purus euismod sit amet. Sed eget congue nisi, sit amet lacinia elit. Mauris sit amet orci sapien. Donec accumsan auctor erat eget ultricies. Vivamus pulvinar egestas volutpat. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sit amet massa sit amet neque imperdiet iaculis vitae ac dui. \n Morbi scelerisque diam sit amet nibh porttitor congue. Nunc quis orci a urna feugiat semper id eu metus. Aliquam erat volutpat. Nunc libero nulla, interdum feugiat ullamcorper pulvinar, egestas at ex. Vestibulum mi risus, tempus a porta id, rutrum non erat. Nulla pretium nisi non lectus dictum, et aliquam eros pharetra. Duis pulvinar orci et lacus gravida, nec imperdiet augue vulputate. \n In id ipsum ex. Donec ut leo urna. Proin a pellentesque nulla. Aliquam varius ante tortor, at condimentum nunc luctus at. Ut posuere quis turpis sit amet posuere. Cras facilisis venenatis ultricies. Nulla commodo vulputate elit, eu ornare augue rutrum vel. Nulla tristique turpis sit amet sapien mollis, vitae sodales turpis ornare. Donec tortor nunc, malesuada in pharetra sit amet, volutpat at nunc. Aenean semper vehicula tempus. Fusce id ligula est. Fusce consequat interdum venenatis. Suspendisse tellus felis, tempus posuere ornare ac, vestibulum quis ligula. Donec a fermentum augue, vitae ornare ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam bibendum diam quis varius faucibus. \n Vivamus fermentum elementum dolor eget efficitur. Aenean rhoncus sit amet velit eu bibendum. Nunc tortor dolor, iaculis id hendrerit id, rhoncus a est. Sed at justo eu libero mattis scelerisque. Nunc ac lectus eu dolor maximus accumsan sit amet condimentum ipsum. Curabitur porta neque id rhoncus tincidunt. Praesent vitae est sed risus porttitor iaculis eget nec lorem. Nam tincidunt mauris eget ex fringilla, ut efficitur diam egestas.",
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
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod urna eget orci molestie, a rutrum magna ornare. Proin consequat pretium molestie. Nulla eleifend consequat libero ut lobortis. Aliquam non dapibus est. Fusce rhoncus ut diam in faucibus. Quisque quam enim, aliquam at pulvinar vel, interdum et leo. Fusce dapibus elit et velit fermentum placerat. \n Etiam bibendum arcu enim, a bibendum ipsum scelerisque a. Cras bibendum in eros ac bibendum. Etiam eu pharetra nisl. Quisque gravida arcu odio, sed aliquam augue aliquet nec. Sed ut suscipit felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras vel urna in ante consectetur pellentesque id a diam. Pellentesque congue felis risus, at porttitor lorem tincidunt et. Mauris rutrum faucibus dui, mattis placerat purus euismod sit amet. Sed eget congue nisi, sit amet lacinia elit. Mauris sit amet orci sapien. Donec accumsan auctor erat eget ultricies. Vivamus pulvinar egestas volutpat. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sit amet massa sit amet neque imperdiet iaculis vitae ac dui. \n Morbi scelerisque diam sit amet nibh porttitor congue. Nunc quis orci a urna feugiat semper id eu metus. Aliquam erat volutpat. Nunc libero nulla, interdum feugiat ullamcorper pulvinar, egestas at ex. Vestibulum mi risus, tempus a porta id, rutrum non erat. Nulla pretium nisi non lectus dictum, et aliquam eros pharetra. Duis pulvinar orci et lacus gravida, nec imperdiet augue vulputate. \n In id ipsum ex. Donec ut leo urna. Proin a pellentesque nulla. Aliquam varius ante tortor, at condimentum nunc luctus at. Ut posuere quis turpis sit amet posuere. Cras facilisis venenatis ultricies. Nulla commodo vulputate elit, eu ornare augue rutrum vel. Nulla tristique turpis sit amet sapien mollis, vitae sodales turpis ornare. Donec tortor nunc, malesuada in pharetra sit amet, volutpat at nunc. Aenean semper vehicula tempus. Fusce id ligula est. Fusce consequat interdum venenatis. Suspendisse tellus felis, tempus posuere ornare ac, vestibulum quis ligula. Donec a fermentum augue, vitae ornare ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam bibendum diam quis varius faucibus. \n Vivamus fermentum elementum dolor eget efficitur. Aenean rhoncus sit amet velit eu bibendum. Nunc tortor dolor, iaculis id hendrerit id, rhoncus a est. Sed at justo eu libero mattis scelerisque. Nunc ac lectus eu dolor maximus accumsan sit amet condimentum ipsum. Curabitur porta neque id rhoncus tincidunt. Praesent vitae est sed risus porttitor iaculis eget nec lorem. Nam tincidunt mauris eget ex fringilla, ut efficitur diam egestas.",
    date: 'August 18, 2022',
    url: "/schematic/2"
  },
  {
    badge: "new",
    title: 'Village',
    image: "https://imgur.com/L0Saq5F.png",
    author: {
        id: "3",
        name: "53k31574",
        avatarUrl: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-4.png"
    },
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod urna eget orci molestie, a rutrum magna ornare. Proin consequat pretium molestie. Nulla eleifend consequat libero ut lobortis. Aliquam non dapibus est. Fusce rhoncus ut diam in faucibus. Quisque quam enim, aliquam at pulvinar vel, interdum et leo. Fusce dapibus elit et velit fermentum placerat. \n Etiam bibendum arcu enim, a bibendum ipsum scelerisque a. Cras bibendum in eros ac bibendum. Etiam eu pharetra nisl. Quisque gravida arcu odio, sed aliquam augue aliquet nec. Sed ut suscipit felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras vel urna in ante consectetur pellentesque id a diam. Pellentesque congue felis risus, at porttitor lorem tincidunt et. Mauris rutrum faucibus dui, mattis placerat purus euismod sit amet. Sed eget congue nisi, sit amet lacinia elit. Mauris sit amet orci sapien. Donec accumsan auctor erat eget ultricies. Vivamus pulvinar egestas volutpat. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sit amet massa sit amet neque imperdiet iaculis vitae ac dui. \n Morbi scelerisque diam sit amet nibh porttitor congue. Nunc quis orci a urna feugiat semper id eu metus. Aliquam erat volutpat. Nunc libero nulla, interdum feugiat ullamcorper pulvinar, egestas at ex. Vestibulum mi risus, tempus a porta id, rutrum non erat. Nulla pretium nisi non lectus dictum, et aliquam eros pharetra. Duis pulvinar orci et lacus gravida, nec imperdiet augue vulputate. \n In id ipsum ex. Donec ut leo urna. Proin a pellentesque nulla. Aliquam varius ante tortor, at condimentum nunc luctus at. Ut posuere quis turpis sit amet posuere. Cras facilisis venenatis ultricies. Nulla commodo vulputate elit, eu ornare augue rutrum vel. Nulla tristique turpis sit amet sapien mollis, vitae sodales turpis ornare. Donec tortor nunc, malesuada in pharetra sit amet, volutpat at nunc. Aenean semper vehicula tempus. Fusce id ligula est. Fusce consequat interdum venenatis. Suspendisse tellus felis, tempus posuere ornare ac, vestibulum quis ligula. Donec a fermentum augue, vitae ornare ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam bibendum diam quis varius faucibus. \n Vivamus fermentum elementum dolor eget efficitur. Aenean rhoncus sit amet velit eu bibendum. Nunc tortor dolor, iaculis id hendrerit id, rhoncus a est. Sed at justo eu libero mattis scelerisque. Nunc ac lectus eu dolor maximus accumsan sit amet condimentum ipsum. Curabitur porta neque id rhoncus tincidunt. Praesent vitae est sed risus porttitor iaculis eget nec lorem. Nam tincidunt mauris eget ex fringilla, ut efficitur diam egestas.",
    date: 'August 18, 2022',
    url: "/schematic/3"
  },
  {
    badge: "new",
    title: 'Factory',
    image: "https://imgur.com/ZarnXAK.png",
    author: {
        id: "4",
        name: "shintharo13",
        avatarUrl: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png"
    },
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod urna eget orci molestie, a rutrum magna ornare. Proin consequat pretium molestie. Nulla eleifend consequat libero ut lobortis. Aliquam non dapibus est. Fusce rhoncus ut diam in faucibus. Quisque quam enim, aliquam at pulvinar vel, interdum et leo. Fusce dapibus elit et velit fermentum placerat. \n Etiam bibendum arcu enim, a bibendum ipsum scelerisque a. Cras bibendum in eros ac bibendum. Etiam eu pharetra nisl. Quisque gravida arcu odio, sed aliquam augue aliquet nec. Sed ut suscipit felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras vel urna in ante consectetur pellentesque id a diam. Pellentesque congue felis risus, at porttitor lorem tincidunt et. Mauris rutrum faucibus dui, mattis placerat purus euismod sit amet. Sed eget congue nisi, sit amet lacinia elit. Mauris sit amet orci sapien. Donec accumsan auctor erat eget ultricies. Vivamus pulvinar egestas volutpat. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sit amet massa sit amet neque imperdiet iaculis vitae ac dui. \n Morbi scelerisque diam sit amet nibh porttitor congue. Nunc quis orci a urna feugiat semper id eu metus. Aliquam erat volutpat. Nunc libero nulla, interdum feugiat ullamcorper pulvinar, egestas at ex. Vestibulum mi risus, tempus a porta id, rutrum non erat. Nulla pretium nisi non lectus dictum, et aliquam eros pharetra. Duis pulvinar orci et lacus gravida, nec imperdiet augue vulputate. \n In id ipsum ex. Donec ut leo urna. Proin a pellentesque nulla. Aliquam varius ante tortor, at condimentum nunc luctus at. Ut posuere quis turpis sit amet posuere. Cras facilisis venenatis ultricies. Nulla commodo vulputate elit, eu ornare augue rutrum vel. Nulla tristique turpis sit amet sapien mollis, vitae sodales turpis ornare. Donec tortor nunc, malesuada in pharetra sit amet, volutpat at nunc. Aenean semper vehicula tempus. Fusce id ligula est. Fusce consequat interdum venenatis. Suspendisse tellus felis, tempus posuere ornare ac, vestibulum quis ligula. Donec a fermentum augue, vitae ornare ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam bibendum diam quis varius faucibus. \n Vivamus fermentum elementum dolor eget efficitur. Aenean rhoncus sit amet velit eu bibendum. Nunc tortor dolor, iaculis id hendrerit id, rhoncus a est. Sed at justo eu libero mattis scelerisque. Nunc ac lectus eu dolor maximus accumsan sit amet condimentum ipsum. Curabitur porta neque id rhoncus tincidunt. Praesent vitae est sed risus porttitor iaculis eget nec lorem. Nam tincidunt mauris eget ex fringilla, ut efficitur diam egestas.",
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
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod urna eget orci molestie, a rutrum magna ornare. Proin consequat pretium molestie. Nulla eleifend consequat libero ut lobortis. Aliquam non dapibus est. Fusce rhoncus ut diam in faucibus. Quisque quam enim, aliquam at pulvinar vel, interdum et leo. Fusce dapibus elit et velit fermentum placerat. \n Etiam bibendum arcu enim, a bibendum ipsum scelerisque a. Cras bibendum in eros ac bibendum. Etiam eu pharetra nisl. Quisque gravida arcu odio, sed aliquam augue aliquet nec. Sed ut suscipit felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras vel urna in ante consectetur pellentesque id a diam. Pellentesque congue felis risus, at porttitor lorem tincidunt et. Mauris rutrum faucibus dui, mattis placerat purus euismod sit amet. Sed eget congue nisi, sit amet lacinia elit. Mauris sit amet orci sapien. Donec accumsan auctor erat eget ultricies. Vivamus pulvinar egestas volutpat. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sit amet massa sit amet neque imperdiet iaculis vitae ac dui. \n Morbi scelerisque diam sit amet nibh porttitor congue. Nunc quis orci a urna feugiat semper id eu metus. Aliquam erat volutpat. Nunc libero nulla, interdum feugiat ullamcorper pulvinar, egestas at ex. Vestibulum mi risus, tempus a porta id, rutrum non erat. Nulla pretium nisi non lectus dictum, et aliquam eros pharetra. Duis pulvinar orci et lacus gravida, nec imperdiet augue vulputate. \n In id ipsum ex. Donec ut leo urna. Proin a pellentesque nulla. Aliquam varius ante tortor, at condimentum nunc luctus at. Ut posuere quis turpis sit amet posuere. Cras facilisis venenatis ultricies. Nulla commodo vulputate elit, eu ornare augue rutrum vel. Nulla tristique turpis sit amet sapien mollis, vitae sodales turpis ornare. Donec tortor nunc, malesuada in pharetra sit amet, volutpat at nunc. Aenean semper vehicula tempus. Fusce id ligula est. Fusce consequat interdum venenatis. Suspendisse tellus felis, tempus posuere ornare ac, vestibulum quis ligula. Donec a fermentum augue, vitae ornare ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam bibendum diam quis varius faucibus. \n Vivamus fermentum elementum dolor eget efficitur. Aenean rhoncus sit amet velit eu bibendum. Nunc tortor dolor, iaculis id hendrerit id, rhoncus a est. Sed at justo eu libero mattis scelerisque. Nunc ac lectus eu dolor maximus accumsan sit amet condimentum ipsum. Curabitur porta neque id rhoncus tincidunt. Praesent vitae est sed risus porttitor iaculis eget nec lorem. Nam tincidunt mauris eget ex fringilla, ut efficitur diam egestas.",
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
            <SimpleGrid cols={{ base: 1, sm: 4, lg: props.maxNumWide }} spacing={{ base: "1rem", sm: 'lg' }}>
                {cards()}
            </SimpleGrid>
        </Container>
    )
}