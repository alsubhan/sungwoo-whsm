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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, CheckCircle, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Dummy active pick lists for picking
const dummyActivePickLists = [
    {
        id: "PL-001",
        pickListNumber: "PL-2026-0001",
        salesOrderNumber: "SO-2026-0045",
        customerName: "Hyundai Motors",
        items: [
            { id: "1", sku: "SPR-001", name: "Brake Pad Set", location: "A-01-02", quantity: 4, pickedQty: 0 },
            { id: "2", sku: "SPR-002", name: "Oil Filter", location: "B-02-01", quantity: 10, pickedQty: 0 },
            { id: "3", sku: "SPR-003", name: "Air Filter", location: "B-02-03", quantity: 6, pickedQty: 0 },
        ],
        status: "pending",
    },
    {
        id: "PL-002",
        pickListNumber: "PL-2026-0002",
        salesOrderNumber: "SO-2026-0046",
        customerName: "Kia Corporation",
        items: [
            { id: "4", sku: "SPR-004", name: "Spark Plug", location: "C-01-01", quantity: 8, pickedQty: 5 },
            { id: "5", sku: "SPR-005", name: "Timing Belt", location: "C-02-02", quantity: 2, pickedQty: 2 },
        ],
        status: "in_progress",
    },
];

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
};

export default function PickingPage() {
    const [pickLists, setPickLists] = useState(dummyActivePickLists);
    const [searchTerm, setSearchTerm] = useState("");
    const [pickingDialogOpen, setPickingDialogOpen] = useState(false);
    const [selectedPickList, setSelectedPickList] = useState<typeof dummyActivePickLists[0] | null>(null);
    const [scannedBarcode, setScannedBarcode] = useState("");

    const filteredPickLists = pickLists.filter(
        (pl) =>
            pl.pickListNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pl.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStartPicking = (pickList: typeof dummyActivePickLists[0]) => {
        setSelectedPickList(pickList);
        setPickingDialogOpen(true);
    };

    const handleScanItem = () => {
        if (!scannedBarcode || !selectedPickList) return;

        const item = selectedPickList.items.find(
            (i) => i.sku.toLowerCase() === scannedBarcode.toLowerCase()
        );

        if (!item) {
            toast.error("Item not found in this pick list");
            setScannedBarcode("");
            return;
        }

        if (item.pickedQty >= item.quantity) {
            toast.warning("Item already fully picked");
            setScannedBarcode("");
            return;
        }

        // Update picked quantity
        const updatedItems = selectedPickList.items.map((i) =>
            i.id === item.id ? { ...i, pickedQty: i.pickedQty + 1 } : i
        );

        const updatedPickList = { ...selectedPickList, items: updatedItems, status: "in_progress" };
        setSelectedPickList(updatedPickList);

        // Update in main list
        setPickLists(pickLists.map((pl) => (pl.id === selectedPickList.id ? updatedPickList : pl)));

        toast.success(`Picked 1x ${item.name}`);
        setScannedBarcode("");
    };

    const handleCompletePicking = () => {
        if (!selectedPickList) return;

        const allPicked = selectedPickList.items.every((i) => i.pickedQty >= i.quantity);

        if (!allPicked) {
            toast.error("Not all items have been picked");
            return;
        }

        setPickLists(
            pickLists.map((pl) =>
                pl.id === selectedPickList.id ? { ...pl, status: "completed" } : pl
            )
        );

        setPickingDialogOpen(false);
        toast.success(`Pick list ${selectedPickList.pickListNumber} completed!`);
    };

    const getPickListProgress = (pickList: typeof dummyActivePickLists[0]) => {
        const totalQty = pickList.items.reduce((sum, i) => sum + i.quantity, 0);
        const pickedQty = pickList.items.reduce((sum, i) => sum + i.pickedQty, 0);
        return Math.round((pickedQty / totalQty) * 100);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Picking</h1>
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPickLists.map((pickList) => (
                    <Card key={pickList.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{pickList.pickListNumber}</CardTitle>
                                <Badge className={statusColors[pickList.status]}>
                                    {pickList.status.replace("_", " ")}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Sales Order</p>
                                    <p className="font-medium">{pickList.salesOrderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">{pickList.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Progress</p>
                                    <Progress value={getPickListProgress(pickList)} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {getPickListProgress(pickList)}% complete
                                    </p>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleStartPicking(pickList)}
                                    disabled={pickList.status === "completed"}
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    {pickList.status === "completed" ? "Completed" : "Start Picking"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Picking Dialog */}
            <Dialog open={pickingDialogOpen} onOpenChange={setPickingDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ScanLine className="h-5 w-5" />
                            Picking - {selectedPickList?.pickListNumber}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPickList && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Scan or enter SKU..."
                                    value={scannedBarcode}
                                    onChange={(e) => setScannedBarcode(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleScanItem()}
                                    autoFocus
                                />
                                <Button onClick={handleScanItem}>
                                    <ScanLine className="h-4 w-4 mr-2" />
                                    Pick
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Required</TableHead>
                                        <TableHead>Picked</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedPickList.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.sku}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.location}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.pickedQty}</TableCell>
                                            <TableCell>
                                                {item.pickedQty >= item.quantity ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <span className="text-yellow-600">Pending</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPickingDialogOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleCompletePicking}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Picking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
