import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import axios from "axios";
import translatorData from "@/api/translators.json";
import channels from "@/api/channel.json";

interface TaskFormData {
  translationChannel: string;
  videoCount: string;
  fromDate: Date;
  toDate: Date;
  defaultLanguage: string;
  translateLanguage: string;
  hours: string;
  assignVideoCount: string;
}

export default function AssignTask() {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const { register, handleSubmit, setValue } = useForm<TaskFormData>();
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [translators, setTranslators] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("activities");

  const TABS = ["activities", "prediction", "prediction-10-days", "translate"];

  useEffect(() => {
    const selected = channels.find((ch) => ch.id === selectedChannel);
    if (selected) {
      setValue("videoCount", selected.videoCount);
    }
  }, [selectedChannel, setValue]);

  useEffect(() => {
    setTranslators(translatorData);
  }, []);

  const onSubmit = (data: TaskFormData) => {
    console.log("Task assignment data:", data, "Mode:", activeTab);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Task Assignment
        </h1>
        <p className="text-muted-foreground">
          Assign tasks to team members based on category
        </p>
      </div>

      {/* Toggle Tabs */}
      <div className="flex gap-4 mb-6">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Activities Form */}
      {activeTab === "activities" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Assign Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activities form content goes here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prediction Form */}
      {activeTab === "prediction" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Assign Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Prediction form content goes here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prediction 10 Days Form */}
      {activeTab === "prediction-10-days" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Assign 10-Day Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Prediction 10 Days form content goes here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Translate Form (Existing) */}
      {activeTab === "translate" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Assign Translation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Translation Channel */}
                <div className="space-y-2">
                  <Label htmlFor="translationChannel">
                    Translation Channel
                  </Label>
                  <Select onValueChange={(value) => setSelectedChannel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Video Count */}
                <div className="space-y-2">
                  <Label htmlFor="videoCount">Total Video Count</Label>
                  <Input id="videoCount" readOnly {...register("videoCount")} />
                </div>

                {/* From Date */}
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate
                          ? format(fromDate, "MM/dd/yyyy")
                          : "MM/DD/YYYY"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "MM/dd/yyyy") : "MM/DD/YYYY"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Default Language */}
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Input
                    id="defaultLanguage"
                    placeholder="english"
                    {...register("defaultLanguage")}
                  />
                </div>

                {/* Translate Language */}
                <div className="space-y-2">
                  <Label htmlFor="translateLanguage">Translate Language</Label>
                  <Input
                    id="translateLanguage"
                    placeholder="target language"
                    {...register("translateLanguage")}
                  />
                </div>

                {/* Hours */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hours">Hours</Label>
                  <div className="md:w-1/2">
                    <Input
                      id="hours"
                      placeholder="1233"
                      defaultValue="1233"
                      {...register("hours")}
                    />
                  </div>
                </div>
              </div>

              {/* Assign Video Count */}
              <div className="space-y-2">
                <Label htmlFor="assignVideoCount">Assign Video Count</Label>
                <Input
                  id="assignVideoCount"
                  placeholder="10"
                  {...register("assignVideoCount")}
                />
              </div>

              {/* Assign Translator */}
              <div className="space-y-2">
                <Label htmlFor="assigntranslator">Assign Translator</Label>
                <Input
                  id="assigntranslator"
                  placeholder="select translator"
                  {...register("translateLanguage")}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  UPDATE
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Translator List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Select Translator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {translators.map((translator) => (
              <div
                key={translator.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">
                        {translator.name}
                      </span>
                      <Badge
                        // variant="secondary"
                        className="bg-green-stat/10 text-green-stat border-green-stat/20"
                      >
                        {translator.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {translator.hours}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {translator.languages.map((language) => (
                        <Badge
                          key={language}
                          variant="outline"
                          className="text-xs bg-muted/50 text-muted-foreground border-muted"
                        >
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Calendar, CalendarIcon, User } from "lucide-react";
// import { format } from "date-fns";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import { useEffect } from "react";
// import axios from "axios";
// import translatorData from "@/api/translators.json";
// import channels from "@/api/channel.json";

// interface TaskFormData {
//   translationChannel: string;
//   videoCount: string;
//   fromDate: Date;
//   toDate: Date;
//   defaultLanguage: string;
//   translateLanguage: string;
//   hours: string;
//   assignVideoCount:string;
// }

// // const translators = [
// //   {
// //     id: 1,
// //     name: "Vaibav. J",
// //     status: "Available",
// //     hours: "30 Hrs",
// //     languages: ["English", "Hindi", "Telugu"],
// //     avatar: "VJ"
// //   },
// //   {
// //     id: 2,
// //     name: "Vaibav. J",
// //     status: "Available",
// //     hours: "30 Hrs",
// //     languages: ["English", "Hindi", "Telugu"],
// //     avatar: "VJ"
// //   },
// //   {
// //     id: 3,
// //     name: "Vaibav. J",
// //     status: "Available",
// //     hours: "30 Hrs",
// //     languages: ["English", "Hindi", "Telugu"],
// //     avatar: "VJ"
// //   }
// // ];

// export default function AssignTask() {
//   const [fromDate, setFromDate] = useState<Date>();
//   const [toDate, setToDate] = useState<Date>();
//   const { register, handleSubmit, watch, setValue } = useForm<TaskFormData>();
//   // channel name
//   const[channelList , setChannelList]= useState(channels);

//   //video count for selected channel
//  const [selectedChannel, setSelectedChannel] = useState<string>("");
// useEffect(() => {
//   const selected = channels.find((ch) => ch.id === selectedChannel);
//   if (selected) {
//     setValue("videoCount", selected.videoCount); // ✅ from react-hook-form
//   }
// }, [selectedChannel, setValue]);

//   // translator
//  const [translators, setTranslators] = useState<any[]>([]);

// useEffect(() => {
//   console.log("📦 Loaded local translators:", translatorData);
//   setTranslators(translatorData); // ✅ this must be an array!
// }, []);

//   const onSubmit = (data: TaskFormData) => {
//     console.log("Task assignment data:", data);
//   };

//   const handleAssignTranslator = (translatorId: number) => {
//     console.log("Assign translator:", translatorId);
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-semibold text-foreground mb-2">Task Assignment</h1>
//         <p className="text-muted-foreground">Assign translation tasks to team members</p>
//       </div>

//       {/* Assign Task Form */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg font-medium">Assign Task</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Translation Channel */}
//               <div className="space-y-2">
//                 <Label htmlFor="translationChannel">Translation Channel</Label>
//                 {/* <Select defaultValue="raw-talks">
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select channel" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="raw-talks">Raw Talks</SelectItem>
//                     <SelectItem value="tech-talks">Tech Talks</SelectItem>
//                     <SelectItem value="edu-content">Edu Content</SelectItem>
//                   </SelectContent>
//                 </Select> */}
//                 <Select onValueChange={(value) => setSelectedChannel(value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select channel" />
//                       </SelectTrigger>
//                             <SelectContent>
//                         {channels.map((channel) => (
//                            <SelectItem key={channel.id} value={channel.id}>
//                          {channel.label}
//                         </SelectItem>
//                            ))}
//                         </SelectContent>
//                             </Select>

//               </div>

// {/* Video Count from selected channel (readonly) */}
// <div className="space-y-2">
//   <Label htmlFor="videoCount">Total Video Count</Label>
//   <Input
//     id="videoCount"
//     placeholder="400"
//     readOnly
//     {...register("videoCount")}
//   />
// </div>

//               {/* From Date */}
//               <div className="space-y-2">
//                 <Label>From Date</Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal",
//                         !fromDate && "text-muted-foreground"
//                       )}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {fromDate ? format(fromDate, "MM/dd/yyyy") : "MM/DD/YYYY"}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <CalendarComponent
//                       mode="single"
//                       selected={fromDate}
//                       onSelect={setFromDate}
//                       initialFocus
//                       className="pointer-events-auto"
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               {/* To Date */}
//               <div className="space-y-2">
//                 <Label>To Date</Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal",
//                         !toDate && "text-muted-foreground"
//                       )}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {toDate ? format(toDate, "MM/dd/yyyy") : "MM/DD/YYYY"}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <CalendarComponent
//                       mode="single"
//                       selected={toDate}
//                       onSelect={setToDate}
//                       initialFocus
//                       className="pointer-events-auto"
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               {/* Assign video count to translator (editable) */}

//               {/* Default Language */}
//               <div className="space-y-2">
//                 <Label htmlFor="defaultLanguage">Default Language</Label>
//                 <Input
//                   id="defaultLanguage"
//                   placeholder="english"
//                   // defaultValue="english"
//                   {...register("defaultLanguage")}
//                 />
//               </div>

//               {/* Translate Language */}
//               <div className="space-y-2">
//                 <Label htmlFor="translateLanguage">Translate Language</Label>
//                 <Input
//                   id="translateLanguage"
//                   placeholder="target language"
//                   // defaultValue="400"
//                   {...register("translateLanguage")}
//                 />
//               </div>

//               {/* Hours */}
//               <div className="space-y-2 md:col-span-2">
//                 <Label htmlFor="hours">Hours</Label>
//                 <div className="md:w-1/2">
//                   <Input
//                     id="hours"
//                     placeholder="1233"
//                     defaultValue="1233"
//                     {...register("hours")}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="space-y-2">
//   <Label htmlFor="assignVideoCount">Assign Video Count</Label>
//   <Input
//     id="assignVideoCount"
//     placeholder="10"
//     {...register("assignVideoCount")}
//   />
// </div>
//                  {/* Translate Language */}
//               <div className="space-y-2">
//                 <Label htmlFor="assigntranslator">assign translator </Label>
//                 <Input
//                   id="assigntranslator"
//                   placeholder="select translator"
//                   // defaultValue="400"
//                   {...register("translateLanguage")}
//                 />
//               </div>
//             {/* Assign Button */}
//             <div className="flex justify-end">
//               <Button type="submit" className="bg-primary hover:bg-primary/90 px-8">
//                 UPDATE
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Select Translator */}

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg font-medium">Select Translator</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {translators.map((translator) => (
//               <div
//                 key={translator.id}
//                 className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
//               >
//                 <div className="flex items-center gap-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarFallback className="bg-muted text-muted-foreground">
//                       <User className="h-6 w-6" />
//                     </AvatarFallback>
//                   </Avatar>

//                   <div className="space-y-2">
//                     <div className="flex items-center gap-3">
//                       <span className="font-medium text-foreground">{translator.name}</span>
//                       <Badge
//                         variant="secondary"
//                         className="bg-green-stat/10 text-green-stat border-green-stat/20"
//                       >
//                         {translator.status}
//                       </Badge>
//                       <span className="text-sm text-muted-foreground">{translator.hours}</span>
//                     </div>

//                     <div className="flex gap-2">
//                       {translator.languages.map((language) => (
//                         <Badge
//                           key={language}
//                           variant="outline"
//                           className="text-xs bg-muted/50 text-muted-foreground border-muted"
//                         >
//                           {language}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
