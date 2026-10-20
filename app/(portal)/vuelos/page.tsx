"use client";

import { FeedSkeletonFlight } from "@/components/vuelos/FeedSkeletonFlight";
import { FlightsFeed } from "@/components/vuelos/FlightsFeed";
import { Suspense } from "react";

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-6">
          <FeedSkeletonFlight />
        </div>
      }
    >
      <FlightsFeed />
    </Suspense>
  );
}
