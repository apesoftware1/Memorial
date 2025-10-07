import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function OperatingHoursModal({ 
  isOpen, 
  onClose, 
  initialData = {
    monToFri: "",
    saturday: "",
    sunday: "",
    publicHoliday: ""
  },
  onSave 
}) {
  const [operatingHours, setOperatingHours] = useState({
    monToFri: "",
    saturday: "",
    sunday: "",
    publicHoliday: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setOperatingHours({
        monToFri: initialData.monToFri || "",
        saturday: initialData.saturday || "",
        sunday: initialData.sunday || "",
        publicHoliday: initialData.publicHoliday || ""
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Simple validation - ensure format is consistent
    // This is a basic example - you might want more sophisticated validation
    const timePattern = /^([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|am|pm)?\s*-\s*[0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|am|pm)?|Closed)$/i;
    
    Object.keys(operatingHours).forEach(field => {
      const value = operatingHours[field].trim();
      if (value && !timePattern.test(value)) {
        newErrors[field] = "Please use format: 9:00 AM - 5:00 PM or 'Closed'";
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave({ operatingHours });
      toast({
        title: "Success",
        description: "Operating hours updated successfully",
        className: "bg-green-500 text-white border-green-600",
        variant: "default",
      });
      onClose();
    } catch (error) {
      console.error("Error saving operating hours:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update operating hours",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Operating Hours</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="monToFri">Monday to Friday</Label>
            <Input
              id="monToFri"
              placeholder="e.g. 9:00 AM - 5:00 PM"
              value={operatingHours.monToFri}
              onChange={(e) => handleInputChange("monToFri", e.target.value)}
              className={errors.monToFri ? "border-red-500" : ""}
            />
            {errors.monToFri && (
              <p className="text-red-500 text-sm">{errors.monToFri}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="saturday">Saturday</Label>
            <Input
              id="saturday"
              placeholder="e.g. 9:00 AM - 1:00 PM or Closed"
              value={operatingHours.saturday}
              onChange={(e) => handleInputChange("saturday", e.target.value)}
              className={errors.saturday ? "border-red-500" : ""}
            />
            {errors.saturday && (
              <p className="text-red-500 text-sm">{errors.saturday}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="sunday">Sunday</Label>
            <Input
              id="sunday"
              placeholder="e.g. Closed"
              value={operatingHours.sunday}
              onChange={(e) => handleInputChange("sunday", e.target.value)}
              className={errors.sunday ? "border-red-500" : ""}
            />
            {errors.sunday && (
              <p className="text-red-500 text-sm">{errors.sunday}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="publicHoliday">Public Holiday</Label>
            <Input
              id="publicHoliday"
              placeholder="e.g. Closed"
              value={operatingHours.publicHoliday}
              onChange={(e) => handleInputChange("publicHoliday", e.target.value)}
              className={errors.publicHoliday ? "border-red-500" : ""}
            />
            {errors.publicHoliday && (
              <p className="text-red-500 text-sm">{errors.publicHoliday}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}