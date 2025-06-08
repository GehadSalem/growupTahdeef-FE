import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { Habit } from "@/lib/types";
import api from "@/utils/api";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await api.get("/habits");
        setHabits(response.data);
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في تحميل العادات",
          variant: "destructive",
        });
        console.error("Error fetching habits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  const calculateDailyProgress = () => {
    const completedHabits = habits.filter((habit) => habit.completed).length;
    return habits.length > 0
      ? Math.round((completedHabits / habits.length) * 100)
      : 0;
  };

  const toggleHabitComplete = async (id: string) => {
  const originalHabits = [...habits];
  try {
    // Find the habit first
    const habitToUpdate = habits.find(habit => habit.id === id);
    if (!habitToUpdate) return;

    // Create the updated data
    const updatedData = { completed: !habitToUpdate.completed };

    // Optimistic update
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, ...updatedData } : habit
      )
    );

    // Send the actual update with the new completed status
    await api.patch(`/habits/${id}`, updatedData);

    // Show different toast based on new state
    toast({
      title: !habitToUpdate.completed ? "أحسنت! 👏" : "تم الإلغاء",
      description: !habitToUpdate.completed 
        ? `لقد أكملت "${habitToUpdate.name}"`
        : `لقد ألغيت إكمال "${habitToUpdate.name}"`,
    });
  } catch (error) {
    // Revert on error
    setHabits(originalHabits);
    toast({
      title: "خطأ",
      description: "فشل في تحديث حالة العادة",
      variant: "destructive",
    });
    console.error("Error toggling habit completion:", error);
  }
};

  const addHabit = async (habitData: {
    name: string;
    category: string;
    frequency: {
      type: "daily" | "weekly" | "monthly";
      time?: string;
      days?: number[];
      dayOfMonth?: number;
    };
  }) => {
    try {
      const response = await api.post("/habits", habitData);
      setHabits([...habits, response.data]);
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة عادة جديدة بنجاح",
      });
      return response.data;
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة العادة",
        variant: "destructive",
      });
      console.error("Error adding habit:", error);
      throw error;
    }
  };

  const editHabit = async (
    id: string,
    habitData: {
      name: string;
      category: string;
      frequency?: {
        type: "daily" | "weekly" | "monthly";
        time?: string;
        days?: number[];
        dayOfMonth?: number;
      };
    }
  ) => {
    const originalHabits = [...habits];
    try {
      // Optimistic update
      setHabits(
        habits.map((habit) =>
          habit.id === id ? { ...habit, ...habitData } : habit
        )
      );

      const response = await api.put(`/habits/${id}`, habitData);
      
      // Update with server response
      setHabits(
        habits.map((habit) =>
          habit.id === id ? response.data : habit
        )
      );

      // Update selected habit if it's the one being edited
      if (selectedHabit?.id === id) {
        setSelectedHabit(response.data);
      }

      toast({
        title: "تم التعديل",
        description: "تم تعديل العادة بنجاح",
      });
      return response.data;
    } catch (error: any) {
      // Revert on error
      setHabits(originalHabits);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تعديل العادة",
        variant: "destructive",
      });
      console.error("Error editing habit:", error);
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    const originalHabits = [...habits];
    try {
      // Optimistic update
      setHabits(habits.filter((habit) => habit.id !== id));
      
      await api.delete(`/habits/${id}`);
      
      // Clear selected habit if it's the one being deleted
      if (selectedHabit?.id === id) {
        setSelectedHabit(null);
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف العادة بنجاح",
      });
      return true;
    } catch (error: any) {
      // Revert on error
      setHabits(originalHabits);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حذف العادة",
        variant: "destructive",
      });
      console.error("Error deleting habit:", error);
      return false;
    }
  };



  // Function to select a habit by ID
  const selectHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    setSelectedHabit(habit || null);
  };

  // Function to clear the selected habit
  const clearSelectedHabit = () => {
    setSelectedHabit(null);
  };

  return {
    habits,
    loading,
    selectedHabit,
    selectHabit,
    clearSelectedHabit,
    toggleHabitComplete,
    addHabit,
    editHabit,
    deleteHabit,
    calculateDailyProgress,
  };
}