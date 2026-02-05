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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, Search, RotateCcw, CheckCircle, XCircle, Wrench } from "lucide-react";
import { toast } from "sonner";

// Dummy machines
const machines = [
    { id: "MCH-001", name: "CNC Machine A1", location: "Production Line A" },
    { id: "MCH-002", name: "Press Machine B1", location: "Production Line B" },
    { id: "MCH-003", name: "Welding Robot C1", location: "Production Line C" },
    { id: "MCH-004", name: "Assembly Station D1", location: "Assembly Area" },
];

// Dummy spare parts
const spareParts = [
    { sku: "SPR-101", name: "Bearing Set Type A" },
    { sku: "SPR-102", name: "Hydraulic Pump" },
    { sku: "SPR-103", name: "Servo Motor 5KW" },
    { sku: "SPR-201", name: "Conveyor Belt 2M" },
    { sku: "SPR-301", name: "PLC Controller" },
];

// Dummy return records
const dummyReturns = [
    {
        id: "RFP-001",
        returnNumber: "RFP-2026-0001",
        machineId: "MCH-001",
        machineName: "CNC Machine A1",
        sku: "SPR-101",
        spareName: "Bearing Set Type A",
        quantity: 1,
        condition: "working",
        action: "added_to_stock",
        returnedBy: "Technician Kim",
        returnedAt: "2026-02-05T11:00:00",
    },
    {
        id: "RFP-002",
        returnNumber: "RFP-2026-0002",
        machineId: "MCH-003",
        machineName: "Welding Robot C1",
        sku: "SPR-103",
        spareName: "Servo Motor 5KW",
        quantity: 1,
        condition: "not_working",
        action: "sent_for_repair",
        returnedBy: "Technician Lee",
        returnedAt: "2026-02-04T16:30:00",
    },
    {
        id: "RFP-003",
        returnNumber: "RFP-2026-0003",
        machineId: "MCH-002",
        machineName: "Press Machine B1",
        sku: "SPR-102",
        spareName: "Hydraulic Pump",
        quantity: 1,
        condition: "working",
        action: "added_to_stock",
        returnedBy: "Technician Park",
        returnedAt: "2026-02-03T14:00:00",
    },
];

const conditionColors: Record<string, string> = {
    working: "bg-green-100 text-green-800",
    not_working: "bg-red-100 text-red-800",
};

const actionColors: Record<string, string> = {
    added_to_stock: "bg-green-100 text-green-800",
    sent_for_repair: "bg-yellow-100 text-yellow-800",
};

export default function ReturnFromProductionPage() {
    const [returns, setReturns] = useState(dummyReturns);
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Form state
    const [selectedMachine, setSelectedMachine] = useState("");
    const [selectedSpare, setSelectedSpare] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [condition, setCondition] = useState<"working" | "not_working">("working");

    const filteredReturns = returns.filter(
        (r) =>
            r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.spareName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Statistics
    const workingReturns = returns.filter((r) => r.condition === "working").length;
    const faultyReturns = returns.filter((r) => r.condition === "not_working").length;

    const handleCreateReturn = () => {
        if (!selectedMachine || !selectedSpare) {
            toast.error("Please select machine and spare part");
            return;
        }

        const machine = machines.find((m) => m.id === selectedMachine);
        const spare = spareParts.find((s) => s.sku === selectedSpare);

        const newReturn = {
            id: `RFP-${Date.now()}`,
            returnNumber: `RFP-2026-${String(returns.length + 1).padStart(4, "0")}`,
            machineId: selectedMachine,
            machineName: machine?.name || "",
            sku: selectedSpare,
            spareName: spare?.name || "",
            quantity: parseInt(quantity),
            condition,
            action: condition === "working" ? "added_to_stock" : "sent_for_repair",
            returnedBy: "Current Operator",
            returnedAt: new Date().toISOString(),
        };

        setReturns([newReturn, ...returns]);

        if (condition === "working") {
            toast.success(`${spare?.name} added to stock (${quantity} units)`);
        } else {
            toast.warning(`${spare?.name} marked for vendor repair`);
        }

        // Reset form
        setSelectedMachine("");
        setSelectedSpare("");
        setQuantity("1");
        setCondition("working");
        setCreateDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Return From Production</h1>
                <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Receive Return
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{returns.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Working (Added to Stock)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{workingReturns}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Faulty (For Repair)</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{faultyReturns}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Return #</TableHead>
                            <TableHead>Machine</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Spare Part</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Returned By</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReturns.map((ret) => (
                            <TableRow key={ret.id}>
                                <TableCell className="font-medium">{ret.returnNumber}</TableCell>
                                <TableCell>{ret.machineName}</TableCell>
                                <TableCell>{ret.sku}</TableCell>
                                <TableCell>{ret.spareName}</TableCell>
                                <TableCell>{ret.quantity}</TableCell>
                                <TableCell>
                                    <Badge className={conditionColors[ret.condition]}>
                                        {ret.condition === "working" ? "Working" : "Not Working"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={actionColors[ret.action]}>
                                        {ret.action === "added_to_stock" ? "Added to Stock" : "Sent for Repair"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{ret.returnedBy}</TableCell>
                                <TableCell>{new Date(ret.returnedAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create Return Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5" />
                            Receive Replaced Spare
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Machine (Spare removed from)</label>
                            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select machine" />
                                </SelectTrigger>
                                <SelectContent>
                                    {machines.map((machine) => (
                                        <SelectItem key={machine.id} value={machine.id}>
                                            {machine.id} - {machine.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Spare Part</label>
                            <Select value={selectedSpare} onValueChange={setSelectedSpare}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select spare part" />
                                </SelectTrigger>
                                <SelectContent>
                                    {spareParts.map((spare) => (
                                        <SelectItem key={spare.sku} value={spare.sku}>
                                            {spare.sku} - {spare.name}
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

                        <div className="space-y-3">
                            <label className="text-sm font-medium">Spare Condition</label>
                            <RadioGroup value={condition} onValueChange={(v) => setCondition(v as "working" | "not_working")}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="working" id="working" />
                                    <Label htmlFor="working" className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Working - Add to Stock
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="not_working" id="not_working" />
                                    <Label htmlFor="not_working" className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        Not Working - Send for Vendor Repair
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateReturn}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Receive Spare
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
