import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DateRange {
    from: Date;
    to: Date;
}

interface MaterialDispatchReportProps {
    dateRange: DateRange;
    isActive: boolean;
    registerDataProvider: (provider: () => { title: string; columns: { key: string; label: string }[]; rows: any[] }) => void;
}

interface DispatchRecord {
    id: string;
    date: string;
    dcNumber: string;
    material: string;
    sku: string;
    quantity: number;
    unit: string;
    destination: string;
    destinationType: "Production" | "Vendor" | "Customer" | "Internal";
    status: "Dispatched" | "In Transit" | "Delivered" | "Returned";
    vehicleNo: string;
    remarks: string;
}

// Dummy data for demonstration
const dummyDispatchData: DispatchRecord[] = [
    {
        id: "1",
        date: "2026-02-05",
        dcNumber: "DC-2026-0001",
        material: "Welding Electrodes",
        sku: "SKU-WE-001",
        quantity: 500,
        unit: "pcs",
        destination: "Welding Line 1",
        destinationType: "Production",
        status: "Delivered",
        vehicleNo: "MH-12-AB-1234",
        remarks: "Urgent requirement",
    },
    {
        id: "2",
        date: "2026-02-05",
        dcNumber: "DC-2026-0002",
        material: "Motor Bearings",
        sku: "SKU-MB-045",
        quantity: 20,
        unit: "nos",
        destination: "ABC Engineering Works",
        destinationType: "Vendor",
        status: "In Transit",
        vehicleNo: "MH-12-CD-5678",
        remarks: "Repair job",
    },
    {
        id: "3",
        date: "2026-02-04",
        dcNumber: "DC-2026-0003",
        material: "Hydraulic Oil",
        sku: "SKU-HO-012",
        quantity: 200,
        unit: "ltr",
        destination: "Assembly Line A",
        destinationType: "Production",
        status: "Delivered",
        vehicleNo: "-",
        remarks: "Monthly refill",
    },
    {
        id: "4",
        date: "2026-02-04",
        dcNumber: "DC-2026-0004",
        material: "Spare Motor",
        sku: "SKU-SM-078",
        quantity: 2,
        unit: "nos",
        destination: "XYZ Motors Pvt Ltd",
        destinationType: "Vendor",
        status: "Dispatched",
        vehicleNo: "MH-12-EF-9012",
        remarks: "Rewinding work",
    },
    {
        id: "5",
        date: "2026-02-03",
        dcNumber: "DC-2026-0005",
        material: "Conveyor Belt",
        sku: "SKU-CB-023",
        quantity: 50,
        unit: "mtr",
        destination: "Paint Shop",
        destinationType: "Internal",
        status: "Delivered",
        vehicleNo: "-",
        remarks: "Replacement",
    },
    {
        id: "6",
        date: "2026-02-03",
        dcNumber: "DC-2026-0006",
        material: "Pneumatic Cylinder",
        sku: "SKU-PC-034",
        quantity: 5,
        unit: "nos",
        destination: "Quality Control",
        destinationType: "Production",
        status: "Delivered",
        vehicleNo: "-",
        remarks: "Maintenance stock",
    },
    {
        id: "7",
        date: "2026-02-02",
        dcNumber: "DC-2026-0007",
        material: "Robot Arm Joint",
        sku: "SKU-RJ-056",
        quantity: 1,
        unit: "nos",
        destination: "FANUC India",
        destinationType: "Vendor",
        status: "Returned",
        vehicleNo: "MH-12-GH-3456",
        remarks: "Warranty replacement",
    },
    {
        id: "8",
        date: "2026-02-01",
        dcNumber: "DC-2026-0008",
        material: "Safety Gloves",
        sku: "SKU-SG-089",
        quantity: 100,
        unit: "pairs",
        destination: "All Production Lines",
        destinationType: "Internal",
        status: "Delivered",
        vehicleNo: "-",
        remarks: "Monthly safety stock",
    },
];

const columns = [
    { key: "date", label: "Date" },
    { key: "dcNumber", label: "DC No." },
    { key: "material", label: "Material" },
    { key: "sku", label: "SKU" },
    { key: "quantity", label: "Qty" },
    { key: "unit", label: "Unit" },
    { key: "destination", label: "Destination" },
    { key: "destinationType", label: "Type" },
    { key: "status", label: "Status" },
    { key: "vehicleNo", label: "Vehicle No." },
];

export const MaterialDispatchReport = ({
    dateRange,
    isActive,
    registerDataProvider,
}: MaterialDispatchReportProps) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DispatchRecord[]>([]);

    useEffect(() => {
        // Simulate loading
        setLoading(true);
        const timer = setTimeout(() => {
            // Filter by date range
            const filtered = dummyDispatchData.filter((record) => {
                const recordDate = new Date(record.date);
                return recordDate >= dateRange.from && recordDate <= dateRange.to;
            });
            setData(filtered);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [dateRange]);

    useEffect(() => {
        if (isActive) {
            registerDataProvider(() => ({
                title: "Material Dispatch Report",
                columns,
                rows: data,
            }));
        }
    }, [isActive, data, registerDataProvider]);

    const getStatusBadge = (status: DispatchRecord["status"]) => {
        switch (status) {
            case "Dispatched":
                return <Badge className="bg-blue-100 text-blue-800">Dispatched</Badge>;
            case "In Transit":
                return <Badge className="bg-yellow-100 text-yellow-800">In Transit</Badge>;
            case "Delivered":
                return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
            case "Returned":
                return <Badge className="bg-purple-100 text-purple-800">Returned</Badge>;
        }
    };

    const getTypeBadge = (type: DispatchRecord["destinationType"]) => {
        switch (type) {
            case "Production":
                return <Badge variant="outline" className="border-green-500 text-green-700">Production</Badge>;
            case "Vendor":
                return <Badge variant="outline" className="border-orange-500 text-orange-700">Vendor</Badge>;
            case "Customer":
                return <Badge variant="outline" className="border-blue-500 text-blue-700">Customer</Badge>;
            case "Internal":
                return <Badge variant="outline" className="border-gray-500 text-gray-700">Internal</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    // Calculate stats
    const totalDispatches = data.length;
    const delivered = data.filter((d) => d.status === "Delivered").length;
    const inTransit = data.filter((d) => d.status === "In Transit" || d.status === "Dispatched").length;
    const toVendors = data.filter((d) => d.destinationType === "Vendor").length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Dispatches</div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalDispatches}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-sm text-green-600 dark:text-green-400">Delivered</div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">{delivered}</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">In Transit</div>
                    <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{inTransit}</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 dark:text-orange-400">To Vendors</div>
                    <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{toVendors}</div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>DC No.</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Vehicle</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell className="font-mono text-sm">{record.dcNumber}</TableCell>
                                    <TableCell className="font-medium">{record.material}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{record.sku}</TableCell>
                                    <TableCell className="text-right">{record.quantity}</TableCell>
                                    <TableCell>{record.unit}</TableCell>
                                    <TableCell>{record.destination}</TableCell>
                                    <TableCell>{getTypeBadge(record.destinationType)}</TableCell>
                                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                                    <TableCell>{record.vehicleNo}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-4 text-muted-foreground">
                                    No dispatch records found for the selected date range.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
