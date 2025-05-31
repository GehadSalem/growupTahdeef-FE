import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { Habit } from "@/lib/types";
import axios from "axios";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch habits from backend on initial load
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await axios.get('/api/habits');
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

  // حساب التقدم اليومي
  const calculateDailyProgress = () => {
    const completedHabits = habits.filter(habit => habit.completed).length;
    return habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;
  };

  // تغيير حالة العادة (مكتملة/غير مكتملة)
  const toggleHabitComplete = async (id: string) => {
    try {
      // Optimistic UI update
      setHabits(habits.map(habit => 
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      ));
      
      // Send request to backend
      await axios.patch(`/api/habits/${id}/complete`);
      
      // إظهار رسالة نجاح عند إكمال العادة
      const habit = habits.find(h => h.id === id);
      if (habit && !habit.completed) {
        toast({
          title: "أحسنت! 👏",
          description: `لقد أكملت "${habit.title}"`,
        });
      }
    } catch (error) {
      // Revert on error
      setHabits(habits.map(habit => 
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      ));
      
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة العادة",
        variant: "destructive",
      });
      console.error("Error toggling habit completion:", error);
    }
  };
  
  // إضافة عادة جديدة
  const addHabit = async (habitData: { 
    title: string; 
    category: string;
    frequency: {
      type: 'daily' | 'weekly' | 'monthly';
      time?: string;
      days?: number[];
      dayOfMonth?: number;
    };
  }) => {
    try {
      const response = await axios.post('/api/habits', habitData);
      
      setHabits([...habits, response.data]);
      
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة عادة جديدة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة العادة",
        variant: "destructive",
      });
      console.error("Error adding habit:", error);
    }
  };
  
  // تعديل عادة
  const editHabit = async (id: string, habitData: { 
    title: string; 
    category: string;
    frequency?: {
      type: 'daily' | 'weekly' | 'monthly';
      time?: string;
      days?: number[];
      dayOfMonth?: number;
    };
  }) => {
    try {
      const response = await axios.put(`/api/habits/${id}`, habitData);
      
      setHabits(habits.map(habit => 
        habit.id === id ? response.data : habit
      ));
      
      toast({
        title: "تم التعديل",
        description: "تم تعديل العادة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تعديل العادة",
        variant: "destructive",
      });
      console.error("Error editing habit:", error);
    }
  };
  
  // حذف عادة
  const deleteHabit = async (id: string) => {
    try {
      await axios.delete(`/api/habits/${id}`);
      
      setHabits(habits.filter(habit => habit.id !== id));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العادة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف العادة",
        variant: "destructive",
      });
      console.error("Error deleting habit:", error);
    }
  };
  
  // الحصول على أيقونة مناسبة للفئة
  const getIconForCategory = (category: string) => {
    const icons: {[key: string]: string} = {
      'learning': '📚',
      'health': '🧘‍♂️',
      'productivity': '⏱️',
      'finance': '💰',
      'social': '👥',
      'other': '✨',
      'تعلم': '📚',
      'صحة': '🧘‍♂️',
      'إنتاجية': '⏱️',
      'مالي': '💰',
      'اجتماعي': '👥',
      'أخرى': '✨',
    };
    
    return icons[category] || '📝';
  };

  return { 
    habits, 
    loading,
    toggleHabitComplete, 
    addHabit,
    editHabit, 
    deleteHabit, 
    getIconForCategory,
    calculateDailyProgress
  };
}