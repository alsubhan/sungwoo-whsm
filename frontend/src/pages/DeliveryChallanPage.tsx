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
import { Plus, Search, FileText, Truck, CheckCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// Dummy vendors
const vendors = [
    { id: "VND-001", name: "Korea Parts Co." },
    { id: "VND-002", name: "Auto Spares Ltd." },
    { id: "VND-003", name: "Industrial Solutions" },
];

// Dummy faulty spares
const faultySpares = [
    { sku: "SPR-103", name: "Servo Motor 5KW", qty: 2 },
    { sku: "SPR-102", name: "Hydraulic Pump", qty: 1 },
    { sku: "SPR-301", name: "PLC Controller", qty: 1 },
];

// Dummy delivery challans
const dummyChallans = [
    {
        id: "DC-001",
        challanNumber: "DC-2026-0001",
        vendorId: "VND-001",
        vendorName: "Korea Parts Co.",
        sku: "SPR-103",
        spareName: "Servo Motor 5KW",
        quantity: 1,
        faultDescription: "Bearing seized, motor overheating",
        type: "returnable",
        status: "pending",
        sentAt: "2026-02-05T10:00:00",
        receivedAt: null,
        vendorInvoice: null,
        repairAmount: null,
    },
    {
        id: "DC-002",
        challanNumber: "DC-2026-0002",
        vendorId: "VND-002",
        vendorName: "Auto Spares Ltd.",
        sku: "SPR-102",
        spareName: "Hydraulic Pump",
        quantity: 1,
        faultDescription: "Seal failure, oil leakage",
        type: "returnable",
        status: "closed",
        sentAt: "2026-02-03T09:00:00",
        receivedAt: "2026-02-04T16:00:00",
        vendorInvoice: "INV-VND-2026-0045",
        repairAmount: 15000,
    },
    {
        id: "DC-003",
        challanNumber: "DC-2026-0003",
        vendorId: "VND-003",
        vendorName: "Industrial Solutions",
        sku: "SPR-301",
        spareName: "PLC Controller",
        quantity: 1,
        faultDescription: "Communication module failure",
        type: "returnable",
        status: "pending",
        sentAt: "2026-02-04T14:00:00",
        receivedAt: null,
        vendorInvoice: null,
        repairAmount: null,
    },
];

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    closed: "bg-green-100 text-green-800",
};

