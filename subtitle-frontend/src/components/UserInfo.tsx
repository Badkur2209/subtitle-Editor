import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Crown, Languages } from "lucide-react";

export function UserInfo() {}
// const { user } = useAuth();

//   const getRoleColor = (role: string) => {
//     switch (role) {
//       case "admin":
//         return "bg-red-100 text-red-800 border-red-200";
//       case "editor":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "translator":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "reviewer":
//         return "bg-purple-100 text-purple-800 border-purple-200";
//       case "assigner":
//         return "bg-orange-100 text-orange-800 border-orange-200";
//       case "uploader":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-lg flex items-center gap-2">
//           <User className="h-5 w-5" />
//           User Profile
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div>
//           <p className="text-sm text-gray-600">Name</p>
//           <p className="font-medium">{user?.name}</p>
//         </div>

//         <div>
//           <p className="text-sm text-gray-600">Username</p>
//           <p className="font-medium">@{user?.username}</p>
//         </div>

//         <div>
//           <p className="text-sm text-gray-600 flex items-center gap-1">
//             <Crown className="h-4 w-4" />
//             Role
//           </p>
//           <Badge className={`mt-1 ${getRoleColor(user?.role || "")}`}>
//             {user?.role?.toUpperCase()}
//           </Badge>
//         </div>

//         <div>
//           <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
//             <Languages className="h-4 w-4" />
//             Language Pairs
//           </p>
//           <div className="flex flex-wrap gap-1">
//             {user?.lang_pairs?.length ? (
//               user.lang_pairs.map((pair: string, index: number) => (
//                 <Badge key={index} variant="outline" className="text-xs">
//                   {pair.replace("_", " → ").toUpperCase()}
//                 </Badge>
//               ))
//             ) : (
//               <span className="text-sm text-gray-500">
//                 No language pairs assigned
//               </span>
//             )}
//           </div>
//         </div>

//         <div className="pt-2 border-t">
//           <p className="text-xs text-gray-500">
//             Account created: {new Date().toLocaleDateString()}
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
