import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Video, HardDrive } from "lucide-react";
import { formatBytes } from "@/lib/utils";

/**
 * Dashboard stats cards — displays total projects, videos created, and storage used.
 * Server Component — receives data as props.
 */

interface StatsCardsProps {
  totalProjects: number;
  videosCreated: number;
  storageUsedBytes: number;
}

export function StatsCards({
  totalProjects,
  videosCreated,
  storageUsedBytes,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Projects",
      value: totalProjects.toString(),
      icon: FolderOpen,
    },
    {
      label: "Videos Created",
      value: videosCreated.toString(),
      icon: Video,
    },
    {
      label: "Storage Used",
      value: formatBytes(storageUsedBytes),
      icon: HardDrive,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
