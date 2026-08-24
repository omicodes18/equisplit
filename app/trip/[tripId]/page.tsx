import React from 'react';
import { TripApp } from '@/components/TripApp';
import { INITIAL_TRIPS } from '@/lib/initialData';

export function generateStaticParams() {
  return INITIAL_TRIPS.map((trip) => ({
    tripId: trip.id,
  }));
}

interface TripPageProps {
  params: {
    tripId: string;
  };
}

export default function TripPage({ params }: TripPageProps) {
  return <TripApp initialTripId={params.tripId} />;
}
