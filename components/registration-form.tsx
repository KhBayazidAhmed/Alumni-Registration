"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Trash2, Upload, X } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useFormStorage } from "@/hooks/use-form-storage"
import { useArrayStorage } from "@/hooks/use-array-storage"
import { compressImage, safelyStoreItem, safelyRemoveItem } from "@/utils/storage-utils"

// Define a leaner schema with only the required fields
const formSchema = z.object({
  nameEnglish: z.string().min(2, { message: "Name must be at least 2 characters." }),
  gender: z.string(),
  mobileNumber: z.string().min(10, { message: "Mobile number must be valid." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bloodGroup: z.string(),
  tShirtSize: z.string(),
  presentAddress: z.string().min(5, { message: "Address must be at least 5 characters." }),
  permanentAddress: z.string().min(5, { message: "Address must be at least 5 characters." }),
  sscBatch: z.string(),
  sscDepartment: z.string(),
  hscBatch: z.string(),
  hscDepartment: z.string(),
  occupation: z.string(),
  organization: z.string(),
  jobPosition: z.string(),
  remarks: z.string().optional(),
})

// Define types with only necessary fields
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

// Storage keys
const STORAGE_KEY = "registration_form_data"
const GUESTS_KEY = "registration_form_guests"
const KIDS_KEY = "registration_form_kids"
const PROFILE_IMAGE_KEY = "registration_form_profile_image"

// Add this code right before the RegistrationForm component definition
const LazyConfirmationDialog = dynamic(() => import("@/components/confirmation-dialog"), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg shadow-lg">
        <p>Loading preview...</p>
      </div>
    </div>
  ),
  ssr: false,
})

// Memoized guest item component
const GuestItem = memo(function GuestItem({
  guest,
  updateGuest,
  removeGuest,
}: {
  guest: GuestType
  updateGuest: (id: string, field: keyof GuestType, value: string) => void
  removeGuest: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-md shadow-sm">
      <div className="col-span-1">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={guest.name}
          onChange={(e) => updateGuest(guest.id, "name", e.target.value)}
          placeholder="Guest name"
        />
      </div>
      <div className="col-span-1">
        <label className="text-sm font-medium">Age</label>
        <Input
          value={guest.age}
          onChange={(e) => updateGuest(guest.id, "age", e.target.value)}
          placeholder="Guest age"
        />
      </div>
      <div className="col-span-1 sm:col-span-2 md:col-span-1">
        <label className="text-sm font-medium">Relation</label>
        <Input
          value={guest.relation}
          onChange={(e) => updateGuest(guest.id, "relation", e.target.value)}
          placeholder="Relation"
        />
      </div>
      <div className="col-span-1 flex items-end">
        <Button type="button" variant="destructive" size="sm" onClick={() => removeGuest(guest.id)} className="w-full">
          <Trash2 className="h-4 w-4 mr-2" /> Remove
        </Button>
      </div>
    </div>
  )
})

// Memoized kid item component
const KidItem = memo(function KidItem({
  kid,
  updateKid,
  removeKid,
}: {
  kid: KidType
  updateKid: (id: string, field: keyof KidType, value: string) => void
  removeKid: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md shadow-sm">
      <div className="col-span-1">
        <label className="text-sm font-medium">Name</label>
        <Input value={kid.name} onChange={(e) => updateKid(kid.id, "name", e.target.value)} placeholder="Kid name" />
      </div>
      <div className="col-span-1">
        <label className="text-sm font-medium">Age</label>
        <Input value={kid.age} onChange={(e) => updateKid(kid.id, "age", e.target.value)} placeholder="Kid age" />
      </div>
      <div className="col-span-1 flex items-end">
        <Button type="button" variant="destructive" size="sm" onClick={() => removeKid(kid.id)} className="w-full">
          <Trash2 className="h-4 w-4 mr-2" /> Remove
        </Button>
      </div>
    </div>
  )
})

