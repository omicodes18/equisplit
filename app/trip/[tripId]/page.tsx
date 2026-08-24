import React from 'react';
import { TripApp } from '@/components/TripApp';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface TripPageProps {
  params: {
    tripId: string;
  };
}

export default function TripPage({ params }: TripPageProps) {
  return <TripApp initialTripId={params.tripId} />;
}
