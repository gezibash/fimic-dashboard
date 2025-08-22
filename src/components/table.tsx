'use client';

import type { ColDef } from 'ag-grid-community';
import { useMemo, useState } from 'react';
import { AGGridWrapper } from './ag-grid';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

// Sample data for demonstration
interface SampleData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive';
}

const generateSampleData = (): SampleData[] => {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Director'];
  const statuses: ('active' | 'inactive')[] = [
    'active',
    'active',
    'active',
    'inactive',
  ];

  return Array.from({ length: 100 }, (_, i) => ({
    id: `emp-${i + 1}`,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100_000) + 50_000,
    startDate: new Date(
      2020 + Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

export default function TableDemo() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<SampleData[]>([]);

  const sampleData = useMemo(() => generateSampleData(), []);

  const columnDefs = useMemo(
    (): ColDef<SampleData>[] => [
      {
        field: 'name',
        headerName: 'Employee Name',
        flex: 2,
        minWidth: 150,
        pinned: 'left',
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 2,
        minWidth: 200,
      },
      {
        field: 'role',
        headerName: 'Role',
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 text-xs ring-1 ring-blue-700/20 ring-inset dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
            {params.value}
          </span>
        ),
      },
      {
        field: 'department',
        headerName: 'Department',
        flex: 1,
        minWidth: 130,
        filter: 'agSetColumnFilter',
      },
      {
        field: 'salary',
        headerName: 'Salary',
        flex: 1,
        minWidth: 120,
        valueFormatter: (params: any) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(params.value),
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      {
        field: 'startDate',
        headerName: 'Start Date',
        flex: 1,
        minWidth: 130,
        valueFormatter: (params: any) =>
          new Date(params.value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        filter: 'agDateColumnFilter',
        comparator: (dateA: string, dateB: string) => {
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 100,
        cellRenderer: (params: any) => {
          const isActive = params.value === 'active';
          return (
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 font-medium text-xs ring-1 ring-inset ${
                isActive
                  ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20'
                  : 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
        filter: 'agSetColumnFilter',
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">AG Grid Demo</h1>
          <p className="text-muted-foreground">
            Demonstrating the type-safe AG Grid wrapper with Geist font theme
          </p>
        </div>
        <Button onClick={() => setDarkMode(!darkMode)} variant="outline">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>

      {selectedEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Employees</CardTitle>
            <CardDescription>
              {selectedEmployees.length} employee(s) selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedEmployees.map((emp) => (
                <div className="flex items-center gap-2" key={emp.id}>
                  <span className="font-medium">{emp.name}</span>
                  <span className="text-muted-foreground">"</span>
                  <span className="text-muted-foreground text-sm">
                    {emp.email}
                  </span>
                  <span className="text-muted-foreground">"</span>
                  <span className="text-sm">{emp.department}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Employee Data Grid</CardTitle>
          <CardDescription>
            Sample employee data with sorting, filtering, pagination, and
            selection
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AGGridWrapper<SampleData>
            animateRows={true}
            columnDefs={columnDefs}
            darkMode={darkMode}
            enableSelection={true}
            getRowClass={(params) =>
              params.data?.status === 'inactive' ? 'opacity-60' : ''
            }
            height={600}
            onRowSelectionChanged={setSelectedEmployees}
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            rowData={sampleData}
            // Custom row styling
            selectionMode="multiple"
            // Sidebar with filters and columns
            sideBar={{
              toolPanels: [
                {
                  id: 'filters',
                  labelDefault: 'Filters',
                  labelKey: 'filters',
                  iconKey: 'filter',
                  toolPanel: 'agFiltersToolPanel',
                },
                {
                  id: 'columns',
                  labelDefault: 'Columns',
                  labelKey: 'columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
                },
              ],
            }}
            // Column groups would go in individual column definitions
            // Status bar
            statusBar={{
              statusPanels: [
                { statusPanel: 'agTotalRowCount', align: 'left' },
                { statusPanel: 'agFilteredRowCount', align: 'left' },
                { statusPanel: 'agSelectedRowCount', align: 'left' },
                { statusPanel: 'agAggregationComponent', align: 'left' },
              ],
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
