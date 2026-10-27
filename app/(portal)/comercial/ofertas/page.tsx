import { CommercialCatalog } from "@/components/commercial/catalog/CommercialCatalog";

export default function CommercialOffersPage() {
  return (
    <div className="w-full h-full min-h-0">
      <CommercialCatalog kind="offer" />
    </div>
  );
}