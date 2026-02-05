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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, CheckCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

// Dummy pending receipts from main warehouse
const dummyPendingReceipts = [
    {
        id: "SR-001",
        movementNumber: "MOV-2026-0003",
        fromLocation: "Main Warehouse",
        toStore: "Maintenance Store 1",
        items: [
            { sku: "SPR-101", name: "Bearing Set Type A", quantity: 25, received: false },
            { sku: "SPR-102", name: "Hydraulic Pump", quantity: 10, received: false },
        ],
        movedAt: "2026-02-05T10:00:00",
        status: "pending",
    },
    {
        id: "SR-002",
        movementNumber: "MOV-2026-0004",
        fromLocation: "Main Warehouse",
        toStore: "Maintenance Store 2",
        items: [
            { sku: "SPR-201", name: "Conveyor Belt 2M", quantity: 8, received: false },
        ],
        movedAt: "2026-02-05T11:30:00",
        status: "pending",
    },
];

// Dummy completed receipts
const dummyCompletedReceipts = [
    {
        id: "SR-003",
        receiptNumber: "SRC-2026-0001",
        movementNumber: "MOV-2026-0001",
        fromLocation: "Main Warehouse",
        toStore: "Maintenance Store 1",
        sku: "SPR-103",
        productName: "Servo Motor 5KW",
        quantity: 5,
        receivedBy: "Store Operator Kim",
        receivedAt: "2026-02-04T14:30:00",
        status: "received",
    },
    {
        id: "SR-004",
        receiptNumber: "SRC-2026-0002",
        movementNumber: "MOV-2026-0002",
        fromLocation: "Main Warehouse",
        toStore: "Maintenance Store 3",
        sku: "SPR-301",
        productName: "PLC Controller",
        quantity: 3,
        receivedBy: "Store Operator Lee",
        receivedAt: "2026-02-03T16:00:00",
        status: "received",
    },
];

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    partial: "bg-blue-100 text-blue-800",
    received: "bg-green-100 text-green-800",
};

export default function StoreReceiptPage() {
    const [pendingReceipts, setPendingReceipts] = useState(dummyPendingReceipts);
    const [completedReceipts, setCompletedReceipts] = useState(dummyCompletedReceipts);
    const [searchTerm, setSearchTerm] = useState("");
    const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<typeof dummyPendingReceipts[0] | null>(null);
    const [itemsToReceive, setItemsToReceive] = useState<Record<string, boolean>>({});

    const filteredCompletedReceipts = completedReceipts.filter(
        (r) =>
            r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenReceive = (receipt: typeof dummyPendingReceipts[0]) => {
        setSelectedReceipt(receipt);
        const initialState: Record<string, boolean> = {};
        receipt.items.forEach((item) => {
            initialState[item.sku] = false;
        });
        setItemsToReceive(initialState);
        setReceiveDialogOpen(true);
    };

    const handleConfirmReceipt = () => {
        if (!selectedReceipt) return;

        const receivedItems = selectedReceipt.items.filter((item) => itemsToReceive[item.sku]);

        if (receivedItems.length === 0) {
            toast.error("Please select at least one item to receive");
            return;
        }

        // Create receipt records
        const newReceipts = receivedItems.map((item, index) => ({
            id: `SR-${Date.now()}-${index}`,
            receiptNumber: `SRC-2026-${String(completedReceipts.length + index + 1).padStart(4, "0")}`,
            movementNumber: selectedReceipt.movementNumber,
            fromLocation: selectedReceipt.fromLocation,
            toStore: selectedReceipt.toStore,
            sku: item.sku,
            productName: item.name,
            quantity: item.quantity,
            receivedBy: "Current Operator",
            receivedAt: new Date().toISOString(),
            status: "received",
        }));

        setCompletedReceipts([...newReceipts, ...completedReceipts]);

        // Update or remove pending receipt
        const remainingItems = selectedReceipt.items.filter((item) => !itemsToReceive[item.sku]);

        if (remainingItems.length === 0) {
            setPendingReceipts(pendingReceipts.filter((r) => r.id !== selectedReceipt.id));
        } else {
            setPendingReceipts(
                pendingReceipts.map((r) =>
                    r.id === selectedReceipt.id
                        ? { ...r, items: remainingItems, status: "partial" }
                        : r
                )
            );
        }

        toast.success(
            `Received ${receivedItems.length} item(s). Stock added to ${selectedReceipt.toStore}.`
        );

        setReceiveDialogOpen(false);
        setSelectedReceipt(null);
    };

    const toggleItem = (sku: string) => {
        setItemsToReceive((prev) => ({ ...prev, [sku]: !prev[sku] }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Store Receipt</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Receipts</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReceipts.length}</div>
                        <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Today's Receipts</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completedReceipts.filter(
                                (r) => new Date(r.receivedAt).toDateString() === new Date().toDateString()
                            ).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Items Received Today</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completedReceipts
                                .filter((r) => new Date(r.receivedAt).toDateString() === new Date().toDateString())
                                .reduce((sum, r) => sum + r.quantity, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Receipts */}
            {pendingReceipts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Pending Material from Main Warehouse</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingReceipts.map((receipt) => (
                            <Card key={receipt.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{receipt.movementNumber}</CardTitle>
                                        <Badge className={statusColors[receipt.status]}>
                                            {receipt.status === "partial" ? "Partial" : "Pending"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <span className="text-muted-foreground">From:</span> {receipt.fromLocation}
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">To:</span> {receipt.toStore}
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Items:</span> {receipt.items.length}
                                        </p>
                                        <div className="space-y-1">
                                            {receipt.items.map((item) => (
                                                <div key={item.sku} className="flex justify-between text-xs bg-muted p-2 rounded">
                                                    <span>{item.name}</span>
                                                    <span>{item.quantity} units</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full mt-2" onClick={() => handleOpenReceive(receipt)}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm Receipt
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Receipt History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Receipt History</h2>
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search receipts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Receipt #</TableHead>
                                <TableHead>Movement #</TableHead>
                                <TableHead>Store</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Received By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCompletedReceipts.map((receipt) => (
                                <TableRow key={receipt.id}>
                                    <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                                    <TableCell>{receipt.movementNumber}</TableCell>
                                    <TableCell>{receipt.toStore}</TableCell>
                                    <TableCell>{receipt.sku}</TableCell>
                                    <TableCell>{receipt.productName}</TableCell>
                                    <TableCell>{receipt.quantity}</TableCell>
                                    <TableCell>{receipt.receivedBy}</TableCell>
                                    <TableCell>{new Date(receipt.receivedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-100 text-green-800">Received</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Receipt Confirmation Dialog */}
            <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Confirm Physical Receipt
                        </DialogTitle>
                    </DialogHeader>

                    {selectedReceipt && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Movement #</p>
                                    <p className="font-medium">{selectedReceipt.movementNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">From</p>
                                    <p className="font-medium">{selectedReceipt.fromLocation}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Select items received physically:</p>
                                {selectedReceipt.items.map((item) => (
                                    <div
                                        key={item.sku}
                                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={itemsToReceive[item.sku] || false}
                                                onCheckedChange={() => toggleItem(item.sku)}
                                            />
                                            <div>
                                                <p className="font-medium">{item.sku}</p>
                                                <p className="text-sm text-muted-foreground">{item.name}</p>
                                            </div>
                                        </div>
                                        <span>{item.quantity} units</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReceiveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmReceipt}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm & Add to Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
