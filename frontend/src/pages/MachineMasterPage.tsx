import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Bot, Wrench } from "lucide-react";

// Types
interface Machine {
    id: string;
    machineId: string;
    name: string;
    type: string;
    model: string;
    serialNumber: string;
    status: "Active" | "Inactive" | "Under Maintenance";
    productionLineId: string;
    productionLineName: string;
    location: string;
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
}

interface ProductionLine {
    id: string;
    name: string;
}

// Dummy production lines for dropdown
const dummyProductionLines: ProductionLine[] = [
    { id: "PL-001", name: "Assembly Line A" },
    { id: "PL-002", name: "Assembly Line B" },
    { id: "PL-003", name: "Welding Line 1" },
    { id: "PL-004", name: "Paint Shop" },
    { id: "PL-005", name: "Quality Control" },
];

// Dummy machines data
const initialMachines: Machine[] = [
    {
        id: "1",
        machineId: "MCH-001",
        name: "Welding Robot ARM-1",
        type: "Welding Robot",
        model: "FANUC ARC Mate 100iD",
        serialNumber: "FAN-2024-WR-001",
        status: "Active",
        productionLineId: "PL-003",
        productionLineName: "Welding Line 1",
        location: "Bay A - Section 1",
        lastMaintenanceDate: "2026-01-15",
        nextMaintenanceDate: "2026-04-15",
    },
    {
        id: "2",
        machineId: "MCH-002",
        name: "Assembly Robot ARM-2",
        type: "Assembly Robot",
        model: "KUKA KR 16",
        serialNumber: "KUK-2023-AR-045",
        status: "Active",
        productionLineId: "PL-001",
        productionLineName: "Assembly Line A",
        location: "Bay B - Section 2",
        lastMaintenanceDate: "2026-01-20",
        nextMaintenanceDate: "2026-04-20",
    },
    {
        id: "3",
        machineId: "MCH-003",
        name: "Painting Robot PNT-1",
        type: "Painting Robot",
        model: "ABB IRB 5500",
        serialNumber: "ABB-2024-PR-012",
        status: "Under Maintenance",
        productionLineId: "PL-004",
        productionLineName: "Paint Shop",
        location: "Paint Bay - Zone A",
        lastMaintenanceDate: "2026-02-01",
        nextMaintenanceDate: "2026-02-10",
    },
    {
        id: "4",
        machineId: "MCH-004",
        name: "Spot Welder SW-1",
        type: "Spot Welding Robot",
        model: "FANUC R-2000iC",
        serialNumber: "FAN-2022-SW-089",
        status: "Active",
        productionLineId: "PL-003",
        productionLineName: "Welding Line 1",
        location: "Bay A - Section 3",
        lastMaintenanceDate: "2026-01-10",
        nextMaintenanceDate: "2026-04-10",
    },
    {
        id: "5",
        machineId: "MCH-005",
        name: "Inspection Robot INS-1",
        type: "Vision Inspection",
        model: "Cognex In-Sight 9000",
        serialNumber: "COG-2025-VI-003",
        status: "Inactive",
        productionLineId: "PL-005",
        productionLineName: "Quality Control",
        location: "QC Station 1",
        lastMaintenanceDate: "2025-12-15",
        nextMaintenanceDate: "2026-03-15",
    },
];

