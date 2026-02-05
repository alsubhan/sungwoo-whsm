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
import { Plus, Search, Factory, Package, ScanLine, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Dummy production lines
const productionLines = [
    { id: "PL-A1", name: "Production Line A1" },
    { id: "PL-A2", name: "Production Line A2" },
    { id: "PL-B1", name: "Production Line B1" },
    { id: "PL-B2", name: "Production Line B2" },
];

// Dummy FG products by production line
const fgProductsByLine: Record<string, Array<{ sku: string; name: string; }>> = {
    "PL-A1": [
        { sku: "FG-001", name: "Engine Assembly A1" },
        { sku: "FG-002", name: "Transmission Unit A1" },
    ],
    "PL-A2": [
        { sku: "FG-003", name: "Chassis Frame A2" },
        { sku: "FG-004", name: "Suspension System A2" },
    ],
    "PL-B1": [
        { sku: "FG-005", name: "Door Panel Set B1" },
        { sku: "FG-006", name: "Dashboard Assembly B1" },
    ],
    "PL-B2": [
        { sku: "FG-007", name: "Seat Assembly B2" },
        { sku: "FG-008", name: "Interior Trim B2" },
    ],
};

// Dummy receipt history
const dummyReceipts = [
    {
        id: "FGR-001",
        receiptNumber: "FGR-2026-0001",
        productionLine: "Production Line A1",
        sku: "FG-001",
        productName: "Engine Assembly A1",
        quantity: 25,
        operatorName: "Kim Jung-ho",
        receivedAt: "2026-02-05T09:30:00",
        status: "received",
    },
    {
        id: "FGR-002",
        receiptNumber: "FGR-2026-0002",
        productionLine: "Production Line B1",
        sku: "FG-005",
        productName: "Door Panel Set B1",
        quantity: 40,
        operatorName: "Park Min-ji",
        receivedAt: "2026-02-05T08:15:00",
        status: "received",
    },
    {
        id: "FGR-003",
        receiptNumber: "FGR-2026-0003",
        productionLine: "Production Line A2",
        sku: "FG-003",
        productName: "Chassis Frame A2",
        quantity: 15,
        operatorName: "Lee Sang-woo",
        receivedAt: "2026-02-04T16:45:00",
        status: "received",
    },
];

export default function FinishGoodsReceiptPage() {
    const [receipts, setReceipts] = useState(dummyReceipts);
    const [searchTerm, setSearchTerm] = useState("");
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

    // Form state
    const [selectedLine, setSelectedLine] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [scannedSku, setScannedSku] = useState("");
    const [quantity, setQuantity] = useState("");
    const [isScanned, setIsScanned] = useState(false);

    const availableProducts = selectedLine ? fgProductsByLine[selectedLine] || [] : [];

    const filteredReceipts = receipts.filter(
        (r) =>
            r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleScan = () => {
        if (!selectedLine || !selectedProduct) {
            toast.error("Please select production line and product first");
            return;
        }

        const product = availableProducts.find((p) => p.sku === selectedProduct);
        if (product && scannedSku.toLowerCase() === product.sku.toLowerCase()) {
            setIsScanned(true);
            toast.success(`Verified: ${product.name}`);
        } else {
            toast.error("SKU does not match selected product");
            setIsScanned(false);
        }
    };

    const handleReceive = () => {
        if (!selectedLine || !selectedProduct || !quantity || !isScanned) {
            toast.error("Please complete all fields and scan the product");
            return;
        }

        const product = availableProducts.find((p) => p.sku === selectedProduct);
        const line = productionLines.find((l) => l.id === selectedLine);

        const newReceipt = {
            id: `FGR-${Date.now()}`,
            receiptNumber: `FGR-2026-${String(receipts.length + 1).padStart(4, "0")}`,
            productionLine: line?.name || selectedLine,
            sku: selectedProduct,
            productName: product?.name || "",
            quantity: parseInt(quantity),
            operatorName: "Current Operator",
            receivedAt: new Date().toISOString(),
            status: "received",
        };

        setReceipts([newReceipt, ...receipts]);
        toast.success(
            `Received ${quantity} units of ${product?.name}. Stock updated in FG Warehouse.`
        );

        // Reset form
        setSelectedLine("");
        setSelectedProduct("");
        setScannedSku("");
        setQuantity("");
        setIsScanned(false);
        setReceiptDialogOpen(false);
    };

    const resetForm = () => {
        setSelectedLine("");
        setSelectedProduct("");
        setScannedSku("");
        setQuantity("");
        setIsScanned(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Finish Goods Receipt</h1>
                <Button
                    onClick={() => {
                        resetForm();
                        setReceiptDialogOpen(true);
                    }}
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Receive FG
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Today's Receipts</CardTitle>
                        <Factory className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {receipts.filter((r) => new Date(r.receivedAt).toDateString() === new Date().toDateString()).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Units Today</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {receipts
                                .filter((r) => new Date(r.receivedAt).toDateString() === new Date().toDateString())
                                .reduce((sum, r) => sum + r.quantity, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Lines</CardTitle>
                        <Factory className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productionLines.length}</div>
                    </CardContent>
                </Card>
            </div>

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
                            <TableHead>Production Line</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Operator</TableHead>
                            <TableHead>Received At</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReceipts.map((receipt) => (
                            <TableRow key={receipt.id}>
                                <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                                <TableCell>{receipt.productionLine}</TableCell>
                                <TableCell>{receipt.sku}</TableCell>
                                <TableCell>{receipt.productName}</TableCell>
                                <TableCell>{receipt.quantity}</TableCell>
                                <TableCell>{receipt.operatorName}</TableCell>
                                <TableCell>{new Date(receipt.receivedAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge className="bg-green-100 text-green-800">Received</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Receive FG Dialog */}
            <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Factory className="h-5 w-5" />
                            Receive Finish Goods
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Production Line</label>
                            <Select value={selectedLine} onValueChange={(v) => {
                                setSelectedLine(v);
                                setSelectedProduct("");
                                setIsScanned(false);
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select production line" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productionLines.map((line) => (
                                        <SelectItem key={line.id} value={line.id}>
                                            {line.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">FG Product</label>
                            <Select value={selectedProduct} onValueChange={(v) => {
                                setSelectedProduct(v);
                                setIsScanned(false);
                            }} disabled={!selectedLine}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select FG product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableProducts.map((product) => (
                                        <SelectItem key={product.sku} value={product.sku}>
                                            {product.sku} - {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Scan Barcode</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Scan or enter SKU..."
                                    value={scannedSku}
                                    onChange={(e) => setScannedSku(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                                />
                                <Button variant="outline" onClick={handleScan}>
                                    <ScanLine className="h-4 w-4" />
                                </Button>
                            </div>
                            {isScanned && (
                                <div className="flex items-center gap-1 text-green-600 text-sm">
                                    <CheckCircle className="h-4 w-4" />
                                    Verified
                                </div>
                            )}
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
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleReceive} disabled={!isScanned || !quantity}>
                            <Package className="h-4 w-4 mr-2" />
                            Receive to FG Warehouse
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
