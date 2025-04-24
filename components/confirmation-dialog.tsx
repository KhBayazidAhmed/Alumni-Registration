"use client"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, ChevronLeft } from "lucide-react"
import { memo } from "react"

// Define types for props
type GuestType = {
  id: string
  name: string
  age: string
  relation: string
}

type KidType = {
  id: string
  name: string
  age: string
}

type ConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  formValues: any
  validGuests: GuestType[]
  validKids: KidType[]
  onSubmit: () => void
}

// Memoize the entire dialog component to prevent unnecessary re-renders
const ConfirmationDialog = memo(function ConfirmationDialog({
  open,
  onOpenChange,
  formValues,
  validGuests,
  validKids,
  onSubmit,
}: ConfirmationDialogProps) {
  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
      <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
        <DialogTitle>Madhupur Shahid Smrity Alumni Registration</DialogTitle>
        <DialogDescription>Review your registration information before submission.</DialogDescription>
      </DialogHeader>

      <ScrollArea className="flex-1 px-4 sm:px-6 py-2 overflow-auto">
        <div className="space-y-4 pb-4">
          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs mr-2">
                1
              </span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-muted/30 p-3 rounded-md">
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Full Name</span>
                <span className="text-sm">{formValues.nameEnglish || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Gender</span>
                <span className="text-sm capitalize">{formValues.gender || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Mobile Number</span>
                <span className="text-sm">{formValues.mobileNumber || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Email</span>
                <span className="text-sm">{formValues.email || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Blood Group</span>
                <span className="text-sm">{formValues.bloodGroup || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">T-Shirt Size</span>
                <span className="text-sm">{formValues.tShirtSize || "—"}</span>
              </div>
              <div className="flex flex-col py-1 sm:col-span-2">
                <span className="text-xs font-medium">Present Address</span>
                <span className="text-sm">{formValues.presentAddress || "—"}</span>
              </div>
              <div className="flex flex-col py-1 sm:col-span-2">
                <span className="text-xs font-medium">Permanent Address</span>
                <span className="text-sm">{formValues.permanentAddress || "—"}</span>
              </div>
            </div>
          </div>

          {/* Education Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs mr-2">
                2
              </span>
              Education Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-muted/30 p-3 rounded-md">
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">SSC Batch</span>
                <span className="text-sm">{formValues.sscBatch || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">SSC Department</span>
                <span className="text-sm">{formValues.sscDepartment || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">HSC Batch</span>
                <span className="text-sm">{formValues.hscBatch || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">HSC Department</span>
                <span className="text-sm">{formValues.hscDepartment || "—"}</span>
              </div>
            </div>
          </div>

          {/* Occupation Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs mr-2">
                3
              </span>
              Occupation Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-muted/30 p-3 rounded-md">
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Occupation</span>
                <span className="text-sm">{formValues.occupation || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Organization</span>
                <span className="text-sm">{formValues.organization || "—"}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="text-xs font-medium">Job Position</span>
                <span className="text-sm">{formValues.jobPosition || "—"}</span>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs mr-2">
                4
              </span>
              Guest Information
            </h3>

            {validGuests.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Additional Guests (5 years+)</h4>
                <div className="space-y-2">
                  {validGuests.map((guest) => (
                    <div key={guest.id} className="bg-muted/30 p-3 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-xs font-medium block">Name</span>
                          <span className="text-sm">{guest.name}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium block">Age</span>
                          <span className="text-sm">{guest.age}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium block">Relation</span>
                          <span className="text-sm">{guest.relation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">No additional guests added.</p>
            )}

            {validKids.length > 0 && (
              <div className="space-y-2 mt-3">
                <h4 className="text-sm font-medium">Kids (less than 5 years)</h4>
                <div className="space-y-2">
                  {validKids.map((kid) => (
                    <div key={kid.id} className="bg-muted/30 p-3 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs font-medium block">Name</span>
                          <span className="text-sm">{kid.name}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium block">Age</span>
                          <span className="text-sm">{kid.age}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formValues.remarks && (
              <div>
                <h4 className="text-sm font-medium mb-1">Remarks</h4>
                <p className="text-sm bg-muted/30 p-3 rounded-md">{formValues.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="p-4 sm:p-6 border-t sticky bottom-0 bg-background z-10 mt-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-1 order-2 w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Edit Information
          </Button>
          <Button type="button" onClick={onSubmit} className="sm:order-2 order-1 w-full sm:w-auto">
            <Check className="h-4 w-4 mr-2" />
            Confirm & Complete Registration
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  )
})

export default ConfirmationDialog
