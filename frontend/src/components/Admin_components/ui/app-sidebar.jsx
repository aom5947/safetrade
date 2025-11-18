import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../ui/sidebar"
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { AlertCircle, BarChart2, ChevronDown, ChevronRight, ChevronUp, CreditCard, FileText, LayoutDashboard, User, User2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Button } from "@/components/Admin_components/ui/button";


// const menuItems = [
//   { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
//   { icon: Users, label: 'ผู้ใช้งาน', path: '/users' },
//   { icon: Package, label: 'ประกาศ', path: '/listings' },
//   { icon: Folder, label: 'หมวดหมู่', path: '/categories' },
//   { icon: Star, label: 'รีวิว', path: '/reviews' },
//   { icon: Flag, label: 'รายงาน', path: '/reports' },
// ];

const navData = [
  {
    icon: <BarChart2 />,
    label: 'Dashboard / Analytics',
    menuName: 'dashboard',
    children: [
      { label: 'ดูยอดขายทั้งหมด', link: '/admin/' },
    ]
  },
  {
    icon: <AlertCircle />,
    label: 'รายงาน',
    menuName: 'reports',
    children: [
      { label: 'รายงานประกาศ', link: '/admin/reports' },
      { label: 'จัดการประกาศ', link: '/admin/listings' },
    ]
  },
  // {
  //   icon: <CreditCard />,
  //   label: 'ติดตามปัญหา / ข้อร้องเรียน',
  //   menuName: 'disputes',
  //   children: [
  //     { label: 'รายการข้อร้องเรียน', link: '/admin/disputes' },
  //     { label: 'ระบบซัพพอร์ต', link: '/admin/support' },
  //   ]
  // },
  {
    icon: <User />,
    label: 'หมวดหมู่',
    menuName: 'categories',
    children: [
      { label: 'จัดการหมวดหมู่', link: '/admin/categories' },
    ]
  },
  {
    icon: <User />,
    label: 'จัดการผู้ใช้งาน',
    menuName: 'users',
    children: [
      { label: 'จัดการผู้ใช้งาน', link: '/admin/users/' },
    ]
  },
];


export function AppSidebar({ role, setToken, setRole, setUserData }) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const navigate = useNavigate();

  const handleLogout = () => {
    // ล้างข้อมูลใน localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");

    navigate("/login");
  };

  // if (isMobile) {
  //   return (
  //     <div>

  //     <Sidebar>
  //       <SidebarHeader>
  //         <div className="flex items-center gap-2 px-2 py-4">
  //           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
  //             <LayoutDashboard className="h-4 w-4" />
  //           </div>
  //           <div className="flex flex-col">
  //             <span className="text-sm font-semibold">Admin Panel</span>
  //             <span className="text-xs text-sidebar-foreground/70">game trust</span>
  //           </div>
  //         </div>
  //     </div>
  //       </SidebarHeader>
  //       <SidebarContent>
  //         <SidebarGroup />
  //         <SidebarGroup />
  //       </SidebarContent>
  //       <SidebarFooter>
  //       </SidebarFooter>
  //     </Sidebar>
  //   )
  // }

  return (
    <Sidebar>
      <SidebarHeader className="border-b ">
        <div className="flex items-center gap-2 px-2 h-20">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Admin Panel</span>
            <span className="text-xs text-sidebar-foreground/70">game trust</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navData.map((item) => (
                <Collapsible key={item.menuName} defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <div className='flex items-center justify-between w-full'>
                          <span className="text-blue-500">{item.label}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.link}>
                            <SidebarMenuSubButton asChild>
                              <Link to={child.link}>
                                <span>{child.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <Link to="/profile-admin">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button onClick={handleLogout} variant="ghost">Sign out</Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}