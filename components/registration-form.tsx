"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Check, ChevronLeft, Plus, Trash2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
  const [guests, setGuests] = useState<GuestType[]>([])
  const [kids, setKids] = useState<KidType[]>([])
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submissionDate, setSubmissionDate] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

    // Load form data
    const savedFormData = localStorage.getItem(STORAGE_KEY)
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        form.reset(parsedData)
      } catch (error) {
        console.error("Error parsing saved form data:", error)
      }
    }

    // Load guests
    const savedGuests = localStorage.getItem(GUESTS_KEY)
    if (savedGuests) {
      try {
        setGuests(JSON.parse(savedGuests))
      } catch (error) {
        console.error("Error parsing saved guests:", error)
      }
    }

    // Load kids
    const savedKids = localStorage.getItem(KIDS_KEY)
    if (savedKids) {
      try {
        setKids(JSON.parse(savedKids))
      } catch (error) {
        console.error("Error parsing saved kids:", error)
      }
    }

    // Load profile image
    const savedProfileImage = localStorage.getItem(PROFILE_IMAGE_KEY)
    if (savedProfileImage) {
      setProfileImage(savedProfileImage)
    }
  }, [])

  // Save guests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(GUESTS_KEY, JSON.stringify(guests))
  }, [guests])

  // Save kids to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(KIDS_KEY, JSON.stringify(kids))
  }, [kids])

  // Save profile image to localStorage whenever it changes
  useEffect(() => {
    if (profileImage) {
      localStorage.setItem(PROFILE_IMAGE_KEY, profileImage)
    } else {
      localStorage.removeItem(PROFILE_IMAGE_KEY)
    }
  }, [profileImage])

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

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
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

        const reader = new FileReader()
        reader.onload = () => {
          setProfileImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [toast],
  )

  const removeImage = useCallback(() => {
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const addGuest = useCallback(() => {
    setGuests((prev) => [...prev, { id: Date.now().toString(), name: "", age: "", relation: "" }])
  }, [])

  const removeGuest = useCallback((id: string) => {
    setGuests((prev) => prev.filter((guest) => guest.id !== id))
  }, [])

  const updateGuest = useCallback((id: string, field: keyof GuestType, value: string) => {
    setGuests((prev) => prev.map((guest) => (guest.id === id ? { ...guest, [field]: value } : guest)))
  }, [])

  const addKid = useCallback(() => {
    setKids((prev) => [...prev, { id: Date.now().toString(), name: "", age: "" }])
  }, [])

  const removeKid = useCallback((id: string) => {
    setKids((prev) => prev.filter((kid) => kid.id !== id))
  }, [])

  const updateKid = useCallback((id: string, field: keyof KidType, value: string) => {
    setKids((prev) => prev.map((kid) => (kid.id === id ? { ...kid, [field]: value } : kid)))
  }, [])

  const clearForm = useCallback(() => {
    if (confirm("Are you sure you want to clear all form data? This cannot be undone.")) {
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
      setGuests([])
      setKids([])
      setProfileImage(null)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(GUESTS_KEY)
      localStorage.removeItem(KIDS_KEY)
      localStorage.removeItem(PROFILE_IMAGE_KEY)

      toast({
        title: "Form cleared",
        description: "All form data has been cleared.",
      })
    }
  }, [form, toast])

  // Get form values for confirmation
  const formValues = form.getValues()

  // Filter valid guests and kids for display
  const validGuests = guests.filter(
    (guest) => guest.name.trim() !== "" && guest.age.trim() !== "" && guest.relation.trim() !== "",
  )
  const validKids = kids.filter((kid) => kid.name.trim() !== "" && kid.age.trim() !== "")

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
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
            {/* Update the confirmation dialog title: */}
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
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                    No additional guests added.
                  </p>
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
                onClick={() => setShowConfirmation(false)}
                className="sm:order-1 order-2 w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
              {/* Update the confirmation button: */}
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                className="sm:order-2 order-1 w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm & Complete Registration
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
