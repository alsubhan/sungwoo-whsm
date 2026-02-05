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
import { Search, ArrowRight, Truck, Package, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Dummy maintenance stores
const maintenanceStores = [
    { id: "MS-1", name: "Maintenance Store 1" },
    { id: "MS-2", name: "Maintenance Store 2" },
    { id: "MS-3", name: "Maintenance Store 3" },
];

// Dummy GRNs with items to move
const pendingGRNsForMovement = [
    {
        id: "GRN-001",
        grnNumber: "GRN-2026-0101",
        supplierName: "Korea Parts Co.",
        items: [
            { sku: "SPR-101", name: "Bearing Set Type A", quantity: 50, targetStore: "MS-1" },
            { sku: "SPR-201", name: "Conveyor Belt 2M", quantity: 20, targetStore: "MS-2" },
        ],
        receivedAt: "2026-02-04T14:00:00",
        status: "pending_movement",
    },
    {
        id: "GRN-002",
        grnNumber: "GRN-2026-0102",
        supplierName: "Auto Spares Ltd.",
        items: [
            { sku: "SPR-301", name: "PLC Controller", quantity: 10, targetStore: "MS-3" },
        ],
        receivedAt: "2026-02-05T09:00:00",
        status: "pending_movement",
    },
];

// Dummy movement history
const dummyMovements = [
    {
        id: "MOV-001",
        movementNumber: "MOV-2026-0001",
        grnNumber: "GRN-2026-0099",
        fromLocation: "Main Warehouse",
        toLocation: "Maintenance Store 1",
        sku: "SPR-101",
        productName: "Bearing Set Type A",
        quantity: 30,
        movedBy: "Warehouse Operator",
        movedAt: "2026-02-04T10:30:00",
        status: "completed",
    },
    {
        id: "MOV-002",
        movementNumber: "MOV-2026-0002",
        grnNumber: "GRN-2026-0100",
        fromLocation: "Main Warehouse",
        toLocation: "Maintenance Store 2",
        sku: "SPR-202",
        productName: "Pneumatic Cylinder",
        quantity: 15,
        movedBy: "Warehouse Operator",
        movedAt: "2026-02-03T15:45:00",
        status: "completed",
    },
];

const statusColors: Record<string, string> = {
    pending_movement: "bg-yellow-100 text-yellow-800",
    in_transit: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
};

export default function MaterialMovementPage() {
    const [movements, setMovements] = useState(dummyMovements);
    const [pendingGRNs, setPendingGRNs] = useState(pendingGRNsForMovement);
    const [searchTerm, setSearchTerm] = useState("");
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [selectedGRN, setSelectedGRN] = useState<typeof pendingGRNsForMovement[0] | null>(null);

    const filteredMovements = movements.filter(
        (m) =>
            m.movementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStartMovement = (grn: typeof pendingGRNsForMovement[0]) => {
        setSelectedGRN(grn);
        setMoveDialogOpen(true);
    };

    const handleCompleteMovement = () => {
        if (!selectedGRN) return;

        // Create movement records for each item
        const newMovements = selectedGRN.items.map((item, index) => ({
            id: `MOV-${Date.now()}-${index}`,
            movementNumber: `MOV-2026-${String(movements.length + index + 1).padStart(4, "0")}`,
            grnNumber: selectedGRN.grnNumber,
            fromLocation: "Main Warehouse",
            toLocation: maintenanceStores.find((s) => s.id === item.targetStore)?.name || item.targetStore,
            sku: item.sku,
            productName: item.name,
            quantity: item.quantity,
            movedBy: "Current Operator",
            movedAt: new Date().toISOString(),
            status: "completed",
        }));

        setMovements([...newMovements, ...movements]);
        setPendingGRNs(pendingGRNs.filter((g) => g.id !== selectedGRN.id));

        toast.success(
            `Material from ${selectedGRN.grnNumber} moved to maintenance stores. Store receipts pending.`
        );

        setMoveDialogOpen(false);
        setSelectedGRN(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Material Internal Movement</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Movements</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingGRNs.length}</div>
                        <p className="text-xs text-muted-foreground">GRNs awaiting movement</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Today's Movements</CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {movements.filter((m) => new Date(m.movedAt).toDateString() === new Date().toDateString()).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Items Moved Today</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {movements
                                .filter((m) => new Date(m.movedAt).toDateString() === new Date().toDateString())
                                .reduce((sum, m) => sum + m.quantity, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending GRNs for Movement */}
            {pendingGRNs.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Pending GRNs for Movement</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingGRNs.map((grn) => (
                            <Card key={grn.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{grn.grnNumber}</CardTitle>
                                        <Badge className={statusColors[grn.status]}>Pending</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <span className="text-muted-foreground">Supplier:</span> {grn.supplierName}
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Items:</span> {grn.items.length}
                                        </p>
                                        <div className="space-y-1">
                                            {grn.items.map((item) => (
                                                <div key={item.sku} className="flex justify-between text-xs bg-muted p-2 rounded">
                                                    <span>{item.name}</span>
                                                    <span>
                                                        {item.quantity} → {maintenanceStores.find((s) => s.id === item.targetStore)?.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full mt-2" onClick={() => handleStartMovement(grn)}>
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Move to Stores
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Movement History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Movement History</h2>
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search movements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Movement #</TableHead>
                                <TableHead>GRN #</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Moved By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMovements.map((movement) => (
                                <TableRow key={movement.id}>
                                    <TableCell className="font-medium">{movement.movementNumber}</TableCell>
                                    <TableCell>{movement.grnNumber}</TableCell>
                                    <TableCell>{movement.fromLocation}</TableCell>
                                    <TableCell>{movement.toLocation}</TableCell>
                                    <TableCell>{movement.sku}</TableCell>
                                    <TableCell>{movement.productName}</TableCell>
                                    <TableCell>{movement.quantity}</TableCell>
                                    <TableCell>{movement.movedBy}</TableCell>
                                    <TableCell>{new Date(movement.movedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[movement.status]}>
                                            {movement.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Movement Confirmation Dialog */}
            <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Confirm Material Movement
                        </DialogTitle>
                    </DialogHeader>

                    {selectedGRN && (
                        <div className="space-y-4 py-4">
                            <div>
                                <p className="text-sm text-muted-foreground">GRN Number</p>
                                <p className="font-medium">{selectedGRN.grnNumber}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Items to Move:</p>
                                {selectedGRN.items.map((item) => (
                                    <div key={item.sku} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">{item.sku}</p>
                                            <p className="text-sm text-muted-foreground">{item.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>{item.quantity} units</span>
                                            <ArrowRight className="h-4 w-4" />
                                            <span className="text-primary">
                                                {maintenanceStores.find((s) => s.id === item.targetStore)?.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCompleteMovement}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Movement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