export default function DeliveryChallanPage() {
    const [challans, setChallans] = useState(dummyChallans);
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
    const [selectedChallan, setSelectedChallan] = useState<typeof dummyChallans[0] | null>(null);

    // Create form state
    const [selectedVendor, setSelectedVendor] = useState("");
    const [selectedSpare, setSelectedSpare] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [faultDescription, setFaultDescription] = useState("");

    // Receive form state
    const [vendorInvoice, setVendorInvoice] = useState("");
    const [repairAmount, setRepairAmount] = useState("");

    const filteredChallans = challans.filter(
        (c) =>
            c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.spareName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = challans.filter((c) => c.status === "pending").length;
    const closedCount = challans.filter((c) => c.status === "closed").length;

    const handleCreateChallan = () => {
        if (!selectedVendor || !selectedSpare || !faultDescription) {
            toast.error("Please fill all required fields");
            return;
        }

        const vendor = vendors.find((v) => v.id === selectedVendor);
        const spare = faultySpares.find((s) => s.sku === selectedSpare);

        const newChallan = {
            id: `DC-${Date.now()}`,
            challanNumber: `DC-2026-${String(challans.length + 1).padStart(4, "0")}`,
            vendorId: selectedVendor,
            vendorName: vendor?.name || "",
            sku: selectedSpare,
            spareName: spare?.name || "",
            quantity: parseInt(quantity),
            faultDescription,
            type: "returnable",
            status: "pending",
            sentAt: new Date().toISOString(),
            receivedAt: null,
            vendorInvoice: null,
            repairAmount: null,
        };

        setChallans([newChallan, ...challans]);
        toast.success(`Delivery Challan ${newChallan.challanNumber} generated`);

        // Reset form
        setSelectedVendor("");
        setSelectedSpare("");
        setQuantity("1");
        setFaultDescription("");
        setCreateDialogOpen(false);
    };

    const handleOpenReceive = (challan: typeof dummyChallans[0]) => {
        setSelectedChallan(challan);
        setVendorInvoice("");
        setRepairAmount("");
        setReceiveDialogOpen(true);
    };

    const handleReceiveBack = () => {
        if (!selectedChallan || !vendorInvoice || !repairAmount) {
            toast.error("Please enter vendor invoice and repair amount");
            return;
        }

        setChallans(
            challans.map((c) =>
                c.id === selectedChallan.id
                    ? {
                        ...c,
                        status: "closed",
                        receivedAt: new Date().toISOString(),
                        vendorInvoice,
                        repairAmount: parseFloat(repairAmount),
                    }
                    : c
            )
        );

        toast.success(
            `Challan ${selectedChallan.challanNumber} closed. Spare received and added to stock.`
        );

        setReceiveDialogOpen(false);
        setSelectedChallan(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Delivery Challan</h1>
                <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Create Challan
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Challans</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{challans.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending (At Vendor)</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Closed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{closedCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search challans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Challan #</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Spare Part</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Fault</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredChallans.map((challan) => (
                            <TableRow key={challan.id}>
                                <TableCell className="font-medium">{challan.challanNumber}</TableCell>
                                <TableCell>{challan.vendorName}</TableCell>
                                <TableCell>{challan.sku}</TableCell>
                                <TableCell>{challan.spareName}</TableCell>
                                <TableCell>{challan.quantity}</TableCell>
                                <TableCell className="max-w-[150px] truncate">{challan.faultDescription}</TableCell>
                                <TableCell>
                                    <Badge className="bg-blue-100 text-blue-800">Returnable</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={statusColors[challan.status]}>
                                        {challan.status === "pending" ? "Pending" : "Closed"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(challan.sentAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {challan.status === "pending" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenReceive(challan)}
                                        >
                                            Receive Back
                                        </Button>
                                    )}
                                    {challan.status === "closed" && (
                                        <span className="text-sm text-muted-foreground">
                                            ₹{challan.repairAmount?.toLocaleString()}
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create Challan Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Create Returnable Delivery Challan
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vendor</label>
                            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id}>
                                            {vendor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Faulty Spare</label>
                            <Select value={selectedSpare} onValueChange={setSelectedSpare}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select spare part" />
                                </SelectTrigger>
                                <SelectContent>
                                    {faultySpares.map((spare) => (
                                        <SelectItem key={spare.sku} value={spare.sku}>
                                            {spare.sku} - {spare.name} (Available: {spare.qty})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fault Description</label>
                            <Textarea
                                placeholder="Describe the fault or issue..."
                                value={faultDescription}
                                onChange={(e) => setFaultDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateChallan}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Challan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Receive Back Dialog */}
            <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Receive Repaired Spare
                        </DialogTitle>
                    </DialogHeader>

                    {selectedChallan && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Challan #</p>
                                    <p className="font-medium">{selectedChallan.challanNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Vendor</p>
                                    <p className="font-medium">{selectedChallan.vendorName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Spare Part</p>
                                    <p className="font-medium">{selectedChallan.spareName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Quantity</p>
                                    <p className="font-medium">{selectedChallan.quantity}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vendor Invoice Number</label>
                                <Input
                                    placeholder="Enter vendor invoice number"
                                    value={vendorInvoice}
                                    onChange={(e) => setVendorInvoice(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Repair Amount (₹)</label>
                                <Input
                                    type="number"
                                    placeholder="Enter repair amount"
                                    value={repairAmount}
                                    onChange={(e) => setRepairAmount(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReceiveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleReceiveBack}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Receive & Close Challan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
