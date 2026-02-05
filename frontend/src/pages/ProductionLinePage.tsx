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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Factory, Bot, ChevronDown, ChevronUp } from "lucide-react";

// Types
interface Machine {
    id: string;
    machineId: string;
    name: string;
    type: string;
    status: "Active" | "Inactive" | "Under Maintenance";
}

interface ProductionLine {
    id: string;
    lineId: string;
    name: string;
    description: string;
    status: "Active" | "Inactive";
    capacity: number;
    capacityUnit: string;
    shift: string;
    supervisor: string;
    machines: Machine[];
}

// Dummy machines for linking
const dummyMachines: Machine[] = [
    { id: "1", machineId: "MCH-001", name: "Welding Robot ARM-1", type: "Welding Robot", status: "Active" },
    { id: "2", machineId: "MCH-002", name: "Assembly Robot ARM-2", type: "Assembly Robot", status: "Active" },
    { id: "3", machineId: "MCH-003", name: "Painting Robot PNT-1", type: "Painting Robot", status: "Under Maintenance" },
    { id: "4", machineId: "MCH-004", name: "Spot Welder SW-1", type: "Spot Welding Robot", status: "Active" },
    { id: "5", machineId: "MCH-005", name: "Inspection Robot INS-1", type: "Vision Inspection", status: "Inactive" },
    { id: "6", machineId: "MCH-006", name: "Material Handler MH-1", type: "Material Handling", status: "Active" },
    { id: "7", machineId: "MCH-007", name: "Screw Driver SD-1", type: "Assembly Robot", status: "Active" },
    { id: "8", machineId: "MCH-008", name: "Glue Dispenser GD-1", type: "Assembly Robot", status: "Active" },
];

// Dummy production lines
const initialProductionLines: ProductionLine[] = [
    {
        id: "1",
        lineId: "PL-001",
        name: "Assembly Line A",
        description: "Main vehicle assembly line for sedan models",
        status: "Active",
        capacity: 120,
        capacityUnit: "units/day",
        shift: "3 Shifts",
        supervisor: "John Smith",
        machines: [dummyMachines[1], dummyMachines[6], dummyMachines[7]],
    },
    {
        id: "2",
        lineId: "PL-002",
        name: "Assembly Line B",
        description: "Secondary assembly line for SUV models",
        status: "Active",
        capacity: 80,
        capacityUnit: "units/day",
        shift: "2 Shifts",
        supervisor: "Sarah Johnson",
        machines: [dummyMachines[5]],
    },
    {
        id: "3",
        lineId: "PL-003",
        name: "Welding Line 1",
        description: "Body frame welding and spot welding operations",
        status: "Active",
        capacity: 200,
        capacityUnit: "frames/day",
        shift: "3 Shifts",
        supervisor: "Mike Chen",
        machines: [dummyMachines[0], dummyMachines[3]],
    },
    {
        id: "4",
        lineId: "PL-004",
        name: "Paint Shop",
        description: "Automated painting and coating line",
        status: "Active",
        capacity: 150,
        capacityUnit: "bodies/day",
        shift: "2 Shifts",
        supervisor: "Emily Davis",
        machines: [dummyMachines[2]],
    },
    {
        id: "5",
        lineId: "PL-005",
        name: "Quality Control",
        description: "Final inspection and quality assurance station",
        status: "Inactive",
        capacity: 300,
        capacityUnit: "units/day",
        shift: "3 Shifts",
        supervisor: "Robert Wilson",
        machines: [dummyMachines[4]],
    },
];

