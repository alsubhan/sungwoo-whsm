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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Wrench, AlertTriangle, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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

// Dummy maintenance records
const dummyMaintenance = [
    {
        id: "MNT-001",
        maintenanceNumber: "MNT-2026-0001",
        type: "unplanned",
        machineId: "MCH-001",
        machineName: "CNC Machine A1",
        issueDetails: "Motor overheating - bearing failure",
        spareReplaced: "SPR-101",
        spareName: "Bearing Set Type A",
        startDateTime: "2026-02-05T08:00:00",
        endDateTime: "2026-02-05T10:30:00",
        operatorName: "Technician Kim",
        status: "completed",
    },
    {
        id: "MNT-002",
        maintenanceNumber: "MNT-2026-0002",
        type: "planned",
        machineId: "MCH-002",
        machineName: "Press Machine B1",
        issueDetails: "Scheduled hydraulic system maintenance",
        spareReplaced: "SPR-102",
        spareName: "Hydraulic Pump",
        startDateTime: "2026-02-06T09:00:00",
        endDateTime: null,
        operatorName: "Technician Park",
        status: "scheduled",
    },
    {
        id: "MNT-003",
        maintenanceNumber: "MNT-2026-0003",
        type: "unplanned",
        machineId: "MCH-003",
        machineName: "Welding Robot C1",
        issueDetails: "Welding arm servo failure",
        spareReplaced: "SPR-103",
        spareName: "Servo Motor 5KW",
        startDateTime: "2026-02-04T14:00:00",
        endDateTime: "2026-02-04T18:00:00",
        operatorName: "Technician Lee",
        status: "completed",
    },
];

const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
};

const typeColors: Record<string, string> = {
    planned: "bg-blue-100 text-blue-800",
    unplanned: "bg-red-100 text-red-800",
};

export default function MaintenancePage() {
    const [maintenanceRecords, setMaintenanceRecords] = useState(dummyMaintenance);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [maintenanceType, setMaintenanceType] = useState<"planned" | "unplanned">("unplanned");

    // Form state
    const [selectedMachine, setSelectedMachine] = useState("");
    const [issueDetails, setIssueDetails] = useState("");
    const [selectedSpare, setSelectedSpare] = useState("");
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [operatorName, setOperatorName] = useState("");

    const filteredRecords = maintenanceRecords.filter((record) => {
        const matchesSearch =
            record.maintenanceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.machineName.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === "all") return matchesSearch;
        if (activeTab === "planned") return matchesSearch && record.type === "planned";
        if (activeTab === "unplanned") return matchesSearch && record.type === "unplanned";
        return matchesSearch;
    });

    // Statistics
    const todayRecords = maintenanceRecords.filter(
        (r) => new Date(r.startDateTime).toDateString() === new Date().toDateString()
    );
    const plannedCount = maintenanceRecords.filter((r) => r.type === "planned").length;
    const unplannedCount = maintenanceRecords.filter((r) => r.type === "unplanned").length;

    const handleCreateMaintenance = () => {
        if (!selectedMachine || !issueDetails || !startDateTime || !operatorName) {
            toast.error("Please fill all required fields");
            return;
        }

        const machine = machines.find((m) => m.id === selectedMachine);
        const spare = spareParts.find((s) => s.sku === selectedSpare);

        const newRecord = {
            id: `MNT-${Date.now()}`,
            maintenanceNumber: `MNT-2026-${String(maintenanceRecords.length + 1).padStart(4, "0")}`,
            type: maintenanceType,
            machineId: selectedMachine,
            machineName: machine?.name || "",
            issueDetails,
            spareReplaced: selectedSpare || null,
            spareName: spare?.name || null,
            startDateTime,
            endDateTime: endDateTime || null,
            operatorName,
            status: endDateTime ? "completed" : (maintenanceType === "planned" ? "scheduled" : "in_progress"),
        };

        setMaintenanceRecords([newRecord, ...maintenanceRecords]);
        toast.success(
            `${maintenanceType === "planned" ? "Planned" : "Breakdown"} maintenance record created`
        );

        // Reset form
        setSelectedMachine("");
        setIssueDetails("");
        setSelectedSpare("");
        setStartDateTime("");
        setEndDateTime("");
        setOperatorName("");
        setCreateDialogOpen(false);
    };

    const openCreateDialog = (type: "planned" | "unplanned") => {
        setMaintenanceType(type);
        setCreateDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Planned/Unplanned Maintenance</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openCreateDialog("planned")}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Planned
                    </Button>
                    <Button onClick={() => openCreateDialog("unplanned")} variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Log Breakdown
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Today's Maintenance</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayRecords.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Planned</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plannedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Breakdowns</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unplannedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Downtime</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.5h</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Records</TabsTrigger>
                    <TabsTrigger value="planned">Planned</TabsTrigger>
                    <TabsTrigger value="unplanned">Breakdowns</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 mt-4">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search maintenance records..."
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
                                    <TableHead>Maintenance #</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Machine</TableHead>
                                    <TableHead>Issue Details</TableHead>
                                    <TableHead>Spare Replaced</TableHead>
                                    <TableHead>Start</TableHead>
                                    <TableHead>End</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.maintenanceNumber}</TableCell>
                                        <TableCell>
                                            <Badge className={typeColors[record.type]}>
                                                {record.type === "planned" ? "Planned" : "Breakdown"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{record.machineName}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{record.issueDetails}</TableCell>
                                        <TableCell>{record.spareName || "-"}</TableCell>
                                        <TableCell>{new Date(record.startDateTime).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {record.endDateTime ? new Date(record.endDateTime).toLocaleString() : "-"}
                                        </TableCell>
                                        <TableCell>{record.operatorName}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[record.status]}>{record.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create Maintenance Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {maintenanceType === "planned" ? (
                                <>
                                    <Calendar className="h-5 w-5" />
                                    Schedule Planned Maintenance
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Log Machine Breakdown
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Machine ID</label>
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
                            <label className="text-sm font-medium">Issue Details</label>
                            <Textarea
                                placeholder="Describe the issue or maintenance tasks..."
                                value={issueDetails}
                                onChange={(e) => setIssueDetails(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Spare Replaced (Optional)</label>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date/Time</label>
                                <Input
                                    type="datetime-local"
                                    value={startDateTime}
                                    onChange={(e) => setStartDateTime(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date/Time</label>
                                <Input
                                    type="datetime-local"
                                    value={endDateTime}
                                    onChange={(e) => setEndDateTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Operator Name</label>
                            <Input
                                placeholder="Enter operator name"
                                value={operatorName}
                                onChange={(e) => setOperatorName(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateMaintenance}>
                            {maintenanceType === "planned" ? "Schedule" : "Log Breakdown"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
