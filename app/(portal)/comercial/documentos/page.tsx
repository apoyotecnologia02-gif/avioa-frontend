import { CommercialCatalog } from "@/components/commercial/catalog/CommercialCatalog";

export default function CommercialDocumentsPage() {
  return (
    <div className="w-full h-full min-h-0">
      <CommercialCatalog kind="document" />
    </div>
  );
}