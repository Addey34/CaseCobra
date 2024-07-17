// Page.tsx

import { db } from '@/db';
import { notFound } from 'next/navigation';
import DesignPreview, { ConfigurationWithTypes } from './DesignPreview'; // Vérifiez l'importation ici

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const { id } = searchParams;

  if (!id || typeof id !== 'string') {
    return notFound();
  }

  const configuration: ConfigurationWithTypes | null = await db.configuration.findUnique({
    where: { id },
  }) as ConfigurationWithTypes | null;
  

  if (!configuration) {
    return notFound();
  }

  return <DesignPreview configuration={configuration} />;
};

export default Page;