// Memoized section components
const PersonalInfoSection = memo(function PersonalInfoSection({
  form,
  profileImage,
  removeImage,
  triggerFileInput,
  fileInputRef,
}: any) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <CardTitle className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
            1
          </span>
          Personal Information
        </CardTitle>
        <CardDescription>Enter your basic personal details</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Profile Image Upload */}
        <div className="flex flex-col md:flex-row gap-8 mb-6 pb-6 border-b">
          <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
            <div className="relative">
              {profileImage ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-2 border-border shadow-md">
                  <img src={profileImage || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-sm"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-md border-2 border-dashed border-border flex items-center justify-center bg-muted/50 cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <div className="text-center p-4">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload photo</p>
                  </div>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} />
            <Button type="button" variant="outline" size="sm" onClick={triggerFileInput} className="shadow-sm">
              <Upload className="h-4 w-4 mr-2" />
              {profileImage ? "Change Photo" : "Upload Photo"}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 5MB)</p>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="nameEnglish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tShirtSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>T-Shirt Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                        <SelectItem value="XXXL">XXXL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="presentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Present Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your present address" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your permanent address" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default function RegistrationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameEnglish: "",
      gender: "",
      mobileNumber: "",
      email: "",
      bloodGroup: "",
      tShirtSize: "",
      presentAddress: "",
      permanentAddress: "",
      sscBatch: "",
      sscDepartment: "",
      hscBatch: "",
      hscDepartment: "",
      occupation: "",
      organization: "",
      jobPosition: "",
      remarks: "",
    },
  })

  // Replace the useState and useEffect for guests and kids with these hooks
  const {
    items: guests,
    setItems: setGuests,
    addItem: addGuestItem,
    removeItem: removeGuestItem,
    updateItem: updateGuestItem,
    clearItems: clearGuests,
    isLoaded: guestsLoaded,
  } = useArrayStorage<GuestType>(GUESTS_KEY, [])

  const {
    items: kids,
    setItems: setKids,
    addItem: addKidItem,
    removeItem: removeKidItem,
    updateItem: updateKidItem,
    clearItems: clearKids,
    isLoaded: kidsLoaded,
  } = useArrayStorage<KidType>(KIDS_KEY, [])

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submissionDate, setSubmissionDate] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const profileImageLoaded = useRef(false)

  // Add this after the form initialization
  const { isLoaded: formLoaded, clearStorage: clearFormStorage } = useFormStorage(form, STORAGE_KEY)

  // Update the isLoading state to use the custom hooks
  const isLoading = !formLoaded || !guestsLoaded || !kidsLoaded

  // Load saved form data on initial render
  useEffect(() => {
    // Set current date for submission
    setSubmissionDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    )

    // Load profile image only once on initial render
    if (!profileImageLoaded.current) {
      const savedProfileImage = localStorage.getItem(PROFILE_IMAGE_KEY)
      if (savedProfileImage) {
        setProfileImage(savedProfileImage)
      }
      profileImageLoaded.current = true
    }
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      form.handleSubmit(() => {
        setShowConfirmation(true)
      })()
    },
    [form],
  )

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      // Filter out guests with empty data
      const validGuests = guests.filter(
        (guest) => guest.name.trim() !== "" && guest.age.trim() !== "" && guest.relation.trim() !== "",
      )

      // Filter out kids with empty data
      const validKids = kids.filter((kid) => kid.name.trim() !== "" && kid.age.trim() !== "")

      const formData = {
        ...values,
        guests: validGuests,
        kids: validKids,
        profileImage: profileImage ? true : false,
        submissionDate,
      }
      console.log(formData)

      toast({
        title: "Form submitted",
        description: "Your registration has been submitted successfully.",
      })

      // Close the confirmation dialog
      setShowConfirmation(false)

      // Here you would typically send the data to your backend
    },
    [guests, kids, profileImage, submissionDate, toast],
  )

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should be less than 5MB.",
          variant: "destructive",
        })
        return
      }

      try {
        // Read the file
        const reader = new FileReader()
        const imageDataPromise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const imageData = await imageDataPromise

        // Compress the image
        const compressedImage = await compressImage(imageData, 800, 0.7)

        // Set state and save to localStorage
        setProfileImage(compressedImage)
        safelyStoreItem(PROFILE_IMAGE_KEY, compressedImage)
      } catch (error) {
        console.error("Error processing image:", error)
        toast({
          title: "Error processing image",
          description: "Please try again with a different image.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const removeImage = useCallback(() => {
    setProfileImage(null)
    safelyRemoveItem(PROFILE_IMAGE_KEY)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearForm = useCallback(() => {
    if (confirm("Are you sure you want to clear all form data? This cannot be undone.")) {
      // Reset form
      form.reset({
        nameEnglish: "",
        gender: "",
        mobileNumber: "",
        email: "",
        bloodGroup: "",
        tShirtSize: "",
        presentAddress: "",
        permanentAddress: "",
        sscBatch: "",
        sscDepartment: "",
        hscBatch: "",
        hscDepartment: "",
        occupation: "",
        organization: "",
        jobPosition: "",
        remarks: "",
      })

      // Clear all data
      clearGuests()
      clearKids()
      clearFormStorage()
      safelyRemoveItem(PROFILE_IMAGE_KEY)

      // Reset image state
      setProfileImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast({
        title: "Form cleared",
        description: "All form data has been cleared.",
      })
    }
  }, [form, toast, clearGuests, clearKids, clearFormStorage])

  const addGuest = useCallback(() => {
    addGuestItem({ id: Date.now().toString(), name: "", age: "", relation: "" })
  }, [addGuestItem])

  const removeGuest = useCallback(
    (id: string) => {
      removeGuestItem(id)
    },
    [removeGuestItem],
  )

  const updateGuest = useCallback(
    (id: string, field: keyof GuestType, value: string) => {
      updateGuestItem(id, field, value)
    },
    [updateGuestItem],
  )

  const addKid = useCallback(() => {
    addKidItem({ id: Date.now().toString(), name: "", age: "" })
  }, [addKidItem])

  const removeKid = useCallback(
    (id: string) => {
      removeKidItem(id)
    },
    [removeKidItem],
  )

  const updateKid = useCallback(
    (id: string, field: keyof KidType, value: string) => {
      updateKidItem(id, field, value)
    },
    [updateKidItem],
  )

  // Get form values for confirmation
  const formValues = form.getValues()

  // Filter valid guests and kids for display
  const validGuests = guests.filter(
    (guest) => guest.name.trim() !== "" && guest.age.trim() !== "" && guest.relation.trim() !== "",
  )
  const validKids = kids.filter((kid) => kid.name.trim() !== "" && kid.age.trim() !== "")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md p-8 border rounded-lg shadow-sm bg-card">
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
            <div className="h-24 bg-muted animate-pulse rounded"></div>
            <div className="h-24 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6 mb-10">
          {/* Update the form title and description at the beginning of the form */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Alumni Registration Form</h2>
              <p className="text-sm text-muted-foreground mt-1">Golden Jubilee 2023 | Established 2015</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={clearForm}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Form
              </Button>
            </div>
          </div>

          {/* Add a welcome message at the top of the form before the first Card: */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm">
              Welcome to the Madhupur Shahid Smrity Alumni Registration portal. This form collects information to
              maintain our alumni database and help organize reunions and events. Your information will be kept
              confidential and used only for alumni association purposes.
            </p>
          </div>

          {/* Personal Information Section */}
          <PersonalInfoSection
            form={form}
            profileImage={profileImage}
            removeImage={removeImage}
            triggerFileInput={triggerFileInput}
            fileInputRef={fileInputRef}
          />

          {/* Education Section */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
                  2
                </span>
                Education Details
              </CardTitle>
              <CardDescription>Enter your educational background</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">SSC Information</h3>
                  <FormField
                    control={form.control}
                    name="sscBatch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SSC Batch (Year)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sscDepartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SSC Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="Commerce">Commerce</SelectItem>
                            <SelectItem value="Arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">HSC Information</h3>
                  <FormField
                    control={form.control}
                    name="hscBatch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HSC Batch (Year)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hscDepartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HSC Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="Commerce">Commerce</SelectItem>
                            <SelectItem value="Arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occupation Section */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
                  3
                </span>
                Occupation Details
              </CardTitle>
              <CardDescription>Enter your current occupation</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Present Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your organization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your job position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Guest Section */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
                  4
                </span>
                Guest Details
              </CardTitle>
              <CardDescription>Add information about your guests</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h3 className="text-base font-medium">Additional Guests (5 years+)</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addGuest}>
                      <Plus className="h-4 w-4 mr-2" /> Add Guest
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 pb-1">
                    {guests.map((guest) => (
                      <GuestItem key={guest.id} guest={guest} updateGuest={updateGuest} removeGuest={removeGuest} />
                    ))}
                    {guests.length === 0 && (
                      <div className="text-center py-6 bg-muted/30 rounded-md">
                        <p className="text-sm text-muted-foreground">No guests added yet</p>
                        <Button type="button" variant="ghost" size="sm" onClick={addGuest} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" /> Add Guest
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h3 className="text-base font-medium">Kids (less than 5 years)</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addKid}>
                      <Plus className="h-4 w-4 mr-2" /> Add Kid
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 pb-1">
                    {kids.map((kid) => (
                      <KidItem key={kid.id} kid={kid} updateKid={updateKid} removeKid={removeKid} />
                    ))}
                    {kids.length === 0 && (
                      <div className="text-center py-6 bg-muted/30 rounded-md">
                        <p className="text-sm text-muted-foreground">No kids added yet</p>
                        <Button type="button" variant="ghost" size="sm" onClick={addKid} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" /> Add Kid
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional information" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Update the submit button section at the bottom of the form: */}
          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={clearForm}>
              Clear Form
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowConfirmation(true)}>
              Preview
            </Button>
            <Button type="submit">Register as Alumni</Button>
          </div>
        </form>
      </Form>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <LazyConfirmationDialog
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          formValues={formValues}
          validGuests={validGuests}
          validKids={validKids}
          onSubmit={() => form.handleSubmit(onSubmit)()}
        />
      )}
    </>
  )
}
