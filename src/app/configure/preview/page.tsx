import { db } from '@/db';
import { notFound } from 'next/navigation';
import DesignPreview, { ConfigurationWithTypes } from './DesignPreview';

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const { id } = searchParams;

  if (!id || typeof id !== 'string') {
    return notFound();
  }

  const configuration: ConfigurationWithTypes | null = await db.configuration.findUnique({
    where: { id },
  });

  if (!configuration) {
    return notFound();
  }

  return <DesignPreview configuration={configuration} />;
};

export default Page;
