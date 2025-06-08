import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { HabitCard } from "@/components/ui/HabitCard";
import { AddHabitDialog } from "@/components/ui/AddHabitDialog";
import { EditHabitDialog } from "@/components/ui/EditHabitDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getIconForCategory } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// تعريف واجهة Habit
interface HabitFrequency {
  type: 'daily' | 'weekly' | 'monthly';
  time?: string;
  days?: number[];
  dayOfMonth?: number;
}

interface Habit {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  frequency?: HabitFrequency;
}

interface HabitsListProps {
  habits: Habit[];
  onHabitComplete: (id: string) => Promise<void>;
  onHabitDelete: (id: string) => Promise<boolean>;
  onHabitEdit?: (
    id: string, 
    habit: { 
      name: string; 
      category: string;
      frequency?: HabitFrequency;
    }
  ) => Promise<void>;
  onAddHabit: (
    habit: { 
      name: string; 
      category: string;
      frequency: HabitFrequency;
    }
  ) => Promise<void>;
}

export function HabitsList({ 
  habits, 
  onHabitComplete, 
  onHabitDelete, 
  onHabitEdit, 
  onAddHabit 
}: HabitsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedHabitDetails, setSelectedHabitDetails] = useState<Habit | null>(null);

  const handleOpenDetails = (habit: Habit) => {
    setSelectedHabitDetails(habit);
    setDetailsDialogOpen(true);
  };

  const handleOpenEditDialog = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      setSelectedHabit(habit);
      setEditDialogOpen(true);
    }
  };

  const handleOpenDeleteDialog = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      setSelectedHabit(habit);
      setDeleteDialogOpen(true);
    }
    return Promise.resolve();
  };

  const handleDelete = async () => {
    if (selectedHabit) {
      try {
        setIsLoading(true);
        await onHabitDelete(selectedHabit.id);
        setDeleteDialogOpen(false);
        setSelectedHabit(null);
      } catch (error) {
        console.error("Error deleting habit:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-cairo">العادات اليومية</h2>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-growup hover:bg-growup-dark"
          aria-label="إضافة عادة جديدة"
        >
          <Plus className="mr-0 ml-2 h-4 w-4" />
          إضافة عادة
        </Button>
      </div>
      
      <div className="space-y-3">
        {habits.map((habit) => (
          <div 
            key={habit.id} 
            onClick={() => handleOpenDetails(habit)}
            className="cursor-pointer"
          >
            <HabitCard 
  id={habit.id}
  name={habit.name} 
  category={habit.category}
  completed={habit.completed}
  icon={getIconForCategory(habit.category)}
  frequency={habit.frequency}
  onComplete={() => onHabitComplete(habit.id)}
  onDelete={() => handleOpenDeleteDialog(habit.id)}
  onEdit={onHabitEdit ? () => handleOpenEditDialog(habit.id) : undefined}
/>
          </div>
        ))}
      </div>
      
      {habits.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4 font-cairo">لم تقم بإضافة أي عادات بعد</p>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-growup hover:bg-growup-dark"
          >
            <Plus className="mr-0 ml-2 h-4 w-4" />
            إضافة عادة جديدة
          </Button>
        </div>
      )}
      
      <AddHabitDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onAddHabit={onAddHabit} 
      />
      
      {selectedHabit && onHabitEdit && (
        <EditHabitDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEditHabit={async (updatedHabit) => {
            try {
              setIsLoading(true);
              await onHabitEdit(selectedHabit.id, updatedHabit);
              setEditDialogOpen(false);
            } catch (error) {
              console.error("Error editing habit:", error);
            } finally {
              setIsLoading(false);
            }
          }}
          habit={selectedHabit}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-cairo">هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف العادة "{selectedHabit?.name}" بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="font-cairo"
              disabled={isLoading}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 font-cairo"
              disabled={isLoading}
            >
              {isLoading ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          
          {selectedHabitDetails && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  {getIconForCategory(selectedHabitDetails.category)}
                </div>
                <div>
                  <h3 className="font-bold font-cairo">{selectedHabitDetails.name}</h3>
                  <p className="text-sm text-gray-500">{selectedHabitDetails.category}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium font-cairo">التكرار:</h4>
                <p className="text-sm">
                  {selectedHabitDetails.frequency?.type === 'daily' && 'يومي'}
                  {selectedHabitDetails.frequency?.type === 'weekly' && 'أسبوعي'}
                  {selectedHabitDetails.frequency?.type === 'monthly' && 'شهري'}
                </p>
                
                {selectedHabitDetails.frequency?.time && (
                  <p className="text-sm">الوقت: {selectedHabitDetails.frequency.time}</p>
                )}
                
                {selectedHabitDetails.frequency?.days && (
                  <p className="text-sm">
                    الأيام: {selectedHabitDetails.frequency.days.join('، ')}
                  </p>
                )}
                
                {selectedHabitDetails.frequency?.dayOfMonth && (
                  <p className="text-sm">
                    يوم من الشهر: {selectedHabitDetails.frequency.dayOfMonth}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}