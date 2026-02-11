
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Package, Settings, Users } from "lucide-react";

const VendorDashboard = () => {
    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Vendor Portal</h1>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">R 45,231.89</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">+180 new products</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12,234</div>
                                <p className="text-xs text-muted-foreground">+19% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+573</div>
                                <p className="text-xs text-muted-foreground">+201 since last hour</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">You made 265 sales this month.</p>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">New vendor application received.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Manage your product inventory here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">View and process orders here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Configure your vendor profile and settings.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default VendorDashboard;
