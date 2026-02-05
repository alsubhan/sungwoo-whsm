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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// Maintenance stores
const maintenanceStores = [
    { id: "MS-1", name: "Maintenance Store 1" },
    { id: "MS-2", name: "Maintenance Store 2" },
    { id: "MS-3", name: "Maintenance Store 3" },
];

// SKUs by store (store-specific view)
const skusByStore: Record<string, Array<{ sku: string; name: string; currentStock: number; minStock: number }>> = {
    "MS-1": [
        { sku: "SPR-101", name: "Bearing Set Type A", currentStock: 5, minStock: 10 },
        { sku: "SPR-102", name: "Hydraulic Pump", currentStock: 2, minStock: 5 },
        { sku: "SPR-103", name: "Servo Motor 5KW", currentStock: 8, minStock: 3 },
    ],
    "MS-2": [
        { sku: "SPR-201", name: "Conveyor Belt 2M", currentStock: 1, minStock: 5 },
        { sku: "SPR-202", name: "Pneumatic Cylinder", currentStock: 12, minStock: 8 },
        { sku: "SPR-203", name: "Sensor Proximity", currentStock: 3, minStock: 10 },
    ],
    "MS-3": [
        { sku: "SPR-301", name: "PLC Controller", currentStock: 0, minStock: 2 },
        { sku: "SPR-302", name: "VFD Drive 10HP", currentStock: 4, minStock: 3 },
        { sku: "SPR-303", name: "Encoder Rotary", currentStock: 6, minStock: 5 },
    ],
};

// Dummy indent data
const dummyIndents = [
    {
        id: "IND-001",
        indentNumber: "IND-2026-0001",
        store: "Maintenance Store 1",
        sku: "SPR-101",
        productName: "Bearing Set Type A",
        quantity: 20,
        reason: "Low stock - running production",
        status: "approved",
        raisedBy: "Operator Kim",
        raisedAt: "2026-02-04T09:00:00",
        approvedBy: "HOD Park",
        approvedAt: "2026-02-04T11:30:00",
    },
    {
        id: "IND-002",
        indentNumber: "IND-2026-0002",
        store: "Maintenance Store 2",
        sku: "SPR-201",
        productName: "Conveyor Belt 2M",
        quantity: 10,
        reason: "Urgent replacement required",
        status: "pending_approval",
        raisedBy: "Operator Lee",
        raisedAt: "2026-02-05T08:30:00",
        approvedBy: null,
        approvedAt: null,
    },
    {
        id: "IND-003",
        indentNumber: "IND-2026-0003",
        store: "Maintenance Store 3",
        sku: "SPR-301",
        productName: "PLC Controller",
        quantity: 5,
        reason: "Stock replenishment",
        status: "po_created",
        raisedBy: "Operator Choi",
        raisedAt: "2026-02-03T14:00:00",
        approvedBy: "HOD Kim",
        approvedAt: "2026-02-03T16:00:00",
    },
];

const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    po_created: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
    draft: "Draft",
    pending_approval: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
    po_created: "PO Created",
};

