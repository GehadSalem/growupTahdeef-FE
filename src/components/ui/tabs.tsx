"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <div className="relative overflow-x-auto">
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-h-10 w-max",
        className
      )}
      {...props}
    />
  </div>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm h-auto flex-shrink-0",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// مكون جديد لشريط الأهداف مع الزر
const GoalsHeader = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <h2 className="text-xl font-semibold">قوالب الأهداف المقترحة</h2>
    <p className="text-gray-600">إدارة قوالب الأهداف التي يمكن للمستخدمين اختيارها</p>
  </div>
)

// مكون جديد لشريط التصنيفات مع الزر
const GoalsCategories = () => (
  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
      <Button variant="outline" className="h-10">
        شخصية
      </Button>
      <Button variant="outline" className="h-10">
        أهداف مالية
      </Button>
    </div>
    <Button className="h-10 flex items-center gap-1">
      <Plus className="h-4 w-4" />
      <span>هدف جديد</span>
    </Button>
  </div>
)

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  GoalsHeader,
  GoalsCategories
}