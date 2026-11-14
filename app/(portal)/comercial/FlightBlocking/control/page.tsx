import { FlightBlockingsDashboard } from "@/components/commercial/bloqueos/FlightBlockingsDashboard";

export default function BloqueosControlPage() {
  return (
    <div className="w-full h-full min-h-0">
      <FlightBlockingsDashboard control={true} />
    </div>
  );
}