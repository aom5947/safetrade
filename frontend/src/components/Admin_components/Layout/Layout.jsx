import { Outlet } from "react-router-dom";
import { AppSidebar } from "../ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import React from "react";


export default function AdminLayout() {
    return (
        <main className="font-lineSeed">
            <SidebarProvider defaultOpen
                style={{
                    "--sidebar-width": "18rem",
                    "--sidebar-width-mobile": "20rem",
                }}
            >
                <AppSidebar />
                <main className="px-2 w-full">
                    <header className="h-20 flex justify-between items-center">
                        <SidebarTrigger />
                        <div className="space-x-2">
                            <span>Your are: admin</span>
                        </div>
                    </header>
                    <Outlet />
                </main>
            </SidebarProvider>
        </main>
    )
}