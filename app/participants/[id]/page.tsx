import { ParticipantDetailClient } from './ParticipantDetailClient';

export function generateStaticParams() {
  return Array.from({length:200}, (_, index) => ({id:`P${String(index+1).padStart(2,'0')}`}));
}

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ParticipantDetailClient id={id} />;
}
