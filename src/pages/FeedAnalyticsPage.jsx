import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, BarChart2, Star, Share2, MousePointerClick, Download } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FeedAnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/feed/analytics/report")
      .then((res) => {
        setData(res.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalViews = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalShares = data.reduce((acc, curr) => acc + (curr.shares || 0), 0);
  const totalBookmarks = data.reduce((acc, curr) => acc + (curr.bookmarks || 0), 0);
  const totalClicks = data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  const chartData = data.slice(0, 8).map(item => ({
    name: item.title?.length > 15 ? `${item.title.substring(0, 15)}...` : item.title || "Post",
    Views: item.views || 0,
    Engagement: (item.shares || 0) + (item.bookmarks || 0) + (item.clicks || 0)
  }));

  const handleDownloadReport = () => {
    window.open("/api/feed/analytics/report?format=csv", "_blank");
    toast.success(t("Downloading CSV report..."));
  };

  return (
    <div className="space-y-4" data-testid="feed-analytics-page">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <PageHeader
          title={t("Content Feed Analytics")}
          subtitle={t("Track view counters, profile clicks, bookmarks, and engagement on News and Announcements.")}
        />
        <Button onClick={handleDownloadReport} className="bg-purple-800 hover:bg-purple-900 text-white font-bold h-9">
          <Download className="h-4 w-4 mr-2" /> {t("Export CSV Report")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard label={t("Total Feed Views")} value={totalViews.toString()} icon={Newspaper} tone="warning" />
        <StatCard label={t("Total Saved Bookmarks")} value={totalBookmarks.toString()} icon={Star} tone="default" />
        <StatCard label={t("Total Shared Links")} value={totalShares.toString()} icon={Share2} tone="info" />
        <StatCard label={t("Total Action Clicks")} value={totalClicks.toString()} icon={MousePointerClick} tone="success" />
      </div>

      <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-sm">
        <div className="text-sm font-semibold text-slate-800 mb-4">{t("Post Performance (Views vs Engagement)")}</div>
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">{t("Loading chart analytics...")}</div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">{t("No feed items generated yet.")}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="Views" fill="#8884d8" radius={[4, 4, 0, 0]} name="Total Views" />
                <Bar dataKey="Engagement" fill="#82ca9d" radius={[4, 4, 0, 0]} name="Saves/Clicks/Shares" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
