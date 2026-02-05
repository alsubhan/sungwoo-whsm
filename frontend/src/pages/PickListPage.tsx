import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ClipboardList, Eye } from "lucide-react";
import { toast } from "sonner";

// Dummy data for pick lists
const dummyPickLists = [
    {
        id: "PL-001",
        pickListNumber: "PL-2026-0001",
        salesOrderNumber: "SO-2026-0045",
        customerName: "Hyundai Motors",
        totalItems: 12,
        pickedItems: 0,
        status: "pending",
        createdAt: "2026-02-05T08:00:00",
        assignedTo: "Warehouse Operator 1",
    },
    {
        id: "PL-002",
        pickListNumber: "PL-2026-0002",
        salesOrderNumber: "SO-2026-0046",
        customerName: "Kia Corporation",
        totalItems: 8,
        pickedItems: 5,
        status: "in_progress",
        createdAt: "2026-02-05T09:30:00",
        assignedTo: "Warehouse Operator 2",
    },
    {
        id: "PL-003",
        pickListNumber: "PL-2026-0003",
        salesOrderNumber: "SO-2026-0044",
        customerName: "Samsung SDI",
        totalItems: 15,
        pickedItems: 15,
        status: "completed",
        createdAt: "2026-02-04T14:00:00",
        assignedTo: "Warehouse Operator 1",
    },
];

// Dummy sales orders for generation
const dummySalesOrders = [
    { id: "SO-047", orderNumber: "SO-2026-0047", customerName: "LG Electronics", itemCount: 6 },
    { id: "SO-048", orderNumber: "SO-2026-0048", customerName: "SK Hynix", itemCount: 10 },
    { id: "SO-049", orderNumber: "SO-2026-0049", customerName: "Posco Holdings", itemCount: 4 },
];

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
};

export default function PickListPage() {
    const [pickLists, setPickLists] = useState(dummyPickLists);
    const [searchTerm, setSearchTerm] = useState("");
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedSalesOrder, setSelectedSalesOrder] = useState("");
    const [selectedPickList, setSelectedPickList] = useState<typeof dummyPickLists[0] | null>(null);

    const filteredPickLists = pickLists.filter(
        (pl) =>
            pl.pickListNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pl.salesOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pl.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleGeneratePickList = () => {
        if (!selectedSalesOrder) {
            toast.error("Please select a sales order");
            return;
        }

        const salesOrder = dummySalesOrders.find((so) => so.id === selectedSalesOrder);
        if (!salesOrder) return;

        const newPickList = {
            id: `PL-${Date.now()}`,
            pickListNumber: `PL-2026-${String(pickLists.length + 1).padStart(4, "0")}`,
            salesOrderNumber: salesOrder.orderNumber,
            customerName: salesOrder.customerName,
            totalItems: salesOrder.itemCount,
            pickedItems: 0,
            status: "pending",
            createdAt: new Date().toISOString(),
            assignedTo: "Unassigned",
        };

        setPickLists([newPickList, ...pickLists]);
        setGenerateDialogOpen(false);
        setSelectedSalesOrder("");
        toast.success(`Pick list ${newPickList.pickListNumber} generated successfully`);
    };

    const handleView = (pickList: typeof dummyPickLists[0]) => {
        setSelectedPickList(pickList);
        setViewDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Pick List Generation</h1>
                <Button onClick={() => setGenerateDialogOpen(true)} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Generate Pick List
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search pick lists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pick List #</TableHead>
                            <TableHead>Sales Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPickLists.map((pickList) => (
                            <TableRow key={pickList.id}>
                                <TableCell className="font-medium">{pickList.pickListNumber}</TableCell>
                                <TableCell>{pickList.salesOrderNumber}</TableCell>
                                <TableCell>{pickList.customerName}</TableCell>
                                <TableCell>
                                    {pickList.pickedItems}/{pickList.totalItems} items
                                </TableCell>
                                <TableCell>
                                    <Badge className={statusColors[pickList.status]}>
                                        {pickList.status.replace("_", " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell>{pickList.assignedTo}</TableCell>
                                <TableCell>{new Date(pickList.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => handleView(pickList)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Generate Pick List Dialog */}
            <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Generate Pick List
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Sales Order</label>
                            <Select value={selectedSalesOrder} onValueChange={setSelectedSalesOrder}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a sales order" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dummySalesOrders.map((so) => (
                                        <SelectItem key={so.id} value={so.id}>
                                            {so.orderNumber} - {so.customerName} ({so.itemCount} items)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleGeneratePickList}>Generate</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Pick List Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Pick List Details</DialogTitle>
                    </DialogHeader>
                    {selectedPickList && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pick List Number</p>
                                    <p className="font-medium">{selectedPickList.pickListNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Sales Order</p>
                                    <p className="font-medium">{selectedPickList.salesOrderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selectedPickList.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={statusColors[selectedPickList.status]}>
                                        {selectedPickList.status.replace("_", " ")}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Progress</p>
                                    <p className="font-medium">
                                        {selectedPickList.pickedItems}/{selectedPickList.totalItems} items picked
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned To</p>
                                    <p className="font-medium">{selectedPickList.assignedTo}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
