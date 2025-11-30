import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CatalogTable from "../../components/tables/CatalogTable/CatalogTable";

export default function CatalogPage() {
  return (
    <>
      <PageMeta title="Catalog Management" description="Manage catalogs" />
      <PageBreadcrumb pageTitle="Catalogs" />
      <div className="space-y-6">
        <ComponentCard title="Catalogs List">
          <CatalogTable />
        </ComponentCard>
      </div>
    </>
  );
}