export default function IndentPage() {
    const [indents, setIndents] = useState(dummyIndents);
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    // Form state
    const [selectedStore, setSelectedStore] = useState("");
    const [selectedSku, setSelectedSku] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");

    const availableSkus = selectedStore ? skusByStore[selectedStore] || [] : [];

    const filteredIndents = indents.filter((indent) => {
        const matchesSearch =
            indent.indentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            indent.productName.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === "all") return matchesSearch;
        if (activeTab === "pending") return matchesSearch && indent.status === "pending_approval";
        if (activeTab === "approved") return matchesSearch && (indent.status === "approved" || indent.status === "po_created");
        return matchesSearch;
    });

    const handleCreateIndent = () => {
        if (!selectedStore || !selectedSku || !quantity || !reason) {
            toast.error("Please fill all required fields");
            return;
        }

        const sku = availableSkus.find((s) => s.sku === selectedSku);
        const store = maintenanceStores.find((s) => s.id === selectedStore);

        const newIndent = {
            id: `IND-${Date.now()}`,
            indentNumber: `IND-2026-${String(indents.length + 1).padStart(4, "0")}`,
            store: store?.name || "",
            sku: selectedSku,
            productName: sku?.name || "",
            quantity: parseInt(quantity),
            reason,
            status: "pending_approval",
            raisedBy: "Current Operator",
            raisedAt: new Date().toISOString(),
            approvedBy: null,
            approvedAt: null,
        };

        setIndents([newIndent, ...indents]);
        toast.success(`Indent ${newIndent.indentNumber} raised for HOD approval`);

        // Reset form
        setSelectedStore("");
        setSelectedSku("");
        setQuantity("");
        setReason("");
        setCreateDialogOpen(false);
    };

    const handleApprove = (indent: typeof dummyIndents[0]) => {
        setIndents(
            indents.map((i) =>
                i.id === indent.id
                    ? { ...i, status: "approved", approvedBy: "Current HOD", approvedAt: new Date().toISOString() }
                    : i
            )
        );
        toast.success(`Indent ${indent.indentNumber} approved`);
    };

    const handleReject = (indent: typeof dummyIndents[0]) => {
        setIndents(
            indents.map((i) =>
                i.id === indent.id
                    ? { ...i, status: "rejected", approvedBy: "Current HOD", approvedAt: new Date().toISOString() }
                    : i
            )
        );
        toast.error(`Indent ${indent.indentNumber} rejected`);
    };

    const handleCreatePO = (indent: typeof dummyIndents[0]) => {
        setIndents(
            indents.map((i) =>
                i.id === indent.id ? { ...i, status: "po_created" } : i
            )
        );
        toast.success(`PO created for indent ${indent.indentNumber}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Indent Management</h1>
                <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Raise Indent
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Indents</TabsTrigger>
                    <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 mt-4">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search indents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <TabsContent value={activeTab} className="mt-4">
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Indent #</TableHead>
                                    <TableHead>Store</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Raised By</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIndents.map((indent) => (
                                    <TableRow key={indent.id}>
                                        <TableCell className="font-medium">{indent.indentNumber}</TableCell>
                                        <TableCell>{indent.store}</TableCell>
                                        <TableCell>{indent.sku}</TableCell>
                                        <TableCell>{indent.productName}</TableCell>
                                        <TableCell>{indent.quantity}</TableCell>
                                        <TableCell className="max-w-[150px] truncate">{indent.reason}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[indent.status]}>
                                                {statusLabels[indent.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{indent.raisedBy}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {indent.status === "pending_approval" && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApprove(indent)}
                                                            className="text-green-600"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleReject(indent)}
                                                            className="text-red-600"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {indent.status === "approved" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCreatePO(indent)}
                                                    >
                                                        Create PO
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create Indent Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Raise New Indent
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Maintenance Store</label>
                            <Select value={selectedStore} onValueChange={(v) => {
                                setSelectedStore(v);
                                setSelectedSku("");
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select store" />
                                </SelectTrigger>
                                <SelectContent>
                                    {maintenanceStores.map((store) => (
                                        <SelectItem key={store.id} value={store.id}>
                                            {store.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Spare Part (Store SKUs only)</label>
                            <Select value={selectedSku} onValueChange={setSelectedSku} disabled={!selectedStore}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select spare part" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSkus.map((sku) => (
                                        <SelectItem key={sku.sku} value={sku.sku}>
                                            {sku.sku} - {sku.name} (Stock: {sku.currentStock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input
                                type="number"
                                placeholder="Enter quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason</label>
                            <Textarea
                                placeholder="Enter reason for indent..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateIndent}>
                            <Clock className="h-4 w-4 mr-2" />
                            Submit for Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
