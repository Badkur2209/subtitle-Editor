// subtitle-frontend/src/pages/AssignTask.tsx
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../utils/config.ts";
import { useForm } from "react-hook-form";
import { AlignCenter, CalendarIcon, User } from "lucide-react";
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

const LANGUAGES = [
  "english",
  "hindi",
  "marathi",
  "telugu",
  "gujarati",
  "bengali",
];

export default function AssignTask() {
  // Form states
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const { register, handleSubmit, setValue } = useForm();
  const [selectedChannel, setSelectedChannel] = useState("");
  const [translators, setTranslators] = useState([]);
  const [activeTab, setActiveTab] = useState("activities");
  useEffect(() => {
    const today = new Date();
    setValue("fromDate", today);
    setValue("toDate", today);
  }, [setValue]);
  // Users state
  const [users, setUsers] = useState([]); // must be array
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState(null);
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");

  const TABS = ["activities", "prediction", "prediction-10-days", "translate"];
  const langCodeMap: Record<string, string> = {
    english: "en",
    hindi: "hi",
    gujarati: "gu",
    marathi: "mr",
    telugu: "te",
    bengali: "bn",
  };

  const handleLoad = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activities`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Assuming data.activities is the activities array
      let activitiesArray =
        data.success && data.activities ? data.activities : [];

      // Step 2: Count the number of `null` values
      const nullCount = activitiesArray.filter(
        (activity) =>
          activity[`status_${langCodeMap[targetLang]}`] === null ||
          activity[`status_${langCodeMap[targetLang]}`] === "pending"
      ).length;
      setValue("taskCount", nullCount);
    } catch (err) {
      console.error("Failed to load activities", err);
      alert("Failed to load activities.");
    }
  };

  useEffect(() => {
    handleLoad();
  }, [targetLang]);

  const filteredUsers = users.filter((user) => {
    const pair = `${langCodeMap[sourceLang]}_${langCodeMap[targetLang]}`;
    return user.langPairs.includes(pair);
  });

  // Fetch users from API
  useEffect(() => {
    setLoadingUsers(true);
    setUserError(null);
    axios
      .get(`${API_BASE_URL}/users`)
      // .get("https://api.ayushcms.info/api/users")
      .then((res) => {
        // API returns { users: [...] }
        const arr = Array.isArray(res.data.users) ? res.data.users : [];
        setUsers(arr);
        setLoadingUsers(false);
      })
      .catch(() => {
        setUsers([]);
        setUserError("Failed to load users.");
        setLoadingUsers(false);
      });
  }, []);

  useEffect(() => {
    const selected = channels.find((ch) => ch.id === selectedChannel);
    if (selected) {
      setValue("videoCount", selected.videoCount);
    }
  }, [selectedChannel, setValue]);

  useEffect(() => {
    setTranslators(translatorData);
  }, []);

  const onPredictionSubmit = (data) => {
    console.log("Form Data:", data);

    const { taskCount, user, targetLanguage } = data;
    const langCode = langCodeMap[targetLanguage];

    if (!langCode) {
      alert(`unsupported language: ${targetLanguage}`);
      return;
    }
    axios
      .post(`${API_BASE_URL}/predictions/assignPredictions`, {
        userId: user,
        taskCount: parseInt(taskCount),
        targetLanguage: langCodeMap[data.targetLanguage],
      })
      .then((res) => {
        console.log("Assigned successfully:", res.data);
        alert(res.data.message); // or use a toast
      })
      .catch((err) => {
        console.error("Assignment failed:", err);
        alert("Error assigning predictions");
      });
  };

  const onPrediction10daysSubmit = (data) => {
    console.log("Form Data:", data);

    const { taskCount, user, targetLanguage } = data;
    const langCode = langCodeMap[targetLanguage];
    axios
      .post(`${API_BASE_URL}/predictions/assignPredictions10days`, {
        userId: user,
        taskCount: parseInt(taskCount),
        targetLanguage: langCodeMap[data.targetLanguage],
      })
      .then((res) => {
        console.log("Assigned successfully:", res.data);
        alert(res.data.message);
      })
      .catch((err) => {
        console.error("Assignment failed:", err);
        alert("Error assigning predictions");
      });
  };

  const onActivitiesSubmit = (data) => {
    console.log("Form Data:", data);

    const { taskCount, user, targetLanguage } = data;
    const langCode = langCodeMap[targetLanguage];

    if (!langCode) {
      alert(`Unsupported language: ${targetLanguage}`);
      return;
    }
    axios
      .post(`${API_BASE_URL}/assignActivities`, {
        userId: user,
        taskCount: parseInt(taskCount),
        targetLanguage: langCodeMap[data.targetLanguage],
      })
      .then((res) => {
        console.log("Assigned successfully:", res.data);
        alert(res.data.message);
      })
      .catch((err) => {
        console.error("Assignment failed:", err);
        alert("Error assigning activities");
      });
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
            <form
              onSubmit={handleSubmit(onActivitiesSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        onSelect={(date) => {
                          if (date) {
                            setFromDate(date); // ✅ works now
                            setValue("fromDate", date);
                          }
                        }}
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
                        onSelect={(date) => {
                          if (date) {
                            setToDate(date); // updates UI
                            setValue("toDate", date); // updates react-hook-form
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Source Language */}
                <div className="space-y-2">
                  <Label htmlFor="sourceLanguage">Source Language</Label>
                  <Select
                    onValueChange={(value) => {
                      setSourceLang(value);
                      setValue("sourceLanguage", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {LANGUAGES.map((lang) => ( */}
                      {LANGUAGES.filter((lang) => lang !== targetLang).map(
                        (lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Target Language */}
                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">Target Language</Label>
                  <Select
                    onValueChange={(value) => {
                      setTargetLang(value);
                      setValue("targetLanguage", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {LANGUAGES.map((lang) => ( */}
                      {LANGUAGES.filter((lang) => lang !== sourceLang).map(
                        (lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Select User */}
                <div className="space-y-2">
                  <Label>Select User</Label>

                  <Select
                    onValueChange={(value) => setValue("user", value)}
                    disabled={loadingUsers || !sourceLang || !targetLang}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingUsers
                            ? "Loading users..."
                            : !sourceLang || !targetLang
                            ? "Select source & target languages first"
                            : filteredUsers.length === 0
                            ? "No matching users"
                            : "Select user"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} - {user.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-users">
                          {loadingUsers
                            ? "Loading..."
                            : !sourceLang || !targetLang
                            ? "Select source and target languages"
                            : "No users found for this language pair"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Task (Count) */}
                <div className="space-y-2">
                  <Label htmlFor="taskCount">Task (Count)</Label>
                  <Input
                    id="taskCount"
                    type="number"
                    {...register("taskCount")}
                  />
                </div>
              </div>
              {/* Assign Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 px-8"
                  disabled={loadingUsers || !!userError}
                >
                  Assign
                </Button>
              </div>
            </form>
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
            <form
              onSubmit={handleSubmit(onPredictionSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        onSelect={(date) => {
                          if (date) {
                            setFromDate(date); // ✅ works now
                            setValue("fromDate", date);
                          }
                        }}
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
                        onSelect={(date) => {
                          if (date) {
                            setToDate(date); // updates UI
                            setValue("toDate", date); // updates react-hook-form
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Source Language */}
                <div className="space-y-2">
                  <Label htmlFor="sourceLanguage">Source Language</Label>
                  <Select
                    onValueChange={(value) => {
                      setSourceLang(value);
                      setValue("sourceLanguage", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {LANGUAGES.map((lang) => ( */}
                      {LANGUAGES.filter((lang) => lang !== targetLang).map(
                        (lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Target Language */}
                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">Target Language</Label>
                  <Select
                    onValueChange={(value) => {
                      setTargetLang(value);
                      setValue("targetLanguage", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {LANGUAGES.map((lang) => ( */}
                      {LANGUAGES.filter((lang) => lang !== sourceLang).map(
                        (lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Select User */}
                <div className="space-y-2">
                  <Label>Select User</Label>

                  <Select
                    onValueChange={(value) => setValue("user", value)}
                    disabled={loadingUsers || !sourceLang || !targetLang}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingUsers
                            ? "Loading users..."
                            : !sourceLang || !targetLang
                            ? "Select source & target languages first"
                            : filteredUsers.length === 0
                            ? "No matching users"
                            : "Select user"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} - {user.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-users">
                          {loadingUsers
                            ? "Loading..."
                            : !sourceLang || !targetLang
                            ? "Select source and target languages"
                            : "No users found for this language pair"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Task (Count) */}
                <div className="space-y-2">
                  <Label htmlFor="taskCount">Task (Count)</Label>
                  <Input
                    id="taskCount"
                    type="number"
                    {...register("taskCount")}
                  />
                </div>
              </div>
              {/* Assign Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 px-8"
                  disabled={loadingUsers || !!userError}
                >
                  Assign
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Prediction 10 Days Form */}
      {activeTab === "prediction-10-days" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Assign Prediction 10 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onPrediction10daysSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        onSelect={(date) => {
                          if (date) {
                            setFromDate(date); // ✅ works now
                            setValue("fromDate", date);
                          }
                        }}
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
                        onSelect={(date) => {
                          if (date) {
                            setToDate(date); // updates UI
                            setValue("toDate", date); // updates react-hook-form
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Source Language */}
                <div className="space-y-2">
                  <Label htmlFor="sourceLanguage">Source Language</Label>
                  <Select
                    onValueChange={(value) => {
                      setSourceLang(value);
                      setValue("sourceLanguage", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {LANGUAGES.map((lang) => ( */}
                      {LANGUAGES.filter((lang) => lang !== targetLang).map(
                        (lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Target Language */}
                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">Target Language</Label>
                  <Select
                    onValueChange={(value) => {
                      setTargetLang(value);
                      setValue("targetLanguage", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {LANGUAGES.map((lang) => ( */}
                      {LANGUAGES.filter((lang) => lang !== sourceLang).map(
                        (lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Select User */}
                <div className="space-y-2">
                  <Label>Select User</Label>

                  <Select
                    onValueChange={(value) => setValue("user", value)}
                    disabled={loadingUsers || !sourceLang || !targetLang}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingUsers
                            ? "Loading users..."
                            : !sourceLang || !targetLang
                            ? "Select source & target languages first"
                            : filteredUsers.length === 0
                            ? "No matching users"
                            : "Select user"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} - {user.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-users">
                          {loadingUsers
                            ? "Loading..."
                            : !sourceLang || !targetLang
                            ? "Select source and target languages"
                            : "No users found for this language pair"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Task (Count) */}
                <div className="space-y-2">
                  <Label htmlFor="taskCount">Task (Count)</Label>
                  <Input
                    id="taskCount"
                    type="number"
                    {...register("taskCount")}
                  />
                </div>
              </div>
              {/* Assign Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 px-8"
                  disabled={loadingUsers || !!userError}
                >
                  Assign
                </Button>
              </div>
            </form>
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
          <CardContent>{/* your existing translate form here */}</CardContent>
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
                      <Badge className="bg-green-stat/10 text-green-stat border-green-stat/20">
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
