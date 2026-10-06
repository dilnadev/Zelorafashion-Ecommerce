import { getAdminCustomers, type AdminCustomerSort } from "@/lib/queries/admin-customers";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const revalidate = 0;

const VALID_SORTS: AdminCustomerSort[] = ["created_at", "total_spent", "full_name"];

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page ?? 1);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const sortByParam = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "created_at";
  const sortBy = VALID_SORTS.includes(sortByParam as AdminCustomerSort)
    ? (sortByParam as AdminCustomerSort)
    : "created_at";
  const sortDir = searchParams.sortDir === "asc" ? "asc" : "desc";

  const result = await getAdminCustomers({ page, pageSize: 20, search, sortBy, sortDir });

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">Customers</h1>
      <CustomersTable
        customers={result.customers}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        search={search}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  );
}
