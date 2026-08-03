'use client';

import { AlertTriangle, Clock, FileSpreadsheet, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExperimentData } from '@/components/layout/DataProvider';
import { dashboardMetrics } from '@/lib/statistics/analysis';
import { round } from '@/lib/statistics/descriptive';
import { GroupBarChart } from '@/components/charts/GroupBarChart';
import { RetentionChart } from '@/components/charts/RetentionChart';
import { ResponseTimeChart } from '@/components/charts/ResponseTimeChart';
import { QuestionnaireChart } from '@/components/charts/QuestionnaireChart';

function MetricCard({ title, value, helper, icon: Icon }: { title: string; value: string; helper: string; icon: typeof Users }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-[var(--muted-foreground)]">{title}</CardTitle>
        <Icon size={18} className="text-[var(--primary)]" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black">{value}</div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { participants, dataSource } = useExperimentData();
  const metrics = dashboardMetrics(participants);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge className="mb-3 bg-[#fee9df] text-[var(--accent)]">DEMONSTRATION WITH SIMULATED DATA</Badge>
          <h2 className="text-3xl font-black tracking-tight">Educational Experiment Dashboard</h2>
          <p className="mt-2 max-w-3xl text-[var(--muted-foreground)]">
            Single-group pre-test, AI learning session, immediate post-test, delayed post-test, and questionnaire
            analysis for Chinese learners of Japanese.
          </p>
        </div>
        <Badge className={dataSource === 'simulated' ? '' : 'bg-[#e7f7f3] text-[var(--success)]'}>
          Data source: {dataSource}
        </Badge>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Participants" value={String(metrics.participantCount)} helper="Current analytic sample size" icon={Users} />
        <MetricCard title="Average Total Pre" value={`${round(metrics.averageTotalPre)}`} helper="Weighted total memory score" icon={FileSpreadsheet} />
        <MetricCard title="Average Total Post" value={`${round(metrics.averageTotalPost)}`} helper="Immediate post-test score" icon={TrendingUp} />
        <MetricCard title="Average Total Gain" value={`${round(metrics.averageTotalGain)}`} helper="Post minus pre, no artificial threshold" icon={TrendingUp} />
        <MetricCard title="Average Retention" value={`${round(metrics.averageRetentionRate)}%`} helper="Delayed / immediate post-test" icon={FileSpreadsheet} />
        <MetricCard title="Response Time Reduction" value={`${round(metrics.averageResponseTimeReduction)}s`} helper="Lower time is not automatically better quality" icon={Clock} />
        <MetricCard title="Satisfaction Median" value={`${round(metrics.satisfactionMedian)}`} helper="Intention to reuse, 1-5 Likert" icon={Users} />
        <MetricCard title="Top-box Satisfaction" value={`${round(metrics.satisfactionTopBox)}%`} helper="Percentage selecting 4 or 5" icon={Users} />
      </div>

      <Card className="border-[#f0d39f] bg-[#fff9ed]">
        <CardHeader className="flex flex-row gap-3">
          <AlertTriangle className="mt-1 text-[var(--warning)]" />
          <div>
            <CardTitle>Interpretation warning</CardTitle>
            <CardDescription>
              This system demonstrates an analytical workflow. Reduced response time does not necessarily indicate
              improved language quality, and single-group simulated results do not establish causation.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <GroupBarChart participants={participants} />
        <RetentionChart participants={participants} />
        <ResponseTimeChart participants={participants} />
        <QuestionnaireChart participants={participants} />
      </div>
    </div>
  );
}
