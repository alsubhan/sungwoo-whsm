import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Package,
  BarChart3,
  Users,
  Settings,
  LogOut,
  MenuIcon,
  User,
  Shield,
  Home,
  Boxes,
  FolderTree,
  Ruler,
  FileText,
  Truck,
  ShoppingCart,
  ClipboardCheck,
  CreditCard,
  Barcode,
  UploadCloud,
  Receipt,
  Calculator,
  ClipboardList,
  ScanBarcode,
  PackageCheck,
  FileInput,
  ArrowRightLeft,
  PackagePlus,
  Wrench,
  RotateCcw,
  FileOutput,
  Bot,

  Factory,
  ChevronRight
} from "lucide-react";

// Add prop for performance dashboard toggle
type SidebarProps = {
  onPerformanceToggle?: () => void;
};

const sidebarGroups = [
  {
    items: [{
      name: "Dashboard",
      href: "/",
      icon: Home,
      permission: 'dashboard_view'
    }]
  },
  {
    title: "Masters",
    items: [{
      name: "Products",
      href: "/products",
      icon: Boxes,
      permission: 'products_view'
    }, {
      name: "Categories",
      href: "/categories",
      icon: FolderTree,
      permission: 'categories_view'
    }, {
      name: "Units",
      href: "/units",
      icon: Ruler,
      permission: 'units_view'
    }, {
      name: "Taxes",
      href: "/taxes",
      icon: Calculator,
      permission: 'taxes_view'
    }, {
      name: "Machines",
      href: "/machine-master",
      icon: Bot
    }, {
      name: "Production Lines",
      href: "/production-lines",
      icon: Factory
    }, {
      name: "Suppliers",
      href: "/suppliers",
      icon: Truck,
      permission: 'suppliers_view'
    }, {
      name: "Customers",
      href: "/customers",
      icon: Users,
      permission: 'customers_view'
    }, {
      name: "Users & Roles",
      href: "/users",
      icon: User,
      permission: 'users_view'
    }]
  },
  {
    title: "Transactions",
    items: [{
      name: "Inventory",
      href: "/inventory",
      icon: Package,
      permission: 'inventory_view'
    }, {
      name: "Purchase Orders",
      href: "/purchase-orders",
      icon: ShoppingCart,
      permission: 'purchase_orders_view'
    }, {
      name: "Goods Receive Notes",
      href: "/grns",
      icon: ClipboardCheck,
      permission: 'grn_view'
    }, {
      name: "Sales Orders",
      href: "/sale-orders",
      icon: FileText,
      permission: 'sale_orders_view'
    }, {
      name: "Sales Invoices",
      href: "/sale-invoices",
      icon: Receipt,
      permission: 'sale_invoices_view'
    },
    {
      name: "Credit Notes",
      href: "/credit-notes",
      icon: CreditCard,
      permission: 'credit_notes_view'
    },
    {
      name: "Pick List",
      href: "/pick-list",
      icon: ClipboardList
    }, {
      name: "Picking",
      href: "/picking",
      icon: ScanBarcode
    }, {
      name: "FG Receipt",
      href: "/finish-goods-receipt",
      icon: PackageCheck
    }, {
      name: "Indent",
      href: "/indent",
      icon: FileInput
    }, {
      name: "Material Movement",
      href: "/material-movement",
      icon: ArrowRightLeft
    }, {
      name: "Store Receipt",
      href: "/store-receipt",
      icon: PackagePlus
    }, {
      name: "Maintenance",
      href: "/maintenance",
      icon: Wrench
    }, {
      name: "Return From Prod",
      href: "/return-from-production",
      icon: RotateCcw
    }, {
      name: "Delivery Challan",
      href: "/delivery-challan",
      icon: FileOutput
    }]
  },
  {
    title: "Reports",
    items: [{
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      permission: 'reports_view'
    }]
  },
  {
    title: "Utilities",
    items: [{
      name: "Barcode Printing",
      href: "/barcodes",
      icon: Barcode,
      permission: 'barcode_view'
    }, {
      name: "Backup & Restore",
      href: "/backup",
      icon: UploadCloud,
      permission: 'backup_view'
    }, {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      permission: 'settings_view'
    }]
  }
];

export const Sidebar = ({ onPerformanceToggle }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const {
    user,
    signOut,
    hasPermission
  } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    signOut();
  };

  const formattedDate = currentTime.toLocaleString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const initials = user?.user_metadata?.full_name ? `${user.user_metadata.full_name.split(' ')[0][0]}${user.user_metadata.full_name.split(' ')[1]?.[0] || ''}` : user?.email?.[0]?.toUpperCase() || 'U';

  // Filter navigation items based on user permissions
  const filteredGroups = sidebarGroups.map(group => ({
    ...group,
    items: group.items.filter(link => !link.permission || hasPermission(link.permission))
  })).filter(group => group.items.length > 0);

  return <div className={cn("flex flex-col border-r bg-card border-border h-screen transition-all duration-300", collapsed ? "w-16" : "w-64")}>
    <div className="flex items-center justify-between p-4 border-b border-border h-16">
      {!collapsed && (
        <div
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onPerformanceToggle}
          title="Click to open Performance Dashboard"
        >
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Sungwoo WHS</h1>
            <p className="text-xs text-muted-foreground">WH and Store Mgmt</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
          <MenuIcon size={20} />
        </Button>
      </div>
    </div>

    {!collapsed && <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
      {formattedDate}
    </div>}

    <ScrollArea className="flex-1">
      <div className={cn("flex flex-col gap-1 p-2")}>
        {filteredGroups.map((group, groupIndex) => {
          // If no title (Dashboard), render flat
          if (!group.title) {
            return (
              <div key={groupIndex} className="mb-2">
                {group.items.map(link => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      title={collapsed ? link.name : undefined}
                    >
                      <link.icon className={collapsed ? "h-6 w-6" : "h-5 w-5"} />
                      {!collapsed && <span>{link.name}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          }

          // If collapsed sidebar, render flat with separator
          if (collapsed) {
            return (
              <div key={groupIndex} className="mb-2">
                <div className="my-2 border-t border-border" />
                {group.items.map(link => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      title={link.name}
                    >
                      <link.icon className="h-6 w-6" />
                    </Link>
                  );
                })}
              </div>
            )
          }

          // Expanded sidebar with title: Use Collapsible
          return (
            <Collapsible key={groupIndex} defaultOpen className="mb-2 group/collapsible">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground">
                {group.title}
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                {group.items.map(link => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ml-2",
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </ScrollArea>

    <div className="border-t border-border p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-start gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && <div className="flex flex-col items-start text-sm">
              <span className="font-medium">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
            </div>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/user-settings" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>;
}; 