const MachineMasterPage = () => {
    const { toast } = useToast();
    const [machines, setMachines] = useState<Machine[]>(initialMachines);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
    const [formData, setFormData] = useState<Partial<Machine>>({
        machineId: "",
        name: "",
        type: "",
        model: "",
        serialNumber: "",
        status: "Active",
        productionLineId: "",
        location: "",
        lastMaintenanceDate: "",
        nextMaintenanceDate: "",
    });

    const filteredMachines = machines.filter(
        (m) =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNew = () => {
        setEditingMachine(null);
        setFormData({
            machineId: `MCH-${String(machines.length + 1).padStart(3, "0")}`,
            name: "",
            type: "",
            model: "",
            serialNumber: "",
            status: "Active",
            productionLineId: "",
            location: "",
            lastMaintenanceDate: "",
            nextMaintenanceDate: "",
        });
        setDialogOpen(true);
    };

    const handleEdit = (machine: Machine) => {
        setEditingMachine(machine);
        setFormData(machine);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setMachines(machines.filter((m) => m.id !== id));
        toast({
            title: "Machine Deleted",
            description: "The machine has been removed from the system.",
        });
    };

    const handleSave = () => {
        const productionLine = dummyProductionLines.find(
            (pl) => pl.id === formData.productionLineId
        );

        if (editingMachine) {
            setMachines(
                machines.map((m) =>
                    m.id === editingMachine.id
                        ? {
                            ...m,
                            ...formData,
                            productionLineName: productionLine?.name || "",
                        }
                        : m
                )
            );
            toast({
                title: "Machine Updated",
                description: "Machine details have been updated successfully.",
            });
        } else {
            const newMachine: Machine = {
                id: String(Date.now()),
                machineId: formData.machineId || "",
                name: formData.name || "",
                type: formData.type || "",
                model: formData.model || "",
                serialNumber: formData.serialNumber || "",
                status: formData.status || "Active",
                productionLineId: formData.productionLineId || "",
                productionLineName: productionLine?.name || "",
                location: formData.location || "",
                lastMaintenanceDate: formData.lastMaintenanceDate || "",
                nextMaintenanceDate: formData.nextMaintenanceDate || "",
            };
            setMachines([...machines, newMachine]);
            toast({
                title: "Machine Added",
                description: "New machine has been added to the system.",
            });
        }
        setDialogOpen(false);
    };

    const getStatusBadge = (status: Machine["status"]) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case "Inactive":
                return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
            case "Under Maintenance":
                return <Badge className="bg-orange-100 text-orange-800">Under Maintenance</Badge>;
        }
    };

    // Stats
    const activeCount = machines.filter((m) => m.status === "Active").length;
    const maintenanceCount = machines.filter((m) => m.status === "Under Maintenance").length;
    const inactiveCount = machines.filter((m) => m.status === "Inactive").length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Machine Master</h1>
                <Button onClick={handleAddNew} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Machine
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{machines.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
                        <Wrench className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{maintenanceCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-500">{inactiveCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search machines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Machine ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Production Line</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Maintenance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMachines.length > 0 ? (
                            filteredMachines.map((machine) => (
                                <TableRow key={machine.id}>
                                    <TableCell className="font-mono text-sm">{machine.machineId}</TableCell>
                                    <TableCell className="font-medium">{machine.name}</TableCell>
                                    <TableCell>{machine.type}</TableCell>
                                    <TableCell>{machine.model}</TableCell>
                                    <TableCell>{machine.productionLineName}</TableCell>
                                    <TableCell>{machine.location}</TableCell>
                                    <TableCell>{getStatusBadge(machine.status)}</TableCell>
                                    <TableCell>{machine.lastMaintenanceDate}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(machine)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(machine.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                                    No machines found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingMachine ? "Edit Machine" : "Add New Machine"}</DialogTitle>
                        <DialogDescription>
                            {editingMachine ? "Update machine details" : "Enter details for the new machine"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Machine ID</Label>
                            <Input
                                value={formData.machineId || ""}
                                onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                                placeholder="MCH-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Welding Robot ARM-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type || ""}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Welding Robot">Welding Robot</SelectItem>
                                    <SelectItem value="Assembly Robot">Assembly Robot</SelectItem>
                                    <SelectItem value="Painting Robot">Painting Robot</SelectItem>
                                    <SelectItem value="Spot Welding Robot">Spot Welding Robot</SelectItem>
                                    <SelectItem value="Vision Inspection">Vision Inspection</SelectItem>
                                    <SelectItem value="Material Handling">Material Handling</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Model</Label>
                            <Input
                                value={formData.model || ""}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder="FANUC ARC Mate 100iD"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Serial Number</Label>
                            <Input
                                value={formData.serialNumber || ""}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="FAN-2024-WR-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Production Line</Label>
                            <Select
                                value={formData.productionLineId || ""}
                                onValueChange={(value) => setFormData({ ...formData, productionLineId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select production line" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dummyProductionLines.map((pl) => (
                                        <SelectItem key={pl.id} value={pl.id}>
                                            {pl.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Bay A - Section 1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status || "Active"}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as Machine["status"] })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Last Maintenance Date</Label>
                            <Input
                                type="date"
                                value={formData.lastMaintenanceDate || ""}
                                onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Next Maintenance Date</Label>
                            <Input
                                type="date"
                                value={formData.nextMaintenanceDate || ""}
                                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingMachine ? "Update" : "Add"} Machine
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MachineMasterPage;
