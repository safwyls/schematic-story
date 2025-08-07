import { SchematicDetails } from '@/components/Schematics/SchematicDetails/SchematicDetails';
import { useParams } from 'react-router-dom';

export function SchematicDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <>
        <SchematicDetails id={id} />
    </>
  );
}