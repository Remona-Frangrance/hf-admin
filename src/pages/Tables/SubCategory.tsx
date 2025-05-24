import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import SubcategoriesTable from "../../components/tables/SubCategoryTable.tsx/SubCategoryTable";

export default function SubcategoriesPage() {
  return (
    <>
      <PageMeta
        title="Subcategories Management | Your Admin Panel"
        description="Manage your product subcategories in the admin dashboard"
      />
      <PageBreadcrumb 
        pageTitle="Subcategories"
        // items={[
        //   { title: "Dashboard", path: "/dashboard" },
        //   { title: "Categories", path: "/categories" },
        //   { title: "Subcategories", active: true }
        // ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Subcategories List">
          <SubcategoriesTable />
        </ComponentCard>  
      </div>
    </>
  );
}