const ProductionLinePage = () => {
    const { toast } = useToast();
    const [productionLines, setProductionLines] = useState<ProductionLine[]>(initialProductionLines);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLine, setEditingLine] = useState<ProductionLine | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ProductionLine>>({
        lineId: "",
        name: "",
        description: "",
        status: "Active",
        capacity: 0,
        capacityUnit: "units/day",
        shift: "3 Shifts",
        supervisor: "",
        machines: [],
    });

    const filteredLines = productionLines.filter(
        (pl) =>
            pl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pl.lineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pl.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNew = () => {
        setEditingLine(null);
        setFormData({
            lineId: `PL-${String(productionLines.length + 1).padStart(3, "0")}`,
            name: "",
            description: "",
            status: "Active",
            capacity: 0,
            capacityUnit: "units/day",
            shift: "3 Shifts",
            supervisor: "",
            machines: [],
        });
        setDialogOpen(true);
    };

    const handleEdit = (line: ProductionLine) => {
        setEditingLine(line);
        setFormData(line);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setProductionLines(productionLines.filter((pl) => pl.id !== id));
        toast({
            title: "Production Line Deleted",
            description: "The production line has been removed from the system.",
        });
    };

    const handleSave = () => {
        if (editingLine) {
            setProductionLines(
                productionLines.map((pl) =>
                    pl.id === editingLine.id ? { ...pl, ...formData } as ProductionLine : pl
                )
            );
            toast({
                title: "Production Line Updated",
                description: "Production line details have been updated successfully.",
            });
        } else {
            const newLine: ProductionLine = {
                id: String(Date.now()),
                lineId: formData.lineId || "",
                name: formData.name || "",
                description: formData.description || "",
                status: formData.status || "Active",
                capacity: formData.capacity || 0,
                capacityUnit: formData.capacityUnit || "units/day",
                shift: formData.shift || "3 Shifts",
                supervisor: formData.supervisor || "",
                machines: formData.machines || [],
            };
            setProductionLines([...productionLines, newLine]);
            toast({
                title: "Production Line Added",
                description: "New production line has been added to the system.",
            });
        }
        setDialogOpen(false);
    };

    const toggleRowExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // Stats
    const totalLines = productionLines.length;
    const activeLines = productionLines.filter((pl) => pl.status === "Active").length;
    const totalMachines = productionLines.reduce((acc, pl) => acc + pl.machines.length, 0);
    const totalCapacity = productionLines
        .filter((pl) => pl.status === "Active")
        .reduce((acc, pl) => acc + pl.capacity, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Production Lines</h1>
                <Button onClick={handleAddNew} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Production Line
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lines</CardTitle>
                        <Factory className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLines}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Lines</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeLines}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMachines}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Capacity</CardTitle>
                        <Factory className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{totalCapacity}</div>
                        <p className="text-xs text-muted-foreground">units/day</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search production lines..."
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
                            <TableHead className="w-8"></TableHead>
                            <TableHead>Line ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Shift</TableHead>
                            <TableHead>Machines</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLines.length > 0 ? (
                            filteredLines.map((line) => (
                                <>
                                    <TableRow key={line.id}>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleRowExpand(line.id)}
                                            >
                                                {expandedRow === line.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{line.lineId}</TableCell>
                                        <TableCell className="font-medium">{line.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{line.description}</TableCell>
                                        <TableCell>
                                            {line.capacity} {line.capacityUnit}
                                        </TableCell>
                                        <TableCell>{line.shift}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{line.machines.length} machines</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {line.status === "Active" ? (
                                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(line)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(line.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedRow === line.id && (
                                        <TableRow key={`${line.id}-expanded`}>
                                            <TableCell colSpan={9} className="bg-gray-50 dark:bg-gray-900">
                                                <div className="p-4">
                                                    <h4 className="font-semibold mb-2">Linked Machines</h4>
                                                    {line.machines.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                            {line.machines.map((machine) => (
                                                                <div
                                                                    key={machine.id}
                                                                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border"
                                                                >
                                                                    <Bot className="h-4 w-4 text-blue-500" />
                                                                    <div>
                                                                        <div className="font-medium text-sm">{machine.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {machine.machineId} • {machine.type}
                                                                        </div>
                                                                    </div>
                                                                    <Badge
                                                                        className={`ml-auto text-xs ${machine.status === "Active"
                                                                                ? "bg-green-100 text-green-800"
                                                                                : machine.status === "Under Maintenance"
                                                                                    ? "bg-orange-100 text-orange-800"
                                                                                    : "bg-gray-100 text-gray-800"
                                                                            }`}
                                                                    >
                                                                        {machine.status}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm">No machines linked to this production line.</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                                    No production lines found.
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
                        <DialogTitle>{editingLine ? "Edit Production Line" : "Add New Production Line"}</DialogTitle>
                        <DialogDescription>
                            {editingLine ? "Update production line details" : "Enter details for the new production line"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Line ID</Label>
                            <Input
                                value={formData.lineId || ""}
                                onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                                placeholder="PL-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Assembly Line A"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Main vehicle assembly line for sedan models"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Capacity</Label>
                            <Input
                                type="number"
                                value={formData.capacity || ""}
                                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                placeholder="120"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Capacity Unit</Label>
                            <Select
                                value={formData.capacityUnit || "units/day"}
                                onValueChange={(value) => setFormData({ ...formData, capacityUnit: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="units/day">units/day</SelectItem>
                                    <SelectItem value="units/hour">units/hour</SelectItem>
                                    <SelectItem value="frames/day">frames/day</SelectItem>
                                    <SelectItem value="bodies/day">bodies/day</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Shift</Label>
                            <Select
                                value={formData.shift || "3 Shifts"}
                                onValueChange={(value) => setFormData({ ...formData, shift: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1 Shift">1 Shift</SelectItem>
                                    <SelectItem value="2 Shifts">2 Shifts</SelectItem>
                                    <SelectItem value="3 Shifts">3 Shifts</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Supervisor</Label>
                            <Input
                                value={formData.supervisor || ""}
                                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                                placeholder="John Smith"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status || "Active"}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as ProductionLine["status"] })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingLine ? "Update" : "Add"} Production Line
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProductionLinePage;
