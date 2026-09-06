import { experimentParticipants } from '@/data/experimentParticipants';
import { ParticipantDetailClient } from './ParticipantDetailClient';

export function generateStaticParams() {
  return experimentParticipants.map((participant) => ({
    id: participant.participantId
  }));
}

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ParticipantDetailClient id={id} />;
}
