import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface VTTFile {
  id: string;
  fileName: string;
  created: string;
  size: string;
  duration: string;
  language: string;
  subtitles: string;
  status: "active" | "processing" | "completed";
}

const vttFiles: VTTFile[] = [
  {
    id: "1",
    fileName: "Introduction Video.vtt",
    created: "2024-07-03",
    size: "12.5 KB",
    duration: "5:24",
    language: "English",
    subtitles: "English",
    status: "active",
  },
  {
    id: "2",
    fileName: "Tutorial Part 1.vtt",
    created: "2024-07-03",
    size: "12.5 KB",
    duration: "5:24",
    language: "English",
    subtitles: "English",
    status: "processing",
  },
  {
    id: "3",
    fileName: "Introduction Video.vtt",
    created: "2024-07-03",
    size: "12.5 KB",
    duration: "5:24",
    language: "English",
    subtitles: "English",
    status: "active",
  },
  {
    id: "4",
    fileName: "Introduction Video.vtt",
    created: "2024-07-03",
    size: "12.5 KB",
    duration: "5:24",
    language: "English",
    subtitles: "English",
    status: "active",
  },
];

export function VTTFilesTable() {
  const getStatusBadge = (status: VTTFile["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">VTT Files Overview</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="font-semibold text-gray-700">File Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Created</TableHead>
              <TableHead className="font-semibold text-gray-700">Size</TableHead>
              <TableHead className="font-semibold text-gray-700">Duration</TableHead>
              <TableHead className="font-semibold text-gray-700">Language</TableHead>
              <TableHead className="font-semibold text-gray-700">Subtitles</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vttFiles.map((file) => (
              <TableRow key={file.id} className="border-gray-100 hover:bg-gray-50">
                <TableCell className="font-medium">{file.fileName}</TableCell>
                <TableCell className="text-gray-600">{file.created}</TableCell>
                <TableCell className="text-gray-600">{file.size}</TableCell>
                <TableCell className="text-gray-600">{file.duration}</TableCell>
                <TableCell className="text-gray-600">{file.language}</TableCell>
                <TableCell className="text-gray-600">{file.subtitles}</TableCell>
                <TableCell>{getStatusBadge(file.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-gray-200">
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Download className="h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}